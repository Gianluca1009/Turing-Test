import random
import uuid
from fastapi import FastAPI, HTTPException
import requests
from fastapi.middleware.cors import CORSMiddleware
import socketio  # type: ignore
import logging
import asyncio
from src.backend.classes import  Message, ChatRequest, Lobby, RegistrationData, LoginData
from src.backend.utilities.lobby_utilities import *
from src.backend.utilities.AI_utilities import *
from src.backend.sockets import register_socket_handlers
from src.backend.config import conn

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
    
    cursor = conn.cursor()

    # Controllo duplicati (username)
    cursor.execute("SELECT * FROM utenti WHERE username=%s", (username,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Esiste già un account con questo username!")
    
    # Controllo duplicati (email)
    cursor.execute("SELECT * FROM utenti WHERE email=%s", (email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Esiste già un account con questa email!")

    # Inserimento nuovo utente (0 trofei, vittorie e sconfitte iniziali)
    cursor.execute("""
        INSERT INTO utenti (username, email, pwd, trofei, vittorie, sconfitte)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (username, email, password, 0, 0, 0))
    conn.commit()

    return {"message": "Registrazione completata con successo"}

@fastapi_app.post("/login")
def login(user_data: LoginData):
    email = user_data.email
    password = user_data.password

    cursor = conn.cursor(dictionary=True)

    # Cerca l'utente per email
    cursor.execute("SELECT * FROM utenti WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="Non esiste un account associato a questa email!")

    # Verifica password 
    if user["pwd"] != password:
        raise HTTPException(status_code=401, detail="Password errata, riprovare")

    return {
        "message": "Login effettuato con successo",
        "id_utente": user["id_utente"],
        "username": user["username"],
        "email": user["email"],
        "trofei": user["trofei"],
        "vittorie": user["vittorie"],
        "sconfitte": user["sconfitte"]
    }


