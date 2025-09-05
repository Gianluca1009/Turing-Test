import { Trophy } from "lucide-react";

function OpponentInfo({ imageUrl, name, trophies, success_rate }) {
  return (
    <div className="flex items-center gap-3 p-3 my-3 rounded-xl border-2 border-gray-800 dark:border-white bg-grey-300 dark:bg-gray-700 shadow-sm">
      {/* Foto profilo */}
      <img
        src={imageUrl}
        alt={name}
        className="w-12 h-12 rounded-full object-cover shadow-sm"
      />

      {/* Nome + Trofei sulla stessa riga */}
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold">{name}</span>
        {trophies != null ?
          // Se trophies !== null allora l'opponent è umano 
          <div className="flex items-center text-sm text-gray-600">
            <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
            {trophies}
          </div>
          :
          // Se trophies === null allora l'opponent è un bot e success_rate !== null
          <p className="flex items-center text-sm text-gray-600">
            {success_rate} % di successo
          </p>
          }
      </div>
    </div>
  );
}

export default OpponentInfo;