# Petrodesk v2 — Análisis integral y propuesta de evolución

Fecha de revisión: 8 de julio de 2026  
Proyecto revisado: Petrodesk

## 1. Resumen ejecutivo

Petrodesk ya tiene una idea central fuerte: ser una plataforma interna para soporte técnico, control de activos, préstamos de equipos, campos/sedes, visitas y reportes en un entorno operativo/industrial. La versión actual combina una estética SaaS moderna con una arquitectura separada en frontend React/Vite y backend NestJS/Prisma/PostgreSQL.

La mayor oportunidad para una versión 2 no es “agregar pantallas por agregar”, sino convertir Petrodesk en un sistema operativo liviano para IT en campo: tickets, activos, préstamos, visitas, evidencia, responsables, trazabilidad, reportes, automatizaciones y decisiones predictivas conectadas entre sí.

En el estado actual, el backend ya contempla buena parte del dominio, pero varias pantallas principales del frontend todavía están en construcción. Por eso recomiendo una v2 por etapas: primero cerrar el producto base funcional, luego agregar inteligencia operativa, movilidad, automatización y analítica.

## 2. Tema central de Petrodesk

Petrodesk debe entenderse como:

> Una plataforma de gestión IT para operaciones industriales y de campo, enfocada en trazabilidad, soporte, activos, préstamos, visitas y cumplimiento operativo.

El diferenciador natural no es competir directamente contra Jira, ServiceNow o Freshservice, sino crear una herramienta más ajustada a operaciones petroleras/industriales pequeñas o medianas donde importan:

- Saber qué equipo existe, dónde está, quién lo tiene y en qué estado se encuentra.
- Registrar incidentes y solicitudes con prioridad, responsable y tiempos de atención.
- Controlar préstamos, entregas, devoluciones, evidencias y aprobaciones.
- Gestionar campos/sedes con responsables HSE, supervisores y coordinadores.
- Planear visitas a campo, registrar gastos, adjuntar informes y generar historial.
- Tener reportes claros para auditoría, operación y toma de decisiones.

## 3. Estado actual observado

### 3.1 Stack y arquitectura

- Frontend: React 18, Vite, TypeScript, Tailwind CSS, React Router, Lucide y Recharts.
- Backend: NestJS, Prisma, PostgreSQL/Supabase, JWT, bcrypt y módulos separados por dominio.
- Base de datos: modelos para usuarios, tickets, comentarios, adjuntos, activos, historial, campos, préstamos, notificaciones y visitas.
- Despliegue previsto: Vercel/serverless para backend y frontend, con variables de entorno.

### 3.2 Módulos detectados

| Módulo | Backend | Frontend | Observación |
|---|---:|---:|---|
| Login / cambio obligatorio de contraseña | Sí | Sí | Funcional como base. |
| Usuarios | Sí | Sí | CRUD disponible. |
| Campos / sedes | Sí | Sí | CRUD disponible con vista lista/grid. |
| Visitas | Sí | Sí | Incluye informes y gastos básicos. |
| Tickets | Sí | En construcción | Backend existe, falta pantalla real. |
| Inventario / activos | Sí | En construcción | Backend existe, falta experiencia completa. |
| Préstamos | Sí | En construcción | Backend existe, falta flujo operativo. |
| Reportes | Sí | En construcción | Backend genera CSV, falta panel visual. |
| Notificaciones | Sí | Parcial visual | Campana estática; falta consumo real. |
| Dashboard | No consolidado | En construcción | Debe volverse el centro de mando. |

### 3.3 Fortalezas

- Dominio bien elegido: soporte IT + activos + campo es una combinación valiosa.
- Modelo de datos inicial coherente para una mesa de ayuda interna.
- Backend modular, fácil de extender por áreas.
- UI con identidad visual clara: azul/gris operativo + naranja Petrodesk.
- Ya existe autenticación JWT, roles base y cambio de contraseña obligatorio.
- Campos y visitas empiezan a conectar Petrodesk con la realidad operativa del terreno.

### 3.4 Debilidades o brechas actuales

