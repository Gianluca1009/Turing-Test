import './App.css';
import { Routes, Route } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import Index from './pages/Index';
import Header from './components/Header';
import { useEffect, useState } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  // Applica la classe 'dark' all'elemento <html> per Tailwind
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen transition-colors duration-300">
      <Header toggleDarkMode={() => setDarkMode(!darkMode)} darkMode={darkMode} />
      
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;
