// ChatPage.jsx contiene la pagina per chattare con un altro utente

import React, { useState, useEffect, useRef } from "react";
import ChatBox from "../components/chatPage/ChatBox";
import StartChat from "../components/chatPage/StartChat";
import WaitingForChat from "../components/chatPage/WaitingForChat";
import { io } from "socket.io-client";

function ChatPage() {
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

  // useState utile a memorizzare il nome dell'eventuale modello utilizzato durante la chat
  const [modelName, setModelName] = useState(null);

  // useRef utile a creare un contenitore che sopravvive ai render del componente Chat
  // Verrà utilizzato come riferimento per il socket
  const socketRef = useRef(null);

  // Cleanup: quando ChatPage viene smontata disconnette il socket
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log("Socket disconnesso perché ChatPage è stato smontato (cambio pagina)");
      }
    };
  }, []);

  const handleStart = (mode) => {
    // Viene creato il socket e assegnato all'attributo current di socketRef (al click del bottone startChat)
    const socket = io("http://localhost:8003");
    socketRef.current = socket;

    let payload = {
      mode: mode,
      user: { username: "user", sid: null}, // sid lo metti dopo il connect
    };

    // Gestione dell'evento 'connect' con relativa chiamata alla funzione del backend
    socket.on("connect", () => {
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
    socket.on("chat_ready", (data) => {
      console.log("Chat pronta con lobby:", data.lobby_id);
      setWaiting(false);
      setStarted(true);
      
      // starterSid contiene il sid dell'utente che deve iniziare la conversazione
      if (data.user_1_starts === true) {
        setStarterSid(data.user_1_sid) 
      } else {
        setStarterSid(data.user_2_sid)
      }

      // vengono salvati in lobbySids i sid di tutti e due gli utenti
      setLobbySids({
        user_1: data.user_1_sid,
        user_2: data.user_2_sid,
      });

      setModelName(data.model_name)

    });

  };

  // Funzione utile a disconnettere l'utente nel caso l'altro esca dalla chat (utilizzata in ChatBox.jsx)
  const onChatEnded = () => {
    setStarted(false);
    setWaiting(false);
    setAI(false);
    setStarterSid(null)
    setLobbySids({ user1: null, user2: null });
    setModelName(null);

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }

  return (
    <>
      {((ai || started) && starterSid) ? (
          <ChatBox
            socket = { socketRef.current }
            mode = { ai ? "bot" : "human" }
            onChatEnded = { onChatEnded }
            starterSid = { starterSid }
            lobbySids = { lobbySids }
            started = { started }
            modelName = { modelName }
          />
        ) : !started ? (
          !waiting ? (
            <StartChat handleStart = { handleStart } />
          ) : (
            <WaitingForChat />
          )
        ) : null}
    </>
  );
}


export default ChatPage;
