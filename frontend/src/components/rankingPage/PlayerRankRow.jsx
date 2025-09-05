import React from "react";

function PlayerRankRow({ rank, username, trophies, icon }) {
  return (
    <div
      className={`max-w-2xl mx-auto mt-6 w-full rounded-xl shadow-md p-4 border transition-colors duration-300 select-none
        bg-gray-100 dark:bg-black/80 border-gray-300 dark:border-green-400 text-gray-900 dark:text-green-300`}
    >
      <div className="flex items-center justify-between">
        {/* Parte sinistra: rank + icona + username */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Rank */}
          <span
            className="text-2xl font-extrabold w-10 h-10 flex items-center justify-center text-green-600 dark:text-green-400"
          >
            {rank}
          </span>

          {/* Icona sempre come immagine rotonda */}
          <img
            src={icon}
            alt={`${trophies} icon`}
            className="w-16 h-16 object-cover rounded-full border shadow-sm shrink-0
              border-green-400/40 bg-white"
          />

          {/* Username */}
          <span className="text-xl font-semibold truncate">{username}</span>
        </div>

        {/* Trofei */}
        <div className="flex items-center gap-2 text-lg font-bold text-yellow-500 dark:text-yellow-400 shrink-0">
          🏆 {trophies}
        </div>
      </div>
    </div>
  );
}

export default PlayerRankRow;
