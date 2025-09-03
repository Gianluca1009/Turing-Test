import { createContext, useContext, useState } from "react";

// Viene creato il contesto, il contenitore globale per l'applicazione
const AuthContext = createContext();

// AuthProvider è il provider che avvolgerà l'app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Funzione che permette di fare il login
  const login = (data) => {
    // Rimuoviamo message, che è il messaggio di avvenuto login inviato dal backend
    const userData = { ...data };
    delete userData.message; 

    setUser(userData);
  };

  // Funzione che permette di fare il login
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children} {/* dentro c'è l'applicazione (App.jsx)*/}
    </AuthContext.Provider>
  );
}

// useAuth è il custom hook per usare il context facilmente
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
