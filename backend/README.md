# Backend — SGI San José (Lavadero y Lubricentro)

API REST desarrollada con **Node.js**, **Express 5**, **TypeScript**, **Prisma ORM** y base de datos **PostgreSQL**, contenedorizada mediante **Docker Compose**.

---

## 🛠️ Stack Tecnológico

* **Runtime:** Node.js (v20+)
* **Framework Web:** Express 5
* **Lenguaje:** TypeScript
* **ORM:** Prisma
* **Base de Datos:** PostgreSQL 16 (vía Docker)
* **Validaciones:** Zod
* **Seguridad:** JSON Web Tokens (`jsonwebtoken`) y hashing de contraseñas (`bcryptjs`)
* **CORS:** `cors` con origen configurable por variable de entorno
* **Contenedorización:** Docker & Docker Compose

---

## 📁 Estructura del Proyecto

```text
backend/
├── prisma/
│   ├── schema.prisma        # Modelo de datos y relaciones (Cliente, Servicio, Turno, Usuario)
│   └── migrations/          # Historial de migraciones SQL
├── src/
│   ├── config/              # Variables de entorno y configuraciones globales
│   ├── controllers/         # Controladores que reciben req/res y delegan a servicios
│   ├── middleware/          # Middlewares (auth, autorización por rol, validación Zod, errorHandler)
│   ├── routes/              # Definición de rutas REST y aplicación de middlewares
│   ├── services/            # Lógica de negocio y consultas directas a Prisma
│   ├── types/               # Extensiones de tipos globales de Express y contratos
│   ├── validations/         # Esquemas de validación Zod para body y params
│   └── index.ts             # Punto de entrada de la aplicación
├── .env.example             # Plantilla de variables de entorno requeridas
├── api.http                 # Colección de peticiones HTTP para pruebas de integración
├── Dockerfile               # Definición de la imagen del backend
└── tsconfig.json            # Configuración del compilador TypeScript
```

---

## 🚀 Puesta en Marcha

### 1. Variables de Entorno

Crear el archivo `.env` dentro de la carpeta `backend/` basándose en `.env.example`:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

POSTGRES_USER=postgres
POSTGRES_PASSWORD=password123
POSTGRES_DB=sgi_sanjose_db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:${POSTGRES_PORT}/${POSTGRES_DB}

# Seguridad y Autenticación
JWT_SECRET=super_secret_jwt_key_sanjose_2026
```

### 2. Iniciar Servicios con Docker

Desde la raíz del repositorio:

```bash
# Levantar los contenedores de Base de Datos y Backend
docker compose up -d --build

# Generar el cliente de Prisma dentro del contenedor (si no se autogeneró)
docker compose exec api npx prisma generate

# Aplicar migraciones pendientes
docker compose exec api npx prisma migrate deploy
```

---

## 🔐 Seguridad y Matriz de Permisos (RBAC)

La API implementa autenticación mediante **JWT (JSON Web Tokens)** enviados en el header `Authorization: Bearer <token>`.

### Roles de Usuario
* **ADMIN:** Acceso total a todas las operaciones (escritura/lectura de servicios, clientes, turnos y usuarios).
* **EMPLEADO:** Gestión operativa de clientes y turnos; lectura de catálogo.
* **CLIENTE:** Reserva y consulta de sus turnos; lectura pública de servicios.
* **PÚBLICO:** Consulta del catálogo de servicios sin autenticación requerida.

### Matriz de Endpoints y Permisos

| Endpoint | Método | Rol Mínimo Requerido | Descripción |
| :--- | :---: | :---: | :--- |
| `/api/auth/registro` | `POST` | Público | Registro de nuevos usuarios (por defecto rol `CLIENTE`) |
| `/api/auth/login` | `POST` | Público | Autenticación y obtención del token JWT |
| `/api/auth/yo` | `GET` | Autenticado | Obtener datos del usuario logueado según su token |
| `/api/servicios` | `GET` | Público | Catálogo de servicios (lavadero / lubricentro) |
| `/api/servicios/:id` | `GET` | Público | Detalle de un servicio particular |
| `/api/servicios` | `POST` | **ADMIN** | Alta de servicio (escritura protegida) |
| `/api/servicios/:id` | `PUT` | **ADMIN** | Edición de servicio (escritura protegida) |
| `/api/servicios/:id` | `DELETE` | **ADMIN** | Eliminación de servicio (escritura protegida) |
| `/api/clientes` | `GET` | **ADMIN / EMPLEADO** | Listado de clientes |
| `/api/clientes/:id` | `GET` | **ADMIN / EMPLEADO** | Detalle de cliente |
| `/api/clientes` | `POST` | **ADMIN / EMPLEADO** | Alta de nuevo cliente |
| `/api/clientes/:id` | `PUT` | **ADMIN / EMPLEADO** | Edición de cliente |
| `/api/clientes/:id` | `DELETE` | **ADMIN** | Baja de cliente |
| `/api/turnos` | `GET` | Autenticado | Listado de turnos con datos de cliente y servicio |
| `/api/turnos` | `POST` | Autenticado | Solicitud de turno |

---

## 🌐 Configuración CORS

* El middleware `cors` está configurado en `src/index.ts` antes del parseador `express.json()` y las rutas.
* El origen permitido se parametriza con `process.env.FRONTEND_URL` (por defecto `http://localhost:5173`).
* El preflight `OPTIONS` es respondido automáticamente con estado `204 No Content`, permitiendo headers personalizados como `Authorization` y `Content-Type`.

