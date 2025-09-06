import React from "react";
import ChatLine from "./ChatLine";

function ChatHistoryContainer({ chats, onSelectChat }) {
  return (
    <div
      className="w-full max-w-3xl h-[70vh] bg-gray-300 dark:bg-gray-900 border border-green-400 rounded-2xl shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-transparent"
    >
      {chats.length === 0 ? (
        <div className="p-6 text-center text-gray-600 dark:text-gray-400">
          Nessuna chat disponibile
        </div>
      ) : (
        chats.map((chat, index) => (
          <ChatLine
            key={index}
            opponent={chat.opponent}
            date={chat.date}
            result={chat.result}
            onClick={() => onSelectChat(chat)}
          />
        ))
      )}
    </div>
  );
}

export default ChatHistoryContainer;