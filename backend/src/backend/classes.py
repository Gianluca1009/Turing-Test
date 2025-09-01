from pydantic import BaseModel, Field
from typing import Optional, Union
import google.generativeai as genai # type: ignore

# Gestisce i dati relativi a un utente
class User(BaseModel):
    username: str
    sid: str
    
# Gestisce i dati relativi al LLM
class Model(BaseModel):
    name: str
    sid: str = "bot" # Utile per i controlli sul sid dei messaggi dal frontend
    model: genai.GenerativeModel  = Field(exclude=True)
    
    model_config = {
        "arbitrary_types_allowed": True
    }
    
# Contiene i dati relativi a un messaggio
class Message(BaseModel):
    sender: Union[User, Model] # Chi invia il messaggio può essere un utente o un LLM
    role: str # 'user' | 'assistant' (human or bot)
    text: str # Testo del messaggio inviato

# Contiene i dati della richiesta di uno user per l'inizio di una chat
class ChatRequest(BaseModel):
    mode: str # Indica se la chat richiesta coinvolge un altro utente o un bot
    user: User # E' lo user che invia la richiesta
    
# Contiene i dati relativi a una lobby
class Lobby(BaseModel):
    conversation: list[Message] # Storico dei messaggi inviati durante la chat
    lobby_id: str
    user_1: Optional[User] = None # E' un utente
    user_2: Optional[User] = None # Rimane None se si sta chattando con l'AI
    llm: Optional[Model] = None # Rimane None se si sta chattando con un altro essere umano
    chat_with_AI: bool # Indica se si sta chattando con un LLM o con un altro essere umano

 # Contiene i dati relativi alla registrazione di un nuovo utente
class RegistrationData(BaseModel):
    username: str 
    email: str
    password: str
    
 # Contiene i dati relativi alla registrazione di un nuovo utente
class LoginData(BaseModel):
    email: str
    password: str