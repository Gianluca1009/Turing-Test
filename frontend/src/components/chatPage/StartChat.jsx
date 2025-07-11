// StartChat.jsx contiene il bottone utile ad avviare la chat

function StartChat({ handleStart }) {

  return (

    <button
      onClick={ handleStart }
      className="bg-green-500 hover:bg-green-600 text-white font-semibold mt-16 px-6 py-3 rounded-lg transition"
    >
      Inizia Chat
    </button>
    
  );
}

export default StartChat;