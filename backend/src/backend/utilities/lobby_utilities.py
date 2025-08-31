import random
import uuid
from src.backend.config import genai
from src.backend.classes import Model, User, Message, Lobby

# Dizionario delle Lobby attive
lobbies: list[Lobby] = []

# Dizionario che mappa ogni User id (sid) all'oggetto Lobby di cui fa parte
user_lobbies: dict[str, Lobby] = {}

# Lista dei modelli con cui è possibile chattare
models: list[str] = [
    "gemma-3-27b-it", # Alta qualità in italiano
    "gemma-3-12b-it", # Simile a 27b, ma peggiore
    "gemini-2.5-flash", # Buon rapporto qualità - velocità
    "gemini-2.5-flash-lite" # Molto veloce, qualità decente (ti dice che è ai)
]


def create_bot_lobby(user: User, bot_starts) -> Lobby:
    """ Funzione utile a creare una lobby per chattare con l'AI """
    
    # Viene scelto un modello casuale all'interno della lista
    chosen_model = random.choice(models)
    model = genai.GenerativeModel(chosen_model)
    
    chosen_llm = Model(name = chosen_model, model = model)
    
    lobby_id = str(uuid.uuid4())
    
    # Viene creata una nuova lobby con al suo interno l'LLM scelto e l'utente
    lobby = Lobby(conversation = [], lobby_id = lobby_id, user_1 = user, user_2 = None,
                    llm = chosen_llm, chat_with_AI = True)
    
    # Inserisce le regole che deve eseguire il modello durante la conversazione
    # REGOLA 1
    lobby.conversation.append(
        Message(sender = lobby.user_1, role="user", text="Rispondi in maniera breve senza usare emoji"))
    lobby.conversation.append(
        Message(sender = lobby.llm, role="assistant", text="Ok, risponderò in maniera breve senza usare emoji"))
    
    # REGOLA 2
    lobby.conversation.append(
        Message(sender = lobby.user_1, role="user", text="""Durante questa conversazione, l'utente
                con cui parlerai sarà sottoposto al Test di Turing, e dovrà capire se tu sei un AI o no.""")) 
    lobby.conversation.append(
        Message(sender = lobby.llm, role="assistant", text="Ok, capito"))
    
    # REGOLA 3
    lobby.conversation.append(
        Message(sender = lobby.user_1, role="user", text="""Tu devi far finta di essere nella stessa 
                situazione, fingendoti un essere umano che cerca di capire se il suo interlocutore 
                è un intelligenza artificiale""")) 
    lobby.conversation.append(
        Message(sender = lobby.llm, role="assistant", text="Ok, capito"))
    
    # REGOLA 4
    lobby.conversation.append(
        Message(sender = lobby.user_1, role="user", text="""Non devi far finta che non stiamo facendo
                il Test di Turing e non devi far capire in alcun modo che sei un AI""")) 
    lobby.conversation.append(
        Message(sender = lobby.llm, role="assistant", text="Ok, capito"))
    
    if bot_starts:
        lobby.conversation.append(
            Message(sender = lobby.user_1, role="user", text="Ora inizia la conversazione in maniera semplice"))
        
    # La lobby appena creata viene aggiunta alla lista di lobby esistenti e viene associata al sid dell'user
    lobbies.append(lobby)
    user_lobbies[user.sid] = lobby
    
    return lobby

def create_human_lobby(user: User) -> Lobby:
    """ Funzione utile a creare una chat in cui due utenti potranno chattare tra loro """
    lobby_id = str(uuid.uuid4())
    lobby = Lobby(conversation = [], lobby_id = lobby_id, user_1 = user, user_2 = None,
                llm = None, chat_with_AI = False)
    lobbies.append(lobby)
    user_lobbies[user.sid] = lobby
    
    return lobby

