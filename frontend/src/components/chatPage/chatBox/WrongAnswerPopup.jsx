// WrongAnswerPopup.jsx contiene il popup che compare quando non si indovina con chi si stava parlando
import OpponentInfo from "./OpponentInfo";
import { useOpponent } from "../../../contexts/OpponentContext";
import { useAuth } from "../../../contexts/AuthContext";


function WrongAnswerPopup({ mode, setShowWrongPopup, onTimeExpired, sid }) {

  const { opponent } = useOpponent();

  const { user } = useAuth();

  const updateStats = async () => {
    try {
      await fetch("http://localhost:8003/update_stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          opponent_name: opponent.name,
          add: false, // Bisogna sottrarre i trofei, visto che è stata data la risposta sbagliata
          amount: 10,
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
            <h2 className="text-xl font-bold mb-4">❌ Peccato!</h2>
            <p>Stavi chattando con:</p>

            <OpponentInfo
              imageUrl = "https://hd2.tudocdn.net/1142397?w=824&h=494" // Memorizzare la foto
              name = {opponent.name}
              trophies = {opponent.trophies}
              success_rate = {null}
            />

            <p>Hai perso 10 trofei!</p>
            <p>Nuovo punteggio: {Math.max(0, user.trophies - 10)} 🏆</p>
            <button
              className="mt-4 bg-gray-200 dark:bg-gray-900 text-black dark:text-white px-4 py-2 rounded-lg"
              onClick={() => {
                setShowWrongPopup(false);
                onTimeExpired(sid);
                updateStats();
              }}
            >
              Ok
            </button>
          </>
        ) : (
          // mode === "bot"
          <>
            <h2 className="text-xl font-bold mb-4">❌ Peccato!</h2>
            <p>Stavi chattando con:</p>

            <OpponentInfo
              imageUrl = "https://static.vecteezy.com/system/resources/previews/055/687/055/non_2x/rectangle-gemini-google-icon-symbol-logo-free-png.png" // Memorizzare la foto
              name = {opponent.name}
              trophies = {null}
              success_rate = {Math.round(((opponent.victories + 1)/(opponent.victories + opponent.defeats + 1))*100)}
            />

            <p>Hai perso 10 trofei!</p>
            <p>Nuovo punteggio: {Math.max(0, user.trophies - 10)} 🏆</p>
            

            <button
              className="mt-4 bg-gray-200 dark:bg-gray-900 text-black dark:text-white px-4 py-2 rounded-lg"
              onClick={() => {
                setShowWrongPopup(false);
                onTimeExpired(sid);
                updateStats();
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

export default WrongAnswerPopup;
