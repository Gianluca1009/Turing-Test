from pydantic import BaseModel
from typing import Optional

# Gestisce i dati relativi a un utente
class User(BaseModel):
    username: str
    sid: str

# Contiene i dati relativi a un messaggio
class Message(BaseModel):
    text: str
    sender: User

class Chat(BaseModel):
    text: str
    
# Contiene i dati relativi a una lobby
class Lobby(BaseModel):
    messages: list[Message]
    lobby_id: str
    user_1: Optional[User] = None
    user_2: Optional[User] = None