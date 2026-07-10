# Control Inteligente de Vivienda del Bienestar · Sandbox

Monorepo del sandbox funcional: prototipo de alta fidelidad con **backend real, datos persistentes y copilotos con IA**. Los datos son simulados; los flujos, la autenticación, la persistencia y la IA son reales.

```
├── frontend/   → web app (GitHub Pages o servida por el backend)
├── backend/    → API Node.js (cero dependencias) + SQLite · Cloud Run
└── .github/    → workflow de despliegue a Pages
```

## Correr local (un solo comando)

Requiere Node ≥ 22.5. Sin `npm install`.

```bash
cd backend && npm start
# → http://localhost:8080  (frontend + API juntos)
```

Con IA real en los copilotos:

```bash
ANTHROPIC_API_KEY=sk-ant-... npm start
```

Sin API key los copilotos responden con guiones alimentados por los **datos vivos** de la base.

## Usuarios del sandbox

Contraseña de todos: `bienestar2026`

| Rol | Correo |
|---|---|
| Director | director@infonavit.gob.mx |
| Colaborador | colaborador@infonavit.gob.mx |
| Constructor | constructor@habitatjalisco.mx |
| Operador (Notaría/UVE) | operador@notaria121.mx |
| Derechohabiente | ana@correo.mx · NSS demo `92099142066` |

NSS de prueba no elegibles: `11223344556` (<6 meses), `99887766554` (>2 SM), `55443322110` (crédito activo).

## Qué es real en el sandbox

- Login con token por rol y permisos (un constructor no puede programar firmas)
- La historia completa persiste en SQLite: solicitud del director → actualización del constructor → estimación 2/2 → firmas de notaría → validación UVE → fianza; recarga la página y todo sigue ahí
- Reserva B2C con cronómetro real de 72 h, checklist de documentos y bloqueo de doble apartado
- KPIs del tablero del director derivados de las acciones de los otros roles
- Copilotos por rol vía API de Claude con snapshot de la base en el prompt (fallback scripted)
- Desglose de mensajes del director en tareas por IA
- NPS que recalcula el promedio real
- `POST /api/reset` (botón ↺ en la barra) regresa todo al estado inicial

## Despliegue

### Backend → Cloud Run

```bash
gcloud run deploy vivienda-bienestar-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars ANTHROPIC_API_KEY=sk-ant-... \
  --min-instances 1
```

Notas: el Dockerfile está en `backend/Dockerfile` (usa `gcloud run deploy --source .` con `--dockerfile backend/Dockerfile` si tu gcloud lo soporta, o `docker build -f backend/Dockerfile .`). `--min-instances 1` evita que SQLite (en `/tmp`, efímero) se reinicie entre solicitudes durante una demo. La URL de Cloud Run también sirve el frontend completo — puedes demo-ar solo con esa URL.

### Frontend → GitHub Pages

El workflow `.github/workflows/pages.yml` publica `frontend/` en cada push a `main` (activa Pages: Settings → Pages → Source: GitHub Actions).

Para conectar Pages con el backend de Cloud Run, abre el sitio con:

```
https://<usuario>.github.io/Infonavit-POC/?api=https://<servicio>.run.app
```

El parámetro se guarda en el navegador; solo se necesita la primera vez.

## Pruebas

```bash
cd backend && node --no-warnings test/e2e.mjs   # 32 verificaciones end-to-end
```
