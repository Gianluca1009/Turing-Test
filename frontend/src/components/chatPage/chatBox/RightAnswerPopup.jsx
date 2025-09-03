// RightAnswerPopup.jsx contiene il popup che compare quando si indovina con chi si stava parlando

import { useState } from "react";
import OpponentInfo from "./OpponentInfo";

function RightAnswerPopup({ mode, modelName, setShowRightPopup, onTimeExpired, sid }) {
  const [feedback, setFeedback] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

      <div className="bg-gray-400 dark:bg-gray-800 text-black dark:text-white p-6 rounded-2xl shadow-lg text-center">

        {mode === "human" ? (
          <>
            <h2 className="text-black dark:text-white text-xl font-bold mb-4">✅ Complimenti!</h2>
            <p className="text-black dark:text-white">Stavi chattando con:</p>

            <OpponentInfo
              imageUrl = "https://hd2.tudocdn.net/1142397?w=824&h=494" // Memorizzare la foto
              name = "nome_utente"
              trophies = {150}
            />

            <p className="text-black dark:text-white">Il tuo nuovo punteggio: tot pt (+10)</p>
            <button
              className="mt-4 bg-gray-200 dark:bg-gray-900 text-black dark:text-white px-4 py-2 rounded-lg"
              onClick={() => {
                setShowRightPopup(false);
                onTimeExpired(sid);
              }}
            >
              Ok
            </button>
          </>
        ) : (
          // mode === "bot"
          <>
            <h2 className="text-black dark:text-white text-xl font-bold mb-4">🎉 Complimenti!</h2>
            <p className="text-black dark:text-white">Stavi chattando con:</p>

            <OpponentInfo
              imageUrl = "https://static.vecteezy.com/system/resources/previews/055/687/055/non_2x/rectangle-gemini-google-icon-symbol-logo-free-png.png" // Memorizzare la foto
              name = {modelName}
              trophies = {150}
            />
            
            <p className="text-black dark:text-white">Il tuo nuovo punteggio: tot pt (+10)</p>
            <h3 className="text-black dark:text-white mt-4 font-semibold">Dai un consiglio all'AI!</h3>
            <p>Cosa ti ha fatto capire di star parlando con un bot?</p>

            <textarea
              className="w-full p-2 mt-4 border rounded-lg bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
              rows="3"
              placeholder="Lascia un feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <button
              className="mt-4 bg-gray-200 dark:bg-gray-900 text-black dark:text-white px-4 py-2 rounded-lg"
              onClick={() => {
                setShowRightPopup(false);
                onTimeExpired(sid);
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