- Varias pantallas principales están en construcción, aunque sus APIs existen.
- Los roles están definidos, pero no se aplican de forma consistente en todos los controladores.
- No hay validación robusta de DTOs en backend.
- CORS está abierto a cualquier origen; aceptable en pruebas, riesgoso en producción.
- No hay dashboard real de KPIs.
- Las notificaciones existen en base de datos, pero no están integradas como experiencia viva.
- No hay SLA, vencimientos, escalamiento ni colas de trabajo.
- No hay catálogo de solicitudes ni base de conocimiento.
- No hay pruebas automatizadas ni documentación técnica operativa suficiente.
- Falta trazabilidad avanzada: auditoría, eventos, comentarios enriquecidos, archivos por entidad.

## 4. Oportunidad estratégica para Petrodesk v2

La v2 debería moverse de “sistema CRUD de soporte” a “plataforma operativa inteligente”. Eso implica cinco ejes:

1. Completar el núcleo funcional: tickets, activos, préstamos, reportes y dashboard.
2. Agregar flujo de trabajo: estados, SLA, aprobaciones, escalamiento y responsables.
3. Mejorar trazabilidad: historial completo, evidencias, archivos, auditoría y bitácoras.
4. Llevarlo a campo: experiencia móvil, QR, modo offline parcial y reportes de visita.
5. Incorporar inteligencia: sugerencias, clasificación automática, predicción y analítica.

## 5. Roadmap propuesto

### Fase 1 — Cerrar la versión base funcional

Objetivo: que Petrodesk deje de tener módulos centrales en construcción.

Prioridad alta:

- Dashboard operativo con métricas reales:
  - Tickets abiertos, críticos, vencidos y cerrados.
  - Activos disponibles, en uso, en mantenimiento y retirados.
  - Préstamos por vencer y vencidos.
  - Visitas próximas y recientes.
  - Actividad reciente del sistema.
- Pantalla completa de tickets:
  - Crear ticket.
  - Asignar responsable.
  - Cambiar prioridad y estado.
  - Ver comentarios.
  - Agregar comentarios.
  - Adjuntar evidencias.
  - Filtros por estado, prioridad, campo, usuario y responsable.
- Pantalla completa de inventario:
  - Crear, editar y consultar activos.
  - Filtros por estado, marca, campo, usuario asignado.
  - Historial del activo.
  - Cambio de estado.
  - Asignación a usuario o campo.
- Pantalla completa de préstamos:
  - Solicitud, aprobación, entrega, devolución y rechazo.
  - Fechas esperadas y alertas de vencimiento.
  - Texto o acta de confirmación.
  - Historial de cada préstamo.
- Pantalla de reportes:
  - Descarga CSV existente.
  - Gráficos con Recharts.
  - Filtros por fechas.
  - Exportación por tickets, activos, préstamos y visitas.

### Fase 2 — Seguridad, permisos y calidad interna

Objetivo: endurecer la aplicación para operación real.

Implementaciones recomendadas:

- Aplicar RBAC real por endpoint:
  - ADMIN: usuarios, configuración, reportes globales.
  - IT_SUPPORT: tickets, activos, préstamos, visitas.
  - END_USER: crear tickets, ver sus tickets, ver activos asignados, solicitar préstamos.
- Añadir DTOs con validación:
  - Campos obligatorios.
  - Fechas coherentes.
  - Estados permitidos.
  - Prevención de cambios inválidos.
- Cerrar CORS en producción a dominios permitidos.
- Quitar logs sensibles de autenticación.
- Configurar JWT_SECRET obligatorio en producción.
- Evitar que endpoints devuelvan hashes de contraseñas.
- Agregar auditoría:
  - Quién creó, modificó o eliminó.
  - Fecha y acción.
  - Valor anterior y nuevo cuando aplique.
- Implementar manejo estándar de errores en frontend.

### Fase 3 — Automatización operativa

Objetivo: reducir trabajo manual y mejorar tiempos de respuesta.

Funciones:

- SLA por prioridad:
  - Crítico: respuesta inmediata y vencimiento corto.
  - Alto, medio, bajo con reglas configurables.
