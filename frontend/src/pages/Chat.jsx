import { io } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react'

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);

  // Listen for incoming messages from the server
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:8003');
    socketRef.current = socket;

    socket.emit('find_chat');

    // salva il socket ID appena connesso
    socket.on('connect', () => {
      setSocketId(socket.id);
    });

    socket.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    setMessages([{ sender: 'bot', text: 'Ciao! Sto cercando un partner con cui chattare...' }]);

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    const msg = { from: 'user', text: input };
    // emit message to server
    socketRef.current.emit('chat_message', msg);
    setInput('');
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
          <header className="bg-gray-200 dark:bg-black text-green-500 text-2xl font-extrabold p-5 rounded-t-3xl border-b border-green-600 tracking-wide transition-colors duration-300">
            Chat
          </header>

          <main className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-xs px-5 py-3 rounded-xl break-words transition-colors duration-300 ${
                  msg.sender === socketId
                    ? 'ml-auto bg-green-500 text-black shadow-lg'    // mio messaggio, a destra
                    : msg.sender === 'bot'
                      ? 'mx-auto text-center text-sm text-gray-400 italic'  // messaggio iniziale
                      : 'mr-auto bg-gray-200 dark:bg-gray-800 text-green-600 dark:text-green-300 shadow-inner' // messaggio ricevuto
                }`}
              >
                {msg.text}
              </div>
            ))}

          </main>

          <footer className="p-5 bg-gray-200 dark:bg-black border-t border-green-600 flex gap-3 rounded-b-3xl transition-colors duration-300">
            <input
              type="text"
              className="flex-1 bg-white dark:bg-gray-900 border border-green-500 rounded-lg px-4 py-3
                text-gray-800 dark:text-green-300 placeholder-green-600
                focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              placeholder="Scrivi un messaggio..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
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

export default Chat;
