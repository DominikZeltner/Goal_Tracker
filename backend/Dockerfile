# Konzept 1.11 / 1.13: Docker-Backend mit python:3.12-slim
FROM python:3.12-slim

WORKDIR /app

# Dependencies zuerst kopieren (Layer-Caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application-Code kopieren
COPY . .

# Start per uvicorn auf Port 8000 (siehe Konzept 1.4)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
