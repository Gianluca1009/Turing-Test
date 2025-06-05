# Copiato dall'esonero, da cambiare forse

FROM alpine 
# python?

# Update system packages and install GCC and MariaDB client libraries
RUN apt-get update && apt-get install -y \
    gcc \
    libmariadb-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the container working directory
WORKDIR /app

# Copies requirements.txt into the working directory
COPY requirements.txt .

# Installs dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copies the content of src folder in the /app/src folder
COPY src /app/src

# Includes src folder to the path
ENV PYTHONPATH=/app/src

# Expose port 8001
EXPOSE 8003

# Runs the app with uvicorn
CMD ["uvicorn", "backend.server.backend_server:app", "--host", "0.0.0.0", "--port", "8003"]