# Arquitectura sugerida

## Principios

- Una sola capa de orquestacion para experiencias internas y externas.
- Integracion desacoplada con sistemas core y fuentes maestras.
- Seguridad y trazabilidad como capacidades nativas.
- Modularidad para iniciar como POC y crecer a piloto.

## Capas

### 1. Experiencias

- Portal interno de operacion
- Portal de proveedores
- Portal de derechohabientes
- Canales de atencion asistida

### 2. Orquestacion de procesos

- Motor de flujos
- Reglas de negocio
- SLA y semaforizacion
- Colas, tareas y aprobaciones

### 3. Expediente y datos

- Caso unico
- Documentos y evidencias
- Historial de eventos
- Metadatos y estatus

### 4. Integracion

- APIs REST
- Bus de integracion o iPaaS
- Notificaciones
- Identidad y acceso

### 5. Analitica e IA

- Dashboards operativos
- KPIs de servicio
- Resumen de expediente
- Sugerencias asistidas

## Integraciones potenciales

- CRM o sistemas de atencion
- Gestores documentales
- Sistemas de identidad
- Fuentes maestras de derechohabientes y proveedores
- Canales de correo, SMS o WhatsApp

## Consideraciones no funcionales

- Auditoria completa por evento
- Segregacion de roles y permisos
- Cifrado de datos sensibles
- Bitacora de accesos y cambios
- Escalabilidad por dominio de servicio
