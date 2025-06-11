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
lobbies: dict[str, list[str, str]] = {}

@sio.event
async def connect (sid):
    """ Stampa l'id dell'utente appena connesso """
    logging.info(f"Client connected: {sid}")

@sio.event
async def find_chat(sid):
    trovata = False
    for key in lobbies:
        lobby = lobbies[key]
        if(len(lobby) == 1):
            # Se c'è qualche giocatore in attesa, inseriamo il nuovo utente nella sua lobby
            lobby.append(sid)
            trovata = True
    if trovata == False:
        # Crea una nuova lobby con id univoco se non ci sono giocatori in attesa
        lobbies[str(uuid.uuid4())] = [sid]
    logging.info(lobbies)
    
        
        

@sio.event
async def chat_message(sid, data):
    # Broadcast incoming message to all connected clients
    await sio.emit("chat_message", data)

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

# ASGI application combining FastAPI and Socket.IO
app = socketio.ASGIApp(sio, other_asgi_app = app)

