export const metrics = [
  { value: "35%", label: "Menor tiempo de seguimiento operativo" },
  { value: "24/7", label: "Autoservicio para proveedores y derechohabientes" },
  { value: "1", label: "Expediente unificado por caso" },
  { value: "100%", label: "Trazabilidad de SLA y estatus" },
];

export const experiences = [
  {
    tag: "Interno",
    title: "Centro de control operativo",
    description:
      "Orquesta casos, tickets, expedientes, alertas y cumplimiento en una sola vista para equipos de Infonavit.",
  },
  {
    tag: "Proveedores",
    title: "Portal de colaboracion externa",
    description:
      "Permite onboarding, carga documental, seguimiento de solicitudes, evidencias, pagos y cumplimiento de SLA.",
  },
  {
    tag: "Derechohabientes",
    title: "Experiencia omnicanal de servicio",
    description:
      "Facilita tramites, consultas, citas, estatus y asistencia contextual con lenguaje claro y seguimiento continuo.",
  },
];

export const journeys = [
  {
    audience: "Interno Infonavit",
    title: "Gestion integral de casos y seguimiento",
    summary:
      "Unifica solicitudes entrantes, semaforizacion, reasignacion automatica y vista 360 del expediente.",
    bullets: [
      "Bandeja centralizada por prioridad, canal y tipo de caso.",
      "Reglas de negocio para enrutar incidencias a la celula correcta.",
      "Trazabilidad de interacciones, documentos y compromisos.",
      "Alertamiento de SLA y cuellos de botella en tiempo real.",
    ],
    impact: "Menor retrabajo, mas control operativo y mejor tiempo de respuesta.",
    kpi: "Tiempo promedio de atencion, cumplimiento SLA, backlog por celula.",
    capabilities: "Case management, workflow engine, expediente digital, dashboards.",
  },
  {
    audience: "Proveedores",
    title: "Onboarding, cumplimiento y seguimiento de solicitudes",
    summary:
      "Los proveedores visualizan estatus, requisitos y pendientes sin depender de correo o seguimiento manual.",
    bullets: [
      "Registro y validacion documental con checklist dinamico.",
      "Seguimiento de solicitudes, rechazos y observaciones con evidencia.",
      "Visibilidad de pagos, hitos y estatus de atencion.",
      "Comunicacion estructurada con bitacora auditable.",
    ],
    impact: "Menos friccion operativa y mayor transparencia con terceros.",
    kpi: "Tiempo de onboarding, tickets reabiertos, cumplimiento documental.",
    capabilities: "Portal B2B, gestor documental, mensajeria, SLA tracker.",
  },
  {
    audience: "Derechohabientes",
    title: "Acompanamiento de tramites y servicio personalizado",
    summary:
      "El derechohabiente consulta su situacion, inicia tramites y recibe orientacion clara segun su contexto.",
    bullets: [
      "Inicio de tramites con formularios guiados y precarga de datos.",
      "Seguimiento de estatus y proximos pasos con lenguaje ciudadano.",
      "Agenda de citas, recordatorios y notificaciones multicanal.",
      "Asistente de ayuda para dudas frecuentes y escalamiento a agente.",
    ],
    impact: "Mejor experiencia digital, menos abandono y mas claridad en el proceso.",
    kpi: "Conversion de tramite, satisfaccion, contacto evitado.",
    capabilities: "Portal ciudadano, notificaciones, knowledge assistant, CRM de servicio.",
  },
];

export const architecture = [
  {
    title: "Canales",
    description: "Portal interno, portal proveedores, portal derechohabientes, contact center y canales de mensajeria.",
  },
  {
    title: "Orquestacion",
    description: "Motor de flujos, reglas, SLA, tareas, colas, aprobaciones y prioridades.",
  },
  {
    title: "Datos y expediente",
    description: "Vista 360, expediente digital, documentos, historial y eventos del caso.",
  },
  {
    title: "Integracion",
    description: "APIs, ESB o iPaaS para core Infonavit, identidad, notificaciones y fuentes maestras.",
  },
  {
    title: "Analitica",
    description: "KPIs operativos, monitoreo de SLA, tableros ejecutivos y deteccion de fricciones.",
  },
  {
    title: "Seguridad",
    description: "SSO, perfiles, trazabilidad, consentimiento, cifrado y controles de auditoria.",
  },
  {
    title: "Automatizacion",
    description: "Validaciones, recordatorios, tareas recurrentes y enriquecimiento de casos.",
  },
  {
    title: "IA Asistida",
    description: "Busqueda semantica, resumen de expediente, sugerencias de respuesta y copiloto operativo.",
  },
];

