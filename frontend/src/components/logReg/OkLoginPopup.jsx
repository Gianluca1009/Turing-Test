// OkLoginPopup.jsx contiene il popup che indica il login avvenuto con successo

import { useAuth } from "../../contexts/AuthContext";

// OkLoginPopup.jsx
function OkLoginPopup({ setShowOkLoginPopup }) {

  const { user } = useAuth();

  return (

    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}

      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={() => setShowOkLoginPopup(false)}
      ></div>

      {/* Contenuto */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg w-full max-w-sm z-10 text-center">
        
        <button
          onClick={() => setShowOkLoginPopup(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-green-400 text-xl"
        >
          ✖
        </button>

        <h2 className="text-green-500 text-xl font-bold mb-4">Login effettuato!</h2>

        <p className="text-gray-700 dark:text-gray-300 mb-6">Bentornato {user.username}! Ora puoi avviare una chat</p>

        <button
          onClick={() => setShowOkLoginPopup(false)}
          className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
        >
          OK
        </button>

      </div>

    </div>

  );
}

export default OkLoginPopup;
