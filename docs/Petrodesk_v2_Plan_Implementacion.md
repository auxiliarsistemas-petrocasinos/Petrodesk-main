# Plan de Implementación — Petrodesk v2

**Documento para:** Equipo/agentes de desarrollo
**Origen:** Consolidación del informe de auditoría técnica (revisión externa, 8 jul 2026)
**Nombre visible del producto:** Petrodesk (sin cambio de marca; v2 es una evolución interna)
**Objetivo de este documento:** Traducir el diagnóstico y las recomendaciones en un backlog ejecutable, con épicas, tareas técnicas, contratos de API, cambios de modelo de datos y criterios de aceptación, organizados en fases secuenciales.

---

## 0. Cómo usar este documento

Este plan está organizado en **5 fases secuenciales** (no paralelas salvo que se indique). Cada fase tiene:

- **Objetivo de negocio**
- **Épicas** con tareas técnicas concretas
- **Cambios de modelo de datos** (Prisma)
- **Contratos de API** esperados
- **Criterios de aceptación / Definition of Done**

Regla general para los agentes de desarrollo: **no iniciar una fase sin cerrar la Definition of Done de la anterior**, salvo Fase 2 (seguridad), que puede ejecutarse en paralelo con el cierre de Fase 1 porque toca capas transversales (guards, DTOs, CORS) que no bloquean funcionalidad visible.

No crear pantallas nuevas de "en construcción". Cualquier módulo que se toque debe salir de esa fase con flujo operativo real, no solo maqueta.

---

## 1. Contexto técnico actual (baseline)

- **Frontend:** React 18 + Vite + TypeScript + Tailwind + React Router + Lucide + Recharts.
- **Backend:** NestJS + Prisma + PostgreSQL (Supabase) + JWT + bcrypt, módulos por dominio.
- **Despliegue:** Vercel/serverless, frontend y backend separados.
- **Estado de módulos:**

| Módulo | Backend | Frontend | Acción requerida |
|---|---|---|---|
| Login / password change | Sí | Sí | Mantener, endurecer en Fase 2 |
| Usuarios | Sí | Sí | Mantener, aplicar RBAC en Fase 2 |
| Campos/sedes | Sí | Sí | Mejorar con mapa operativo en Fase 4-5 |
| Visitas | Sí | Sí (básico) | Completar checklist en Fase 4 |
| Tickets | Sí | **Falta** | Fase 1 — prioridad máxima |
| Inventario/activos | Sí | **Falta** | Fase 1 — prioridad máxima |
| Préstamos | Sí | **Falta** | Fase 1 — prioridad máxima |
| Reportes | Sí (CSV) | **Falta panel visual** | Fase 1 |
| Notificaciones | Sí (datos) | **Falta consumo real** | Fase 1/3 |
| Dashboard | No consolidado | **Falta** | Fase 1 — punto de partida |

**Riesgos técnicos conocidos que deben corregirse temprano (no esperar a Fase 2 si son triviales):**
- CORS abierto a cualquier origen.
- Falta `JWT_SECRET` obligatorio en producción.
- Endpoints que podrían exponer hash de contraseña.
- Sin `ValidationPipe` global ni DTOs robustos.

---

## 2. FASE 1 — Cerrar el producto base funcional

**Objetivo de negocio:** que Petrodesk deje de tener módulos "en construcción". Todo lo que el backend ya soporta debe tener una experiencia de usuario real.

### Épica 1.1 — Dashboard operativo

**Tareas:**
1. Crear endpoint agregador `GET /dashboard/summary` que devuelva en una sola llamada:
   - Conteo de tickets por estado (abiertos, críticos, vencidos, cerrados).
   - Conteo de activos por estado (disponible, en uso, mantenimiento, retirado).
   - Préstamos por vencer (≤72h) y vencidos.
   - Visitas próximas (7 días) y recientes (7 días).
   - Últimos 10 eventos de actividad del sistema (requiere que exista al menos un log de actividad básico, ver Épica 2.4).
2. Frontend: construir pantalla `Dashboard` con tarjetas de KPI + gráficos Recharts (barras/líneas para tendencias de tickets, dona para estados de activos).
3. Tarjetas accionables tipo "centro de mando" (ver sección 6.3 del informe): ej. "3 tickets críticos sin asignar", con click que navega al listado filtrado correspondiente.

