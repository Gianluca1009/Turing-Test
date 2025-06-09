import React from 'react';
import { useNavigate } from 'react-router-dom';

function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-300 dark:bg-black text-gray-900 dark:text-gray-300 transition-colors duration-300">

      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        
        {/* Luci neon verdi sfocate animate */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-400 rounded-full opacity-20 filter blur-3xl animate-blob animation-delay-0"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-green-500 rounded-full opacity-30 filter blur-2xl animate-blob animation-delay-3000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-600 rounded-full opacity-25 filter blur-3xl animate-blob animation-delay-6000"></div>

        {/* Contenuto centrale */}
        <div className="relative bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 border border-green-400 rounded-3xl p-12 shadow-lg max-w-md w-full text-center z-10 transition-colors duration-300">
          <h1 className="text-4xl font-extrabold text-green-500 mb-6 tracking-wider">
            Benvenuto su BotOrNot
          </h1>
          <p className="text-green-500 mb-10">
            Scopri se stai parlando con una persona reale o con una potente intelligenza artificiale.
          </p>
          <div className="flex flex-col gap-5">
            <button
              onClick={() => navigate('/chat')}
              className="bg-transparent border-2 border-green-600 hover:bg-green-400 hover:text-black text-green-500 py-4 px-8 rounded-xl font-semibold transition"
            >
              Vai alla Chat
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Index;
