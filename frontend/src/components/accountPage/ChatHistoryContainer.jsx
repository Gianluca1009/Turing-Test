import React, { useEffect, useState } from "react";
import ChatLine from "./ChatLine";
import { useAuth } from "../../contexts/AuthContext";

function ChatHistoryContainer() {
  const { user } = useAuth(); // contiene l'utente loggato
  const [chats, setChats] = useState([]); // stato per salvare le chat

  useEffect(() => {
    if (!user?.id_user) return;

    const fetchChats = async () => {
      try {
        const res = await fetch(
          `http://localhost:8003/get_user_chats/${user.id_user}`
        );
        if (!res.ok) throw new Error(`Errore HTTP: ${res.status}`);
        const data = await res.json();
        setChats(data); // qui salvi le chat
        console.log(data);
      } catch (err) {
        console.error("Errore nel recupero delle chat:", err);
      } 
    };

    fetchChats();
  }, [user]);

  return (
    <div className="w-full max-w-3xl h-[70vh] bg-gray-300 dark:bg-gray-900 border border-green-400 rounded-2xl shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-transparent p-4">
      
      {/* Titolo */}
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100 mb-4">
        Cronologia Chat
      </h2>

      {chats.length === 0 ? (
        <div className="p-6 text-center text-gray-600 dark:text-gray-400">
          Nessuna chat disponibile
        </div>
      ) : (
        chats.map((chat) => {
          // Calcolo dinamico dell'avversario
          let opponent;
          if (chat.id_user_1 === user.id_user) {
            opponent = chat.username_user_2 ?? chat.model_name ?? "IA";
          } else {
            opponent = chat.username_user_1 ?? "Utente";
          }

          return (
            <ChatLine
              key = {chat.id_chat}
              opponent_name = {opponent}
            />
          );
        })
      )}
    </div>
  );
}

export default ChatHistoryContainer;
