import React, { useState, useEffect } from "react";
import ModelRankingRow from "../components/rankingPage/ModelRankRow";
import PlayerRankRow from "../components/rankingPage/PlayerRankRow";

function RankingPage() {

  const [tipoClassifica, setTipoClassifica] = useState("modelli");
  
  const [classificaModelli, setClassificaModelli] = useState([]);
  const [classificaUtenti, setClassificaUtenti] = useState([]);

  useEffect(() => {

    const loghiModelli = {
      "Gemma-3-27b-it" : "https://ai-market.jp/wp-content/uploads/2024/02/gemma-header.width-1200.format-w.jpg",
      "Gemma-3-12b-it" : "https://ai-market.jp/wp-content/uploads/2024/02/gemma-header.width-1200.format-w.jpg",
      "Gemini-2.5-flash" : "https://ai-market.jp/wp-content/uploads/2024/02/gemma-header.width-1200.format-w.jpg",
      "Gemini-2.5-flash-lite" : "https://ai-market.jp/wp-content/uploads/2024/02/gemma-header.width-1200.format-w.jpg"
    }

    const descrizioniModelli = {
      "Gemma-3-27b-it" : "Modello di grandi dimensioni ottimizzato per l`italiano, con buone capacità generative e comprensive",
      "Gemma-3-12b-it" : "Versione più compatta del Gemma-3-27b-it, bilancia prestazioni e velocità di esecuzione",
      "Gemini-2.5-flash" : "Modello rapido e versatile con capacità generative avanzate, ottimizzato per risposte veloci",
      "Gemini-2.5-flash-lite" : "Modello pensato per sistemi con risorse limitate o per applicazioni in tempo reale"
    }

    // fetch modelli
    fetch("http://localhost:8003/get_classifica_modelli")
      .then((res) => {
        if (!res.ok) throw new Error("Errore fetch classifica modelli");
        return res.json();
      })
      .then((data) => {
        const modelliConPercentuale = data.map((m) => ({
          id_modello: m.id_modello,
          nome: m.nome,
          percentuale: (m.vittorie + m.sconfitte > 0)
            ? (m.vittorie / (m.vittorie + m.sconfitte)).toFixed(2) * 100
            : "0",
          logo: loghiModelli[m.nome],
          descrizione: descrizioniModelli[m.nome]
        }));
        setClassificaModelli(modelliConPercentuale)
      })
      .catch((err) => console.error(err));

    // fetch giocatori
    fetch("http://localhost:8003/get_classifica_utenti")
      .then((res) => {
        if (!res.ok) throw new Error("Errore fetch classifica utenti");
        return res.json();
      })
      .then((data) => setClassificaUtenti(data))
      .catch((err) => console.error(err));
  }, []);


  const toggleClassifica = () => {
    setTipoClassifica((prev) =>
      prev === "modelli" ? "giocatori" : "modelli"
    );
  };

  const titolo =
    tipoClassifica === "modelli"
      ? "Classifica Modelli LLM"
      : "Classifica Giocatori";

  const didascalia =
    tipoClassifica === "modelli"
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
          {tipoClassifica === "modelli" ? "👥 Giocatori" : "🤖 Modelli"}
        </button>
      </div>

      {/* Sottotitolo */}
      <p className="mb-6 text-gray-700 dark:text-green-200 text-sm whitespace-pre-line">
        {didascalia}
      </p>

      {/* Rendering classifica */}
      {tipoClassifica === "modelli"

        ? classificaModelli
          .slice() // crea una copia per non modificare lo stato originale
          .sort((a, b) => {
            // decrescente percentuale
            const diff = parseFloat(b.percentuale) - parseFloat(a.percentuale);
            if (diff !== 0) return diff;
            // se uguale, crescente id
            return a.id - b.id;
          })
          .map((m, index) => <ModelRankingRow key = {m.id_modello} rank = {index + 1} {...m} />)

        : classificaUtenti.map((u, index) => (
            <PlayerRankRow key = {u.id_utente} rank = {index + 1} {...u} />
          ))
      }
    </div>
  );
}

export default RankingPage;
