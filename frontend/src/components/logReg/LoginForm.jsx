// LoginForm.jsx contiene il form per effettuare il login

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function LoginForm({ onClose }) {

  const { login } = useAuth();

  // useState utili per contenere le informazioni inserite nel form dall'utente
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  
  const [errorMessage, setErrorMessage] = useState(null);

  // Funzione che gestisce il submit del form di registrazione, inviando i dati al backend
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const res = await fetch("http://localhost:8003/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const userData = await res.json();
        login(userData);
        if (onClose) onClose("login");
        setErrorMessage(null);
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.detail);
      } 
    } catch (err) {
      console.error("Errore di connessione:", err);
      alert("Impossibile connettersi al server.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 shadow-lg"
    >

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full px-4 py-3 rounded-lg border border-green-500 bg-transparent text-green-500 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="w-full px-4 py-3 rounded-lg border border-green-500 bg-transparent text-green-500 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      {/* Eventuale messaggio d'errore */}
      { errorMessage && <p className = "text-green-500">{ errorMessage }</p> }

      <button
        type="submit"
        className="w-full py-3 rounded-lg bg-green-500 text-black font-semibold hover:bg-green-400 transition"
      >
        Accedi
      </button>

    </form>
  );
}

export default LoginForm;