export const roadmap = [
  {
    title: "Fase 1",
    description: "Descubrimiento y definicion de journeys criticos, stakeholders y KPIs de la POC.",
  },
  {
    title: "Fase 2",
    description: "Configuracion de experiencia demo, reglas base, mock de integraciones y tableros.",
  },
  {
    title: "Fase 3",
    description: "Validacion con usuarios clave y refinamiento de casos internos y externos.",
  },
  {
    title: "Fase 4",
    description: "Plan de piloto con seguridad, datos, integraciones reales y gobierno de adopcion.",
  },
];

export const roleScreens = [
  {
    key: "interno",
    label: "Interno Infonavit",
    theme: "internal",
    title: "Mesa de control y expediente 360",
    description:
      "Pantalla para operacion con cola priorizada, alertas, bitacora del caso y acciones sugeridas.",
    heroStat: "127 casos activos",
    heroDetail: "18 con riesgo SLA y 6 listos para cierre hoy",
    columns: [
      {
        title: "Bandeja operativa",
        items: [
          "Casos priorizados por semaforo y antiguedad",
          "Filtro por celula, canal, tipo de tramite y region",
          "Acciones rapidas para reasignar, comentar o escalar",
        ],
      },
      {
        title: "Expediente",
        items: [
          "Resumen del caso con historial consolidado",
          "Documentos, evidencias y compromisos",
          "Sugerencias de siguiente mejor accion",
        ],
      },
      {
        title: "Control ejecutivo",
        items: [
          "SLA por proceso y cuello de botella",
          "Productividad por equipo",
          "Incidencias recurrentes y alertas",
        ],
      },
    ],
    timeline: [
      "09:10 Caso creado desde portal ciudadano",
      "09:14 Regla lo asigna a formalizacion",
      "10:05 Analista solicita documento faltante",
      "10:30 Derechohabiente carga evidencia y el caso avanza",
    ],
  },
  {
    key: "proveedores",
    label: "Proveedores",
    theme: "partner",
    title: "Portal de onboarding y seguimiento",
    description:
      "Experiencia B2B con checklist documental, observaciones auditable y monitoreo de cumplimiento.",
    heroStat: "92% cumplimiento documental",
    heroDetail: "11 expedientes en revision y 3 con observaciones",
    columns: [
      {
        title: "Inicio",
        items: [
          "Checklist dinamico por tipo de proveedor",
          "Carga de evidencias con versionado",
          "Firma y aceptacion de condiciones",
        ],
      },
      {
        title: "Seguimiento",
        items: [
          "Estatus por solicitud y fecha compromiso",
          "Observaciones con responsable y respuesta",
          "Bitacora de interacciones y mensajes",
        ],
      },
      {
        title: "Valor agregado",
        items: [
          "Panel de pagos y entregables",
          "Alertas preventivas por vencimiento",
          "Metrica de cumplimiento y salud del proveedor",
        ],
      },
    ],
    timeline: [
      "Dia 1 Registro del proveedor y alta de expediente",
      "Dia 2 Revision automatica detecta documento vencido",
      "Dia 3 Proveedor corrige y reenvia evidencia",
      "Dia 4 Operacion aprueba y habilita colaboracion",
    ],
  },
  {
    key: "derechohabientes",
    label: "Derechohabientes",
    theme: "citizen",
    title: "Portal de tramites y acompanamiento",
    description:
      "Experiencia clara para iniciar tramites, conocer estatus, resolver dudas y continuar el proceso sin friccion.",
    heroStat: "3 pasos para completar",
    heroDetail: "Cita confirmada y documentacion al 80%",
    columns: [
      {
        title: "Mi tramite",
        items: [
          "Resumen de estatus con proximos pasos",
          "Carga de documentos con validacion guiada",
          "Linea de tiempo entendible y en lenguaje simple",
        ],
      },
      {
        title: "Ayuda",
        items: [
          "Asistente con preguntas frecuentes",
          "Escalamiento a ejecutivo cuando se requiera",
          "Notificaciones por cambios importantes",
        ],
      },
      {
        title: "Relacion continua",
        items: [
          "Agenda de citas y recordatorios",
          "Historico de solicitudes y respuestas",
          "Encuesta de satisfaccion y retroalimentacion",
        ],
      },
    ],
    timeline: [
      "08:45 Derechohabiente inicia tramite desde celular",
      "08:52 Sistema precarga informacion disponible",
      "09:08 Se agenda cita para validacion final",
      "09:15 Se envia confirmacion y checklist personalizado",
    ],
  },
];
