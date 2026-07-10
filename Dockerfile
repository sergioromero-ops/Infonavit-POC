# Backend sandbox — Vivienda del Bienestar (cero dependencias npm)
FROM node:22-slim
WORKDIR /app
COPY backend/src ./src
COPY backend/package.json .
# El frontend también se sirve desde el contenedor (opcional; útil como URL única)
COPY frontend ./frontend
ENV FRONTEND_DIR=/app/frontend
ENV DB_PATH=/tmp/sandbox.db
ENV PORT=8080
EXPOSE 8080
CMD ["node", "--no-warnings", "src/index.js"]