**Criterios de aceptación:**
- El dashboard carga datos reales desde el backend, no mocks.
- Cada tarjeta de KPI es clickeable y filtra la vista correspondiente.
- Tiempo de carga aceptable con paginación/agregación en backend, no trayendo todas las filas al frontend.

### Épica 1.2 — Módulo de Tickets (pantalla completa)

**Tareas backend:**
1. Confirmar/crear DTOs: `CreateTicketDto`, `UpdateTicketDto`, `AddCommentDto`, `AssignTicketDto`.
2. Endpoints mínimos:
   - `POST /tickets`
   - `GET /tickets` (con filtros: `status`, `priority`, `fieldId`, `assignedToId`, `createdById`, `search`, paginación `page`/`pageSize`)
   - `GET /tickets/:id`
   - `PATCH /tickets/:id` (cambio de estado/prioridad)
   - `POST /tickets/:id/assign`
   - `POST /tickets/:id/comments`
   - `GET /tickets/:id/comments`
   - `POST /tickets/:id/attachments`
3. Registrar cada cambio relevante en `TicketActivity` (ver modelo en sección 6).

**Tareas frontend:**
1. Vista de listado con filtros (estado, prioridad, campo, usuario, responsable) + búsqueda.
2. Vista de detalle de ticket: info general, línea de tiempo/comentarios, adjuntos, botones de acción (asignar, cambiar estado, cambiar prioridad).
3. Formulario de creación de ticket con selección de campo, categoría (placeholder hasta Fase 3) y prioridad.
4. Estados vacíos: "No hay tickets abiertos. Crear uno."

**Criterios de aceptación:**
- Un usuario IT_SUPPORT puede crear, asignar, comentar, adjuntar evidencia y cerrar un ticket de principio a fin sin usar Postman.
- Los filtros combinados funcionan y son persistentes en la URL (query params) para poder compartir vistas filtradas.

### Épica 1.3 — Módulo de Inventario/Activos (pantalla completa)

**Tareas backend:**
1. Endpoints:
   - `POST /assets`
   - `GET /assets` (filtros: `status`, `brand`, `fieldId`, `assignedUserId`, `search`)
   - `GET /assets/:id` (incluir historial embebido o endpoint separado `GET /assets/:id/history`)
   - `PATCH /assets/:id`
   - `POST /assets/:id/assign` (a usuario o campo)
   - `PATCH /assets/:id/status`
2. Registrar cada cambio de estado/asignación como evento de historial (reutilizar el mismo patrón de auditoría de Épica 2.4).

**Tareas frontend:**
1. Listado con filtros por estado, marca, campo, usuario asignado.
2. Ficha de activo (base para el "pasaporte digital" de la Fase 4-5): datos generales, estado actual, historial cronológico, asignación actual.
3. Acciones: cambiar estado, reasignar a usuario/campo.

**Criterios de aceptación:**
- Un activo puede rastrearse completo: dónde está, quién lo tiene, en qué estado, y qué cambios ha tenido.

### Épica 1.4 — Módulo de Préstamos (flujo operativo completo)

**Tareas backend:**
1. Modelar el ciclo de vida como máquina de estados: `SOLICITADO → APROBADO → ENTREGADO → DEVUELTO` (o `RECHAZADO` desde `SOLICITADO`/`APROBADO`).
2. Endpoints:
   - `POST /loans` (solicitud)
   - `POST /loans/:id/approve`
   - `POST /loans/:id/reject`
   - `POST /loans/:id/deliver` (marca entrega, fecha esperada de devolución)
   - `POST /loans/:id/return` (marca devolución, condición del equipo)
   - `GET /loans` (filtros por estado, usuario, activo, vencimiento)
   - `GET /loans/:id`
3. Job/consulta de "préstamos por vencer y vencidos" reutilizable por el dashboard.

**Tareas frontend:**
1. Listado con estado visual claro (badges de color) y alertas de vencimiento.
2. Flujo guiado: solicitar → aprobar → entregar → devolver, con formularios específicos por paso.
3. Historial de cada préstamo visible en el detalle.

**Criterios de aceptación:**
- El flujo completo de préstamo puede ejecutarse de punta a punta desde la UI.
- Las fechas de vencimiento generan alerta visible en dashboard y listado.

### Épica 1.5 — Reportes (panel visual + export)

