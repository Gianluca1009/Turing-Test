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

  const [ai, setAI] = useState(false);

  // useRef utile a creare un contenitore che sopravvive ai render del componente Chat
  // Verrà utilizzato come riferimento per il socket
  const socketRef = useRef(null);

  const handleStart = (mode) => {
    // Viene creato il socket e assegnato all'attributo current di socketRef (al click del bottone startChat)
    const socket = io("http://localhost:8003");
    socketRef.current = socket;

    let payload = {
      mode: mode,
      user: { username: "user", sid: null }, // sid lo metti dopo il connect
    };

    // Gestione dell'evento 'connect' con relativa chiamata alla funzione del backend
    socket.on("connect", () => {
      payload.user.sid = socket.id;

      if (mode === "bot") {
        setAI(true);
      } else {
        setWaiting(true);
      }

      // Chiamata alla funzione 'find_chat' del backend
      socket.emit("find_chat", payload);
    });

    // Quando il backend risponde che la chat è pronta
    socket.on("chat_ready", (data) => {
      console.log("Chat pronta con lobby:", data.lobby_id);
      setWaiting(false);
      setStarted(true);
    });

    // Gestione dell'evento 'disconnect' con relativa chiamata alla funzione del backend
    // INUTILE ???? DA CONTROLLARE
    socket.on("disconnect", () => {
      console.log("Cliente disconnesso. ID:", socket.id);
      setStarted(false);
    });

    // EVENTO UTILE A USCIRE DALLA CHAT QUANDO L'ALTRO UTENTE ESCE DALLA LOBBY (NON FUNZIONANTE!!!)
    socket.on("chat_ended", (data) => {
      console.log("Chat terminata:", data.reason);
      setStarted(false);
      setWaiting(false);
    });
  };

  return (
    <>
      {ai ? (
        <ChatBox socket={socketRef.current} mode={"bot"} />
      ) : !started ? (
        !waiting ? (
          <StartChat handleStart={handleStart} />
        ) : (
          <WaitingForChat />
        )
      ) : (
        <ChatBox socket={socketRef.current} mode={"human"} />
      )}
    </>
  );
}

export default ChatPage;
