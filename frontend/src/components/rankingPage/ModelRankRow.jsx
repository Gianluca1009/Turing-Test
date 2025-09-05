import React from "react";

function ModelRankingRow({ rank, nome, percentuale, descrizione, logo }) {

  return (
    <div
      className={`max-w-2xl mx-auto mt-6 w-full rounded-xl shadow-md py-4 px-6 border transition-colors duration-300 select-none
        bg-gray-100 dark:bg-black/80 border-gray-300 dark:border-green-400 text-gray-900 dark:text-green-300`}
    >
      {/* Riga principale */}
      <div className="flex items-center justify-between">
        {/* Parte sinistra: posizione + logo + nome */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Rank */}
          <span
            // className={`text-2xl font-extrabold w-10 h-10 flex items-center justify-center rounded-full shadow-md shrink-0
            //     bg-green-900 dark:bg-green-200 text-green-300 dark:text-green-700`}
            className={`text-2xl font-extrabold w-10 h-10 flex items-center text-green-600 dark:text-green-400`}
          >
            {rank}
          </span>

          {/* Logo */}
          {logo && (
            <img
              src={logo}
              alt={`${nome} logo`}
              className="w-20 h-20 object-contain rounded-lg border shadow-sm shrink-0
                border-green-400/40 bg-white"
            />
          )}

          {/* Nome */}
          <span className="text-xl font-semibold truncate">{nome}</span>
        </div>

        {/* Percentuale di successo */}
        <div className="text-lg font-semibold text-green-600 dark:text-green-400 shrink-0">
          {percentuale}% 
        </div>
      </div>

      {/* Didascalia */}
      {descrizione && (
        <p className="mt-3 text-sm italic opacity-80">{descrizione}</p>
      )}
    </div>
  );
}

export default ModelRankingRow;

