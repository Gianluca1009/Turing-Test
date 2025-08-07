import { io } from "socket.io-client";
import { useState, useEffect, useRef } from "react";

function ChatBox({ socket, mode }) {
  // useState che tiene conto di tutti i messaggi inviati nella chat
  const [messages, setMessages] = useState([]);

  // useState che tiene conto del testo scritto nella barra d'invio
  const [input, setInput] = useState("");

  // useState utile a memorizzare l'id del socket relatico alla chat
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    if (!socket) return;

    setSocketId(socket.id);

    // Gestione dell'evento 'chat_message' con relativa chiamata alla funzione del backend
    socket.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // EVENTO NON FUNZIONANTE, UTILE A SEGNALARE L'ABBANDONO DELLA CHAT DELL'ALTRO UTENTE (NON FUNZIONANTE!!!)
    socket.on("chat_ended", (data) => {
      alert("L'altro utente ha abbandonato la chat.");
    });

    return () => {
      // Cleanup: disconnette il socket quando il componente Chat viene smontato
      socket.off("chat_message");
      socket.disconnect();
    };
  }, [socket]);

  // Funzione utile a inviare un messaggio in chat
  const sendMessage = () => {
    if (!input.trim()) return;

    // contiene i dati relativi al messaggio inviato
    const message = {
      sender: { username: "user", sid: socket.id },
      text: input,
    };

    // Chiamata alla funzione 'chat_message' dal server
    socket.emit("chat_message", message, mode);
    // Viene svuotata la barra d'input
    setInput("");
  };

  return (
    <div className="bg-gray-800 dark:bg-gray-800 text-gray-900 dark:text-gray-300 transition-colors duration-300 rounded">
      <div className="flex items-center justify-center h-screen bg-gray-400 dark:bg-black p-4 transition-colors duration-300">
        <div
          className="flex flex-col 
            w-full h-[90vh] max-w-[90vw]
            sm:w-[90vw] sm:h-[85vh]
            md:w-[70vw] md:h-[80vh]
            lg:w-[60vw] lg:h-[80vh]
            bg-gray-300 dark:bg-gray-900 border border-green-400 rounded-3xl shadow-lg transition-colors duration-300"
        >
          {/* Header della chat box */}
          <header className="bg-gray-200 dark:bg-black text-green-500 text-2xl font-extrabold p-5 rounded-t-3xl border-b border-green-600 tracking-wide transition-colors duration-300">
            Chat
          </header>

          {/* Contenitore per i messaggi inviati in chat */}
          <main className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-xs px-5 py-3 rounded-xl break-words transition-colors duration-300 ${
                  msg.sender.sid == socketId
                    ? "ml-auto bg-green-500 text-black shadow-lg" // Messaggio inviato (destra)
                    : "mr-auto bg-gray-200 dark:bg-gray-800 text-green-600 dark:text-green-300 shadow-inner" // Messaggio inviato (sinistra)
                }`}
              >
                {msg.text}
              </div>
            ))}
          </main>

          {/* Footer contente la barra di input e il bottone per inviare i messaggi */}
          <footer className="p-5 bg-gray-200 dark:bg-black border-t border-green-600 flex gap-3 rounded-b-3xl transition-colors duration-300">
            <input
              type="text"
              className="flex-1 bg-white dark:bg-gray-900 border border-green-500 rounded-lg px-4 py-3
                text-gray-800 dark:text-green-300 placeholder-green-600
                focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              placeholder="Scrivi un messaggio..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-3 rounded-lg transition"
              onClick={sendMessage}
            >
              Invia
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
