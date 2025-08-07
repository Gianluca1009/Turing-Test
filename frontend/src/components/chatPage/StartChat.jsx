// StartChat.jsx contiene il bottone utile ad avviare la chat

function StartChat({ handleStart }) {
  return (
    <div className="flex flex-col items-center gap-4 mt-16">
      <button
        onClick={() => handleStart("human")}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition"
      >
        Inizia Chat
      </button>

      <button
        onClick={() => handleStart("bot")}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition"
      >
        Chatta con l'AI
      </button>
    </div>
  );
}

export default StartChat;
