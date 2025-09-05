// StartChat.jsx contiene il bottone utile ad avviare la chat

import { useAuth } from "../../contexts/AuthContext";

function StartChat({ handleStart, setShowGoToLoginPopup }) {

  const { user } = useAuth();

  const handleClick = (mode) => {
    if (user) {
      handleStart(mode);
    } else {
      setShowGoToLoginPopup(true);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-16">
      <button
        onClick={() => handleClick("human")}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition"
      >
        Inizia Chat
      </button>

      <button
        onClick={() => handleClick("bot")}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition"
      >
        Chatta con l'AI
      </button>
    </div>
  );
}

export default StartChat;
