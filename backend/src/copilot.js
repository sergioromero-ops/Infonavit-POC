import { db, getFlag } from './db.js';

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5';

/* ============ SNAPSHOT DE DATOS VIVOS PARA EL PROMPT ============ */
export function snapshot() {
  const desarrollos = db.prepare(`SELECT * FROM desarrollos`).all();
  const flags = Object.fromEntries(db.prepare(`SELECT k,v FROM flags`).all().map(r => [r.k, r.v]));
  const estimaciones = db.prepare(`SELECT * FROM estimaciones ORDER BY fecha DESC LIMIT 10`).all();
  const tareas = db.prepare(`SELECT * FROM tareas ORDER BY creada DESC LIMIT 10`).all();
  const reservas = db.prepare(`
    SELECT r.*, u.torre, u.piso, u.numero, u.precio, d.nombre AS dh_nombre
    FROM reservas r JOIN unidades u ON u.id = r.unidad_id
    LEFT JOIN derechohabientes d ON d.nss = r.nss
    ORDER BY r.creada DESC LIMIT 5`).all();
  const npsProm = db.prepare(`SELECT ROUND(AVG((ubicacion+servicios+transporte+calidad+desarrollador)/5.0),1) p, COUNT(*) n FROM nps`).get();
  return { desarrollos, flags, estimaciones, tareas, reservas, nps: npsProm };
}

const PERFILES = {
  director: `Eres el Copiloto del Director General de Infonavit en la Torre de Control Nacional del Programa de Vivienda del Bienestar. Objetivos: comercial, operativo y financiero. Hablas con datos concretos, identificas causas raíz y propones acciones (activar constructor, notaría, UVE). Formal pero directo, en español.`,
  colaborador: `Eres el copiloto de un colaborador de Infonavit (verificación y jurídico). Ayudas a priorizar validaciones de fianzas, verificaciones UVE y tareas asignadas por el Director. Directo y operativo, en español.`,
  constructor: `Eres el copiloto del constructor Hábitat Jalisco en su portal del Programa de Vivienda del Bienestar. Ayudas con avances de obra, servicios, fianzas y estimaciones (sin estimación no hay pago). Práctico, en español.`,
  operador: `Eres el copiloto de operadores (Notaría 121 y unidades de verificación UVE). Ayudas a programar firmas de escrituras, validar avances y liberar entregas. Preciso, en español.`,
  derechohabiente: `Eres el "Copiloto operativo" de Ana Hernández, derechohabiente comprando departamento en Bosques del Bienestar (Tlajomulco, Jalisco). Hablas claro, sin lenguaje de trámite, cálido y breve. Tu nombre público es Inés. En español.`
};

/* ============ FALLBACK SCRIPTED (sin API key o sin red) ============ */
function fallback(rol, pregunta) {
  const s = snapshot();
  const b = s.desarrollos.find(d => d.id === 'bosques');
  const t = (pregunta || '').toLowerCase();
  if (rol === 'director' || rol === 'colaborador') {
    if (/bosques|rojo|riesgo|jalisco|detenid/.test(t))
      return `Bosques del Bienestar: avance físico ${b.avance_fisico}%, servicios ${b.avance_servicios}%, ${b.sin_servicios} viviendas sin servicios, ${b.escrituras_pendientes} escrituras pendientes y fianza ${b.fianza_estado === 'por_vencer' ? 'por vencer el ' + b.fianza_vence : b.fianza_estado}. Estimaciones del mes: ${b.estimaciones_mes}/${b.estimaciones_meta}. Recomiendo activar al constructor, a la Notaría 121 y a la UVE.`;
    if (/escritur|notar|firma/.test(t))
      return `Escrituras pendientes en Bosques: ${b.escrituras_pendientes}. A nivel nacional: ${getFlag('kpi_escrituras_pendientes')}. La acción más rápida es programar las firmas listas con la Notaría 121.`;
    if (/estimac|pago|factur/.test(t))
      return `Hábitat Jalisco va ${b.estimaciones_mes}/${b.estimaciones_meta} en estimaciones del mes. Sin estimación no hay pago y la obra se frena.`;
    if (/fianza/.test(t))
      return `La fianza de Bosques del Bienestar ($${b.fianza_monto} MDP) está "${b.fianza_estado}" y vence el ${b.fianza_vence}.`;
    if (/servici|cfe|agua|drenaje|luz/.test(t))
      return `El mayor bloqueo es electrificación. En Bosques hay ${b.sin_servicios} viviendas terminadas sin servicios (${b.avance_servicios}% de avance de servicios).`;
    return `Puedo explicarte causas raíz de riesgo, servicios, escrituración, fianzas y estimaciones con los datos vivos del sandbox. Prueba: "¿por qué está en rojo Bosques?"`;
  }
  if (rol === 'constructor')
    return `Tu desarrollo Bosques del Bienestar: avance ${b.avance_fisico}%, servicios ${b.avance_servicios}%, estimaciones ${b.estimaciones_mes}/${b.estimaciones_meta}, fianza ${b.fianza_estado}. Actualiza avance y carga tu estimación para liberar el pago.`;
  if (rol === 'operador')
    return `Hay ${b.escrituras_pendientes} escrituras pendientes en Bosques del Bienestar. Puedes programar firmas y validar el avance como UVE.`;
  return `Hola, soy tu guía. Tu apartado y documentos se guardan en tiempo real — si algo no se entiende, pregúntame.`;
}

