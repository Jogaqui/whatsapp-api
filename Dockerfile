# Utiliza una imagen base de Node.js
FROM node:20-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia el archivo package.json y pnpm-lock.yaml (si existe)
COPY package.json pnpm-lock.yaml* ./

# Instala pnpm globalmente
RUN npm install -g pnpm
# RUN pnpm add polka
pnpm add express @types/express

# Instala las dependencias de la aplicación
RUN pnpm i

# Copia el resto de los archivos de la aplicación
COPY . .

# Copia los certificados SSL en formato PEM al contenedor
# COPY cert.pem key.pem /usr/src/app/

# Expone el puerto 3200 para HTTPS
EXPOSE 3002

# Ejecuta la aplicación
CMD ["pnpm", "run", "dev"]
