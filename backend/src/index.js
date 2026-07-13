import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, seed, getFlag, setFlagV, logEvento } from './db.js';
import { copilot, desglosarTareas, iaActiva } from './copilot.js';

seed();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = process.env.FRONTEND_DIR || path.join(__dirname, '..', '..', 'frontend');
const SECRET = process.env.JWT_SECRET || 'sandbox-vivienda-bienestar';
const PORT = process.env.PORT || 8080;

const now = () => new Date().toISOString();
const F = k => getFlag(k) === '1';

/* ============ TOKENS (HMAC, sin dependencias) ============ */
const b64u = s => Buffer.from(s).toString('base64url');
function firmar(payload, horas = 12) {
  const body = b64u(JSON.stringify({ ...payload, exp: Date.now() + horas * 36e5 }));
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return body + '.' + sig;
}
function verificar(token) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const esperada = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(esperada))) return null;
  const p = JSON.parse(Buffer.from(body, 'base64url').toString());
  return p.exp > Date.now() ? p : null;
}

/* ============ MINI ROUTER ============ */
const rutas = [];
function ruta(metodo, patron, handler, roles = null) {
  const keys = [];
  const rx = new RegExp('^' + patron.replace(/:[^/]+/g, m => { keys.push(m.slice(1)); return '([^/]+)'; }) + '$');
  rutas.push({ metodo, rx, keys, handler, roles });
}
const GET = (p, h, r) => ruta('GET', p, h, r);
const POST = (p, h, r) => ruta('POST', p, h, r);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.mp4': 'video/mp4', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const json = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };

  // API
  for (const r of rutas) {
    const m = req.method === r.metodo && url.pathname.match(r.rx);
    if (!m) continue;
    try {
      const params = Object.fromEntries(r.keys.map((k, i) => [k, m[i + 1]]));
      let body = {};
      if (req.method === 'POST') {
        const chunks = []; for await (const c of req) chunks.push(c);
        const raw = Buffer.concat(chunks).toString();
        if (raw) try { body = JSON.parse(raw); } catch { return json(400, { error: 'JSON inválido' }); }
      }
      let user = null;
      if (r.roles) {
        user = verificar((req.headers.authorization || '').replace('Bearer ', ''));
        if (!user) return json(401, { error: 'Sesión inválida. Inicia sesión.' });
        if (r.roles.length && !r.roles.includes(user.rol)) return json(403, { error: 'Rol sin permiso para esta acción' });
      }
      return await r.handler({ params, body, query: url.searchParams, user, json });
    } catch (e) {
      console.error(e);
      return json(500, { error: 'Error interno', detalle: e.message });
    }
  }

  // Estáticos del frontend (para correr todo con un solo comando)
  if (req.method === 'GET' && fs.existsSync(FRONTEND_DIR)) {
    let p = path.normalize(path.join(FRONTEND_DIR, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname)));
    if (p.startsWith(FRONTEND_DIR) && fs.existsSync(p) && fs.statSync(p).isFile()) {
      const tipo = MIME[path.extname(p)] || 'application/octet-stream';
      const total = fs.statSync(p).size;
      const rango = req.headers.range;
      if (rango) {
        // Soporte de Range: obligatorio para que Safari/iOS reproduzcan video
        const m = rango.match(/bytes=(\d*)-(\d*)/);
        let ini = m[1] ? parseInt(m[1]) : 0;
        let fin = m[2] ? parseInt(m[2]) : total - 1;
        if (ini >= total) { res.writeHead(416, { 'Content-Range': `bytes */${total}` }); return res.end(); }
        fin = Math.min(fin, total - 1);
        res.writeHead(206, {
          'Content-Type': tipo, 'Accept-Ranges': 'bytes',
          'Content-Range': `bytes ${ini}-${fin}/${total}`, 'Content-Length': fin - ini + 1
        });
        return fs.createReadStream(p, { start: ini, end: fin }).pipe(res);
      }
      res.writeHead(200, { 'Content-Type': tipo, 'Content-Length': total, 'Accept-Ranges': 'bytes' });
      return fs.createReadStream(p).pipe(res);
    }
  }
  json(404, { error: 'No encontrado' });
});