/* ============ LLAMADA REAL A CLAUDE ============ */
export async function copilot(rol, pregunta, contexto = '') {
  if (!API_KEY) return { texto: fallback(rol, pregunta), fuente: 'scripted' };
  try {
    const s = snapshot();
    const system = `${PERFILES[rol] || PERFILES.derechohabiente}

Estás dentro de un SANDBOX con datos simulados pero flujos reales y persistentes. Responde en máximo 120 palabras, puedes usar <b>negritas</b> HTML. Nunca inventes cifras: usa solo el snapshot.

SNAPSHOT ACTUAL DE LA BASE DE DATOS:
${JSON.stringify(s)}${contexto ? `\n\nCONTEXTO DE PANTALLA: ${contexto}` : ''}`;

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL, max_tokens: 400,
        system,
        messages: [{ role: 'user', content: pregunta }]
      })
    });
    if (!r.ok) throw new Error(`Anthropic ${r.status}`);
    const j = await r.json();
    return { texto: j.content?.[0]?.text || fallback(rol, pregunta), fuente: 'claude' };
  } catch (e) {
    console.error('copilot fallback:', e.message);
    return { texto: fallback(rol, pregunta), fuente: 'scripted' };
  }
}

/* ============ DESGLOSE DE TAREAS POR IA (mensaje del director) ============ */
const TAREAS_FALLBACK = [
  { texto: 'Programar verificación UVE · Bosques del Bienestar', asignado: 'Laura Mendoza (verificación)', rol: 'colaborador', vence: '2026-07-11', prioridad: 'normal' },
  { texto: 'Requerir estimación 2/2 a Hábitat Jalisco', asignado: 'R. Cortés (tesorería regional)', rol: 'colaborador', vence: '2026-07-12', prioridad: 'urgente' },
  { texto: 'Mesa CFE servicios Jalisco (4,180 viviendas)', asignado: 'M. Ávila (servicios)', rol: 'colaborador', vence: '2026-07-14', prioridad: 'normal' }
];

export async function desglosarTareas(mensaje) {
  if (!API_KEY) return { tareas: TAREAS_FALLBACK, fuente: 'scripted' };
  try {
    const s = snapshot();
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL, max_tokens: 800,
        system: `Eres la IA de la Torre de Control de Vivienda del Bienestar. El Director envía un mensaje global; tú lo desglosas en tareas específicas según el perfil de cada colaborador. Responde SOLO un array JSON: [{"texto","asignado","rol","vence","prioridad"}] (3 tareas máx, fechas próximas a hoy 2026-07-10, prioridad "urgente"|"normal"). Datos vivos: ${JSON.stringify(s.desarrollos)}`,
        messages: [{ role: 'user', content: mensaje }]
      })
    });
    if (!r.ok) throw new Error(`Anthropic ${r.status}`);
    const j = await r.json();
    const raw = j.content?.[0]?.text || '';
    const arr = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1));
    return { tareas: arr.slice(0, 3), fuente: 'claude' };
  } catch (e) {
    console.error('desglose fallback:', e.message);
    return { tareas: TAREAS_FALLBACK, fuente: 'scripted' };
  }
}
