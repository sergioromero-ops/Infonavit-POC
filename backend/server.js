// backend/server.js
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { auth } from 'express-oauth2-jwt-bearer';
import 'dotenv/config';
import { db } from './data/db.js';

const auth0Audience = process.env.AUTH0_AUDIENCE?.trim();
const auth0Domain = process.env.AUTH0_DOMAIN?.trim();
const auth0Configured = Boolean(auth0Audience && auth0Domain);

// Keep the service healthy while Auth0 is being configured, without exposing
// protected routes or accepting unauthenticated requests.
const checkJwt = auth0Configured
  ? auth({
      audience: auth0Audience,
      issuerBaseURL: `https://${auth0Domain}/`,
    })
  : (_req, res) => {
      res.status(503).json({ message: 'Authentication is not configured' });
    };

if (!auth0Configured) {
  console.warn('AUTH0_AUDIENCE and AUTH0_DOMAIN are not configured');
}

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
