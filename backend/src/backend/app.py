import random
import uuid
from fastapi import FastAPI, HTTPException
import requests
from fastapi.middleware.cors import CORSMiddleware
import socketio  # type: ignore
import logging
import asyncio
from src.backend.classes import  Message, ChatRequest, Lobby, RegistrationData
from src.backend.utilities.lobby_utilities import *
from src.backend.utilities.AI_utilities import *
from src.backend.config import conn

logging.basicConfig(level=logging.INFO)

# Socket.IO server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# app FastAPI
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/register")
def register(new_user_data: RegistrationData):
    
    username = new_user_data.username
    email = new_user_data.email
    password = new_user_data.password
    
    cursor = conn.cursor()

    # Controllo duplicati
    cursor.execute("SELECT * FROM utenti WHERE username=%s OR email=%s", (username, email))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Username o email già in uso")

    # Inserimento nuovo utente (0 trofei, vittorie e sconfitte iniziali)
    cursor.execute("""
        INSERT INTO utenti (username, email, pwd, trofei, vittorie, sconfitte)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (username, email, password, 0, 0, 0))
    conn.commit()

    return {"message": "Registrazione completata con successo"}


async def handle_bot_response(lobby: Lobby) -> None:
    """ Funzione che gestisce la risposta del bot tramite la funzione asincrona """
    
    # Stringa che contiene tutta la conversazione
    conversation_string = build_prompt_for_model(lobby.conversation)
    
    # Viene generata la risposta del bot e creato un oggetto messaggio che la contiene, inviato poi al frontend
    bot_response = await generate_AI_response_async(conversation_string, lobby) #
    message = Message(sender = lobby.llm, role = "assistant", text = bot_response)
    lobby.conversation.append(message)
    await sio.emit("handle_chat_message", message.model_dump(), room = lobby.lobby_id)
    
    logging.info(f"Lobby state: {lobby}") # Debugging
    logging.info(f"\n{lobby.conversation}")   # Debugging

@sio.event
async def connect(sid: str, environ, auth):
    """ Funzione utile a segnalare la connessione di un nuovo user al server (Debugging) """
    
    logging.info(f"Client connected: {sid}") # Debugging
    
    
@sio.event
async def join_lobby(sid: str, request: ChatRequest):
    """Funzione che inserisce un utente in una lobby, creandone una nuova se necessario"""
    request = ChatRequest(**request)
    user = request.user  # Viene creato un oggetto User con i dati passati

    if request.mode == "bot":
        
        # Viene scelto randomicamente se lo user_1 (quindi l'umano) invierà o no il primo messaggio
        user_1_starts = random.choice([True, False])
        
        # Viene generato un valore randomico, per decidere chi inizia la conversazione
        bot_starts = not user_1_starts # Se inizia il bot non inizia lo user e viceversa
        
        lobby = create_bot_lobby(user, bot_starts)
        
        # L'utente accede alla lobby
        await sio.enter_room(user.sid, lobby.lobby_id)
        await sio.emit("chat_ready", {
            "lobby_id": lobby.lobby_id, 
            "user_1_sid": lobby.user_1.sid, 
            "user_2_sid": lobby.llm.sid,
            "user_1_starts": user_1_starts,
            "model_name": lobby.llm.name
        }, room=user.sid)
        
        # Se 'bot_starts == True', chiama 'handle_bot_response' per generare il primo messaggio dell'AI
        if bot_starts:
            asyncio.create_task(handle_bot_response(lobby))

    elif request.mode == "human":
        # Se la chat è tra due utenti, la lobby può già esistere
        
        # Indica se è stata trovata una lobby con un solo utente
        found = False

        for lobby in lobbies:
            lobby_id = lobby.lobby_id
            if lobby.user_2 is None and lobby.chat_with_AI == False:
                # Se c'è solo un utente, completa la lobby con l'utente corrente
                lobby.user_2 = user
                user_lobbies[user.sid] = lobby
                await sio.enter_room(user.sid, lobby_id) # Il secondo utente entra nella lobby
                
                # Viene scelto randomicamente se lo user_1 invierà o no il primo messaggio
                user_1_starts = random.choice([True, False])
                
                await sio.emit("chat_ready", {
                    "lobby_id": lobby_id, 
                    "user_1_sid": lobby.user_1.sid, 
                    "user_2_sid": lobby.user_2.sid, 
                    "user_1_starts": user_1_starts,
                    "model_name": None
                }, room=user.sid)
                
                 # Notifica anche il primo utente
                if lobby.user_1 is not None:
                    await sio.emit("chat_ready", {
                        "lobby_id": lobby_id, 
                        "user_1_sid": lobby.user_1.sid, 
                        "user_2_sid": lobby.user_2.sid, 
                        "user_1_starts": user_1_starts,
                        "model_name": None
                    }, room=lobby.user_1.sid)
                    
                found = True
                break

        if not found:
            # Se non trova lobby con posti liberi, ne crea una nuova e inserisce l'utente corrente al suo interno
            lobby = create_human_lobby(user)
            await sio.enter_room(user.sid, lobby.lobby_id) # Il primo utente entra nella lobby

    logging.info(f"Lobby state: {lobby}") # Debugging
    

@sio.event
async def handle_chat_message(sid: str, message: Message, mode: str):
    """ Funzione utile a inviare un nuovo messaggio """
    
    logging.info(f"Lobby Mode: {mode}") # Debugging
    
    # Viene creato un oggetto Message con i dati passati
    message = Message(**message) 
    
    # Viene recuperata la lobby dell'utente che ha inviato il messaggio
    lobby = user_lobbies.get(message.sender.sid) 

    if lobby:
        # Il messaggio viene aggiunto alla conversazione della lobby e viene inviato al frontend tramite emit
        lobby.conversation.append(message)
        
        # conversation.append(AIMessage(role="user", message=message.text))
        
        # Viene emesso l'evento 'handle_chat_message', che invia il messaggio al frontend
        await sio.emit("handle_chat_message", message.model_dump(), room = lobby.lobby_id)
        logging.info(f"Lobby state: {lobby}") # Debugging

    else:
        # Error detection
        logging.warning(f"Utente {sid} ha inviato un messaggio senza essere in una lobby.")

    if mode == "bot":
        # Esegue in maniera asincrona handle_bot_response (Non blocca l'esecuzione come farebbe await)
        asyncio.create_task(handle_bot_response(lobby)) 


@sio.event
async def disconnect(sid: str, environ):
    """ Funzione utile a gestire la disconnessione dei due utenti dalla lobby di cui fanno parte """
    
    logging.info(f"Client disconnected: {sid}") # Debugging
    lobby = user_lobbies.pop(sid, None) # Viene eliminata la corrispondenza sid - lobby in user_lobbies
    
    if lobby:
        
        # Viene inviato all'altro utente l'evento 'chat_ended', in modo da farlo uscire dalla chat
        await sio.emit("chat_ended", {"reason": "The other user left the chat"}, room = lobby.lobby_id)
        
        # L'utente corrente lascia la lobby
        await sio.leave_room(sid, lobby.lobby_id) 
        
        # Se lo user che ha lasciato la lobby è user_1
        if lobby.user_1 and lobby.user_1.sid == sid: 
            lobby.user_1 = None
            
            # Anche user_2 deve lasciare la lobby se non l'ha già fatto
            if lobby.user_2 is not None:
                user_2_sid = lobby.user_2.sid
                await sio.leave_room(user_2_sid, lobby.lobby_id)
                lobby.user_2 = None
                # La lobby ormai vuota viene rimossa dalla lista delle lobby attive
                lobbies.remove(lobby) 
            
        # Se lo user che ha lasciato la lobby è user_2
        elif lobby.user_2 and lobby.user_2.sid == sid:
            lobby.user_2 = None
            
            # Anche user_1 deve lasciare la lobby se non l'ha già fatto
            if lobby.user_1 is not None:
                user_1_sid = lobby.user_1.sid
                await sio.leave_room(user_1_sid, lobby.lobby_id)
                lobby.user_1 = None
                # La lobby ormai vuota viene rimossa dalla lista delle lobby attive
                lobbies.remove(lobby) 
        
            
        logging.info(f"Lobby state: {lobbies}") # Debugging

    else:
        # Error detection
        logging.warning(f"Utente {sid} ha cercato di uscire da una lobby senza essere in una lobby.")
    


# ASGI application combining FastAPI and Socket.IO
app = socketio.ASGIApp(sio, other_asgi_app = app)