---

## 🚦 Manejo de Errores y Códigos de Estado

Todas las respuestas de error de la API se devuelven en formato JSON estandarizado:
```json
{
  "error": "Mensaje descriptivo del error"
}
```

* **400 Bad Request:** Provocado por validaciones de esquema fallidas con Zod (ej. precio negativo, datos faltantes, parámetros con tipo inválido).
* **401 Unauthorized:** Solicitud a una ruta protegida sin el header `Authorization: Bearer <token>`, o con un token vencido/inválido.
* **403 Forbidden:** Usuario autenticado cuyo rol no cuenta con los permisos necesarios para la operación solicitada (ej. un `CLIENTE` intentando hacer `POST /api/servicios`).
* **404 Not Found:** Recurso inexistente en base de datos o middleware de fallback en formato JSON para cualquier ruta no implementada (`app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }))`).
* **409 Conflict:** Violación de restricciones de unicidad o integridad referencial en PostgreSQL/Prisma (ej. email duplicado `P2002`, patente repetida, o cliente inexistente en turno `P2003`).
* **500 Internal Server Error:** Errores no controlados capturados por el middleware global `errorHandler`.

---

## 🧪 Pruebas con `api.http`

El archivo `api.http` contiene la suite completa de pruebas organizada para ejecutarse con extensiones como *REST Client* (VS Code) o *Thunder Client*.

### Casos Clave de la Entrega 3 (AG-C19):
1. **Escritura Protegida:**
   * Sin token → `401 Unauthorized` (`"Falta el token"`).
   * Token de CLIENTE → `403 Forbidden` (`"No tenés permiso para esta operación"`).
   * Token de ADMIN → `201 Created` (Servicio creado exitosamente).
2. **Matriz de Errores:**
   * Verificación explícita de códigos `400`, `401`, `403`, `404` (JSON) y `409`.

---

## ⚡ Testing Automatizado con Vitest (AG-C21)

El backend cuenta con **56 tests automatizados** desarrollados con **Vitest** y **Supertest**:
* **55 tests sin base de datos:** Ejecutan en memoria en ~2 segundos, probando middlewares de autenticación, validaciones Zod, la matriz de permisos RBAC completa (401/403/400) y casos de negocio Dado/Cuando/Entonces.
* **1 test con base de datos (`*.db.test.ts`):** Prueba la conexión real contra PostgreSQL de Docker.

### Comandos Principales:
```bash
# Correr tests sin base de datos (rápido, no requiere Docker)
npm run test:sin-db

# Correr toda la suite (requiere docker compose up -d db)
npm test

# Modo interactivo / watch
npm run test:watch

# Cobertura de código (v8)
npm run coverage
```

> Para el detalle completo de qué funcionalidades están cubiertas, qué hace falta levantar y el flujo de Git flow, consultar la sección [Testing en el README principal](../README.md#testing).


---

## 📝 Notas para la Evaluación (Entrega 3 - Backend)

* **Separación de responsabilidades:** Arquitectura en capas claras: `routes` -> `controllers` -> `services` -> `prisma`.
* **Seguridad reforzada:** Contraseñas hasheadas en BD con `bcryptjs`, JWT firmado con secreto por variable de entorno, y exclusión estricta de credenciales en respuestas JSON (`passwordHash` nunca se expone).
* **Integración Frontend-Backend:** Probada mediante llamadas reales con `apiFetch`, enviando el token persistido en `localStorage` y reflejando mensajes reales del servidor en la interfaz de usuario.