**Tareas backend:**
1. Mantener/mejorar exportación CSV existente por entidad (tickets, activos, préstamos, visitas).
2. Endpoints de agregación para gráficos: `GET /reports/tickets-summary?from=&to=`, `GET /reports/assets-summary`, `GET /reports/loans-summary`.

**Tareas frontend:**
1. Pantalla de Reportes con selector de rango de fechas y tipo de entidad.
2. Gráficos Recharts (tendencia temporal, distribución por estado/prioridad/campo).
3. Botón de exportación CSV por cada reporte mostrado.

**Criterios de aceptación:**
- Los datos del gráfico y el CSV exportado son consistentes entre sí (mismos filtros aplicados).

### Épica 1.6 — Notificaciones reales

**Tareas backend:**
1. Endpoint `GET /notifications` (por usuario autenticado) y `PATCH /notifications/:id/read`.
2. Generar notificación en eventos clave: asignación de ticket, comentario nuevo, préstamo por vencer, cambio de estado relevante.

**Tareas frontend:**
1. Campana con contador dinámico (badge) conectado al endpoint real.
2. Dropdown/panel de notificaciones con marcado de leída y navegación al recurso relacionado.

**Criterios de aceptación:**
- Una acción real en el sistema (ej. asignar un ticket a un usuario) genera una notificación visible para ese usuario sin recargar la página (polling o websocket, decisión técnica del equipo).

### Definition of Done — Fase 1

- Ningún módulo del menú principal muestra "en construcción".
- Un usuario puede completar los flujos de ticket, activo y préstamo de principio a fin sin intervención manual en base de datos.
- El dashboard refleja datos reales y consistentes con los módulos.

---

## 3. FASE 2 — Seguridad, permisos y calidad interna

**Objetivo de negocio:** que la aplicación sea segura para operación real, no solo para demo. Puede ejecutarse en paralelo con el cierre de Fase 1 en lo referente a guards/DTOs transversales.

### Épica 2.1 — RBAC real por endpoint

**Tareas:**
1. Definir matriz de permisos explícita antes de tocar código:
   - `ADMIN`: usuarios, configuración, reportes globales, todo lo demás.
   - `IT_SUPPORT`: tickets, activos, préstamos, visitas (crear/gestionar).
   - `END_USER`: crear tickets propios, ver sus tickets, ver activos asignados a sí mismo, solicitar préstamos.
2. Implementar/activar `RolesGuard` + decorador `@Roles(...)` en **todos** los controladores, no solo los sensibles.
3. Auditar cada endpoint existente contra la matriz y corregir los que falten.

**Criterios de aceptación:**
- Existe una tabla de mapeo endpoint→roles permitidos como documentación técnica.
- Pruebas manuales o automatizadas confirman que un `END_USER` no puede acceder a endpoints de `ADMIN`/`IT_SUPPORT`.

### Épica 2.2 — Validación de datos (DTOs)

**Tareas:**
1. Activar `ValidationPipe` global (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).
2. Definir DTOs con `class-validator` para cada endpoint de escritura (POST/PATCH), incluyendo:
   - Campos obligatorios.
   - Rangos de fechas coherentes (ej. fecha de devolución esperada > fecha de entrega).
   - Enums válidos para estados/prioridades.

**Criterios de aceptación:**
- Un payload inválido devuelve `400` con mensaje claro, no un error 500 ni un guardado silencioso incorrecto.

### Épica 2.3 — Endurecimiento de infraestructura

**Tareas:**
1. Configurar CORS con lista blanca de orígenes por ambiente (no `*` en producción).
2. Hacer `JWT_SECRET` obligatorio (fallar el arranque si no está definido en producción).
3. Revisar todos los serializers/DTOs de respuesta para asegurar que el hash de contraseña nunca se devuelve.
4. Eliminar logs que impriman credenciales o tokens.
5. Definir manejo de archivos compatible con entorno serverless (no depender de filesystem local persistente; usar storage externo — S3, Supabase Storage o equivalente).

**Criterios de aceptación:**
- Revisión de código confirma que ningún endpoint devuelve `password`/`passwordHash`.
- Variables de entorno documentadas en `.env.example` (backend y frontend).

### Épica 2.4 — Auditoría (AuditLog)