/* ============ AUTH ============ */
POST('/api/auth/login', ({ body, json }) => {
  const u = db.prepare(`SELECT * FROM users WHERE email=?`).get((body.email || '').toLowerCase().trim());
  if (!u || u.pass !== body.password) return json(401, { error: 'Correo o contraseña incorrectos' });
  logEvento('login', u.rol);
  json(200, { token: firmar({ id: u.id, rol: u.rol, nombre: u.nombre }), user: { email: u.email, rol: u.rol, nombre: u.nombre, organizacion: u.organizacion, foto: u.foto || null } });
});

/* ============ PERFIL ============ */
GET('/api/perfil', ({ user, json }) => {
  const u = db.prepare(`SELECT email,rol,nombre,organizacion,foto FROM users WHERE id=?`).get(user.id);
  json(200, u || {});
}, []);

POST('/api/auth/cambiar-password', ({ body, user, json }) => {
  const u = db.prepare(`SELECT * FROM users WHERE id=?`).get(user.id);
  if (!u || u.pass !== body.actual) return json(401, { error: 'La contraseña actual no coincide' });
  if (!body.nueva || body.nueva.length < 8) return json(400, { error: 'La nueva contraseña debe tener al menos 8 caracteres' });
  db.prepare(`UPDATE users SET pass=? WHERE id=?`).run(body.nueva, u.id);
  logEvento('password_cambiada', user.rol);
  json(200, { ok: true, mensaje: 'Contraseña actualizada' });
}, []);

POST('/api/auth/foto', ({ body, user, json }) => {
  if (!/^data:image\/(png|jpeg|jpg|webp);base64,/.test(body.foto || '')) return json(400, { error: 'Formato de imagen no válido' });
  if (body.foto.length > 300000) return json(400, { error: 'Imagen demasiado grande (máx ~200 KB)' });
  db.prepare(`UPDATE users SET foto=? WHERE id=?`).run(body.foto, user.id);
  logEvento('foto_actualizada', user.rol);
  json(200, { ok: true });
}, []);

/* ============ ESTADO GLOBAL ============ */
function estadoGlobal() {
  const flags = {};
  for (const k of ['solicitud', 'constructor', 'operador', 'dh', 'estimacion', 'nps', 'verificado']) flags[k] = F(k);
  const desarrollos = db.prepare(`SELECT * FROM desarrollos`).all();
  const bosques = desarrollos.find(d => d.id === 'bosques');
  const kpi = k => parseInt(getFlag('kpi_' + k));
  const nacional = {
    meta_2026: kpi('meta_2026'), contratadas: kpi('contratadas'), terminadas: kpi('terminadas'),
    entregadas: kpi('entregadas'),
    sin_servicios: kpi('sin_servicios') - (flags.constructor ? 25 : 0),
    escrituradas: kpi('escrituradas') + (flags.operador ? 25 : 0),
    escrituras_pendientes: kpi('escrituras_pendientes') - (flags.operador ? 25 : 0),
    necesidad: kpi('necesidad'),
    pct_meta: Math.round(kpi('contratadas') / kpi('meta_2026') * 1000) / 10
  };
  const npsProm = db.prepare(`SELECT ROUND(AVG((ubicacion+servicios+transporte+calidad+desarrollador)/5.0),1) p, COUNT(*) n FROM nps`).get();
  const tareas = db.prepare(`SELECT * FROM tareas ORDER BY creada DESC`).all();
  const mensajes = db.prepare(`SELECT * FROM mensajes ORDER BY creado DESC LIMIT 20`).all();
  const estimaciones = db.prepare(`SELECT * FROM estimaciones WHERE desarrollo_id='bosques' ORDER BY numero`).all();
  return { flags, nacional, desarrollos, bosques, nps: npsProm, tareas, mensajes, estimaciones, hora: now() };
}

GET('/api/estado', ({ json }) => json(200, estadoGlobal()));
GET('/api/health', ({ json }) => json(200, { ok: true, ia: iaActiva() }));

/* ============ ACCIONES DE LA HISTORIA ============ */
POST('/api/acciones/solicitar-actualizacion', ({ user, json }) => {
  setFlagV('solicitud', 1);
  db.prepare(`INSERT INTO mensajes (de_rol,para_rol,de_nombre,texto,creado) VALUES (?,?,?,?,?)`)
    .run('director', 'constructor', 'Dirección General',
      'Se requiere actualización de Bosques del Bienestar: avance físico y de servicios con evidencia, estatus CFE, renovación de fianza ($48.2 MDP) y estimación 2/2 del mes.', now());
  logEvento('solicitud_actualizacion', user.rol);
  json(200, { ok: true, estado: estadoGlobal() });
}, ['director', 'colaborador']);

