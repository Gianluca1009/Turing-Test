import asyncio
import logging
from src.backend.classes import Message, ChatRequest, Lobby
from src.backend.utilities.lobby_utilities import create_bot_lobby, create_human_lobby, soft_disconnection, forced_disconnection, user_lobbies, lobbies
from src.backend.utilities.AI_utilities import get_bot_response


async def handle_bot_response(lobby: Lobby, sio) -> None:
    """Gestisce la risposta del bot e la invia al frontend"""
    
    message = await get_bot_response(lobby)
    await sio.emit("receive_chat_message", message.model_dump(), room=lobby.lobby_id)

    logging.info(f"Lobby state: {lobby}")
    logging.info(f"\n{lobby.conversation}")


def register_socket_handlers(sio):
    """ Registra tutti gli eventi socket """

    @sio.event
    async def connect(sid: str, environ, auth):
        """ Funzione utile a segnalare la connessione di un nuovo user al server (Debugging) """
        logging.info(f"Client connected: {sid}") # Debugging
    

    @sio.event
    async def join_lobby(sid: str, request: ChatRequest):
        """ Funzione che inserisce un utente in una lobby, creandone una nuova se necessario """
        
        request = ChatRequest(**request)
        
        # Viene creato un oggetto User con i dati passati
        user = request.user  

        if request.mode == "bot":
            
            # Viene scelto randomicamente se lo user_1 (quindi l'umano) invierà o no il primo messaggio
            import random
            user_1_starts = random.choice([True, False])
            
            # Viene generato un valore randomico, per decidere chi inizia la conversazione
            bot_starts = not user_1_starts # Se inizia il bot non inizia lo user e viceversa
            
            lobby = create_bot_lobby(user, bot_starts)
            
            # L'utente accede alla lobby
            await sio.enter_room(user.sid, lobby.lobby_id)
            await sio.emit("chat_ready", {
                "lobby_id": lobby.lobby_id, 
                "user_1_sid": lobby.user_1.sid, 
                "user_2_sid": lobby.llm.sid,
                "opponent_username": lobby.llm.name, 
                "user_1_starts": user_1_starts,
            }, room=user.sid)
            
            # Se 'bot_starts == True', chiama 'handle_bot_response' per generare il primo messaggio dell'AI
            if bot_starts:
                asyncio.create_task(handle_bot_response(lobby, sio))

        elif request.mode == "human":
            # Se la chat è tra due utenti, la lobby può già esistere
            
            # Indica se è stata trovata una lobby con un solo utente
            found = False

            for lobby in lobbies:
                lobby_id = lobby.lobby_id
                if lobby.user_2 is None and lobby.chat_with_AI == False:
                    # Se c'è solo un utente, completa la lobby con l'utente corrente
                    lobby.user_2 = user
                    user_lobbies[user.sid] = lobby
                    await sio.enter_room(user.sid, lobby_id) # Il secondo utente entra nella lobby
                    
                    # Viene scelto randomicamente se lo user_1 invierà o no il primo messaggio
                    import random
                    user_1_starts = random.choice([True, False])
                    
                    await sio.emit("chat_ready", {
                        "lobby_id": lobby_id, 
                        "user_1_sid": lobby.user_1.sid, 
                        "user_2_sid": lobby.user_2.sid,
                        "opponent_username": lobby.user_1.username,
                        "user_1_starts": user_1_starts,
                    }, room=user.sid)
                    
                    # Notifica anche il primo utente
                    if lobby.user_1 is not None:
                        await sio.emit("chat_ready", {
                            "lobby_id": lobby_id, 
                            "user_1_sid": lobby.user_1.sid, 
                            "user_2_sid": lobby.user_2.sid, 
                            "opponent_username": lobby.user_2.username,
                            "user_1_starts": user_1_starts,
                        }, room=lobby.user_1.sid)
                        
                    found = True
                    break

            if not found:
                # Se non trova lobby con posti liberi, ne crea una nuova e inserisce l'utente corrente al suo interno
                lobby = create_human_lobby(user)
                await sio.enter_room(user.sid, lobby.lobby_id) # Il primo utente entra nella lobby

        logging.info(f"Lobby state: {lobby}") # Debugging
    

    @sio.event
    async def send_chat_message(sid: str, message: Message, mode: str):
        """ Funzione utile a inviare un nuovo messaggio """
        
        logging.info(f"Lobby Mode: {mode}") # Debugging
        
        # Viene creato un oggetto Message con i dati passati
        message = Message(**message) 
        
        # Viene recuperata la lobby dell'utente che ha inviato il messaggio
        lobby = user_lobbies.get(message.sender.sid) 

        if lobby:
            # Il messaggio viene aggiunto alla conversazione della lobby e viene inviato al frontend tramite emit
            lobby.conversation.append(message)
            
            await sio.emit("receive_chat_message", message.model_dump(), room = lobby.lobby_id)
            logging.info(f"Lobby state: {lobby}") # Debugging

        else:
            # Error detection
            logging.warning(f"Utente {sid} ha inviato un messaggio senza essere in una lobby.")

        if mode == "bot":
            asyncio.create_task(handle_bot_response(lobby, sio)) 


    @sio.event
    async def disconnect(sid: str) -> None:
        """ Gestione dell'evento base disconnect di socket.io """
        await handle_disconnection(sid, time_expired = False)


    @sio.event
    async def user_left_lobby(sid: str) -> None:
        """ Gestione dell'evento lanciato quando uno dei due utenti lascia la lobby """
        await handle_disconnection(sid, time_expired = False)
        await sio.disconnect(sid)


    @sio.event
    async def time_expired(sid: str, data = None) -> None:
        """ Gestione dell'evento lanciato quando la chat termina correttamente """
        await handle_disconnection(sid, time_expired = True)
        await sio.disconnect(sid)
        
    
    @sio.event
    async def handle_disconnection(sid: str, time_expired: bool):
        """ Funzione utile a gestire la disconnessione dei due utenti dalla lobby di cui fanno parte """
        
        logging.info(f"Client disconnected: {sid}") # Debugging
        
        # Viene eliminata la corrispondenza sid - lobby in user_lobbies
        lobby = user_lobbies.pop(sid, None) 
        
        # Se lobby == null, o l'utente si è già disconnesso o la lobby è già stata eliminata (non serve fare altro)
        if not lobby:
             # Error detection
            logging.warning(f"{sid} già disconnesso o lobby già eliminata.")
            return
    
        # Troviamo il valore del sid dell'altro utente
        other_sid = None
        if lobby.user_1 and lobby.user_1.sid == sid and lobby.user_2:
            other_sid = lobby.user_2.sid
        elif lobby.user_2 and lobby.user_2.sid == sid and lobby.user_1:
            other_sid = lobby.user_1.sid
            
        # L'utente corrente lascia la lobby
        await sio.leave_room(sid, lobby.lobby_id)
        
        if time_expired:
            # Viene inviato all'altro utente l'evento 'chat_ended'
            await sio.emit("chat_ended", {"reason": "time_expired"}, room = lobby.lobby_id)
            
            soft_disconnection(sid, lobby)
        
        else:
            # Viene inviato all'altro utente l'evento 'chat_ended', in modo da farlo uscire dalla chat
            await sio.emit("chat_ended", {"reason": "disconnection"}, room = lobby.lobby_id)
            
            if other_sid:
                #  Anche l'altro utente deve lasciare la lobby, se è ancora al suo interno
                await sio.leave_room(other_sid, lobby.lobby_id)
                
                # Eliminiamo la corrispondenza user - lobby anche per l'altro utente
                user_lobbies.pop(other_sid, None)
                    
            forced_disconnection(sid, lobby)
                
            logging.info(f"Lobby state: {lobbies}") # Debugging

           
