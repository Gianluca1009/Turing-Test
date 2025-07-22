#!/bin/bash
#!/bin/bash
# SCRIPT ESEGUTO NEL CONTAINER OLLAMA. SCARICA E AVVIA IL MODELLO ALL'AVVIO CONTROLLANDO SE è GIà PRESENTE PER I SUCCESSIVI AVVII
set -e  # Termina immediatamente lo script se un comando restituisce un errore

MODEL_NAME="phi:2.7b"

echo "Avvio ollama serve in background..."
ollama serve &  # & permette di avviare il comando in background e continuare con le altre istruzioni

# aspetta che il server sia operativo (puoi aumentare se serve)
sleep 5

echo "Controllo se il modello $MODEL_NAME è presente..."
if ! ollama list | grep -q "$MODEL_NAME"; then    # Grep si usa per cercare del testo all'interno di un file. In questo caso cerca il model name nella lista dei modelli scaricati
  echo "Modello $MODEL_NAME non trovato, scarico..."
  ollama pull $MODEL_NAME
else
  echo "Modello $MODEL_NAME già presente."
fi

# Avvia il modello in background
ollama run $MODEL_NAME &
wait    # Il container rimane attivo
