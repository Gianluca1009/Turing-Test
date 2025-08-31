// RegistrationForm.jsx contiene il form per effettuare la registrazione di un nuovo account

import { useState } from "react";

function RegistrationForm({ onClose }) {

  // useState utili per contenere le informazioni inserite nel form dall'utente
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Funzione che gestisce il submit del form di registrazione, inviando i dati al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8003/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (res.ok) {
      if (onClose) onClose("registrazione");
    } else {
      alert("Errore durante la registrazione");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-6 rounded-xl bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 shadow-lg"
    >
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
        className="w-full px-4 py-3 rounded-lg border border-green-500 bg-transparent text-green-500 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
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
      <button
        type="submit"
        className="w-full py-3 rounded-lg bg-green-500 text-black font-semibold hover:bg-green-400 transition"
      >
        Registrati
      </button>
    </form>
  );
}

export default RegistrationForm;
