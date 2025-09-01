import './App.css';
import { Routes, Route } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import Index from './pages/Index';
import Header from './components/Header';
import { useEffect, useState } from 'react';
import LogRegPopup from './components/account/LogRegPopup';
import OkRegPopup from './components/account/OkRegPopup';
import OkLoginPopup from './components/account/OkLoginPopup';
import AccountPage from './pages/AccountPage';

function App() {

  // useState utile a mostrare il popup che contiene i form di login/registrazione
  const [showLogRegPopup, setShowLogRegPopup] = useState(false);

  // useState utile a mostrare il popup che comunica la registrazione avvenuta con successo
  const [showOkRegPopup, setShowOkRegPopup] = useState(false);

    // useState utile a mostrare il popup che comunica il login avvenuto con successo
  const [showOkLoginPopup, setShowOkLoginPopup] = useState(false);

  // useState utile ad attivare e disattivare la dark mode
  const [darkMode, setDarkMode] = useState(true);

  // useEffect che applica la classe 'dark' all'elemento <html> per Tailwind
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Funzione che attiva o disttiva la dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen transition-colors duration-300">
      
      {/* Componente che contiene il nome del sito e la navbar */}
      <Header setOpenLogRegPopup = { setShowLogRegPopup } toggleDarkMode={ toggleDarkMode } darkMode={ darkMode } />

      {/* Popup che contiene i form di login/registrazione */}
      { showLogRegPopup && 
        <LogRegPopup 
          setShowLogRegPopup = { setShowLogRegPopup }
          setShowOkLoginPopup = { setShowOkLoginPopup }
          setShowOkRegPopup = { setShowOkRegPopup }
        /> 
      }

      {/* Popup che indica la registrazione effettuato con successo */}
      { showOkRegPopup && <OkRegPopup setShowOkRegPopup = { setShowOkRegPopup }/> }

      {/* Popup che indica il login effettuato con successo */}
      { showOkLoginPopup && <OkLoginPopup setShowOkLoginPopup = { setShowOkLoginPopup }/> }

      {/* Routes del sito, associa i percorsi alle componenti corrispondenti */}
      <Routes>
        <Route path = "/" element = { <Index /> } />
        <Route path = "/chat" element = { <ChatPage /> } />
        <Route path = "/account" element = { <AccountPage /> } />
        {/* <Route path = "/classifica" element = { <LogRegPopup /> } /> */}
      </Routes>
    </div>
  );
}

export default App;
