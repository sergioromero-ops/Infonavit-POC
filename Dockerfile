# Dockerfile

# 1. Etapa de Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar los package.json y package-lock.json para instalar dependencias
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Instalar todas las dependencias del monorepo
RUN npm install --workspaces

# Copiar el resto del código fuente
COPY frontend/ ./frontend/
COPY backend/ ./backend/
# Copia cualquier otro archivo en la raíz (como el propio Dockerfile, etc.)
COPY . .

# Construir el frontend
RUN npm run build --workspace=frontend

# 2. Etapa de Producción
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copiar los package.json para que npm reconozca los workspaces en producción
COPY --from=builder /app/package.json ./
COPY --from=builder /app/backend/package.json ./backend/

# Copiar las dependencias de producción ya instaladas desde la etapa de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Copiar el código de la aplicación del backend
COPY --from=builder /app/backend ./backend/

# Copiar el build del frontend
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 8080

# Ejecutar el backend. npm usará el package.json de la raíz para encontrar el workspace "backend"
CMD ["npm", "start", "--workspace=backend"]
