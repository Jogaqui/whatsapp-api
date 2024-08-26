# Utiliza una imagen base de Node.js
FROM node:20-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia el archivo package.json y pnpm-lock.yaml (si existe)
COPY package.json pnpm-lock.yaml* ./

# Instala pnpm globalmente
RUN npm install -g pnpm

# Instala las dependencias
RUN pnpm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Copia los certificados SSL al contenedor
COPY cert.pem key.pem /usr/src/app/

# Expone el puerto 3200 para HTTPS
EXPOSE 3200

# Ejecuta la aplicación en modo desarrollo
CMD ["pnpm", "run", "dev"]
