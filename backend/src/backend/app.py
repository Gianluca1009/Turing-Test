from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import socketio  # type: ignore
import logging
from src.backend.classes import RegistrationData, LoginData, StatsUpdate
from src.backend.utilities.lobby_utilities import *
from src.backend.utilities.AI_utilities import *
from src.backend.sockets import register_socket_handlers
from src.backend.config import get_connection

logging.basicConfig(level=logging.INFO)

# Socket.IO server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# app FastAPI
fastapi_app = FastAPI()
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registriamo gli handlers di socket
register_socket_handlers(sio)

# Combinazione: SocketIO + FastAPI
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)


@fastapi_app.post("/register")
def register(new_user_data: RegistrationData):
    
    username = new_user_data.username
    email = new_user_data.email
    password = new_user_data.password
    
    conn = get_connection()
    
    try:
        cursor = conn.cursor()

        # Controllo duplicati (username)
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            raise HTTPException(status_code = 400, detail = "Esiste già un account con questo username!")
        
        # Controllo duplicati (email)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            raise HTTPException(status_code = 400, detail = "Esiste già un account con questa email!")

        # Inserimento nuovo utente (0 trofei, vittorie e sconfitte iniziali)
        cursor.execute("""
            INSERT INTO users (username, email, pwd, trophies, victories, defeats)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (username, email, password, 0, 0, 0))
        conn.commit()
        
        return {"message": "Registrazione completata con successo"}
    
    finally:
        cursor.close()
        conn.close() 
    
    

@fastapi_app.post("/login")
def login(user_data: LoginData):
    email = user_data.email
    password = user_data.password

    conn = get_connection()
    
    try:
        cursor = conn.cursor(dictionary=True)

        # Cerca l'utente per email
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Non esiste un account associato a questa email!")

        # Verifica password 
        if user["pwd"] != password:
            raise HTTPException(status_code=401, detail="Password errata, riprovare")
        
        return user
    
    finally:
        cursor.close()
        conn.close()

    
    
    
@fastapi_app.get("/get_users_ranking")
def get_classifica_utenti():

    conn = get_connection()
    
    try:
        cursor = conn.cursor(dictionary=True)

        # Cerca l'utente per email
        cursor.execute("SELECT id_user, username, trophies FROM users ORDER BY trophies DESC")
        users_ranking = cursor.fetchall()

        if not users_ranking:
            raise HTTPException(status_code = 404, detail="Nessun utente trovato")
        
        return users_ranking
    
    finally:
        cursor.close()
        conn.close()


@fastapi_app.get("/get_models_ranking")
def get_classifica_modelli():

    conn = get_connection()
    
    try:
        cursor = conn.cursor(dictionary=True)

        # Recupera i dati relativi ai modelli e li mette in ordine di accuratezza (in caso di parità, usa gli id)
        cursor.execute(""" SELECT 
                                name,
                                victories,
                                defeats
                            FROM models
                            ORDER BY 
                                (CASE 
                                    WHEN (victories + defeats) > 0 
                                    THEN (victories / (victories + defeats)) * 100
                                    ELSE 0 
                                END) DESC,
                                id_model ASC;""") 
        model_ranking = cursor.fetchall()

        if not model_ranking:
            raise HTTPException(status_code = 404, detail = "Nessun modello trovato")
        
        return model_ranking
    
    finally:
        cursor.close()
        conn.close()


@fastapi_app.get("/get_opponent_trophies/{opponent_username}")
def get_opponent_data(opponent_username: str):

    conn = get_connection()
    
    try:
        cursor = conn.cursor(dictionary=True)

        # Cerca l'utente per email
        cursor.execute(
            "SELECT trophies FROM users WHERE username = %s",
            (opponent_username,)
        ) 
        trophies = cursor.fetchone()

        if not trophies:
            raise HTTPException(status_code = 404, detail = "Utente non presente nel database")
        
        return trophies
    
    finally:
        cursor.close()
        conn.close()
    
@fastapi_app.post("/update_stats")
def update_stats(data: StatsUpdate):
    user_name = data.username
    match_result = data.match_result
    opponent = data.opponent

    if match_result:
        if opponent == "human":
            amount = 15
        elif opponent == "bot":
            amount = 15
        query = "UPDATE users" \
        "SET trophies = trophies + %d, victories = victories + 1" \
        "WHERE username = %s"

    elif not match_result:
        if opponent == "human":
            amount = 15
        elif opponent == "bot":
            amount = 15
        query = "UPDATE users" \
        "SET trophies = trophies + %d, defeats = defeats + 1" \
        "WHERE username = %s"

    conn = get_connection()

    try:
        cursor = conn.cursor()

        cursor.execute(query, (amount, user_name))
        conn.commit()

        if cursor.rowcount <= 0:
            raise HTTPException(status_code = 404, detail = "Errore nell'aggiornamento delle statistiche")
        
    finally:
        cursor.close()
        conn.close()

