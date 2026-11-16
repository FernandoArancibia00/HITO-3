
# Etapa 1: Compilar NestJS con Node.js 20
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY nest-cli.json tsconfig.json ./
COPY src ./src

RUN npm run build

# Etapa 2: Ejecutar el backend
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "npm run migration:run && npm run seed && exec node dist/main.js"]
