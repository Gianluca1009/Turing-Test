from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

# Socket.IO server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# FastAPI app for future REST endpoints
fastapi_app = FastAPI()
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def chat_message(sid, data):
    # Broadcast incoming message to all connected clients
    await sio.emit("chat_message", data)

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

# ASGI application combining FastAPI and Socket.IO
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)

