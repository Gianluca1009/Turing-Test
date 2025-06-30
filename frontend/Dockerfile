# Stage 1: Build
FROM node:20-alpine as build

WORKDIR /app

# Copia file package.json e package-lock.json per installare dipendenze
COPY package*.json ./

RUN npm install

# Copia tutto il codice
COPY . .

# Costruisci la build di produzione (dipende dal tuo setup: qui per CRA o Vite)
RUN npm run build

# Stage 2: Serve la build statica con nginx
FROM nginx:stable-alpine

# Copia la build generata nel percorso dove nginx serve i file
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Espone la porta 80
EXPOSE 80

# Comando di default per nginx (già presente nell'immagine)
CMD ["nginx", "-g", "daemon off;"]
