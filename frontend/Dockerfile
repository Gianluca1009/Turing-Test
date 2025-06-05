# Copiato dall'esonero, da cambiare forse

FROM alpine 
# python?

# Set the container working directory
WORKDIR /app

# Copies requirements.txt into the working directory
COPY requirements.txt .

# Installs dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copies the content of src folder in the /app/src folder
COPY src /app/src

# Copies static folder
COPY static /app/static

# Copies templates folder
COPY templates /app/templates

# Includes src folder to the path
ENV PYTHONPATH=/app/src

# Expose port 8001
EXPOSE 8001

# Runs the app with uvicorn
CMD ["uvicorn", "frontend.server.frontend_server:app", "--host", "0.0.0.0", "--port", "8001"]