POST('/api/acciones/actualizar-desarrollo', ({ body, json }) => {
  const id = body.desarrollo_id || 'bosques';
  const dev = db.prepare(`SELECT * FROM desarrollos WHERE id=?`).get(id);
  if (!dev) return json(404, { error: 'Desarrollo no encontrado' });

  if (id === 'bosques') {
    // Narrativa principal: rojo → ámbar con fianza en renovación
    const af = body.avance_fisico ?? 82, as = body.avance_servicios ?? 71;
    db.prepare(`UPDATE desarrollos SET avance_fisico=?, avance_servicios=?, entregables=117, sin_servicios=43,
      semaforo='ambar', fianza_estado='renovacion', ultima_actualizacion=? WHERE id='bosques'`).run(af, as, now());
    setFlagV('constructor', 1);
    db.prepare(`INSERT INTO mensajes (de_rol,para_rol,de_nombre,texto,creado) VALUES (?,?,?,?,?)`)
      .run('constructor', 'director', 'Hábitat Jalisco Constructora',
        `Actualizamos Bosques del Bienestar: avance ${af}%, servicios ${as}%, fianza en renovación. Solicitamos apoyo con el Ayto. de Tlajomulco (drenaje etapa 3).`, now());
  } else {
    // Cualquier otro desarrollo: avance incremental real con semáforo recalculado
    const af = Math.min(100, body.avance_fisico ?? dev.avance_fisico + 2);
    const as = Math.min(100, body.avance_servicios ?? dev.avance_servicios + 3);
    const sem = (af >= 80 && as >= 75) ? 'verde' : (af >= 60 ? 'ambar' : 'rojo');
    db.prepare(`UPDATE desarrollos SET avance_fisico=?, avance_servicios=?, semaforo=?, ultima_actualizacion=? WHERE id=?`)
      .run(af, as, sem, now(), id);
    db.prepare(`INSERT INTO mensajes (de_rol,para_rol,de_nombre,texto,creado) VALUES (?,?,?,?,?)`)
      .run('constructor', 'director', 'Hábitat Jalisco Constructora',
        `Actualizamos ${dev.nombre}: avance ${af}%, servicios ${as}%.`, now());
  }
  logEvento('actualizacion_desarrollo', 'constructor', { id });
  json(200, { ok: true, desarrollo: db.prepare(`SELECT * FROM desarrollos WHERE id=?`).get(id), estado: estadoGlobal() });
}, ['constructor']);

POST('/api/acciones/generar-estimacion', ({ json }) => {
  db.prepare(`INSERT INTO estimaciones (desarrollo_id,numero,total,monto_mdp,estado,fecha) VALUES ('bosques',2,2,12.4,'en_autorizacion',?)`).run(now());
  db.prepare(`UPDATE desarrollos SET estimaciones_mes=2 WHERE id='bosques'`).run();
  setFlagV('estimacion', 1);
  logEvento('estimacion_enviada', 'constructor', { numero: 2, monto: 12.4 });
  json(200, { ok: true, estado: estadoGlobal() });
}, ['constructor']);

POST('/api/acciones/validar-escrituras', ({ json }) => {
  db.prepare(`UPDATE desarrollos SET escrituras_pendientes = MAX(escrituras_pendientes-25, 0) WHERE id='bosques'`).run();
  setFlagV('operador', 1);
  logEvento('firmas_programadas', 'operador', { cantidad: 25 });
  json(200, { ok: true, estado: estadoGlobal() });
}, ['operador']);

POST('/api/acciones/validar-uve', ({ user, json }) => {
  setFlagV('verificado', 1);
  logEvento('uve_validacion', user.rol, { desarrollo: 'bosques' });
  json(200, { ok: true, estado: estadoGlobal() });
}, ['operador', 'colaborador']);

POST('/api/acciones/validar-fianza', ({ user, json }) => {
  db.prepare(`UPDATE desarrollos SET fianza_estado='vigente', fianza_vence='2027-07-17' WHERE id='bosques'`).run();
  logEvento('fianza_validada', user.rol);
  json(200, { ok: true, estado: estadoGlobal() });
}, ['colaborador', 'director']);