**Tareas:**
1. Crear modelo `AuditLog` (ver sección 6) y servicio de auditoría reutilizable (interceptor o servicio inyectado).
2. Registrar automáticamente: quién, qué acción, sobre qué entidad, valor anterior/nuevo (para cambios), fecha.
3. Aplicar a las entidades críticas primero: tickets, activos, préstamos, usuarios.

**Criterios de aceptación:**
- Es posible reconstruir el historial de cualquier ticket/activo/préstamo a partir del `AuditLog` o de `TicketActivity`.

### Épica 2.5 — Manejo estándar de errores en frontend

**Tareas:**
1. Cliente API centralizado (ver Épica frontend en sección 4) con interceptor de errores.
2. Componente de toast/alerta reutilizable para errores y éxitos.
3. Manejo de expiración de token: logout automático + redirección a login con mensaje claro.

**Definition of Done — Fase 2**

- RBAC aplicado y verificado en el 100% de los endpoints.
- CORS cerrado por ambiente.
- Auditoría básica funcionando en tickets, activos, préstamos y usuarios.
- Ningún endpoint expone datos sensibles.

---

## 4. FASE 3 — Automatización operativa

**Objetivo de negocio:** reducir trabajo manual y mejorar tiempos de respuesta.

### Épica 3.1 — SLA por prioridad

**Tareas:**
1. Crear modelo `SLA` (reglas por prioridad/categoría, ver sección 6).
2. Calcular automáticamente la fecha límite de un ticket al crearlo, según su prioridad/categoría.
3. Job periódico (cron) que revise tickets próximos a vencer o vencidos y dispare notificación/escalamiento.

### Épica 3.2 — Escalamiento automático

**Tareas:**
1. Regla: ticket crítico sin atención dentro del SLA → notificar a `ADMIN` o reasignar según configuración.
2. Regla: préstamo vencido → notificación al usuario y a `IT_SUPPORT`.

### Épica 3.3 — Plantillas

**Tareas:**
1. Modelo simple de plantillas de texto (respuestas frecuentes, cierres de ticket, actas).
2. UI para insertar plantilla al comentar o cerrar un ticket.

### Épica 3.4 — Motor de reglas básico (sin código)

**Tareas:**
1. Pantalla de configuración de reglas simples tipo condición→acción (ej. "si prioridad = CRITICAL, notificar a ADMIN"; "si campo = X, asignar a técnico Y").
2. Motor de evaluación de reglas ejecutado en los eventos de creación/actualización relevantes.

**Nota de alcance:** este motor puede empezar simple (reglas hardcodeadas configurables por tabla) sin necesidad de un DSL complejo. No sobre-diseñar en esta fase.

**Definition of Done — Fase 3**

- Los tickets críticos generan alertas automáticas si no se atienden a tiempo.
- Los préstamos vencidos notifican automáticamente.
- Existen al menos 3 plantillas operativas disponibles para el equipo de soporte.

---

## 5. FASE 4 — Experiencia móvil y trabajo en campo

**Objetivo de negocio:** hacer Petrodesk útil fuera del escritorio, donde ocurre buena parte de la operación real.

### Épica 4.1 — Responsive real / mobile-first

**Tareas:**
1. Auditar y ajustar layout principal para menú móvil (drawer/bottom nav).
2. Priorizar las vistas más usadas en campo: crear ticket, ver activo, iniciar/devolver préstamo, checklist de visita.

### Épica 4.2 — QR para activos

**Tareas:**
1. Modelo `AssetQrCode` (token único por activo, ver sección 6).
2. Endpoint público controlado `GET /assets/qr/:token` que resuelve al activo (con control de expiración/regeneración de token si se requiere).
3. Generación de QR imprimible desde la ficha del activo.
4. Flujo móvil: escanear QR → ver ficha del activo → acciones rápidas (crear ticket, iniciar préstamo, registrar mantenimiento).

### Épica 4.3 — Evidencias desde celular

**Tareas:**
1. Modelo `Attachment` reutilizable por entidad (ticket, activo, préstamo, visita).
2. Soporte de carga de foto/PDF desde móvil (usar storage externo, no filesystem local — depende de Épica 2.3).
3. Firma simple (captura en canvas) para actas de entrega/devolución.

### Épica 4.4 — Checklist de visitas

