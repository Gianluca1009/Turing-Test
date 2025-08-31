import asyncio
from src.backend.classes import Message, Lobby

def build_prompt_for_model(conversation: list[Message]) -> str:
    """
        Funzione che converte una lista di oggetti 'Message' in una stringa prompt per Gemma 3.
        
        :param -> conversation: lista di messaggi della conversazione contenuta nella lobby
        :return -> stringa pronta per Gemma 3
    """
    
    conversation_parts = []

    # Converte ogni messaggio
    for message in conversation:
        if message.role.lower() == "user":
            conversation_parts.append(f"Utente: {message.text}")
        elif message.role.lower() == "assistant":
            conversation_parts.append(f"Assistente: {message.text}")
        else:
            conversation_parts.append(f"{message.role.capitalize()}: {message.text}")

    # Segnala al modello che deve continuare come assistente
    conversation_parts.append("Assistente:")
    
    # Contiene la conversazione come stringa multilinea leggibile dal il modello ("\n" è il separatore)
    conversation_string = "\n".join(conversation_parts) 

    return conversation_string


def generate_AI_response_sync(input: str, lobby: Lobby) -> str:
    """ Funzione che genera e ritorna la risposta del modello """
    
    # Genera la risposta del modello in base alla conversazione in input
    response = lobby.llm.model.generate_content(input)
    
    return response.text


async def generate_AI_response_async(input: str, lobby: Lobby) -> str:
    """
        Funzione che esegue 'generate_AI_response_sync' in un thread separato (modalità asincrona).
        Evita di aspettare la generazione della risposta del bot per poter visualizzare sull'interfaccia 
        il messaggio inviato dall'utente
    """
    
    # Viene recuperato l'event loop
    loop = asyncio.get_event_loop() 
    
    # Esegue 'generate_AI_response_sync' in un thread separato, così non blocca l'event loop
    response = await loop.run_in_executor(None, generate_AI_response_sync, input, lobby) 
    
    # Ritorna la risposta del modello
    return response