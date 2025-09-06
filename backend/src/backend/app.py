from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import socketio  # type: ignore
import logging
from src.backend.classes import RegistrationData, LoginData, StatsUpdate, ChatData, MessageData
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
    """ Endpoint utile a registrare un nuovo account e inserirne i dati all'interno del database """
    
    # Recuperiamo i dati passati in input
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
    """ Enpoint utile a effettuare il login """
    
    # Recuperiamo i dati passati in input
    email = user_data.email
    password = user_data.password

    conn = get_connection()
    
    try:
        cursor = conn.cursor(dictionary=True)

        # Controlla se esistono già utenti con la mail inserita
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Non esiste un account associato a questa email!")

        # Controlla se la password inserita è giusta 
        if user["pwd"] != password:
            raise HTTPException(status_code=401, detail="Password errata, riprovare")
        
        return user
    
    finally:
        cursor.close()
        conn.close()

    
    
    
@fastapi_app.get("/get_users_ranking")
def get_classifica_utenti():
    """ Endopoint utile a restituire la lista di tutti gli utenti ordinata rispetto ai trofei di ognuno """

    conn = get_connection()
    
    try:
        cursor = conn.cursor(dictionary=True)

        # Seleziona i dati necessari al frontend per ogni utente nel database
        cursor.execute("SELECT id_user, username, trophies FROM users ORDER BY trophies DESC")
        users_ranking = cursor.fetchall()

        # Se la tabella 'users' è vuota, lancia un'eccezione gestita dal frontend
        if not users_ranking:
            raise HTTPException(status_code = 404, detail="Nessun utente trovato")
        
        return users_ranking
    
    finally:
        cursor.close()
        conn.close()


@fastapi_app.get("/get_models_ranking")
def get_classifica_modelli():
    """ Endopoint utile a restituire la lista di tutti i modelli ordinata rispetto alla loro percentuale
        di successo 
    """

    conn = get_connection()
    
    try:
        cursor = conn.cursor(dictionary=True)

        # Recupera i dati relativi ai modelli e li mette in ordine di accuratezza (in caso di parità, usa gli id)
        cursor.execute(""" SELECT 
                                name,
                                victories,
                                defeats,
                                id_model
                            FROM models
                            ORDER BY 
                                (CASE 
                                    WHEN (victories + defeats) > 0 
                                    THEN (victories / (victories + defeats)) * 100
                                    ELSE 0 
                                END) DESC,
                                id_model ASC;""") 
        model_ranking = cursor.fetchall()

        # Nel caso la tabella 'models' sia vuota, lancia un'eccezione gestita dal frontend
        if not model_ranking:
            raise HTTPException(status_code = 404, detail = "Nessun modello trovato")
        
        return model_ranking
    
    finally:
        cursor.close()
        conn.close()


@fastapi_app.get("/get_opponent_data/{opponent_username}")
def get_opponent_data(opponent_username: str):
    """ Endpoint utile a recuperare i dati relativi all'avversario della chat corrente """

    conn = get_connection()
    
    try:
        cursor = conn.cursor(dictionary=True)

        # Recupera i dati necessari al frontend filtrando l'utente tramite lo username univoco
        cursor.execute(
            "SELECT id_user, trophies FROM users WHERE username = %s",
            (opponent_username,)
        ) 
        data = cursor.fetchone()

        if not data:
            raise HTTPException(status_code = 404, detail = "Utente non presente nel database")
        
        return data
    
    finally:
        cursor.close()
        conn.close()
    
    
