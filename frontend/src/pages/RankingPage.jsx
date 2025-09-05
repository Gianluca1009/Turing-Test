import React, { useState, useEffect } from "react";
import ModelRankingRow from "../components/rankingPage/ModelRankRow";
import PlayerRankRow from "../components/rankingPage/PlayerRankRow";

function RankingPage() {

  const [rankingType, setRankingType] = useState("models");
  
  const [modelsRanking, setModelsRanking] = useState([]);
  const [usersRanking, setUsersRanking] = useState([]);

  const [noUserMessage, setNoUserMessage] = useState(null);

  useEffect(() => {

    // Dizionario contenente i loghi dei diversi modelli 
    const logos = {
      "Gemma-3-27b-it" : "https://ai-market.jp/wp-content/uploads/2024/02/gemma-header.width-1200.format-w.jpg",
      "Gemma-3-12b-it" : "https://ai-market.jp/wp-content/uploads/2024/02/gemma-header.width-1200.format-w.jpg",
      "Gemini-2.5-flash" : "https://ai-market.jp/wp-content/uploads/2024/02/gemma-header.width-1200.format-w.jpg",
      "Gemini-2.5-flash-lite" : "https://ai-market.jp/wp-content/uploads/2024/02/gemma-header.width-1200.format-w.jpg"
    }

    // Dizionario contenente brevi descrizioni dei diversi modelli 
    const captions = {
      "Gemma-3-27b-it" : "Modello di grandi dimensioni ottimizzato per l`italiano, con buone capacità generative e comprensive",
      "Gemma-3-12b-it" : "Versione più compatta del Gemma-3-27b-it, bilancia prestazioni e velocità di esecuzione",
      "Gemini-2.5-flash" : "Modello rapido e versatile con capacità generative avanzate, ottimizzato per risposte veloci",
      "Gemini-2.5-flash-lite" : "Modello pensato per sistemi con risorse limitate o per applicazioni in tempo reale"
    }

    // fetch modelli
    fetch("http://localhost:8003/get_models_ranking")
      .then((res) => {
        if (!res.ok) throw new Error("Errore fetch classifica modelli");
        return res.json();
      })
      .then((data) => {
        const models = data.map((m) => ({
          name: m.name,
          success_rate: (m.victories + m.defeats > 0)
            ? (m.victories / (m.victories + m.defeats)).toFixed(2) * 100
            : "0",
          logo: logos[m.name],
          descrizione: captions[m.name]
        }));
        setModelsRanking(models)
      })
      .catch((err) => console.error(err));


    // fetch giocatori
    fetch("http://localhost:8003/get_users_ranking")
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Errore fetch classifica utenti");
        }
        return res.json();
      })
      .then((data) => setUsersRanking(data))
      .catch((err) => {
        if (err.message.includes("Nessun utente")) {
          setNoUserMessage("Nessun utente registrato. Registrati per creare un nuovo account!");
        } else {
          console.error(err);
        }
      });
  }, []);


  const toggleClassifica = () => {
    setRankingType((prev) =>
      prev === "models" ? "users" : "models"
    );
  };

  const titolo =
    rankingType === "models"
      ? "Classifica Modelli LLM"
      : "Classifica Giocatori";

  const didascalia =
    rankingType === "models"
      ? `I modelli vengono classificati in base alla loro percentuale di successo nell'ingannare i giocatori.
        Scoprendo l'identità di un modello più in alto in classifica, si vincono più trofei!`
      : `I giocatori vengono classificati in base ai trofei guadagnati durante le partite`;

  return (
    <div className="px-4 sm:px-8 py-6">
      {/* Titolo e bottone sulla stessa riga */}
      <div className="relative flex justify-center mb-2">
        <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">
          {titolo}
        </h2>

        <button
          onClick={toggleClassifica}
          className="absolute right-0 px-3 py-2 bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-green-300 border border-green-400 rounded-md text-sm hover:bg-green-400 hover:text-black transition-colors whitespace-nowrap"
        >
          {rankingType === "models" ? "👥 Giocatori" : "🤖 Modelli"}
        </button>
      </div>

      {/* Sottotitolo */}
      <p className="mb-6 text-gray-700 dark:text-green-200 text-sm whitespace-pre-line">
        {didascalia}
      </p>

      {/* Rendering classifica */}
      {rankingType === "models" ? (
          modelsRanking.map((m, index) => 
            <ModelRankingRow key = {m.name} rank = {index + 1} {...m} />
          )
        ) : ( noUserMessage ? (
            <h2 className="text-center font-semibold text-green-600 dark:text-green-400">{noUserMessage}</h2>
          ) : ( 
            usersRanking.map((u, index) => 
              <PlayerRankRow key = {u.username} rank = {index + 1} {...u} />
            )
          )
        )
      }
    </div>
  );
  }

export default RankingPage;
