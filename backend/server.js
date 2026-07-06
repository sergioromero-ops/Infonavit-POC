// backend/server.js
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(morgan('dev'));
app.use(cors({ origin: 'http://localhost:3000' })); // Ajustar en producción
app.use(express.json());

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/profile', (req, res) => {
  // Simulación de datos de perfil de usuario
  res.json({
    name: 'Juan Derechohabiente',
    email: 'juan.derechohabiente@example.com',
    role: 'derechohabiente',
    memberSince: '2023-01-15',
  });
});

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const frontendDistPath = path.resolve(__dirname, '..', 'frontend', 'dist');

  app.use(express.static(frontendDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