@fastapi_app.post("/update_stats")
def update_stats(data: StatsUpdate):
    """ Endpoint utile ad aggiornare le staistiche riguardanti trofei, vittorie e sconfitte a fine partita """
    
    # Recuperiamo i dati passati in input
    user_name = data.username
    opponent_name = data.opponent_name
    add = data.add  # add indica se lo user guadagna trofei (true) o se li perde (false)
    amount = data.amount 
    is_opponent_ai = data.is_opponent_ai

    conn = get_connection()
    try:
        cursor = conn.cursor()

        if add:
            # Se l'utente attivo vince, aumentano i trofei e le vittorie
            query_user = """
                UPDATE users
                SET trophies = trophies + %s,
                    victories = victories + 1
                WHERE username = %s
            """
            cursor.execute(query_user, (amount, user_name))
            
            if cursor.rowcount <= 0:
                raise HTTPException(
                    status_code=404,
                    detail="Errore nell'aggiornamento delle statistiche dell'utente"
            )

            # Se l'avversario perde, SOLO se l'avversario è un bot, aumentiamo le sue sconfitte
            if is_opponent_ai:
                query_opponent = """
                    UPDATE models
                    SET defeats = defeats + 1
                    WHERE name = %s
                """
                cursor.execute(query_opponent, (opponent_name,))
                
                if cursor.rowcount <= 0:
                    raise HTTPException(
                        status_code=404,
                        detail="Errore nell'aggiornamento delle statistiche del modello"
                )
        else:
            # Se l'utente attivo perde, diminuiscono i trofei e aumentano le sconfitte
            query_user = """
                UPDATE users
                SET trophies = GREATEST(trophies - %s, 0),
                    defeats = defeats + 1
                WHERE username = %s
            """
            cursor.execute(query_user, (amount, user_name))
            
            if cursor.rowcount <= 0:
                raise HTTPException(
                    status_code=404,
                    detail="Errore nell'aggiornamento delle statistiche dell'utente"
            )

            # Se l'avversario vince, SOLO se l'avversario è un bot, aumentiamo le sue vittorie
            if is_opponent_ai:
                query_opponent = """
                    UPDATE models
                    SET victories = victories + 1
                    WHERE name = %s
                """
                cursor.execute(query_opponent, (opponent_name,))
                
                if cursor.rowcount <= 0:
                    raise HTTPException(
                        status_code=404,
                        detail="Errore nell'aggiornamento delle statistiche del modello"
                )

        conn.commit()

    finally:
        cursor.close()
        conn.close()
        
        
@fastapi_app.post("/save_chat_data")
def save_chat_data(chat_data: ChatData):
    """ Endpoint utile a salvare i dati relativi a una chat (compresi i suoi messaggi) nel database """
    
    conn = get_connection()
    try:
        cursor = conn.cursor()

        # Salva i dati ricevuti dal frontend nella tabella 'chats'
        cursor.execute("""
            INSERT INTO chats (id_user_1, id_user_2, id_model)
            VALUES (%s, %s, %s)
        """, (chat_data.id_user_1, chat_data.id_user_2, chat_data.id_model))
        conn.commit()

        # Recuperiamo l'id della chat appena inserita nella tabella 
        id_chat = cursor.lastrowid

        # Salva i messaggi della chat ricevuti dal frontend nella tabella 'messages'
        for msg in chat_data.messages:
            cursor.execute("""
                INSERT INTO messages (id_chat, id_user, id_model, message)
                VALUES (%s, %s, %s, %s)
            """, (id_chat, msg.id_user, msg.id_model, msg.message))

        conn.commit()

    finally:
        cursor.close()
        conn.close()


@fastapi_app.get("/get_user_chats/{id_user}")
def get_user_chats(id_user: int):
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                c.id_chat,
                c.id_user_1,
                u1.username AS username_user_1,
                c.id_user_2,
                u2.username AS username_user_2,
                c.id_model,
                m.name AS model_name
            FROM chats c
            JOIN users u1 ON c.id_user_1 = u1.id_user
            LEFT JOIN users u2 ON c.id_user_2 = u2.id_user
            LEFT JOIN models m ON c.id_model = m.id_model
            WHERE c.id_user_1 = %s OR c.id_user_2 = %s
        """, (id_user, id_user))

        chats = cursor.fetchall()
        return chats
    finally:
        cursor.close()
        conn.close()
        
@fastapi_app.get("/get_chat_messages/{id_chat}", response_model = list[Message])
def get_chat_messages(id_chat: int):
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_message, id_chat, id_user, id_model, message
            FROM messages
            WHERE id_chat = %s
            ORDER BY id_message ASC
        """, (id_chat,))
        messages = cursor.fetchall()
        return messages
    finally:
        cursor.close()
        conn.close()