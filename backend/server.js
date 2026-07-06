// backend/server.js
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { auth } from 'express-oauth2-jwt-bearer';
import 'dotenv/config';
import { db } from './data/db.js';

// Authorization middleware
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(morgan('dev'));
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint de perfil protegido
app.get('/api/profile', checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const email = req.auth.payload.email; // Asumiendo que el email está en el token

    let user = await db.user.findUnique({ where: { auth0Id } });

    // Si el usuario no existe, lo creamos (user-provisioning)
    if (!user) {
      user = await db.user.create({
        data: {
          auth0Id,
          email,
          // Se pueden añadir más datos que vengan del token o de un perfil de Auth0
        },
      });
    }

    res.json({
      name: user.email, // Usamos el email como nombre por ahora
      role: user.role || 'DERECHOHABIENTE',
      memberSince: user.createdAt,
      ...user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
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