**Tareas:**
1. Modelos `ChecklistTemplate` y `ChecklistResponse` (ver sección 6).
2. Checklist base para HSE: seguridad, equipos revisados, hallazgos, pendientes, firma del responsable.
3. UI de visita: completar checklist + adjuntar evidencia + firma.

### Épica 4.5 — Modo offline parcial (evaluar alcance real)

**Tareas:**
1. Definir alcance mínimo viable: capturar checklist de visita y evidencias sin conexión, sincronizar al recuperar internet (service worker + cola local).
2. **Nota para el equipo:** esta es la funcionalidad de mayor riesgo técnico de todo el plan. Evaluar con una prueba de concepto acotada antes de comprometer fecha; si el esfuerzo es desproporcionado, puede diferirse sin bloquear el resto de la Fase 4.

**Definition of Done — Fase 4**

- Un técnico puede, desde su celular: escanear un QR, ver la ficha del activo, crear un ticket o préstamo, y completar un checklist de visita con firma y evidencia.

---

## 6. FASE 5 — Inteligencia y analítica

**Objetivo de negocio:** convertir datos operativos en decisiones. Esta fase depende de tener suficiente volumen de datos históricos de las fases anteriores (tickets cerrados, historial de activos) para ser útil.

### Épica 5.1 — Analítica de soporte

**Tareas:**
1. Calcular métricas: MTTR (tiempo medio de resolución), tiempo medio de primera respuesta, carga por técnico, tickets por campo, activos con más fallas.
2. Exponer en dashboard/reportes como sección "Analítica".

### Épica 5.2 — Clasificación y resumen automático de tickets (IA)

**Tareas:**
1. Integración con modelo de lenguaje (a definir proveedor) para:
   - Sugerir categoría y prioridad al crear un ticket.
   - Resumir hilos largos de comentarios.
   - Sugerir próximo paso.
2. Mantener siempre la sugerencia como **editable por el usuario**, nunca como decisión automática sin confirmación humana en esta primera versión.

### Épica 5.3 — Base de conocimiento inteligente

**Tareas:**
1. Modelo `KnowledgeArticle`.
2. Flujo para convertir un ticket cerrado en artículo sugerido (revisión humana antes de publicar).
3. Recomendación de artículos relevantes al crear un ticket nuevo (búsqueda por similitud de texto, no necesariamente embeddings desde el día uno).

### Épica 5.4 — Mantenimiento preventivo/predictivo

**Tareas:**
1. Modelo `AssetMaintenance` (ver sección 6 más abajo, num. de modelos).
2. Alertas por antigüedad, historial de fallas o reincidencia.
3. Programación de mantenimiento con responsable y fecha.

### Épica 5.5 — Portal de autoservicio para END_USER

**Tareas:**
1. Vista simplificada para `END_USER`: crear solicitud vía catálogo de servicios, ver estado de sus tickets, ver activos asignados, solicitar préstamo, confirmar recepción/devolución.
2. Catálogo de servicios (`ServiceRequestType`) con formulario, SLA y responsable por defecto asociados.

**Definition of Done — Fase 5**

- El dashboard de analítica muestra MTTR y carga por técnico con datos reales.
- Existe al menos un flujo de IA funcionando end-to-end con confirmación humana (sugerencia de categoría/prioridad).
- El portal de autoservicio permite a un END_USER operar sin tocar las vistas internas de IT_SUPPORT.

---

## 7. Modelo de datos — Cambios acumulados por fase

Resumen de modelos Prisma nuevos o ampliados, para que el equipo de backend planifique migraciones. Se listan en el orden en que se necesitan:

**Fase 1:**
- `TicketActivity` — historial granular de estados/asignaciones de un ticket.
- Ampliar `Ticket`, `Asset`, `Loan` con campos de estado consistentes si no existen ya.

**Fase 2:**
- `AuditLog` — auditoría global (entidad, acción, usuario, valor anterior/nuevo, fecha).

**Fase 3:**
- `SLA` — reglas por prioridad/categoría (tiempo de respuesta, tiempo de resolución).
- Modelo simple de `Template` (plantillas de texto).
- Modelo de `Rule` (condición→acción) para el motor de reglas básico.

**Fase 4:**
- `Attachment` — adjuntos reutilizables por entidad (polimórfico: `entityType` + `entityId`).
- `AssetQrCode` — token/código público controlado por activo.
- `ChecklistTemplate` y `ChecklistResponse`.

