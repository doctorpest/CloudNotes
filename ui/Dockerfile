# Étape 1 : build Angular
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# build classique (pas besoin de ssr ici)
RUN npm run build

# Étape 2 : Nginx pour servir l'app
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# on vire la page par défaut de nginx
RUN rm -rf ./*

# ⚠️ le build Angular met l'app dans dist/ui/browser
COPY --from=builder /app/dist/ui/browser/ ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]