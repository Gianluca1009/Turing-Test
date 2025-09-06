// ChatPage.jsx contiene la pagina per chattare con un altro utente

import React, { useState, useEffect, useRef } from "react";
import ChatBox from "../components/chatPage/ChatBox";
import StartChat from "../components/chatPage/StartChat";
import WaitingForChat from "../components/chatPage/WaitingForChat";
import GoToLoginPopup from "../components/chatPage/chatBox/GoToLoginPopup";
import { io } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";
import { useOpponent  } from "../contexts/OpponentContext";

function ChatPage() {

  // Recuperiamo i dati relativi all'utente attivo dal contesto
  const { user } = useAuth();

  // Recuperiamo dal contesto le funzioni per memorizzare i dati relativi all'avversario durante la partita
  const { opponent, setOpponentData, clearOpponentData } = useOpponent();

  // useState utile a gestire l'inizio della chat
  const [started, setStarted] = useState(false);

  // useState utile a gestire l'attesa dell'inizio di una chat
  const [waiting, setWaiting] = useState(false);

  // useState utile a tracciare il valore di 'mode' (mode == 'bot' -> ai = true, mode == 'human' -> ai = false)
  const [ai, setAI] = useState(false);

  // useState utile a memorizzare il sid dell'utente che deve inviare il primo messaggio
  const  [starterSid, setStarterSid] = useState(null);

  // useState utile a memorizzare i sids degli utenti (o dell'utente e del bot) che partecipano a una chat
  const [lobbySids, setLobbySids] = useState({ user_1: null, user_2: null });

  const [showGoToLoginPopup, setShowGoToLoginPopup] = useState(false);

  // useState che tiene conto di tutti i messaggi inviati durante una chat
  const [messages, setMessages] = useState([]);

  // useRef utile a creare un contenitore che sopravvive ai render del componente Chat
  // Verrà utilizzato come riferimento per il socket
  const socketRef = useRef(null);

  // Cleanup: quando ChatPage viene smontata disconnette il socket
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);


  const handleStart = (mode) => {
    // Viene creato il socket e assegnato all'attributo current di socketRef (al click del bottone startChat)
    const socket = io("http://localhost:8003");
    socketRef.current = socket;

    // Dati da passare alla funzione 'join_lobby' del backend
    let payload = {
      mode: mode,
      user: { 
        username: user.username, 
        sid: null, 
        id_user: user.id_user,
      }, // sid lo metti dopo il connect
    };

    // Gestione dell'evento 'connect' con relativa chiamata alla funzione del backend
    socket.on("connect", () => {

      // Controllo per evitare che venga chiamato join_lobby con 'user_1.sid' = null
      if (!socket.id) {
        console.error("Socket ID non disponibile, impossibile entrare in lobby");
        return;
      }

      // Viene completato il payload
      payload.user.sid = socket.id;

      if (mode === "bot") {
        setAI(true);
      } else {
        setWaiting(true);
      }

      // Chiamata alla funzione 'join_lobby' del backend
      socket.emit("join_lobby", payload);
    });

    // Quando il backend risponde che la chat è pronta
    socket.on("chat_ready", async (data) => {
      console.log("Chat pronta con lobby:", data.lobby_id);

      setWaiting(false);
      setStarted(true);
      
      // starterSid contiene il sid dell'utente che deve iniziare la conversazione
      if (data.user_1_starts === true) {
        setStarterSid(data.user_1_sid); 
      } else {
        setStarterSid(data.user_2_sid);
      }

      // vengono salvati in lobbySids i sid di tutti e due gli utenti
      setLobbySids({
        user_1: data.user_1_sid,
        user_2: data.user_2_sid,
      });


      if (mode === "human") {
        // Se l'interlocutore è un altro utente, recuperiamo i suoi dati dal db per inserirli nel contesto
        try {
          const res = await fetch(`http://localhost:8003/get_opponent_data/${data.opponent_username}`);
          if (!res.ok) {
            throw new Error(`Errore HTTP: ${res.status}`);
          }
          const opponentData = await res.json();

          // Memorizziamo i dati dell'utente avversario nel contesto
          setOpponentData({
            name: data.opponent_username,
            id: opponentData.id_user,
            trophies: opponentData.trophies
          });
        } catch (err) {
          console.error("Errore nel recupero dati avversario:", err);
        }
      }


      if (mode === "bot") {
        // Se l'interlocutore è un bot, recuperiamo i suoi dati dal db per inserirli nel contesto
        // Utilizziamo l'endpoint che ritorna la classifica completa dei modelli per ottenere l'attuale ranking
        try {
          const res = await fetch("http://localhost:8003/get_models_ranking");
          if (!res.ok) throw new Error("Errore fetch classifica modelli");
          const modelRanking = await res.json();

          const model = modelRanking.find(
            (m) => m.name.toLowerCase() === data.opponent_username.toLowerCase()
          );

          if (model) {
            // Memorizziamo i dati del bot avversario nel contesto
            setOpponentData({
              id: model.id_model,
              name: model.name,
              rank: modelRanking.indexOf(model) + 1,
              victories: model.victories,
              defeats: model.defeats, 
            });
          }
        } catch (err) {
          console.error("Errore nel recupero dati avversario:", err);
        }
      }
    });
  };


