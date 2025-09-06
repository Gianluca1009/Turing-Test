// src/components/accountPage/AccountData.jsx
import React from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import AccountIcon from "../../SVGs/AccountIcon"; // aggiorna il percorso se necessario

function AccountData() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
  };

  const onDeleteAccount = () => {
    // logica per eliminare l'account
    console.log("Elimina account cliccato");
  };

  return (
    <div className="bg-gray-700 dark:bg-gray-900 shadow-md rounded-xl p-6 w-full h-full flex flex-col justify-between">
      
      {/* Sezione superiore */}
      <div>
        {/* Icona + nome */}
        <div className="flex items-center mb-4">
          <div className="p-6 bg-green-500 rounded-full mr-4 flex items-center justify-center w-20 h-20">
            <AccountIcon className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-white">{user.username}</h2>
        </div>

        {/* Email */}
        <div className="text-gray-300 mb-4">Email: {user.email}</div>

        {/* Vittorie / sconfitte / trofei */}
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-6 text-gray-300">
            <div>
              <span className="font-medium">Vittorie:</span> {user.victories}
            </div>
            <div>
              <span className="font-medium">Sconfitte:</span> {user.defeats}
            </div>
          </div>
          <div className="flex items-center text-yellow-400 font-semibold">
            🏆 {user.trophies}
          </div>
        </div>
      </div>

      {/* Bottoni in basso */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onLogout}
          className="flex-1 mr-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
        <button
          onClick={onDeleteAccount}
          className="flex-1 ml-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Elimina Account
        </button>
      </div>
    </div>
  );
}

export default AccountData;