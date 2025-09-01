// src/pages/AccountPage.jsx
import React from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext"; // importa il tuo context
import AccountIcon from "../SVGs/AccountIcon"; // aggiorna il percorso se necessario

export default function AccountPage() {

    // Importiamo user e logout dal contesto generale (AuthContext.jsx)
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        navigate('/')
    }

    return (
        <div className="flex flex-col items-center p-6 space-y-4">
        {/* Icona utente */}
        <div className="p-4 bg-green-500 rounded-full">
            <AccountIcon />
        </div>

        {/* Dati utente */}
        <div className="bg-gray-300 dark:bg-gray-800 shadow-md rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4">
            Profilo Utente
            </h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-200">
            <li>
                <span className="font-medium">Username:</span> {user.username}
            </li>
            <li>
                <span className="font-medium">Email:</span> {user.email}
            </li>
            <li>
                <span className="font-medium">Vittorie:</span> {user.vittorie}
            </li>
            <li>
                <span className="font-medium">Sconfitte:</span> {user.sconfitte}
            </li>
            <li>
                <span className="font-medium">Trofei:</span> {user.trofei}
            </li>
            </ul>
        </div>

        {/* Logout */}
        <button
            onClick={ onLogout }
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
            Logout
        </button>
        </div>
    );
}