- Escalamiento automático:
  - Si un ticket crítico no se atiende, notificar o reasignar.
  - Si un préstamo vence, generar alerta.
- Notificaciones reales:
  - Campana con contador dinámico.
  - Marcar como leída.
  - Notificaciones por cambios de ticket, asignaciones y vencimientos.
- Plantillas:
  - Respuestas frecuentes.
  - Cierres de ticket.
  - Actas de préstamo/devolución.
- Reglas automáticas:
  - Asignar tickets por campo.
  - Asignar por categoría.
  - Crear tareas al registrar ciertos tipos de activo.

### Fase 4 — Experiencia móvil y trabajo en campo

Objetivo: hacer Petrodesk útil fuera del escritorio.

Funciones:

- Diseño mobile-first para técnicos en campo.
- Lectura de QR o código de barras para activos:
  - Abrir ficha del activo.
  - Registrar mantenimiento.
  - Crear ticket relacionado.
  - Iniciar préstamo o devolución.
- Credencial digital del activo:
  - Estado, serial, ubicación, usuario, historial y foto.
- Evidencias desde celular:
  - Fotos.
  - PDF.
  - Firma simple.
  - Ubicación opcional.
- Modo offline parcial:
  - Capturar visita o evidencia sin conexión.
  - Sincronizar cuando regrese internet.
- Checklist de visita:
  - Seguridad/HSE.
  - Equipos revisados.
  - Hallazgos.
  - Pendientes.
  - Firma del responsable.

### Fase 5 — Inteligencia y analítica

Objetivo: convertir datos operativos en decisiones.

Funciones de IA y analítica:

- Clasificación automática de tickets:
  - Categoría sugerida.
  - Prioridad sugerida.
  - Responsable sugerido.
- Resumen automático de ticket:
  - Resumir conversación.
  - Mostrar causa probable.
  - Sugerir próximo paso.
- Base de conocimiento inteligente:
  - Convertir tickets cerrados en artículos sugeridos.
  - Recomendar soluciones al crear un ticket.
- Predicción de vencimientos y riesgos:
  - Tickets con alta probabilidad de escalar.
  - Activos con reincidencia.
  - Campos con más incidentes.
- Analítica de soporte:
  - MTTR: tiempo medio de resolución.
  - Tiempo medio de primera respuesta.
  - Carga por técnico.
  - Tickets por campo.
  - Activos con más fallas.
- Mantenimiento preventivo/predictivo:
  - Alertas por antigüedad, historial, estado o reincidencia.
  - Programación de mantenimiento.

## 6. Funciones innovadoras específicas para Petrodesk

### 6.1 Mapa operativo de campos

Una vista geográfica o pseudo-geográfica con:

- Campos/sedes.
- Número de activos por campo.
- Tickets abiertos por campo.
- Visitas programadas.
- Responsable HSE, supervisor y coordinador.
- Riesgo operativo por acumulación de tickets o activos críticos.

### 6.2 Pasaporte digital del activo

Cada equipo tendría una ficha tipo “historia clínica”:

- Código interno.
- Serial.
- Marca/modelo.
- Foto.
- QR.
- Usuario actual.
- Campo actual.
- Historial de préstamos.
- Historial de mantenimientos.
- Tickets relacionados.
- Evidencias adjuntas.
- Costo estimado o valor de reposición.
- Estado de garantía.

### 6.3 Centro de mando IT

Dashboard con tarjetas accionables:

- “3 tickets críticos sin asignar”.
- “5 préstamos vencen esta semana”.
- “2 activos en mantenimiento llevan más de 15 días”.
- “Campo Norte concentra el 40% de incidentes”.
- “Técnico Juan tiene 8 tickets abiertos”.

### 6.4 Actas digitales de entrega y devolución

Para préstamos:

- Generar acta en PDF.
- Firma digital simple del usuario.
- Evidencia fotográfica.
- Condición del equipo al entregar/devolver.
- Confirmación por texto.
- Historial inalterable.

### 6.5 Portal de autoservicio para usuarios finales

Un espacio simple para END_USER:

- Crear solicitudes.
- Ver estado de sus tickets.
- Consultar activos asignados.
- Solicitar préstamo.
- Revisar preguntas frecuentes.
- Confirmar recepción/devolución.

