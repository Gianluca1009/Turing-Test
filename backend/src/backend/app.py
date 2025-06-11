import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio # type: ignore
import logging

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

# Dizionario delle lobby di attesa
lobbies: dict[str, list[str]] = {}

# Dizionario per mappare utente a lobby a cui appartiene
user_lobbies: dict[str, str] = {}

@sio.event
async def connect(sid, environ, auth):
    logging.info(f"Client connected: {sid}")

@sio.event
async def find_chat(sid):
    found = False
    # lobby_id è l'id della lobby, lobby è la lista degli utenti in essa
    # lobbies.items() restituisce tutte le coppie (lobby_id, lobby)
    for lobby_id, lobby in lobbies.items():
        if len(lobby) == 1:
            lobby.append(sid)
            user_lobbies[sid] = lobby_id
            await sio.enter_room(sid, lobby_id) # mette il secondo utente nella "room" di Socket.IO associata alla lobby
            found = True

            # per sicurezza aggiunge anche il primo utente alla room, ma dovrebbe esserci già
            await sio.enter_room(lobby[0], lobby_id)

            # Notifica entrambi che la chat è pronta
            await sio.emit("chat_ready", {"lobby_id": lobby_id}, room=lobby_id)
            break

    if not found:
        lobby_id = str(uuid.uuid4())
        lobbies[lobby_id] = [sid]
        user_lobbies[sid] = lobby_id
        await sio.enter_room(sid, lobby_id)

    logging.info(f"Lobby state: {lobbies}")
   
@sio.event
async def chat_message(sid, data):
    lobby_id = user_lobbies.get(sid)
    if lobby_id:
        # Invia il messaggio solo agli utenti nella stessa lobby
        message_with_sender = {
            "text": data["text"],
            "sender": sid  # aggiungi il sid del mittente
        }
        await sio.emit("chat_message", message_with_sender, room=lobby_id)
    else:
        logging.warning(f"Utente {sid} ha inviato un messaggio senza essere in una lobby.")

@sio.event
async def disconnect(sid):
    logging.info(f"Client disconnected: {sid}")
    # rimuove la voce corrispondente a sid da user_lobbies e ne restituisce il valore (cioè la lobby a cui apparteneva)
    lobby_id = user_lobbies.pop(sid, None)
    if lobby_id:
        # Rimuove l'utente dalla stanza (room) Socket.IO
        await sio.leave_room(sid, lobby_id)
        # recupera la lista degli utenti ancora presenti nella lobby con id lobby_id
        # lobbies è il dizionario che mantiene tutte le lobby attive e i relativi utenti
        lobby = lobbies.get(lobby_id)
        if lobby:
            # Rimuove l'utente dalla lista dei membri della lobby
            lobby.remove(sid)
            # Se dopo aver rimosso l’utente la lobby è vuota, la elimina dal dizionario lobbies
            if len(lobby) == 0:
                del lobbies[lobby_id]

# ASGI application combining FastAPI and Socket.IO
app = socketio.ASGIApp(sio, other_asgi_app = app)