-- Creazione del database (opzionale, se non già fatto)
-- DROP DATABASE IF EXISTS cinema_db;
CREATE DATABASE IF NOT EXISTS bot_or_not_db;
USE bot_or_not_db;

-- Tabella Utenti
CREATE TABLE IF NOT EXISTS utenti (
    id_utente INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    trofei INT NOT NULL,
    vittorie INT NOT NULL,
    sconfitte INT NOT NULL
    -- colore_icona?
);

-- Tabella LLMs (IA)
CREATE TABLE IF NOT EXISTS modelli (
    id_modello INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    vittorie INT NOT NULL,
    sconfitte INT NOT NULL
);

CREATE TABLE IF NOT EXISTS recensioni (
    id_recensione INT AUTO_INCREMENT PRIMARY KEY,
    id_modello INT NOT NULL,
    testo TEXT NOT NULL,
    FOREIGN KEY (id_modello) REFERENCES modelli(id_modello) ON DELETE CASCADE
);

--- DEFINIRE LA STRUTTURA DEL DB
-- Tabella Chat
CREATE TABLE IF NOT EXISTS chat (
    id_chat INT AUTO_INCREMENT PRIMARY KEY,
    id_utente1 INT NOT NULL,
    id_utente2 INT,  -- NULL se parli con IA
    id_modello INT,  -- NULL se parli con altro umano

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

-- Elimina e crea nuovamente l'utente 'user', che ha tutti i privilegi sul db
-- DROP USER IF EXISTS 'user'@'%';
CREATE USER 'myuser'@'%' IDENTIFIED BY 'pwd';
GRANT ALL PRIVILEGES ON bot_or_not_db.* TO 'myuser'@'%';
FLUSH PRIVILEGES;