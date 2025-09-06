import React from "react";
import { useNavigate } from "react-router-dom";

function ChatLine({ chat, opponent_name }) {
  const navigate = useNavigate();

  const openOldChat = () => {
    // Passiamo i dati della chat alla pagina OldChatBox tramite state
    navigate(`/old-chat/${chat.id_chat}`, { state: { chat } });
  };

  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200">
      {/* vs Nome Avversario */}
      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
        {opponent_name}
      </div>

      {/* Bottone apri */}
      <button
        onClick={openOldChat}
        className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
      >
        Apri
      </button>
    </div>
  );
}

export default ChatLine;
