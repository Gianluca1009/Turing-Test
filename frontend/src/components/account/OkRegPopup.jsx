// OkRegPopup.jsx contiene il popup che indica la registrazione avvenuta con successo

// OkRegPopup.jsx
function OkRegPopup({ setShowOkRegPopup }) {

  return (

    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={() => setShowOkRegPopup(false)}
      ></div>

      {/* Contenuto */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg w-full max-w-sm z-10 text-center">
        
        <button
          onClick={() => setShowOkRegPopup(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-green-400 text-xl"
        >
          ✖
        </button>

        <h2 className="text-green-500 text-xl font-bold mb-4">Registrazione avvenuta!</h2>

        <p className="text-gray-700 dark:text-gray-300 mb-6">Benvenuto! Ora puoi effettuare il login.</p>

        <button
          onClick={() => setShowOkRegPopup(false)}
          className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
        >
          OK
        </button>

      </div>

    </div>
    
  );
}

export default OkRegPopup;
