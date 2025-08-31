import google.generativeai as genai
import mysql.connector # type: ignore

# Qui viene memorizzata la key in modo centralizzato
api_key = "AIzaSyAxeEbu-oFCfBhvEQkRj0qk_YZOo1EnXnQ"

# Configurazione di genai
genai.configure(api_key = api_key)

# Connessione al DB (puoi mettere in config.py)
conn = mysql.connector.connect(
    host = "database", # nome del container
    user = "myuser",
    password = "pwd",
    database = "bot_or_not_db"
)