### 6.6 Catálogo de servicios

En vez de solo “crear ticket”, ofrecer opciones guiadas:

- Solicitar equipo.
- Reportar falla de computador.
- Solicitar acceso a sistema.
- Reportar problema de red.
- Solicitar visita técnica.
- Reportar incidente en campo.

Cada tipo puede tener formulario, prioridad sugerida, SLA y responsable por defecto.

### 6.7 Motor de reglas sin código

Una sección de configuración para reglas como:

- Si prioridad = CRITICAL, notificar a ADMIN.
- Si campo = Campo Norte, asignar a técnico X.
- Si préstamo vence en 24 horas, enviar recordatorio.
- Si activo pasa a MAINTENANCE, bloquear nuevos préstamos.

### 6.8 Integraciones

Integraciones útiles:

- Email para creación y notificación de tickets.
- Microsoft Teams o Slack para alertas.
- Google Drive, SharePoint o Box para almacenar informes.
- Power BI o Looker Studio para inteligencia gerencial.
- Directorio corporativo: Azure AD, Google Workspace, LDAP u Okta.
- WhatsApp Business para recordatorios operativos, si aplica.

### 6.9 Panel HSE y visitas

Como ya existe responsable HSE en campos, Petrodesk puede crecer hacia:

- Checklist HSE por visita.
- Riesgos identificados.
- Evidencias de cumplimiento.
- Firma de supervisor.
- Recomendaciones.
- Historial de hallazgos por campo.

### 6.10 Módulo de mantenimiento

Separar mantenimiento de activos como flujo propio:

- Orden de mantenimiento.
- Tipo: preventivo, correctivo, garantía.
- Técnico responsable.
- Fecha programada.
- Evidencias.
- Repuestos/costos.
- Resultado.
- Próxima revisión.

## 7. Recomendaciones de modelo de datos para v2

Agregar o ampliar modelos:

- Category: categorías de tickets y catálogo de servicios.
- ServiceRequestType: tipos de solicitud con SLA y formularios.
- SLA: reglas por prioridad/categoría.
- AuditLog: auditoría global.
- Attachment: adjuntos reutilizables por entidad.
- AssetMaintenance: mantenimientos preventivos/correctivos.
- AssetWarranty: garantía, proveedor, fechas y documentos.
- AssetQrCode: token/código público controlado.
- TicketActivity: historial granular de estados/asignaciones.
- KnowledgeArticle: base de conocimiento.
- ApprovalFlow: aprobaciones para préstamos, cambios o compras.
- ChecklistTemplate y ChecklistResponse: visitas y HSE.
- NotificationPreference: preferencias por usuario.
- IntegrationConfig: integraciones externas.

## 8. Recomendaciones de UX/UI

- Reemplazar pantallas en construcción por módulos mínimos funcionales.
- Crear un layout responsive real con menú móvil.
- Agregar estados vacíos útiles:
  - “No hay tickets abiertos. Crear uno”.
  - “No hay activos en este campo”.
- Usar tablas con filtros, ordenamiento y búsqueda.
- Añadir vista detalle para tickets, activos y préstamos.
- Convertir la búsqueda superior en búsqueda global:
  - Tickets.
  - Activos.
  - Usuarios.
  - Campos.
- Crear breadcrumbs para contexto.
- Agregar toasts de éxito/error.
- Unificar formularios con componentes reutilizables.
- Agregar confirmaciones más elegantes que `confirm()`.
- Mejorar textos con acentos correctos y revisar codificación UTF-8.

## 9. Recomendaciones técnicas

### Backend

- Implementar DTOs y `ValidationPipe`.
- Aplicar `RolesGuard` en controladores sensibles.
- Añadir paginación y filtros server-side.
- Crear servicios de auditoría y notificación.
- Normalizar respuestas y errores.
- Evitar exponer datos sensibles de usuarios.
- Agregar pruebas unitarias para servicios principales.
- Agregar migraciones Prisma versionadas.
- Revisar manejo de archivos en serverless, porque filesystem local puede ser temporal.

### Frontend

