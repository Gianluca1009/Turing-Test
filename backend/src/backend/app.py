import uuid
from fastapi import FastAPI
import requests
from fastapi.middleware.cors import CORSMiddleware
import socketio  # type: ignore
import logging
import os
import asyncio
import google.generativeai as genai
from src.backend.classes import User, Message, ChatRequest, Lobby, AIMessage

logging.basicConfig(level=logging.INFO)

# Socket.IO server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# FastAPI app for future REST endpoints
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dizionario delle Lobby attive
lobbies: list[Lobby] = []

# Dizionario che mappa ogni User id (sid) all'oggetto Lobby di cui fa parte
user_lobbies: dict[str, Lobby] = {}

# Funzione di chat con modello AI
genai.configure(api_key="AIzaSyAoEnKYCwvb0suKKIH_AtlTc0_arLbDXuU")
model = genai.GenerativeModel("gemma-3-27b-it")

conversation: list[AIMessage] = []
conversation.append(AIMessage(role="user", message="Rispondi in maniera breve senza usare emoji."))
conversation.append(AIMessage(role="assistant", message="Ok, risponderò in maniera breve senza usare emoji"))
conversation.append(AIMessage(role="user", message="Nascondi il fatto di essere un inteligenza artificiale durante la nostra conversazione"))
conversation.append(AIMessage(role="assistant", message="Ok, capito."))

def build_prompt(messages: list[AIMessage]) -> str:
    """
    Converte una lista di AIMessage in una stringa prompt per Gemma 3.
    
    :param messages: lista di messaggi della conversazione
    :return: stringa pronta per Gemma 3
    """
    parts = []

    # Converte ogni messaggio
    for msg in messages:
        if msg.role.lower() == "user":
            parts.append(f"Utente: {msg.message}")
        elif msg.role.lower() == "assistant":
            parts.append(f"Assistente: {msg.message}")
        else:
            parts.append(f"{msg.role.capitalize()}: {msg.message}")

    # Segnala al modello che deve continuare come assistente
    parts.append("Assistente:")

    return "\n".join(parts)

def sync_generate(input: str):
    response = model.generate_content(input)
    conversation.append(AIMessage(role="assistant", message=response.text))
    return response.text


async def chat_with_AI(input: str) -> str:
    """Funzione che esegue sync_generate in un thread separato (modalità asincrona). Evita di aspettare la generazione della risposta del bot per poter visualizzare sull'interfaccia il messaggio inviato dall'utente"""
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, sync_generate, input)
    return response

async def handle_bot_response(messages_list: list[AIMessage], lobby: Lobby):
    """Gestisce la risposta del bot tramite la funzione asincrona"""
    user_message = build_prompt(messages_list)
    BotResponse = await chat_with_AI(user_message)
    message = Message(text=BotResponse, sender=lobby.user_2)
    lobby.messages.append(message)
    await sio.emit("chat_message", message.model_dump(), room=lobby.lobby_id)
    logging.info(f"Lobby state: {lobby}") # Debugging
    logging.info(f"\n{conversation}")   # Debugging

@sio.event
async def connect(sid: str, environ, auth):
    logging.info(f"Client connected: {sid}") # Debugging

