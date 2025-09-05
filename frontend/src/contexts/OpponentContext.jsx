import { createContext, useContext, useState } from "react";

// Creazione del contesto
const OpponentContext = createContext();

// Provider che gestisce i dati dell’avversario
export function OpponentProvider({ children }) {
  const [opponent, setOpponent] = useState(null);

  /**
   * Imposta i dati dell’avversario
   * Può essere un utente o un modello AI.
   * Esempio:
   * { type: "user", username: "Mario", trofei: 10, vittorie: 5, sconfitte: 3 }
   * { type: "model", name: "GPT-4", vittorie: 20, sconfitte: 5, rank: 2 }
   */
  const setOpponentData = (data) => {
    setOpponent(data);
  };

  // Reset dei dati quando termina la chat
  const clearOpponentData = () => {
    setOpponent(null);
  };

  return (
    <OpponentContext.Provider value={{ opponent, setOpponentData, clearOpponentData }}>
      {children}
    </OpponentContext.Provider>
  );
}

// Hook custom per accedere facilmente al contesto
// eslint-disable-next-line react-refresh/only-export-components
export function useOpponent() {
  return useContext(OpponentContext);
}