POST('/api/tareas/desglosar', async ({ body, json }) => {
  if (!body.mensaje) return json(400, { error: 'Falta el mensaje' });
  const { tareas, fuente } = await desglosarTareas(body.mensaje);
  const ins = db.prepare(`INSERT INTO tareas (texto,asignado,rol,vence,prioridad,estado,origen,creada) VALUES (?,?,?,?,?,'en_curso','ia',?)`);
  for (const t of tareas) ins.run(t.texto, t.asignado, t.rol || 'colaborador', t.vence, t.prioridad || 'normal', now());
  logEvento('tareas_ia', 'director', { n: tareas.length, fuente });
  json(200, { ok: true, tareas, fuente, estado: estadoGlobal() });
}, ['director']);

GET('/api/tareas', ({ json }) => json(200, db.prepare(`SELECT * FROM tareas ORDER BY creada DESC`).all()));

// Bitácora del sandbox (requisito del documento: historial/bitácora en todas las vistas)
const EVENTO_TXT = {
  seed: 'Sandbox sembrado', login: 'Inicio de sesión', solicitud_actualizacion: 'El director solicitó actualización al constructor',
  actualizacion_desarrollo: 'El constructor actualizó avance de obra', estimacion_enviada: 'Estimación enviada a autorización',
  firmas_programadas: 'La notaría programó firmas de escrituras', uve_validacion: 'UVE validó avance en sitio',
  fianza_validada: 'Fianza validada por jurídico', tareas_ia: 'La IA desglosó un mensaje del director en tareas',
  elegibilidad: 'Consulta de elegibilidad por NSS', reserva_creada: 'Departamento apartado (72 h)',
  documento_validado: 'Documento del expediente validado', firma_confirmada: 'Cita de firma confirmada en notaría',
  nps: 'Encuesta NPS registrada', copilot: 'Consulta al copiloto IA', password_cambiada: 'Contraseña actualizada',
  foto_actualizada: 'Foto de perfil actualizada', derechohabiente_autoregistro: 'Nuevo derechohabiente registrado'
};
GET('/api/eventos', ({ json }) => {
  const evs = db.prepare(`SELECT tipo, actor, payload, creado FROM eventos ORDER BY id DESC LIMIT 25`).all();
  json(200, evs.map(e => ({ ...e, texto: EVENTO_TXT[e.tipo] || e.tipo })));
});

/* ============ MENSAJERÍA REAL ENTRE ROLES (comunicación cerrada del documento) ============ */
POST('/api/mensajes', ({ body, user, json }) => {
  const { para_rol, asunto = '', texto } = body;
  if (!texto || !para_rol) return json(400, { error: 'Faltan destinatario o texto' });
  db.prepare(`INSERT INTO mensajes (de_rol,para_rol,de_nombre,texto,creado) VALUES (?,?,?,?,?)`)
    .run(user.rol, para_rol, user.nombre, (asunto ? '【' + asunto + '】 ' : '') + texto, now());
  logEvento('mensaje_enviado', user.rol, { para: para_rol });
  json(200, { ok: true });
}, []);

GET('/api/mensajes', ({ query, json }) => {
  const rol = query.get('rol') || 'director';
  json(200, db.prepare(`SELECT * FROM mensajes WHERE para_rol=? ORDER BY creado DESC LIMIT 15`).all(rol));
});

/* ============ EVIDENCIA FOTOGRÁFICA DE OBRA (constructor → director) ============ */
POST('/api/desarrollos/:id/evidencia', ({ params, body, user, json }) => {
  if (!/^data:image\/(png|jpeg|jpg|webp);base64,/.test(body.foto || '')) return json(400, { error: 'Formato de imagen no válido' });
  if (body.foto.length > 900000) return json(400, { error: 'Imagen demasiado grande (máx ~650 KB)' });
  const dev = db.prepare(`SELECT id FROM desarrollos WHERE id=?`).get(params.id);
  if (!dev) return json(404, { error: 'Desarrollo no encontrado' });
  db.prepare(`INSERT INTO evidencias (desarrollo_id,foto,comentario,creado) VALUES (?,?,?,?)`)
    .run(params.id, body.foto, body.comentario || null, now());
  logEvento('evidencia_subida', user.rol, { desarrollo: params.id });
  json(200, { ok: true, total: db.prepare(`SELECT COUNT(*) n FROM evidencias WHERE desarrollo_id=?`).get(params.id).n });
}, ['constructor']);

GET('/api/desarrollos/:id/evidencias', ({ params, json }) => {
  json(200, db.prepare(`SELECT id,foto,comentario,creado FROM evidencias WHERE desarrollo_id=? ORDER BY id DESC LIMIT 12`).all(params.id));
});

