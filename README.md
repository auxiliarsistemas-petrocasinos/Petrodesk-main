# 🛢️ Petrodesk: Sistema de gestión de activos y mesa de ayuda de TI

Petrodesk es una solución integral de gestión de soporte técnico y control de activos diseñada para equipos de IT en entornos industriales y operativos. Ofrece una interfaz moderna, rápida y altamente intuitiva inspirada en los estándares de los SaaS más premium del mercado.

---

## 🚀 Características Principales

- **Gestión de Tickets**: Sistema completo de seguimiento de incidencias con prioridades, estados y asignación de personal.
- **Control de Inventario**: Registro detallado de activos (Laptops, Desktops, Periféricos) con trazabilidad de marcas y seriales.
- **Módulo de Préstamos**: Control estricto de entregas y devoluciones de equipos a usuarios finales.
- **Sedes y Campos**: Gestión de ubicaciones geográficas (Campos) con supervisores y coordinadores asignados.
- **Reportes Avanzados**: Generación de reportes en formato CSV para auditoría y control de gestión.
- **Modo Oscuro Nativo**: Interfaz adaptativa con soporte completo para temas claro y oscuro.
- **Internacionalización**: UI totalmente en **Español**.

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + **Vite** (Velocidad de desarrollo extrema)
- **TypeScript** (Seguridad en el tipado)
- **Tailwind CSS** (Diseño moderno y responsivo)
- **Lucide React** (Iconografía vectorial premium)

### Backend
- **NestJS** (Arquitectura modular escalable)
- **Prisma ORM** (Gestión de base de datos segura y eficiente)
- **PostgreSQL 15** (Motor de base de datos relacional robusto)
- **JWT Auth** (Autenticación basada en tokens)

### Infraestructura
- **Docker & Docker Compose** (Despliegue containerizado simplificado)
- **Nginx** (Servidor web y proxy inverso)

---

## 📦 Instalación y Despliegue Local

### Requisitos Previos
- Node.js v18+ instalado.
- Base de datos PostgreSQL disponible (o proyecto de Supabase).

### Pasos para iniciar localmente

1. **Clonar el repositorio**.
2. **Configurar el Backend**:
   - Navega a la carpeta `server/`.
   - Crea un archivo `.env` basado en la configuración necesaria (incluyendo `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_KEY` y `JWT_SECRET`).
   - Ejecuta `npm install`
   - Sincroniza la DB con `npx prisma db push` y siembra datos con `npx prisma db seed`.
   - Inicia el servidor con `npm run start:dev` (se ejecutará en el puerto 3000).

3. **Configurar el Frontend**:
   - En otra terminal, navega a `client/`.
   - Crea un archivo `.env` y añade `VITE_API_URL=http://localhost:3000`.
   - Ejecuta `npm install`
   - Inicia el frontend con `npm run dev` (se ejecutará en el puerto 5173).

---

## 🔑 Credenciales de Acceso (Seed Data)

El sistema incluye datos de prueba iniciales para facilitar el testing inmediato. Todas las cuentas comparten la contraseña: **`Admin1234!`**

| Rol | Email | Usuario |
| :--- | :--- | :--- |
| **Administrador** | `admin@petrodesk.com` | `admin.petro` |
| **Soporte IT** | `soporte1@petrodesk.com` | `juan.perez` |
| **Usuario Final** | `usuario1@petrodesk.com` | `carlos.sanchez` |

---

## 📁 Estructura del Proyecto

```text
Petrodesk/
├── client/           # Frontend (React + Vite)
├── server/           # Backend (NestJS + Prisma)
├── uploads/          # Directorio persistente para archivos
├── docker-compose.yml # Orquestación de contenedores
└── README.md         # Documentación del proyecto
```

---

## 🛡️ Seguridad y Roles (RBAC)

El sistema implementa un Control de Acceso Basado en Roles (**RBAC**):
- **ADMIN**: Acceso total al sistema, gestión de usuarios y configuraciones.
- **IT_SUPPORT**: Gestión de tickets, activos y préstamos.
- **END_USER**: Creación de tickets y visualización de sus propios activos asignados.

---

Desarrollado con foco en la excelencia operativa y estética SaaS.
