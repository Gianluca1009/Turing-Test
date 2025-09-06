import google.generativeai as genai
import mysql.connector # type: ignore

# Qui viene memorizzata la key in modo centralizzato
api_key = "AIzaSyCk9OqGh31CGX2I8WAru5QrHRV-oa24WOE"

# Configurazione di genai
genai.configure(api_key = api_key)

# Dati di configurazione per la connessione al db
dbconfig = {
    "host": "database",
    "user": "myuser",
    "password": "pwd",
    "database": "bot_or_not_db"
}

# Pool di connessioni al db, utile a non aprire una nuova connessione ogni volta
# Crea 10 connessioni utilizzate da diverse funzioni (simile al comportamento del semafori)
pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name = "mypool",
    pool_size = 10,
    **dbconfig
)

# Funzione per utilizzare una delle connessioni al db contenute nel pool
def get_connection():
    return pool.get_connection()