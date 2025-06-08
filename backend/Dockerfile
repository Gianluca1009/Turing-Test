FROM python:3.11

WORKDIR /app

RUN pip install fastapi uvicorn mariadb

COPY src /app/src

ENV PYTHONPATH=/app/src

EXPOSE 8003

CMD ["uvicorn", "src.backend.backend:app", "--host", "0.0.0.0", "--port", "8003"]
