import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OpponentProvider } from './contexts/OpponentContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OpponentProvider>
          <App />
        </OpponentProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

