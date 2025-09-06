import { useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

function OldChatBox({ opponent, result }) {
  // user corrente
  const { user } = useAuth();

  // ref per scrollare in fondo
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

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
          {/* Header con nomi utenti */}
          <header className="flex justify-between items-center bg-gray-200 dark:bg-black text-green-500 text-xl font-bold p-5 rounded-t-3xl border-b border-green-600 tracking-wide transition-colors duration-300">
            <span>{opponent}</span>
            <span>{user?.username}</span>
          </header>

          {/* Contenitore messaggi */}
          <main className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-transparent">
            {/* {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-xs px-5 py-3 rounded-xl break-words transition-colors duration-300 ${
                  msg.sender.id_user === user?.id_user
                    ? "ml-auto bg-green-500 text-black shadow-lg"
                    : "mr-auto bg-gray-200 dark:bg-gray-800 text-green-600 dark:text-green-300 shadow-inner"
                }`}
              >
                {msg.text}
              </div>
            ))} */}
            <div />
          </main>

          {/* Footer con esito */}
          <footer className="p-5 bg-gray-200 dark:bg-black border-t border-green-600 flex justify-center items-center rounded-b-3xl transition-colors duration-300">
            {result === "win" ? (
              <span className="text-green-500 font-extrabold text-lg">🏆 Vittoria</span>
            ) : (
              <span className="text-red-500 font-extrabold text-lg">❌ Sconfitta</span>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}

export default OldChatBox;