# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Build-Argument für API-URL
ARG VITE_API_URL=http://localhost:8000

# package-lock.json und package.json kopieren
COPY package-lock.json package.json ./

# Dependencies installieren (npm install da package-lock.json noch nicht aktualisiert)
# TODO: Nach lokalem npm install auf npm ci umstellen
RUN npm install

# Source-Code kopieren
COPY . .

# Umgebungsvariable für Build setzen
ENV VITE_API_URL=${VITE_API_URL}

# Build durchführen
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Build-Artefakte aus Stage 1 kopieren
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx-Konfiguration für React Router kopieren
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port 80 exponieren
EXPOSE 80

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]
