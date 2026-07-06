# Dockerfile

# 1. Etapa de Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar los package.json para instalar dependencias en un solo paso
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Instalar todas las dependencias del monorepo
RUN npm install --workspaces

# Copiar el resto del código fuente
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Construir el frontend
RUN npm run build --workspace=frontend

# 2. Etapa de Producción
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copiar las dependencias de producción del backend
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./backend/node_modules


# Copiar el backend y el frontend construido
COPY --from=builder /app/backend ./
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY package.json ./

RUN npm install -g concurrently

EXPOSE 8080

CMD [ "npm", "start", "--workspace=backend" ]
