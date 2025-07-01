from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    username: str
    sid: str

class Message(BaseModel):
    text: str
    sender: User
    
class Lobby(BaseModel):
    messages: list[Message]
    lobby_id: str
    user_1: Optional[User] = None
    user_2: Optional[User] = None