import { useState, useEffect, useRef } from "react";
import ChoicePopup from "./chatBox/ChoicePopup";
import RightAnswerPopup from "./chatBox/RightAnswerPopup";
import WrongAnswerPopup from "./chatBox/WrongAnswerPopup";

function ChatBox({ socket, mode, modelName, onChatEnded, starterSid, lobbySids, started }) {
  const TOTAL_TIME = 15;

  // useState che tiene conto di tutti i messaggi inviati nella chat
  const [messages, setMessages] = useState([]);

  // useState che tiene conto del testo scritto nella barra d'invio
  const [input, setInput] = useState("");

  // useState utile a memorizzare l'id del socket relatico alla chat
  const [socketId, setSocketId] = useState(null);

  // useState utile a memorizzare il sid dell'utente che deve inviare il primo messaggio
  const [turn, setTurn] = useState(starterSid);

  // useState che tiene il conto del tempo rimanente
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME); 

  const messagesEndRef = useRef(null);

  // stato per mostrare popup a fine chat
  const [showChoicePopup, setShowChoicePopup] = useState(false);

  const [showRightPopup, setShowRightPopup] = useState(false);
  const [showWrongPopup, setShowWrongPopup] = useState(false);

  // useEffect che prepara il frontend a ricevere messaggi e a terminare la chat
  useEffect(() => {
    if (!socket) return;

    setSocketId(socket.id);

    // Gestisce l'arrivo di nuovi messaggi dal server
    socket.on("handle_chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (msg.sender.sid === lobbySids.user_1) {
        setTurn(lobbySids.user_2);
      } else {
        setTurn(lobbySids.user_1);
      }
    });

    // Gestice l'evento 'chat_ended' per chiudere la chat
    socket.on("chat_ended", () => {
      alert("L'altro utente ha abbandonato la chat.");
      if (onChatEnded) onChatEnded();
    });

    return () => {
      socket.off("handle_chat_message");
      socket.off("chat_ended");
    };
  }, [socket, lobbySids.user_1, lobbySids.user_2, onChatEnded]);

  useEffect(() => {
    if (!started) return;

    // Ogni volta che inizia la chat, reimposta il timer al suo valore iniziale
    setTimeLeft(TOTAL_TIME);

    // la funzione dentro setInterval viene eseguita ogni 1000 ms (ogni secondo)
    const interval = setInterval(() => {
      // Quando manca un secondo viene interrotto il ciclo e mostrato il popup
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowChoicePopup(true);
          return 0;
        }
        return prev - 1; // Ad ogni iterazione il tempo diminuisce di un secondo 
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started]);

  // useEffect utile a scrollare verso il basso quando arriva un nuovo messaggio (all'aggiornamento di 'messages')
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Funzione che gestisce l'arrivo o l'invio di un nuovo messaggio
  const sendMessage = () => {
    if (!input.trim()) return;

    const message = {
      sender: { username: "user", sid: socket.id },
      role: "user",
      text: input,
    };

    socket.emit("handle_chat_message", message, mode);
    setInput("");
  };

  // Booleano che indica se è il turno dell'utente attivo o no
  const isMyTurn = () => turn === socketId;

  // funzione che gestisce la risposta dell'utente al popup
  const handleChoicePopupResponse = (answer) => {
    console.log("Risposta utente:", answer ? "Era un bot" : "Era umano");
    setShowChoicePopup(false);
    if (mode === "bot") {
      answer ? setShowRightPopup(true) : setShowWrongPopup(true)
    }
    if (mode === "human") {
      answer ? setShowWrongPopup(true) : setShowRightPopup(true) 
    }
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
          <header className="flex justify-between items-center bg-gray-200 dark:bg-black text-green-500 text-2xl font-extrabold p-5 rounded-t-3xl border-b border-green-600 tracking-wide transition-colors duration-300">
            <span>Chat</span>

            {/* Contenitore del timer a barra */}
            <div className="flex flex-col items-center w-40">
              <div className="relative w-full h-4 bg-gray-300 dark:bg-gray-700 rounded overflow-hidden">
                <div
                  className="absolute top-0 right-0 h-full bg-green-500 transition-all duration-100 ease-linear"
                  style={{ width: `${(timeLeft / TOTAL_TIME) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>

            <button
              onClick={onChatEnded}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Esci
            </button>
          </header>

          {/* Contenitore per i messaggi inviati in chat */}
          <main className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-xs px-5 py-3 rounded-xl break-words transition-colors duration-300 ${
                  msg.sender.sid == socketId
                    ? "ml-auto bg-green-500 text-black shadow-lg"
                    : "mr-auto bg-gray-200 dark:bg-gray-800 text-green-600 dark:text-green-300 shadow-inner"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {!isMyTurn() && (
              <div className="mr-auto max-w-fit px-5 py-3 rounded-xl bg-gray-200 dark:bg-gray-800 shadow-inner">
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </main>

          {/* Footer contente la barra di input e il bottone per inviare i messaggi */}
          <footer className="p-5 bg-gray-200 dark:bg-black border-t border-green-600 flex gap-3 rounded-b-3xl transition-colors duration-300">
            {isMyTurn() ? (
              <>
                <input
                  type="text"
                  className="flex-1 bg-white dark:bg-gray-900 border border-green-500 rounded-lg px-4 py-3 text-gray-800 dark:text-green-300 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Scrivi un messaggio..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-3 rounded-lg"
                  onClick={sendMessage}
                >
                  Invia
                </button>
              </>
            ) : (
              <div className="flex-1 text-center text-gray-500 italic">
                ⏳ Attendi il messaggio dell'altro utente...
              </div>
            )}
          </footer>
        </div>
      </div>

      {/* Popup che richiede di scegliere tra bot e ai */}
      {showChoicePopup && (
        <ChoicePopup handleChoicePopupResponse = { handleChoicePopupResponse }/>
      )}

      {/* Popup CORRETTO */}
      {showRightPopup && (
        <RightAnswerPopup 
            mode = { mode } 
            modelName = { modelName } 
            setShowRightPopup = { setShowRightPopup } 
            onChatEnded = { onChatEnded }
        />
      )}

      {/* Popup SBAGLIATO */}
      {showWrongPopup && (
        <WrongAnswerPopup 
            mode = { mode } 
            modelName = { modelName } 
            setShowWrongPopup = { setShowWrongPopup } 
            onChatEnded = { onChatEnded }
        />
      )}
    </div>
  );
}

export default ChatBox;



// import { useState, useEffect, useRef } from "react";

// function ChatBox({ socket, mode, onChatEnded, starterSid, lobbySids, started}) {

//   const TOTAL_TIME = 300
  
//   // useState che tiene conto di tutti i messaggi inviati nella chat
//   const [messages, setMessages] = useState([]);

//   // useState che tiene conto del testo scritto nella barra d'invio
//   const [input, setInput] = useState("");

//   // useState utile a memorizzare l'id del socket relatico alla chat
//   const [socketId, setSocketId] = useState(null);

//   // useState utile a memorizzare il sid dell'utente che deve inviare il primo messaggio
//   const [turn, setTurn] = useState(starterSid)

//   const [timeLeft, setTimeLeft] = useState(TOTAL_TIME); // 300 secondi = 5 minuti

//   const messagesEndRef = useRef(null);

//   // useEffect che prepara il frontend a ricevere messaggi e a terminare la chat
//   useEffect(() => {
//     if (!socket) return;

//     setSocketId(socket.id);

//     // Gestisce l'arrivo di nuovi messaggi dal server
//     socket.on("handle_chat_message", (msg) => {

//       // Aggiunge il nuovo messaggio alla lista
//       setMessages((prev) => [...prev, msg]);

//       // In base al sid dell'utente che ha inviato il messaggio, cambia il turno
//       if (msg.sender.sid === lobbySids.user_1) {
//         setTurn(lobbySids.user_2)
//       } else {
//         setTurn(lobbySids.user_1)
//       }
//     });

//     // Gestisce la disconnessione dalla chat di un utente, facendo uscire anche l'altro
//     socket.on("chat_ended", (data) => {
//       alert("L'altro utente ha abbandonato la chat.");
//       if (onChatEnded) onChatEnded();
//     });

//     return () => {
//       socket.off("handle_chat_message");
//       socket.off("chat_ended");
//     };
//   }, [socket]);
//   // }, [socket, lobbySids, mode, onChatEnded]);


//   useEffect(() => {
//   if (!started) return;

//   // reset timer quando parte una nuova chat
//   setTimeLeft(TOTAL_TIME);

//   const interval = setInterval(() => {
//     setTimeLeft(prev => {
//       if (prev <= 1) {
//         clearInterval(interval);
//         onChatEnded();
//         return 0;
//       }
//       return prev - 1;
//     });
//   }, 1000);

//   return () => clearInterval(interval);
// }, [started, onChatEnded]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Funzione utile a inviare un messaggio in chat
//   const sendMessage = () => {
//     if (!input.trim()) return;

//     // contiene i dati relativi al messaggio inviato
//     const message = {
//       sender: { username: "user", sid: socket.id },
//       role: "user",
//       text: input,
//     };

//     // Chiamata alla funzione 'chat_message' dal server
//     socket.emit("handle_chat_message", message, mode);
    
//     // Viene svuotata la barra d'input
//     setInput("");
//   };

//   // Funzione utile a controllare se è il turno dell'utente che sta chattando
//   const isMyTurn = () => turn === socketId;

//   return (
//     <div className="bg-gray-800 dark:bg-gray-800 text-gray-900 dark:text-gray-300 transition-colors duration-300 rounded">
//       <div className="flex items-center justify-center h-screen bg-gray-400 dark:bg-black p-4 transition-colors duration-300">
//         <div
//           className="flex flex-col 
//             w-full h-[90vh] max-w-[90vw]
//             sm:w-[90vw] sm:h-[85vh]
//             md:w-[70vw] md:h-[80vh]
//             lg:w-[60vw] lg:h-[80vh]
//             bg-gray-300 dark:bg-gray-900 border border-green-400 rounded-3xl shadow-lg transition-colors duration-300"
//         >
//           {/* Header della chat box */}
//           <header className="flex justify-between items-center bg-gray-200 dark:bg-black text-green-500 text-2xl font-extrabold p-5 rounded-t-3xl border-b border-green-600 tracking-wide transition-colors duration-300">
//             <span>Chat</span>

//             {/* Contenitore del timer a barra */}
//             <div className="flex flex-col items-center w-40">
//               <div className="relative w-full h-4 bg-gray-300 dark:bg-gray-700 rounded overflow-hidden">
//                 <div
//                   className="absolute top-0 right-0 h-full bg-green-500 transition-all duration-100 ease-linear"
//                   style={{
//                     width: `${(timeLeft / TOTAL_TIME) * 100}%`, // percentuale rispetto al tempo iniziale (60s)
//                   }}
//                 ></div>
//               </div>
//               <span className="text-sm text-gray-700 dark:text-gray-300 mt-1">
//                 {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
//               </span>
//             </div>

//             <button
//               onClick={onChatEnded}
//               className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
//             >
//               Esci
//             </button>
//           </header>
//           {/* Contenitore per i messaggi inviati in chat */}
//           <main className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-transparent">
//             {messages.map((msg, index) => (
//               <div
//                 key={index}
//                 className={`max-w-xs px-5 py-3 rounded-xl break-words transition-colors duration-300 ${
//                   msg.sender.sid == socketId
//                     ? "ml-auto bg-green-500 text-black shadow-lg" // Messaggio inviato (destra)
//                     : "mr-auto bg-gray-200 dark:bg-gray-800 text-green-600 dark:text-green-300 shadow-inner" // Messaggio inviato (sinistra)
//                 }`}
//               >
//                 {msg.text}
//               </div>
//             ))}

//             {/* Se è il turno dell'altro utente, mostra un messaggio che indica il typing (tre pallini) */}
//             {!isMyTurn() && (
//               <div className="mr-auto max-w-fit px-5 py-3 rounded-xl bg-gray-200 dark:bg-gray-800 shadow-inner">
//                 <div className="flex items-center justify-center">
//                   <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
//                   <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></span>
//                   <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
//                 </div>
//               </div>
//             )}

//             {/* Ref invisibile per autoscroll */}
//             <div ref={messagesEndRef} />
//           </main>

//           {/* Footer contente la barra di input e il bottone per inviare i messaggi */}
//           <footer className="p-5 bg-gray-200 dark:bg-black border-t border-green-600 flex gap-3 rounded-b-3xl transition-colors duration-300">
//             {isMyTurn() ? (
//               <>
//                 <input
//                   type="text"
//                   className="flex-1 bg-white dark:bg-gray-900 border border-green-500 rounded-lg px-4 py-3 text-gray-800 dark:text-green-300 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
//                   placeholder="Scrivi un messaggio..."
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//                 />
//                 <button
//                   className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-3 rounded-lg"
//                   onClick={sendMessage}
//                 >
//                   Invia
//                 </button>
//               </>
//             ) : (
//               <div className="flex-1 text-center text-gray-500 italic">
//                 ⏳ Attendi il messaggio dell'altro utente...
//               </div>
//             )}
//           </footer>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ChatBox;
