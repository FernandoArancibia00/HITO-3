
# Node.js 20, version requerida por el proyecto
FROM node:20-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar archivos del frontend
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src

# Puerto utilizado por Vite
EXPOSE 5173

# Iniciar React con acceso desde Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