/* ============ B2C ============ */
POST('/api/elegibilidad', ({ body, json }) => {
  const nss = String(body.nss || '').replace(/\D/g, '');
  if (nss.length !== 11) return json(400, { error: 'El NSS debe tener 11 dígitos' });
  let d = db.prepare(`SELECT * FROM derechohabientes WHERE nss=?`).get(nss);
  if (!d) {
    // Sandbox: cualquier NSS válido desconocido se registra como derechohabiente elegible
    db.prepare(`INSERT INTO derechohabientes (nss,nombre,conyuge,meses_cotizando,salario_sm,credito_activo,credito_monto,ciudad) VALUES (?,?,NULL,24,1.5,0,650000,'Guadalajara')`)
      .run(nss, 'Derechohabiente invitado');
    d = db.prepare(`SELECT * FROM derechohabientes WHERE nss=?`).get(nss);
    logEvento('derechohabiente_autoregistro', 'derechohabiente', { nss });
  }
  const razones = [];
  if (d.meses_cotizando < 6) razones.push('Menos de 6 meses de aportaciones');
  if (d.salario_sm < 1 || d.salario_sm > 2) razones.push('Ingreso fuera del rango de 1 a 2 salarios mínimos');
  if (d.credito_activo) razones.push('Crédito Infonavit vigente');
  logEvento('elegibilidad', 'derechohabiente', { nss, elegible: !razones.length });
  json(200, { elegible: !razones.length, razones, nombre: d.nombre, conyuge: d.conyuge, credito_monto: d.credito_monto, ciudad: d.ciudad });
});

GET('/api/desarrollos/:id/unidades', ({ params, json }) =>
  json(200, db.prepare(`SELECT * FROM unidades WHERE desarrollo_id=? ORDER BY piso, numero`).all(params.id)));

function reservaCompleta(id) {
  const r = db.prepare(`
    SELECT r.*, u.torre, u.piso, u.numero, u.precio, u.desarrollo_id, d.nombre dh_nombre, d.conyuge
    FROM reservas r JOIN unidades u ON u.id=r.unidad_id
    JOIN derechohabientes d ON d.nss=r.nss WHERE r.id=?`).get(id);
  if (!r) return null;
  r.documentos = db.prepare(`SELECT tipo,estado,detalle,actualizado FROM documentos WHERE reserva_id=?`).all(id);
  r.segundos_restantes = Math.max(0, Math.floor((new Date(r.expira) - Date.now()) / 1000));
  return r;
}

POST('/api/reservas', ({ body, json }) => {
  const u = db.prepare(`SELECT * FROM unidades WHERE id=?`).get(body.unidad_id);
  if (!u) return json(404, { error: 'Unidad no encontrada' });
  if (u.estado !== 'disponible') return json(409, { error: 'Esa unidad ya está apartada o vendida' });
  const d = db.prepare(`SELECT * FROM derechohabientes WHERE nss=?`).get(String(body.nss || ''));
  if (!d) return json(404, { error: 'NSS no válido' });
  db.prepare(`UPDATE reservas SET estado='expirada' WHERE estado='activa' AND expira < ?`).run(now());
  const activa = db.prepare(`SELECT * FROM reservas WHERE nss=? AND estado='activa'`).get(d.nss);
  if (activa) return json(409, { error: 'Ya tienes un apartado activo', reserva_id: activa.id });

  const expira = new Date(Date.now() + 72 * 36e5).toISOString();
  const r = db.prepare(`INSERT INTO reservas (nss,unidad_id,creada,expira,estado) VALUES (?,?,?,?,'activa')`)
    .run(d.nss, body.unidad_id, now(), expira);
  db.prepare(`UPDATE unidades SET estado='apartada' WHERE id=?`).run(body.unidad_id);
  const doc = db.prepare(`INSERT INTO documentos (reserva_id,tipo,estado,detalle,actualizado) VALUES (?,?,?,?,?)`);
  const rid = Number(r.lastInsertRowid);
  doc.run(rid, 'ine', 'validado', 'Validación automática al estándar bancario', now());
  doc.run(rid, 'curp', 'validado', 'La obtuvimos por ti automáticamente', now());
  doc.run(rid, 'domicilio', 'validado', 'Subido y validado', now());
  doc.run(rid, 'biometria', 'pendiente', null, now());
  doc.run(rid, 'constancia_sat', 'pendiente', null, now());
  logEvento('reserva_creada', 'derechohabiente', { nss: d.nss, unidad: body.unidad_id });
  json(200, { ok: true, reserva: reservaCompleta(rid) });
});

