# Infonavit POC

POC orientada a presentar una solucion digital para el ecosistema Infonavit con dos frentes:

- Solucion interna para equipos operativos, juridicos, cobranza, atencion y analitica.
- Solucion externa para proveedores y derechohabientes.

## Objetivo

Demostrar, en una sola experiencia, como una plataforma unificada puede:

- Reducir tiempos de respuesta y trazabilidad operativa.
- Mejorar la relacion con proveedores mediante autoservicio y visibilidad.
- Elevar la experiencia de derechohabientes con seguimiento claro, atencion asistida y tramites digitales.
- Centralizar indicadores, expedientes y flujos entre canales internos y externos.

## Contenido del repo

- `src/App.jsx`: aplicacion React principal para la demo.
- `src/data.js`: contenido mock por audiencia, journeys y arquitectura.
- `src/styles.css`: identidad visual y componentes de la demo.
- `index.html`: punto de entrada de Vite.
- `docs/propuesta-poc.md`: narrativa ejecutiva de la propuesta.
- `docs/arquitectura.md`: arquitectura funcional y tecnica sugerida.
- `docs/roadmap.md`: plan de implementacion por fases.

## Audiencias cubiertas

### Interno Infonavit

- Operacion y mesa de control
- Atencion y seguimiento
- Juridico y compliance
- Analitica y monitoreo

### Externo

- Proveedores
- Derechohabientes

## Capacidades de la POC

- Vista 360 del caso o expediente
- Trazabilidad de tickets, incidencias y SLA
- Portal de proveedores con onboarding, documentos y estatus
- Portal de derechohabientes con tramites, citas, seguimiento y asistente
- Tableros operativos y alertamiento
- Motor de priorizacion y reglas de negocio

## Como levantar la demo

1. Instalar dependencias:

```bash
npm install
```

2. Ejecutar en local:

```bash
npm run dev
```

3. O generar build productivo:

```bash
npm run build
```

## Enfoque de la propuesta

La POC esta pensada para una conversacion ejecutiva y funcional:

- Que problema se resuelve
- Para quien se resuelve
- Que journeys se transforman
- Que arquitectura habilita escalar a produccion

## Siguientes pasos sugeridos

1. Validar prioridades de negocio con stakeholders de Infonavit.
2. Elegir 2 o 3 journeys criticos para demo guiada.
3. Conectar la POC a APIs mock o sandbox.
4. Definir criterios de exito, seguridad y datos para una fase piloto.

## Pantallas incluidas

- Vista interna para operacion Infonavit con bandeja, expediente y control SLA.
- Vista de proveedores con onboarding, seguimiento y cumplimiento.
- Vista de derechohabientes con tramite guiado, ayuda y citas.
