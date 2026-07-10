// Suite E2E del sandbox. Uso: node --no-warnings test/e2e.mjs  (levanta su propio server)
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srv = spawn('node', ['--no-warnings', 'src/index.js'], {
  cwd: dir, env: { ...process.env, DB_PATH: `/tmp/e2e-${Date.now()}.db`, PORT: '8099' }, stdio: 'ignore'
});
await new Promise(r => setTimeout(r, 1500));

const B = 'http://localhost:8099';
let PASS = 0, FAIL = 0;
const ok = m => { console.log('  ✓ ' + m); PASS++; };
const bad = m => { console.log('  ✗ ' + m); FAIL++; };
const chk = (cond, m) => cond ? ok(m) : bad(m);
const api = async (p, { method = 'GET', body, token } = {}) => {
  const r = await fetch(B + p, {
    method: body ? 'POST' : method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  return r.json();
};
const login = async email => (await api('/api/auth/login', { body: { email, password: 'bienestar2026' } })).token;

try {
  console.log('— Salud y estado inicial');
  chk((await api('/api/health')).ok === true, 'health');
  chk((await api('/api/estado')).bosques.semaforo === 'rojo', 'bosques inicia en rojo');

  console.log('— Login y permisos');
  const TD = await login('director@infonavit.gob.mx');
  const TC = await login('constructor@habitatjalisco.mx');
  const TO = await login('operador@notaria121.mx');
  const TL = await login('colaborador@infonavit.gob.mx');
  chk(TD?.length > 20, 'login de los 4 roles');
  chk((await api('/api/auth/login', { body: { email: 'director@infonavit.gob.mx', password: 'mala' } })).error?.startsWith('Correo'), 'password mala rechazada');
  chk((await api('/api/acciones/validar-escrituras', { method: 'POST', body: {}, token: TC })).error?.startsWith('Rol'), 'constructor NO puede validar escrituras');
  chk((await api('/api/acciones/actualizar-desarrollo', { method: 'POST', body: {} })).error?.startsWith('Sesión'), 'sin token → 401');

  console.log('— Historia: director → constructor → operador → colaborador');
  chk((await api('/api/acciones/solicitar-actualizacion', { body: {}, token: TD })).ok, 'director solicita actualización');
  let r = await api('/api/acciones/actualizar-desarrollo', { body: {}, token: TC });
  chk(r.estado.bosques.avance_fisico === 82, 'constructor actualiza → avance 82%');
  chk(r.estado.bosques.semaforo === 'ambar', 'semáforo rojo → ámbar');
  chk((await api('/api/acciones/generar-estimacion', { body: {}, token: TC })).estado.bosques.estimaciones_mes === 2, 'estimación 2/2 enviada');
  r = await api('/api/acciones/validar-escrituras', { body: {}, token: TO });
  chk(r.estado.bosques.escrituras_pendientes === 23, 'notaría programa 25 firmas → quedan 23');
  chk((await api('/api/acciones/validar-uve', { body: {}, token: TO })).estado.flags.verificado === true, 'UVE valida avance');
  chk((await api('/api/acciones/validar-fianza', { body: {}, token: TL })).estado.bosques.fianza_estado === 'vigente', 'colaborador valida fianza');

  console.log('— KPIs nacionales derivados');
  const e = await api('/api/estado');
  chk(e.nacional.escrituradas === 98467, 'escrituradas 98,442 → 98,467');
  chk(e.nacional.sin_servicios === 18379, 'sin servicios 18,404 → 18,379');
  chk(e.mensajes.length >= 2, 'mensajes director↔constructor persistidos');

  console.log('— Tareas IA (fallback sin API key)');
  r = await api('/api/tareas/desglosar', { body: { mensaje: 'Destrabar Bosques del Bienestar esta semana' }, token: TD });
  chk(r.tareas?.length === 3, 'mensaje desglosado en 3 tareas');

  console.log('— B2C: elegibilidad');
  chk((await api('/api/elegibilidad', { body: { nss: '92099142066' } })).elegible === true, 'Ana elegible');
  const c = await api('/api/elegibilidad', { body: { nss: '11223344556' } });
  chk(c.elegible === false && c.razones.length === 1, 'Carlos NO elegible (<6 meses)');
  chk((await api('/api/elegibilidad', { body: { nss: '123' } })).error?.startsWith('El NSS'), 'NSS corto rechazado');

  console.log('— B2C: reserva 72h + documentos + firma');
  chk((await api('/api/desarrollos/bosques/unidades')).length === 18, '18 unidades sembradas');
  r = await api('/api/reservas', { body: { nss: '92099142066', unidad_id: 'bosques-A-304' } });
  const RID = r.reserva?.id;
  chk(RID && r.reserva.segundos_restantes > 259000, `reserva 304 creada, cronómetro real (${r.reserva?.segundos_restantes}s ≈ 72h)`);
  chk(r.reserva.documentos.filter(d => d.estado === 'validado').length === 3, 'INE/CURP/domicilio auto-validados');
  chk((await api('/api/reservas', { body: { nss: '92099142066', unidad_id: 'bosques-A-306' } })).error?.startsWith('Ya'), 'doble reserva bloqueada');
  chk((await api(`/api/reservas/${RID}/firmar`, { method: 'POST', body: {} })).error?.startsWith('Expediente'), 'firma bloqueada con docs pendientes');
  await api(`/api/reservas/${RID}/documentos/biometria`, { body: {} });
  await api(`/api/reservas/${RID}/documentos/constancia_sat`, { body: {} });
  r = await api(`/api/reservas/${RID}/firmar`, { method: 'POST', body: {} });
  chk(r.notaria === 'Notaría 121', 'expediente completo → firma confirmada');
  chk((await api('/api/reservas/activa?nss=92099142066')).estado === 'firmada', 'reserva persiste tras "recargar"');
  chk((await api('/api/estado')).flags.dh === true, 'firma refleja en torre de control');

  console.log('— NPS y copiloto');
  chk((await api('/api/nps', { body: { ubicacion: 5, servicios: 4, transporte: 3, calidad: 5, desarrollador: 5 } })).ok, 'NPS registrado');
  r = await api('/api/copilot', { body: { rol: 'director', pregunta: '¿por qué está en riesgo bosques?' } });
  chk(r.texto?.includes('82%'), 'copiloto responde con datos VIVOS (82%, no 78%)');
  chk(r.fuente === 'scripted', 'fallback scripted sin API key');

  console.log('— Desarrollos adicionales del constructor');
  const TC2 = await login('constructor@habitatjalisco.mx');
  r = await api('/api/acciones/actualizar-desarrollo', { body: { desarrollo_id: 'tesistan' }, token: TC2 });
  chk(r.desarrollo?.avance_fisico === 94 && r.desarrollo?.semaforo === 'verde', 'tesistán 92→94% con semáforo recalculado');
  chk((await api('/api/acciones/actualizar-desarrollo', { body: { desarrollo_id: 'noexiste' }, token: TC2 })).error?.startsWith('Desarrollo'), 'desarrollo inexistente → 404');

  console.log('— Perfil: contraseña y foto');
  chk((await api('/api/auth/cambiar-password', { body: { actual: 'mala', nueva: 'nueva12345' }, token: TC2 })).error?.includes('actual'), 'password actual incorrecta rechazada');
  chk((await api('/api/auth/cambiar-password', { body: { actual: 'bienestar2026', nueva: 'corta' }, token: TC2 })).error?.includes('8'), 'password corta rechazada');
  chk((await api('/api/auth/cambiar-password', { body: { actual: 'bienestar2026', nueva: 'habitat-2026!' }, token: TC2 })).ok === true, 'cambio de contraseña real');
  chk((await api('/api/auth/login', { body: { email: 'constructor@habitatjalisco.mx', password: 'habitat-2026!' } })).token?.length > 20, 'login con la nueva contraseña');
  const px = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  chk((await api('/api/auth/foto', { body: { foto: px }, token: TC2 })).ok === true, 'foto de perfil guardada');
  chk((await api('/api/perfil', { token: TC2 })).foto === px, 'foto persiste en el perfil');
  chk((await api('/api/auth/foto', { body: { foto: 'data:text/html;base64,xx' }, token: TC2 })).error?.includes('Formato'), 'foto no imagen rechazada');

  console.log('— Video con Range (Safari)');
  const rv = await fetch(B + '/assets/hero-familia.mp4', { headers: { range: 'bytes=0-1' } });
  chk(rv.status === 206 && rv.headers.get('content-range')?.startsWith('bytes 0-1/'), 'video responde 206 Partial Content');

  console.log('— Reset del sandbox');
  await api('/api/reset', { body: {} });
  const fin = await api('/api/estado');
  chk(fin.bosques.semaforo === 'rojo' && fin.flags.dh === false, 'reset → estado inicial');

  console.log('— NSS desconocido (auto-registro del sandbox)');
  const nuevo = await api('/api/elegibilidad', { body: { nss: '77788899911' } });
  chk(nuevo.elegible === true, 'NSS desconocido → registrado y elegible');
  chk((await api('/api/reservas', { body: { nss: '77788899911', unidad_id: 'toluca-A-303' } })).reserva?.id > 0, 'NSS nuevo puede apartar');

  console.log('— Flujo B2C desde otro desarrollo (Querétaro)');
  chk((await api('/api/desarrollos/qro/unidades')).length === 18, 'qro tiene 18 unidades');
  r = await api('/api/reservas', { body: { nss: '92099142066', unidad_id: 'qro-A-303' } });
  chk(r.reserva?.desarrollo_id === 'qro', 'reserva creada en Querétaro Bienestar');
  await api(`/api/reservas/${r.reserva.id}/documentos/biometria`, { body: {} });
  await api(`/api/reservas/${r.reserva.id}/documentos/constancia_sat`, { body: {} });
  chk((await api(`/api/reservas/${r.reserva.id}/firmar`, { method: 'POST', body: {} })).ok === true, 'firma completa en desarrollo alterno');
} catch (err) {
  bad('excepción: ' + err.message);
} finally {
  srv.kill();
}

console.log(`\nRESULTADO: ${PASS} OK, ${FAIL} fallos`);
process.exit(FAIL ? 1 : 0);
