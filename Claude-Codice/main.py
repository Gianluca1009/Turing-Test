from fastapi import FastAPI, HTTPException, Form, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import List
import json
import os
from datetime import datetime

app = FastAPI()

# Configurazione templates
templates = Jinja2Templates(directory="templates")

# Modello per i messaggi
class Message(BaseModel):
    text: str
    sender: str  # "user" o "bot"
    timestamp: str

# Lista per salvare i messaggi (in produzione useresti un database)
messages_storage: List[Message] = []

# Serve i file statici
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def get_chat(request: Request):
    """Serve la pagina HTML della chat"""
    return templates.TemplateResponse("chat.html", {"request": request})

@app.post("/send-message", response_class=HTMLResponse)
async def send_message(request: Request, message: str = Form(...)):
    """Endpoint per inviare un messaggio tramite HTMX"""
    try:
        # Salva il messaggio dell'utente
        user_message = Message(
            text=message,
            sender="user",
            timestamp=datetime.now().isoformat()
        )
        messages_storage.append(user_message)
        
        # Simula una risposta del bot (qui puoi integrare la tua IA)
        bot_response_text = f"Hai detto: {message}"
        
        bot_message = Message(
            text=bot_response_text,
            sender="bot",
            timestamp=datetime.now().isoformat()
        )
        messages_storage.append(bot_message)
        
        # Salva su file (opzionale - per persistenza)
        save_messages_to_file()
        
        # Ritorna i nuovi messaggi come HTML
        return templates.TemplateResponse("messages.html", {
            "request": request,
            "user_message": user_message,
            "bot_message": bot_message
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/messages", response_class=HTMLResponse)
async def get_messages(request: Request):
    """Endpoint per recuperare tutti i messaggi"""
    return templates.TemplateResponse("all_messages.html", {
        "request": request,
        "messages": messages_storage
    })

def save_messages_to_file():
    """Salva i messaggi su file JSON"""
    try:
        with open("messages.json", "w", encoding="utf-8") as f:
            json.dump([msg.dict() for msg in messages_storage], f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Errore nel salvare i messaggi: {e}")

def load_messages_from_file():
    """Carica i messaggi dal file JSON all'avvio"""
    global messages_storage
    try:
        if os.path.exists("messages.json"):
            with open("messages.json", "r", encoding="utf-8") as f:
                data = json.load(f)
                messages_storage = [Message(**msg) for msg in data]
    except Exception as e:
        print(f"Errore nel caricare i messaggi: {e}")

# Carica i messaggi all'avvio
load_messages_from_file()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)