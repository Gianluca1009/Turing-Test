# Turing-Test

# Struttura DB:

# Tabella Messaggi 
    # id_messaggio (PK)
    # id_chat (FK) 
    # id_utente (NULL se il messaggio è dell'IA) (FK)
    # id_IA (NULL se il messaggio è dell'utente) (FK)
    # messaggio
    # send_time (momento dell'invio)

# Tabella Chat
    # id_chat (PK)
    # id_utente1 (FK)
    # id_utente2 (NULL se è IA) (FK)
    # id_IA (NULL se è umano) (FK)

# Utenti
    # id_utente (PK) 
    # username 
    # e-mail (UK)
    # password

# Modelli
    # id_modello (PK)
    # nome (UK)
    # difficoltà
