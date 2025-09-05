// GoToLoginPopup.jsx contiene il popup mostrato quando si tenta di avviare una partita senza aver fatto il login

function GoToLoginPopup({ setShowGoToLoginPopup }) {

  return (

    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setShowGoToLoginPopup(false)}
      ></div>

      {/* Contenuto */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg w-full max-w-sm z-10 text-center">
        
        <button
          onClick={() => setShowGoToLoginPopup(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-green-400 text-xl"
        >
          ✖
        </button>

        <h2 className="text-red-500 text-xl font-bold mb-4">Accesso richiesto</h2>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Devi effettuare il login per avviare una partita.
        </p>

        <button
          onClick={setShowGoToLoginPopup(false)} // qui metterai la logica vera
          className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
        >
          Vai al login
        </button>

      </div>

    </div>
  );
}

export default GoToLoginPopup;