**Fase 5:**
- `Category` — categorías de tickets / catálogo de servicios.
- `ServiceRequestType` — tipos de solicitud con SLA y formulario asociado.
- `AssetMaintenance` — mantenimientos preventivos/correctivos.
- `AssetWarranty` — garantía, proveedor, fechas, documentos.
- `KnowledgeArticle` — base de conocimiento.
- `ApprovalFlow` — aprobaciones para préstamos/cambios/compras (si se requiere más allá del flujo simple de Fase 1).
- `NotificationPreference` — preferencias de notificación por usuario.
- `IntegrationConfig` — configuración de integraciones externas.

**Nota de diseño:** `Attachment` debería diseñarse desde Fase 4 (o antes, si Fase 1 ya requiere adjuntos en tickets) como tabla polimórfica reutilizable, para no tener que crear `TicketAttachment`, `AssetAttachment`, `LoanAttachment` por separado.

---

## 8. Estándares técnicos transversales (aplican desde Fase 1)

### Backend
- DTOs con `class-validator` en todo endpoint de escritura.
- `RolesGuard` en todo controlador.
- Paginación y filtros server-side (nunca traer tablas completas al frontend).
- Respuestas y errores normalizados (mismo formato de error en toda la API).
- Migraciones Prisma versionadas y commiteadas, nunca `db push` directo en producción.

### Frontend
- Cliente API centralizado (un solo lugar que maneje base URL, headers, refresh de token, logout automático).
- Hooks por recurso: `useTickets`, `useAssets`, `useLoans`, etc., para evitar duplicar lógica de `fetch`.
- Componentes compartidos: tabla con filtros/orden/búsqueda, modal genérico, formulario genérico.
- Loading skeletons y estados de error visibles (no pantallas en blanco).
- Protección de rutas por rol, con navegación que se adapta según permisos del usuario autenticado.
- Confirmaciones con componente propio, eliminar el uso de `confirm()` nativo del navegador.
- Revisar codificación UTF-8 y acentos en todos los textos de UI.

### DevOps
- `.env.example` actualizado para frontend y backend en cada fase que agregue variables nuevas.
- Pipeline de build/lint/test antes de cada release.
- Ambientes definidos: local, staging, producción.
- Backups de base de datos configurados antes de Fase 2 (una vez la app maneje datos reales de operación).
- Monitoreo de errores backend/frontend (ej. Sentry o equivalente) — recomendable desde Fase 2.

---

## 9. Orden de ejecución sugerido (resumen)

1. **Fase 1** — Dashboard, Tickets, Activos, Préstamos, Reportes, Notificaciones. *(bloqueante para todo lo demás)*
2. **Fase 2** — RBAC, DTOs, CORS, auditoría. *(en paralelo con el cierre de Fase 1)*
3. **Fase 3** — SLA, escalamiento, plantillas, motor de reglas básico.
4. **Fase 4** — Mobile-first, QR, evidencias, checklist de visitas, (offline como stretch goal).
5. **Fase 5** — Analítica, IA de clasificación/resumen, base de conocimiento, mantenimiento predictivo, portal de autoservicio.

Este orden prioriza: primero que el producto funcione completo (Fase 1), luego que sea seguro (Fase 2), después que ahorre trabajo (Fase 3), luego que funcione en campo (Fase 4), y finalmente que sea inteligente (Fase 5). No se recomienda invertir este orden, incluso si algunas funciones de Fase 5 son las más "vistosas": sin base funcional y segura, la inteligencia no tiene datos confiables sobre los cuales operar.

---

## 10. Notas finales para los agentes de desarrollo

- Este documento no reemplaza el detalle de UX de cada pantalla; donde falte precisión visual, seguir la identidad ya establecida (azul/gris operativo + naranja Petrodesk) y los patrones de UX descritos en la sección 8 (estados vacíos, breadcrumbs, toasts, búsqueda global).
- Cualquier ambigüedad de alcance dentro de una épica debe resolverse a favor de la opción más simple que cumpla la Definition of Done de la fase — evitar sobre-ingeniería, especialmente en Fase 3 (motor de reglas) y Fase 5 (IA).
- Marcar cada épica como completada solo cuando cumpla su criterio de aceptación explícito, no cuando el código "esté escrito".
