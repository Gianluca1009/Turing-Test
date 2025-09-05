-- Creazione del database (opzionale, se non già fatto)
CREATE DATABASE IF NOT EXISTS bot_or_not_db;
USE bot_or_not_db;

-- Tabella Utenti
CREATE TABLE IF NOT EXISTS users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    trophies INT NOT NULL,
    victories INT NOT NULL,
    defeats INT NOT NULL
    -- colore_icona?
);

-- Tabella LLMs (IA)
CREATE TABLE IF NOT EXISTS models (
    id_model INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    victories INT NOT NULL,
    defeats INT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
    id_review INT AUTO_INCREMENT PRIMARY KEY,
    id_model INT NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (id_model) REFERENCES models(id_model) ON DELETE CASCADE
);

--- DEFINIRE LA STRUTTURA DEL DB
-- Tabella Chat
CREATE TABLE IF NOT EXISTS chat (
    id_chat INT AUTO_INCREMENT PRIMARY KEY,
    id_user_1 INT NOT NULL,
    id_user_2 INT,  -- NULL se parli con IA
    id_model INT,  -- NULL se parli con altro umano

    FOREIGN KEY (id_user_1) REFERENCES users(id_user),
    FOREIGN KEY (id_user_2) REFERENCES users(id_user),
    FOREIGN KEY (id_model) REFERENCES models(id_model)
);

-- Tabella Messaggi
CREATE TABLE IF NOT EXISTS messagges (
    id_messagge INT AUTO_INCREMENT PRIMARY KEY,
    id_chat INT NOT NULL,
    id_user INT,  -- NULL se scritto da IA
    id_model INT, -- NULL se scritto da umano
    messagge TEXT NOT NULL,
    send_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_chat) REFERENCES chat(id_chat) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_model) REFERENCES models(id_model)
);

-- Inseriamo i modelli all'interno dell'omonima tabella 
INSERT INTO models (name, victories, defeats) VALUES
('Gemma-3-27b-it', 120, 45),
('Gemma-3-12b-it', 95, 60),
('Gemini-2.5-flash', 80, 70),
('Gemini-2.5-flash-lite', 110, 55);

-- Elimina e crea nuovamente l'utente 'user', che ha tutti i privilegi sul db
DROP USER IF EXISTS 'myuser'@'%';
CREATE USER 'myuser'@'%' IDENTIFIED BY 'pwd';
GRANT ALL PRIVILEGES ON bot_or_not_db.* TO 'myuser'@'%';
FLUSH PRIVILEGES;