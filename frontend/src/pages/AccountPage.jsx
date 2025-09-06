import React from "react";
import AccountData from "../components/accountPage/AccountData";
import ChatHistoryContainer from "../components/accountPage/ChatHistoryContainer";

export default function AccountPage() {

  return (
    <div className="flex flex-col items-center p-6 space-y-4">

      {/* Layout a due colonne */}
      <div className="flex w-full max-w-5xl gap-6">
        {/* Colonna sinistra: dati utente */}
        <div className="w-1/2 h-[70vh]">
          <AccountData />
        </div>

        {/* Colonna destra: chat */}
        <div className="w-1/2 h-[70vh]">
          <ChatHistoryContainer onSelectChat={(chat) => console.log(chat)} />
        </div>
      </div>
    </div>
  );
}