// Funzione per passare i dati, compresi i messaggi della chat al backend
const saveChatData = async () => {
  // Se opponent ha l'attributo rank, vuol dire che l'avversario è un AI
  const isOpponentAi = opponent.rank ? true : false;

  try {
    const res = await fetch("http://localhost:8003/save_chat_data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_user_1: user.id_user,
        id_user_2: !isOpponentAi ? opponent.id : null,
        id_model: isOpponentAi ? opponent.id : null,
        messages: messages.map((msg) => ({
          id_user: msg.sender.id_user ?? null, // Se id_user è undefined o null ritorna null
          id_model: msg.sender.id_user ? null : opponent.id, // se il mittente è un bot inserice l'id del modello
          message: msg.text, 
        })),
      }),
    });

    if (!res.ok) {
      throw new Error(`Errore HTTP: ${res.status}`);
    }

  } catch (err) {
    console.error("Errore salvataggio chat:", err);
  }
};


  // Funzione utile a resettare i valori degli useState quando termina la chat
  const resetValues = () => {
    setStarted(false);
    setWaiting(false);
    setAI(false);
    setStarterSid(null)
    setLobbySids({ user_1: null, user_2: null });
    clearOpponentData();
    setMessages([]);
  }

  // Funzione utile a disconnettere l'utente nel caso l'altro esca dalla chat 
  const onUserDisconnection = () => {

    resetValues();

    // disconnessione forzata nel backend
    socketRef.current.emit("user_left_lobby");

  }

  // FUnzione utile a disconnettere l'utente quando la chat termina correttamente, dopo i popup finali
  const onTimeExpired = async () => {

    // Solo lo user_1 memorizza i dati nel database, così non si hanno mai duplicati
    if (socketRef.current && socketRef.current.id === lobbySids.user_1) {
      saveChatData();
    }

    resetValues();
    
    // disconnessione soft nel backend
    socketRef.current.emit("time_expired");
  }

  return (
    <>
      {((ai || started) && starterSid) ? (
          <ChatBox
            socket = { socketRef.current }
            mode = { ai ? "bot" : "human" }
            onUserDisconnection = { onUserDisconnection }
            onTimeExpired = { onTimeExpired }
            starterSid = { starterSid }
            lobbySids = { lobbySids }
            started = { started }
            messages = { messages }
            setMessages = { setMessages }
          />
        ) : !started ? (
          !waiting ? (
            <StartChat handleStart = { handleStart } setShowGoToLoginPopup = { setShowGoToLoginPopup } />
          ) : (
            <WaitingForChat />
          )
        ) : null}

        {showGoToLoginPopup && (
          <GoToLoginPopup setShowGoToLoginPopup = { setShowGoToLoginPopup } />
        )}

    </>
  );
}


export default ChatPage;
