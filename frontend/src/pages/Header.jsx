import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ toggleDarkMode, darkMode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <header className="w-full bg-gray-300 dark:bg-black bg-opacity-90 border-b border-green-900 py-6 px-8 flex items-center justify-between select-none relative transition-colors duration-300">
      <div className="flex items-center gap-6">
        {/* Menu hamburger */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="flex flex-col justify-center gap-1.5 w-10 h-10 cursor-pointer focus:outline-none bg-gray-200 dark:bg-black border border-green-400 rounded-md py-1 px-2 transition-colors duration-300"
            type="button"
          >
            <span
              className={`block w-full h-2 bg-green-400 rounded-xl transform transition duration-300 ease-in-out
              ${open ? 'rotate-[35deg] translate-y-4' : ''}`}
            />
            <span
              className={`block w-full h-2 bg-green-400 rounded-xl transition-opacity duration-300 ease-in-out
              ${open ? 'opacity-0' : 'opacity-100'}`}
            />
            <span
              className={`block w-full h-2 bg-green-400 rounded-xl transform transition duration-300 ease-in-out
              ${open ? '-rotate-[35deg] -translate-y-4' : ''}`}
            />
          </button>

          {open && (
            <ul className="absolute left-0 top-full mt-3 w-48 bg-white dark:bg-gradient-to-b dark:from-black/90 dark:to-black/70 border border-green-400 rounded-md shadow-[0_0_15px_rgba(34,197,94,0.6)] text-green-600 dark:text-green-400 font-semibold text-lg flex flex-col z-50 transition-colors duration-300">
              <li
                className="px-5 py-3 cursor-pointer hover:bg-green-600 hover:text-black transition"
                onClick={() => handleNavigate('/')}
              >
                Home
              </li>
              <li
                className="px-5 py-3 cursor-pointer hover:bg-green-600 hover:text-black transition"
                onClick={() => handleNavigate('/chat')}
              >
                Chat
              </li>
              <li
                className="px-5 py-3 cursor-pointer hover:bg-green-600 hover:text-black transition"
                onClick={() => handleNavigate('/classifica')}
              >
                Classifica
              </li>
              <li
                className="px-5 py-3 cursor-pointer hover:bg-green-600 hover:text-black transition"
                onClick={() => handleNavigate('/about')}
              >
                About
              </li>
            </ul>
          )}
        </div>

        {/* Titolo + emoji */}
        <h1 className="text-5xl font-extrabold text-green-500 tracking-widest drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] flex items-center gap-4 select-none">
          <span role="img" aria-label="robot" className="text-6xl select-none">
            🤖
          </span>
          ChatBot
        </h1>
      </div>

      {/* Dark mode toggle + saluto */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="px-3 py-2 bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-green-300 border border-green-400 rounded-md text-sm hover:bg-green-400 hover:text-black transition-colors"
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  );
}

export default Header;
