# Backend Dockerfile
FROM node:22-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar solo archivos de dependencias
COPY package*.json ./

# Instalar dependencias en la imagen
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puertos
EXPOSE 3000
EXPOSE 5555

# Comando por defecto
CMD ["npm", "run", "dev"]
