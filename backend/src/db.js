import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'sandbox.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');

/* ============ ESQUEMA ============ */
db.exec(`
CREATE TABLE IF NOT EXISTS flags (k TEXT PRIMARY KEY, v TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, pass TEXT NOT NULL,
  rol TEXT NOT NULL, nombre TEXT NOT NULL, organizacion TEXT
);
CREATE TABLE IF NOT EXISTS derechohabientes (
  nss TEXT PRIMARY KEY, nombre TEXT NOT NULL, conyuge TEXT,
  meses_cotizando INTEGER, salario_sm REAL, credito_activo INTEGER DEFAULT 0,
  credito_monto INTEGER, ciudad TEXT
);
CREATE TABLE IF NOT EXISTS desarrollos (
  id TEXT PRIMARY KEY, nombre TEXT NOT NULL, estado TEXT, ciudad TEXT,
  desarrollador TEXT, meta INTEGER, avance_fisico INTEGER, avance_servicios INTEGER,
  terminadas INTEGER, entregables INTEGER, sin_servicios INTEGER,
  escrituras_pendientes INTEGER, semaforo TEXT,
  fianza_estado TEXT, fianza_monto REAL, fianza_vence TEXT,
  estimaciones_mes INTEGER, estimaciones_meta INTEGER,
  ultima_actualizacion TEXT
);
CREATE TABLE IF NOT EXISTS unidades (
  id TEXT PRIMARY KEY, desarrollo_id TEXT NOT NULL, torre TEXT, piso INTEGER,
  numero TEXT, precio INTEGER, estado TEXT DEFAULT 'disponible',
  FOREIGN KEY (desarrollo_id) REFERENCES desarrollos(id)
);
CREATE TABLE IF NOT EXISTS reservas (
  id INTEGER PRIMARY KEY, nss TEXT NOT NULL, unidad_id TEXT NOT NULL,
  creada TEXT NOT NULL, expira TEXT NOT NULL, estado TEXT DEFAULT 'activa',
  cita_firma TEXT,
  FOREIGN KEY (unidad_id) REFERENCES unidades(id)
);
CREATE TABLE IF NOT EXISTS documentos (
  id INTEGER PRIMARY KEY, reserva_id INTEGER NOT NULL, tipo TEXT NOT NULL,
  estado TEXT DEFAULT 'pendiente', detalle TEXT, actualizado TEXT,
  UNIQUE (reserva_id, tipo)
);
CREATE TABLE IF NOT EXISTS estimaciones (
  id INTEGER PRIMARY KEY, desarrollo_id TEXT NOT NULL, numero INTEGER, total INTEGER,
  monto_mdp REAL, estado TEXT DEFAULT 'enviada', fecha TEXT
);
CREATE TABLE IF NOT EXISTS tareas (
  id INTEGER PRIMARY KEY, texto TEXT NOT NULL, asignado TEXT, rol TEXT,
  vence TEXT, prioridad TEXT DEFAULT 'normal', estado TEXT DEFAULT 'en_curso',
  origen TEXT, creada TEXT
);
CREATE TABLE IF NOT EXISTS mensajes (
  id INTEGER PRIMARY KEY, de_rol TEXT NOT NULL, para_rol TEXT NOT NULL,
  de_nombre TEXT, texto TEXT NOT NULL, creado TEXT
);
CREATE TABLE IF NOT EXISTS nps (
  id INTEGER PRIMARY KEY, reserva_id INTEGER, ubicacion INTEGER, servicios INTEGER,
  transporte INTEGER, calidad INTEGER, desarrollador INTEGER, detalle TEXT, creado TEXT
);
CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY, tipo TEXT NOT NULL, actor TEXT, payload TEXT, creado TEXT
);
`);

// Migraciones ligeras
try { db.exec(`ALTER TABLE users ADD COLUMN foto TEXT`); } catch { /* ya existe */ }

/* ============ SEED ============ */
const now = () => new Date().toISOString();

