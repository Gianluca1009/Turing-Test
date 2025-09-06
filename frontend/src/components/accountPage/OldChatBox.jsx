import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function OldChatBox() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id_chat } = useParams(); // riceviamo l'id della chat dall'URL
  const location = useLocation();
  const chatData = location.state?.chat; // dati passati da ChatLine
  const opponent = chatData?.opponent_name ?? "Avversario";
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll automatico in fondo alla chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch dei messaggi
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:8003/get_chat_messages/${id_chat}`);
        if (!res.ok) throw new Error(`Errore HTTP: ${res.status}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Errore nel recupero dei messaggi:", err);
      }
    };

    fetchMessages();
  }, [id_chat]);

  return (
    <div className="flex flex-col w-full h-screen bg-gray-800 dark:bg-gray-900 text-white">
      {/* Header con pulsante indietro */}
      <header className="flex justify-between items-center bg-gray-700 dark:bg-black p-4 text-lg font-bold border-b border-green-600">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-1 bg-gray-600 dark:bg-gray-800 rounded-lg hover:bg-gray-500 transition"
        >
          Indietro
        </button>
        <span>{user.username} vs {opponent}</span>
      </header>

      {/* Contenitore messaggi */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-xs px-4 py-2 rounded-xl break-words ${
              msg.id_user === user.id_user
                ? "ml-auto bg-green-500 text-black shadow-lg"
                : "mr-auto bg-gray-600 dark:bg-gray-800 text-green-400 shadow-inner"
            }`}
          >
            {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Footer con esito */}
      {chatData?.result && (
        <footer className="p-4 bg-gray-700 dark:bg-black border-t border-green-600 text-center">
          {chatData.result === "win" ? (
            <span className="text-green-500 font-bold text-lg">🏆 Vittoria</span>
          ) : (
            <span className="text-red-500 font-bold text-lg">❌ Sconfitta</span>
          )}
        </footer>
      )}
    </div>
  );
}