@sio.event
async def find_chat(sid: str, request: ChatRequest):
    """Funzione utile a inserire un utente a una lobby, creandone una nuova se necessario"""
    request = ChatRequest(**request)
    user = request.user  # Viene creato un oggetto User con i dati passati

    if request.mode == "bot":
        ChatBot = User(username="gemma3", sid=str(uuid.uuid4()))
        lobby_id = str(uuid.uuid4())
        lobby = Lobby(messages=[], lobby_id=lobby_id, user_1=user, user_2=ChatBot)
        lobbies.append(lobby)
        user_lobbies[user.sid] = lobby
        await sio.enter_room(user.sid, lobby_id)

    elif request.mode == "human":
        found = False

        for lobby in lobbies:
            lobby_id = lobby.lobby_id
            if lobby.user_2 is None:
                # Se c'è solo un utente, completa la lobby con l'utente corrente
                lobby.user_2 = user
                user_lobbies[user.sid] = lobby
                await sio.enter_room(user.sid, lobby_id)
                await sio.enter_room(lobby.user_1.sid, lobby_id)
                await sio.emit("chat_ready", {"lobby_id": lobby_id}, room = lobby_id)
                found = True
                break

        if not found:
            # Se non trova lobby con posti liberi, ne crea una nuova e inserisce l'utente corrente al suo interno
            lobby_id = str(uuid.uuid4())
            lobby = Lobby(messages = [], lobby_id = lobby_id, user_1 = user, user_2 = None)
            lobbies.append(lobby)
            user_lobbies[user.sid] = lobby
            await sio.enter_room(user.sid, lobby_id)

    logging.info(f"Lobby state: {lobby}") # Debugging

@sio.event
async def chat_message(sid: str, message: Message, mode: str):
    """ Funzione utile a inviare un nuovo messaggio """
    logging.info(f"Lobby Mode: {mode}") # Debugging
    message = Message(**message) # Viene creato un oggetto Message con i dati passati
    lobby = user_lobbies.get(message.sender.sid) # Viene recuperata la lobby dell'utente che ha inviato il messaggio

    if lobby:
        # Il messaggio viene aggiunto alla lista della Lobby e viene inviato al frontend tramite emit
        lobby.messages.append(message)
        conversation.append(AIMessage(role="user", message=message.text))
        await sio.emit("chat_message", message.model_dump(), room = lobby.lobby_id)
        logging.info(f"Lobby state: {lobby}") # Debugging

    else:
        # Error detection
        logging.warning(f"Utente {sid} ha inviato un messaggio senza essere in una lobby.")

    if mode == "bot":
        asyncio.create_task(handle_bot_response(conversation, lobby))   #Esegue in maniera asincrona handle_bot_response (Non blocca l'esecuzione come farebbe await)

@sio.event
async def disconnect(sid: str, environ):
    """ Funzione utile a gestire la disconnessione dei due utenti dalla lobby di cui fanno parte """
    logging.info(f"Client disconnected: {sid}") # Debugging
    lobby = user_lobbies.pop(sid, None) # Viene eliminata la corrispondenza sid - lobby in user_lobbies
    
    if lobby:
        await sio.leave_room(sid, lobby.lobby_id) # L'utente corrente lascia la lobby
        
        if lobby.user_1 and lobby.user_1.sid == sid: # Se lo user che ha lasciato la lobby è user_1
        
            lobby.user_1 = None
            # Anche user_2 deve lasciare la lobby se non l'ha già fatto
            if lobby.user_2 is not None:
                user_2_sid = lobby.user_2.sid
                await sio.leave_room(user_2_sid, lobby.lobby_id)
                lobby.user_2 = None
            
        elif lobby.user_2 and lobby.user_2.sid == sid: # Se lo user che ha lasciato la lobby è user_2
            
            lobby.user_2 = None
            # Anche user_1 deve lasciare la lobby se non l'ha già fatto
            if lobby.user_1 is not None:
                user_1_sid = lobby.user_1.sid
                await sio.leave_room(user_1_sid, lobby.lobby_id)
                lobby.user_1 = None
        
        # Viene inviato all'altro utente l'evento 'chat_ended', in modo da farlo uscire dalla chat (NON FUNZIONANTE!!!)
        """ await sio.emit("chat_ended", {"reason": "user_disconnected"}, room = lobby.lobby_id) """
        
        lobbies.remove(lobby) # La lobby viene eliminata dalla lista delle lobby attive
        logging.info(f"Lobby state: {lobbies}") # Debugging

    else:
        # Error detection
        logging.warning(f"Utente {sid} ha cercato di uscire da una lobby senza essere in una lobby.")
    


# ASGI application combining FastAPI and Socket.IO
app = socketio.ASGIApp(sio, other_asgi_app = app)