export function seed(force = false) {
  const hasData = db.prepare(`SELECT COUNT(*) n FROM desarrollos`).get().n > 0;
  if (hasData && !force) return;

  db.exec(`
    DELETE FROM documentos; DELETE FROM nps; DELETE FROM reservas;
    DELETE FROM unidades; DELETE FROM estimaciones; DELETE FROM desarrollos;
    DELETE FROM tareas; DELETE FROM mensajes; DELETE FROM eventos;
    DELETE FROM derechohabientes; DELETE FROM users; DELETE FROM flags;
  `);

  // Flags de la narrativa (equivalente al objeto S del prototipo)
  const setFlag = db.prepare(`INSERT INTO flags (k,v) VALUES (?,?)`);
  for (const k of ['solicitud','constructor','operador','dh','estimacion','nps','verificado'])
    setFlag.run(k, '0');

  // KPIs nacionales base (abril 2026)
  const kpis = {
    meta_2026: 400000, contratadas: 312480, terminadas: 154210, entregadas: 121875,
    sin_servicios: 18404, escrituradas: 98442, escrituras_pendientes: 12440,
    necesidad: 689748
  };
  for (const [k, v] of Object.entries(kpis)) setFlag.run('kpi_' + k, String(v));

  // Usuarios por rol (sandbox: contraseña compartida)
  const u = db.prepare(`INSERT INTO users (email,pass,rol,nombre,organizacion) VALUES (?,?,?,?,?)`);
  u.run('director@infonavit.gob.mx', 'bienestar2026', 'director', 'Dirección General', 'Infonavit');
  u.run('colaborador@infonavit.gob.mx', 'bienestar2026', 'colaborador', 'Laura Mendoza', 'Infonavit · Verificación');
  u.run('constructor@habitatjalisco.mx', 'bienestar2026', 'constructor', 'Hábitat Jalisco Constructora', 'Hábitat Jalisco');
  u.run('operador@notaria121.mx', 'bienestar2026', 'operador', 'Notaría 121', 'Notaría 121 · Guadalajara');
  u.run('ana@correo.mx', 'bienestar2026', 'derechohabiente', 'Ana Hernández', null);

  // Derechohabientes demo
  const d = db.prepare(`INSERT INTO derechohabientes (nss,nombre,conyuge,meses_cotizando,salario_sm,credito_activo,credito_monto,ciudad) VALUES (?,?,?,?,?,?,?,?)`);
  d.run('92099142066', 'Ana Hernández', 'Luis Hernández', 38, 1.8, 0, 680000, 'Guadalajara');
  d.run('11223344556', 'Carlos Ramírez', null, 4, 1.5, 0, 0, 'Monterrey');   // no elegible: <6 meses
  d.run('99887766554', 'María Torres', null, 60, 2.6, 0, 0, 'Puebla');        // no elegible: >2 SM
  d.run('55443322110', 'José Flores', null, 24, 1.2, 1, 0, 'Toluca');         // no elegible: crédito activo

  // Desarrollos
  const dev = db.prepare(`INSERT INTO desarrollos (id,nombre,estado,ciudad,desarrollador,meta,avance_fisico,avance_servicios,terminadas,entregables,sin_servicios,escrituras_pendientes,semaforo,fianza_estado,fianza_monto,fianza_vence,estimaciones_mes,estimaciones_meta,ultima_actualizacion)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const hace12dias = new Date(Date.now() - 12 * 864e5).toISOString();
  dev.run('bosques', 'Bosques del Bienestar', 'Jalisco', 'Tlajomulco de Zúñiga', 'Hábitat Jalisco', 89040, 78, 54, 160, 92, 68, 48, 'rojo', 'por_vencer', 48.2, '2026-07-17', 1, 2, hace12dias);
  dev.run('tesistan', 'Jardines de Tesistán', 'Jalisco', 'Zapopan', 'Hábitat Jalisco', 360, 92, 88, 310, 298, 12, 6, 'verde', 'vigente', 39.8, '2027-03-20', 2, 2, now());
  dev.run('lomas', 'Lomas del Salto', 'Jalisco', 'El Salto', 'Hábitat Jalisco', 288, 64, 57, 120, 98, 22, 11, 'ambar', 'vigente', 31.5, '2027-01-15', 2, 2, now());
  dev.run('chapala', 'Vistas de Chapala', 'Jalisco', 'Ixtlahuacán', 'Hábitat Jalisco', 380, 85, 81, 260, 244, 16, 9, 'verde', 'vigente', 41.2, '2027-06-30', 2, 2, now());
  dev.run('valle', 'Valle del Bienestar', 'Nuevo León', 'Apodaca', 'Constructora Regia', 67305, 72, 64, 210, 180, 30, 22, 'ambar', 'vigente', 61.0, '2027-02-10', 2, 2, now());
  dev.run('angelopolis', 'Angelópolis Bienestar', 'Puebla', 'Puebla', 'GP Vivienda', 29719, 68, 61, 140, 122, 18, 15, 'ambar', 'vigente', 38.5, '2026-12-01', 2, 2, now());
  dev.run('toluca', 'Toluca Bienestar', 'Edo. de México', 'Toluca', 'Casas del Centro', 21336, 84, 79, 190, 178, 12, 8, 'verde', 'vigente', 42.0, '2027-05-20', 2, 2, now());
  dev.run('qro', 'Querétaro Bienestar', 'Querétaro', 'Querétaro', 'Vive QRO', 12570, 91, 88, 110, 106, 4, 3, 'verde', 'vigente', 27.3, '2027-08-15', 2, 2, now());

  // Unidades · Torre A pisos 2-4 en TODOS los desarrollos (flujo B2C completo desde cualquier pin)
  const unidad = db.prepare(`INSERT INTO unidades (id,desarrollo_id,torre,piso,numero,precio,estado) VALUES (?,?,?,?,?,?,?)`);
  const PRECIOS_BASE = { bosques: 598000, tesistan: 612000, lomas: 645000, chapala: 589000, valle: 585000, angelopolis: 560000, toluca: 572000, qro: 618000 };
  const ocupados = ['201', '203', '206', '302', '305', '401', '404'];
  for (const [devId, base] of Object.entries(PRECIOS_BASE)) {
    for (const piso of [2, 3, 4]) {
      for (let n = 1; n <= 6; n++) {
        const num = `${piso}0${n}`;
        unidad.run(`${devId}-A-${num}`, devId, 'A', piso, num, base + piso * 1500 + n * 300,
          ocupados.includes(num) ? 'vendida' : 'disponible');
      }
    }
  }

  // Estimaciones de Hábitat Jalisco (1/2 del mes)
  db.prepare(`INSERT INTO estimaciones (desarrollo_id,numero,total,monto_mdp,estado,fecha) VALUES (?,?,?,?,?,?)`)
    .run('bosques', 1, 2, 11.8, 'pagada', new Date(Date.now() - 20 * 864e5).toISOString());

  // NPS histórico (128 encuestas, promedio 4.6)
  const npsIns = db.prepare(`INSERT INTO nps (reserva_id,ubicacion,servicios,transporte,calidad,desarrollador,detalle,creado) VALUES (NULL,?,?,?,?,?,NULL,?)`);
  for (let i = 0; i < 128; i++) {
    const r = () => 4 + (Math.random() > 0.4 ? 1 : 0);
    npsIns.run(r(), r(), 4, r(), r(), new Date(Date.now() - i * 36e5 * 20).toISOString());
  }

  db.prepare(`INSERT INTO eventos (tipo,actor,payload,creado) VALUES (?,?,?,?)`)
    .run('seed', 'sistema', JSON.stringify({ version: 1 }), now());
}

/* ============ HELPERS ============ */
export const getFlag = k => db.prepare(`SELECT v FROM flags WHERE k=?`).get(k)?.v;
export const setFlagV = (k, v) => db.prepare(`INSERT INTO flags (k,v) VALUES (?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v`).run(k, String(v));
export const logEvento = (tipo, actor, payload = {}) =>
  db.prepare(`INSERT INTO eventos (tipo,actor,payload,creado) VALUES (?,?,?,?)`).run(tipo, actor, JSON.stringify(payload), now());

if (process.argv.includes('--reset')) {
  seed(true);
  console.log('✓ Base de datos re-sembrada en', DB_PATH);
}
