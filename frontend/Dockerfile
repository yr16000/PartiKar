# ---- Étape 1 : Build du frontend ----
FROM node:18 AS builder

WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json ./

# Installation des dépendances sans contrainte stricte
RUN npm install

# Copie du code source
COPY . .

# Build de l'application React (Tailwind inclus)
RUN npm run build


# ---- Étape 2 : Serveur Nginx pour la production ----
FROM nginx:alpine

# Copie du build final vers le dossier de distribution Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Expose le port 80 dans le conteneur
EXPOSE 80

# Commande par défaut pour lancer Nginx
CMD ["nginx", "-g", "daemon off;"]
