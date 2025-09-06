// LogRegPopup.jsx contiene il popup che contiene i form di login/registrazione 

import { useState } from 'react'
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';

function LogRegPopup({ setShowLogRegPopup, setShowOkLoginPopup, setShowOkRegPopup }) {
  const [activeTab, setActiveTab] = useState("login");

  // Funzione utile a chiudere il popup e ad aprire quello di conferma 
  const onClose = (mode) => {
    setShowLogRegPopup(false)
    if(mode === "registrazione") {
      setShowOkRegPopup(true)
    }
    if(mode === "login") {
      setShowOkLoginPopup(true)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay scuro dietro */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setShowLogRegPopup(false)} // chiudi cliccando fuori
      ></div>

      {/* Contenuto popup */}
      <div className="relative bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 border border-green-400 rounded-3xl p-8 shadow-lg w-full max-w-md z-10 transition-colors duration-300">
        
        {/* Pulsante X chiudi */}
        <button
          onClick={() => setShowLogRegPopup(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-green-400 text-xl"
        >
          ✖
        </button>

        {/* Tabs Login / Register */}
        <div className="flex justify-around mb-8 ">
          <button
            onClick={() => setActiveTab("login")}
            className={`pb-2 px-6 font-semibold transition-colors ${
              activeTab === "login"
                ? "text-green-500 border-b-2 border-green-500"
                : "text-gray-400 hover:text-green-400"
            }`}
          >
            Accedi
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`pb-2 px-6 font-semibold transition-colors ${
              activeTab === "register"
                ? "text-green-500 border-b-2 border-green-500"
                : "text-gray-400 hover:text-green-400"
            }`}
          >
            Registrati
          </button>
        </div>

        {/* Contenuto dinamico */}
        {activeTab === "login" ? <LoginForm onClose = { onClose } /> : <RegistrationForm onClose = { onClose } />}

      </div>
    </div>
  );
}

export default LogRegPopup;