GET('/api/reservas/activa', ({ query, json }) => {
  db.prepare(`UPDATE reservas SET estado='expirada' WHERE estado='activa' AND expira < ?`).run(now());
  const nss = String(query.get('nss') || '92099142066');
  const r = db.prepare(`SELECT id FROM reservas WHERE nss=? AND estado IN ('activa','firmada') ORDER BY creada DESC LIMIT 1`).get(nss);
  json(200, r ? reservaCompleta(r.id) : null);
});

POST('/api/reservas/:id/documentos/:tipo', ({ params, json }) => {
  const d = db.prepare(`SELECT * FROM documentos WHERE reserva_id=? AND tipo=?`).get(params.id, params.tipo);
  if (!d) return json(404, { error: 'Documento no encontrado' });
  const detalle = params.tipo === 'biometria'
    ? 'Selfie + prueba de vida validadas (estándar bancario)'
    : 'Descargada del SAT con tu CURP y validada';
  db.prepare(`UPDATE documentos SET estado='validado', detalle=?, actualizado=? WHERE reserva_id=? AND tipo=?`)
    .run(detalle, now(), params.id, params.tipo);
  logEvento('documento_validado', 'derechohabiente', { reserva: params.id, tipo: params.tipo });
  json(200, { ok: true, reserva: reservaCompleta(+params.id) });
});

POST('/api/reservas/:id/firmar', ({ params, json }) => {
  const r = reservaCompleta(+params.id);
  if (!r) return json(404, { error: 'Reserva no encontrada' });
  const pendientes = r.documentos.filter(d => d.estado !== 'validado');
  if (pendientes.length) return json(409, { error: 'Expediente incompleto', pendientes: pendientes.map(d => d.tipo) });
  const cita = '2026-07-15T11:00:00';
  db.prepare(`UPDATE reservas SET estado='firmada', cita_firma=? WHERE id=?`).run(cita, r.id);
  db.prepare(`UPDATE unidades SET estado='vendida' WHERE id=?`).run(r.unidad_id);
  setFlagV('dh', 1);
  logEvento('firma_confirmada', 'derechohabiente', { reserva: r.id, cita });
  json(200, { ok: true, cita, notaria: 'Notaría 121', reserva: reservaCompleta(r.id) });
});

POST('/api/nps', ({ body, json }) => {
  const { ubicacion = 0, servicios = 0, transporte = 0, calidad = 0, desarrollador = 0, detalle = null, reserva_id = null } = body;
  if (![ubicacion, servicios, transporte, calidad, desarrollador].some(v => v > 0))
    return json(400, { error: 'Califica al menos un aspecto' });
  db.prepare(`INSERT INTO nps (reserva_id,ubicacion,servicios,transporte,calidad,desarrollador,detalle,creado) VALUES (?,?,?,?,?,?,?,?)`)
    .run(reserva_id, ubicacion, servicios, transporte, calidad, desarrollador, detalle, now());
  setFlagV('nps', 1);
  const prom = db.prepare(`SELECT ROUND(AVG((ubicacion+servicios+transporte+calidad+desarrollador)/5.0),1) p, COUNT(*) n FROM nps`).get();
  logEvento('nps', 'derechohabiente', { prom: prom.p });
  json(200, { ok: true, promedio: prom.p, encuestas: prom.n });
});

/* ============ COPILOTO IA ============ */
POST('/api/copilot', async ({ body, json }) => {
  if (!body.pregunta) return json(400, { error: 'Falta la pregunta' });
  const out = await copilot(body.rol || 'derechohabiente', body.pregunta, body.contexto || '');
  logEvento('copilot', body.rol || 'derechohabiente', { fuente: out.fuente });
  json(200, out);
});

/* ============ SANDBOX ============ */
POST('/api/reset', ({ json }) => {
  seed(true);
  json(200, { ok: true, mensaje: 'Sandbox re-sembrado al estado inicial' });
});

server.listen(PORT, () => {
  console.log(`✓ Sandbox Vivienda del Bienestar en http://localhost:${PORT}`);
  console.log(`  IA real: ${iaActiva() ? 'activada' : 'desactivada → respuestas con datos vivos (scripted)'}`);
});
