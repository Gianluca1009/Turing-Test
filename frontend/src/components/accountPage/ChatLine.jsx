import React from "react";

function ChatLine({ opponent, date, result, onClick }) {
  return (
    <div
      className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
      onClick={onClick}
    >
      {/* Nome avversario */}
      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
        {opponent}
      </div>

      {/* Data */}
      <div className="text-sm text-gray-600 dark:text-gray-400 italic">
        {new Date(date).toLocaleString()}
      </div>

      {/* Esito */}
      <div
        className={`text-sm font-bold px-3 py-1 rounded-lg ${
          result === "win"
            ? "bg-green-500 text-black"
            : "bg-red-500 text-white"
        }`}
      >
        {result === "win" ? "Vittoria" : "Sconfitta"}
      </div>
    </div>
  );
}

export default ChatLine;