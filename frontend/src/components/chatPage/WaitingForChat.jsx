// WaitingForChat.jsx contiene la rotella di loading visualizzata durante l'attesa della chat

function WaitingForChat() {

  return (

    <div className="flex flex-col mt-16 items-center">

        <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
        
        <p className="mt-4 text-green-600">
            In attesa di un altro utente...
        </p>
        
    </div>
  );
}

export default WaitingForChat;