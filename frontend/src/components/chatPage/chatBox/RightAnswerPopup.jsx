// RightAnswerPopup.jsx contiene il popup che compare quando si indovina con chi si stava parlando

import { useState } from "react";
import OpponentInfo from "./OpponentInfo";
import { useOpponent } from "../../../contexts/OpponentContext";
import { useAuth } from "../../../contexts/AuthContext";

function RightAnswerPopup({ mode, setShowRightPopup, onTimeExpired, sid }) {

  const { opponent } = useOpponent();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState("");

  const earnedTrophies = () => {
    if (mode === "human") return 10;
    if (mode === "bot") 
      if (opponent.rank === 1) return 20;
      if (opponent.rank === 2) return 15;
      if (opponent.rank === 3) return 10;
      if (opponent.rank === 4) return 5;
  }

  const updateStats = async () => {
    try {
      await fetch("http://localhost:8003/update_stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          opponent_name: opponent.name,
          add: true, // Bisogna aggiungere i trofei, visto che è stata data la risposta corretta
          amount: earnedTrophies(),
          is_opponent_ai: mode === "bot",
        }),
      });
    } catch (error) {
      console.error("Errore nella chiamata API:", error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

      <div className="bg-gray-400 dark:bg-gray-800 text-black dark:text-white p-6 rounded-2xl shadow-lg text-center">

        {mode === "human" ? (
          <>
            <h2 className="text-xl font-bold mb-4">✅ Complimenti!</h2>
            <p>Stavi chattando con:</p>

            <OpponentInfo
              imageUrl = "https://hd2.tudocdn.net/1142397?w=824&h=494" // Memorizzare la foto
              name = {opponent.name}
              trophies = {opponent.trophies}
              success_rate = {null}
            />

            <p>Hai guadagnato {earnedTrophies()} trofei!</p>
            <p>Nuovo punteggio: {user.trophies + earnedTrophies()} 🏆</p>

            <button
              className="mt-4 bg-gray-200 dark:bg-gray-900 px-4 py-2 rounded-lg"
              onClick={() => {
                setShowRightPopup(false);
                onTimeExpired(sid)
                updateStats(); // Aggiorniamo le stats del db in base alla risposta
              }}
            >
              Ok
            </button>
          </>
        ) : (
          // mode === "bot"
          <>
            <h2 className="text-xl font-bold mb-4">🎉 Complimenti!</h2>
            <p>Stavi chattando con:</p>

            <OpponentInfo
              imageUrl = "https://static.vecteezy.com/system/resources/previews/055/687/055/non_2x/rectangle-gemini-google-icon-symbol-logo-free-png.png" // Memorizzare la foto
              name = {opponent.name}
              trophies = {null}
              success_rate = {Math.round(((opponent.victories)/(opponent.victories + opponent.defeats))*100)}
            />
            
            <p>Hai guadagnato {earnedTrophies()} trofei!</p>
            <p>Nuovo punteggio: {user.trophies + earnedTrophies()} 🏆</p>

            <h3 className="mt-4 font-semibold">Dai un consiglio all'AI!</h3>
            <p>Cosa ti ha fatto capire di star parlando con un bot?</p>

            <textarea
              className="w-full p-2 mt-4 border rounded-lg bg-gray-200 dark:bg-gray-700"
              rows="3"
              placeholder="Lascia un feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <button
              className="mt-4 bg-gray-200 dark:bg-gray-900 px-4 py-2 rounded-lg"
              onClick={() => {
                setShowRightPopup(false);
                onTimeExpired(sid);
                updateStats(); // Aggiorniamo le stats del db in base alla risposta
              }}
            >
              Ok
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default RightAnswerPopup;

