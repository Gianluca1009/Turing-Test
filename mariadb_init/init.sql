-- Creazione del database (opzionale, se non già fatto)
CREATE DATABASE IF NOT EXISTS turing_test_db;
USE turing_test_db;

-- Tabella Utenti
CREATE TABLE IF NOT EXISTS utenti (
    id_utente INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Tabella LLMs (IA)
CREATE TABLE IF NOT EXISTS modelli (
    id_modello INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    difficolta ENUM('facile', 'media', 'difficile') NOT NULL
);

-- Tabella Chat
CREATE TABLE IF NOT EXISTS chat (
    id_chat INT AUTO_INCREMENT PRIMARY KEY,
    id_utente1 INT NOT NULL,
    id_utente2 INT,  -- NULL se parli con IA
    id_modello INT,      -- NULL se parli con altro umano

    FOREIGN KEY (id_utente1) REFERENCES utenti(id_utente),
    FOREIGN KEY (id_utente2) REFERENCES utenti(id_utente),
    FOREIGN KEY (id_modello) REFERENCES modelli(id_modello)
);

-- Tabella Messaggi
CREATE TABLE IF NOT EXISTS messaggi (
    id_messaggio INT AUTO_INCREMENT PRIMARY KEY,
    id_chat INT NOT NULL,
    id_utente INT,  -- NULL se scritto da IA
    id_modello INT,     -- NULL se scritto da umano
    messaggio TEXT NOT NULL,
    send_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_chat) REFERENCES chat(id_chat) ON DELETE CASCADE,
    FOREIGN KEY (id_utente) REFERENCES utenti(id_utente),
    FOREIGN KEY (id_modello) REFERENCES modelli(id_modello)
);