- Crear cliente API centralizado.
- Manejar refresh/logout cuando el token expira.
- Crear hooks por recurso: `useTickets`, `useAssets`, etc.
- Usar componentes compartidos para tablas, modales, filtros y formularios.
- Agregar loading skeletons y errores visibles.
- Evitar duplicación de lógica de `fetch`.
- Añadir protección de rutas por rol.
- Separar configuración de navegación por permisos.

### DevOps

- Crear `.env.example` para cliente y servidor.
- Agregar pipeline de build/lint/test.
- Documentar despliegue real.
- Definir ambientes: local, staging, producción.
- Configurar backups de base de datos.
- Monitorear errores backend/frontend.

## 10. Priorización recomendada

### Muy alta prioridad

1. Dashboard real.
2. Tickets completos.
3. Inventario completo.
4. Préstamos completos.
5. Permisos por rol.
6. Notificaciones reales.
7. Reportes visuales y CSV.

### Alta prioridad

1. SLA y escalamiento.
2. QR para activos.
3. Actas digitales de entrega/devolución.
4. Historial completo y auditoría.
5. Portal de usuario final.
6. Búsqueda global.

### Media prioridad

1. Base de conocimiento.
2. Catálogo de servicios.
3. Mantenimiento preventivo.
4. Checklists de visitas.
5. Integraciones con email/Teams/Slack.
6. Indicadores de productividad.

### Innovación avanzada

1. Clasificación automática de tickets con IA.
2. Asistente para agentes de soporte.
3. Sugerencia automática de soluciones.
4. Predicción de activos problemáticos.
5. Analítica de riesgo por campo.
6. Modo offline parcial.

## 11. MVP recomendado para Petrodesk v2

Si se quiere una v2 presentable y usable sin eternizar el desarrollo, recomiendo este alcance:

- Dashboard operativo con datos reales.
- Tickets completos con comentarios y asignación.
- Activos completos con historial y QR.
- Préstamos con flujo de aprobación/entrega/devolución.
- Campos y visitas mejorados con checklist básico.
- Reportes visuales + CSV.
- Notificaciones reales.
- Roles aplicados correctamente.
- Auditoría básica.
- Diseño responsive.

Este MVP ya se sentiría como un producto v2 sólido, no solo como una ampliación cosmética.

## 12. Referencias externas usadas para tendencias

Estas referencias se usaron para orientar tendencias de ITSM, automatización e IA aplicables a Petrodesk:

- TechRadar, “Want to improve ITSM workflows and efficiencies? Here are the top 5 AI features to look for” — clasificación automática, agentes virtuales, conocimiento con IA, analítica predictiva y automatización.
  https://www.techradar.com/pro/want-to-improve-itsm-workflows-and-efficiencies-here-are-the-top-5-ai-features-to-look-for
- TechRadar, “Best ITSM tool of 2026” — comparación de capacidades modernas en herramientas ITSM como asset management, automatización, ITIL, IA, integraciones y reportes.
  https://www.techradar.com/best/best-itsm-tools
- ITIL 4 — principios guía como colaborar y promover visibilidad, mantenerlo simple, optimizar y automatizar.
  https://www.ibm.com/topics/it-infrastructure-library
- ArXiv, “Learning to Prioritize IT Tickets” — investigación reciente sobre priorización automática de tickets con modelos de lenguaje.
  https://arxiv.org/abs/2512.17916

## 13. Conclusión

Petrodesk tiene una base muy prometedora porque su dominio no es genérico: une soporte IT, activos, préstamos y operación en campo. La versión 2 debería aprovechar esa identidad y no limitarse a copiar una mesa de ayuda tradicional.

Mi recomendación es posicionar Petrodesk v2 como:

> Un centro de mando IT para operaciones industriales, con trazabilidad de activos, soporte, campo y decisiones inteligentes.

El camino más saludable es terminar primero los módulos esenciales que ya existen en backend, luego endurecer seguridad/permisos, y después sumar automatización, QR, actas digitales, analítica e IA. Con esa ruta, Petrodesk puede pasar de “app interna bonita” a una herramienta realmente diferencial para operación.
