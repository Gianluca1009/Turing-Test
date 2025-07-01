import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio  # type: ignore
import logging
from src.backend.classes import User, Message, Lobby

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

# Dizionario delle lobby attive
# lobbies: dict[str, Lobby] = {}
lobbies: list[Lobby] = []

# Mappa ogni utente (sid) alla lobby a cui appartiene
user_lobbies: dict[str, Lobby] = {}

@sio.event
async def connect(sid, environ, auth):
    logging.info(f"Client connected: {sid}")

@sio.event
async def find_chat(sid, user):
    found = False
    user = User(**user)  # Username provvisorio (es. SID)

    for lobby in lobbies:
        lobby_id = lobby.lobby_id
        if lobby.user_2 is None:
            lobby.user_2 = user
            user_lobbies[user.sid] = lobby
            await sio.enter_room(user.sid, lobby_id)
            await sio.enter_room(lobby.user_1.sid, lobby_id)
            await sio.emit("chat_ready", {"lobby_id": lobby_id}, room = lobby_id)
            found = True
            break

    if not found:
        lobby_id = str(uuid.uuid4())
        lobby = Lobby(messages = [], lobby_id = lobby_id, user_1 = user, user_2 = None)
        lobbies.append(lobby)
        user_lobbies[user.sid] = lobby
        await sio.enter_room(user.sid, lobby_id)

    logging.info(f"Lobby state: {lobbies}")

@sio.event
async def chat_message(sid, message):
    print("Messaggio ricevuto:", message)
    message = Message(**message)
    lobby = user_lobbies.get(message.sender.sid)
    if lobby:
        lobby.messages.append(message)
        await sio.emit("chat_message", message.model_dump(), room = lobby.lobby_id)
    else:
        logging.warning(f"Utente {sid} ha inviato un messaggio senza essere in una lobby.")

@sio.event
async def disconnect(sid):
    logging.info(f"Client disconnected: {sid}")
    lobby = user_lobbies.pop(sid, None)
    if lobby:
        await sio.leave_room(sid, lobby.lobby_id)
        if lobby.user_1 and lobby.user_1.sid == sid:
            lobby.user_1 = None
        elif lobby.user_2 and lobby.user_2.sid == sid:
            lobby.user_2 = None
        if lobby.user_1 is None and lobby.user_2 is None:
            lobbies.remove(lobby)

# ASGI application combining FastAPI and Socket.IO
app = socketio.ASGIApp(sio, other_asgi_app = app)
