# Matriz de Permisos — SGI Lavadero y Lubricentro San José

Definición de control de acceso basado en roles (RBAC) para los endpoints de la API REST según los requerimientos de seguridad de la Clase 18.

## Roles del Sistema

* **Público / Invitado:** Usuario no autenticado (visualización pública de la oferta comercial).
* **CLIENTE:** Cliente registrado (puede consultar y solicitar turnos propios, y ver su información personal).
* **EMPLEADO:** Operario del lavadero/lubricentro (gestión operativa de clientes, turnos y servicios realizados).
* **ADMIN:** Encargado general o dueño (administración total: servicios, precios, empleados y reportes).

---

## Matriz de Control de Acceso por Endpoint

| Entidad | Endpoint | Método | Público | CLIENTE | EMPLEADO | ADMIN | Qué hace la UI |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Auth** | `/api/auth/registro` | POST | ✅ 201 | ✅ 201 | ✅ 201 | ✅ 201 | Formulario de registro público. Redirige a login al terminar. |
| | `/api/auth/login` | POST | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 | Formulario de inicio de sesión. Cambia la NavBar a "Hola, {nombre}". |
| | `/api/auth/yo` | GET | ❌ 401 | ✅ 200 | ✅ 200 | ✅ 200 | Lo llama el `AuthProvider` al recargar la página (F5) para rehidratar el estado. |
| **Servicios** | `/api/servicios` | GET | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 | Catálogo de servicios público. Sin login. |
| | `/api/servicios/:id` | GET | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 | Detalle del servicio público. |
| | `/api/servicios` | POST | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 201 | Botón "Nuevo Servicio" solo visible para ADMIN. Formulario en ruta protegida con `PrivateRoute rol="ADMIN"`. |
| | `/api/servicios/:id` | PUT | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 200 | Botón "Editar" solo visible para ADMIN en el listado/detalle. |
| | `/api/servicios/:id` | DELETE | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 204 | Botón "Borrar" solo visible para ADMIN en el listado/detalle. |
| **Clientes** | `/api/clientes` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Panel interno de clientes protegido para empleados/admins. |
| | `/api/clientes/:id` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Detalle de cliente protegido para empleados/admins. |
| | `/api/clientes` | POST | ❌ 401 | ❌ 403 | ✅ 201 | ✅ 201 | Botón y formulario protegido para empleados/admins. |
| | `/api/clientes/:id` | PUT | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Edición de cliente protegida para empleados/admins. |
| | `/api/clientes/:id` | DELETE | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 204 | Botón "Borrar Cliente" solo visible para ADMIN. |
| **Turnos** | `/api/turnos` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Calendario/listado de turnos general, visible para empleados/admins. |
| | `/api/turnos/:id` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Detalle del turno. |
| | `/api/turnos` | POST | ❌ 401 | ✅ 201 | ✅ 201 | ✅ 201 | Botón "Solicitar Turno" visible logueado. Ruta protegida con `PrivateRoute` (sin rol). |
| | `/api/turnos/:id` | PUT | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Cambio de estado del turno (ej. "Completado"), visible para empleados/admins. |
| | `/api/turnos/:id` | DELETE | ❌ 401 | ❌ 403 | ✅ 204 | ✅ 204 | Cancelación del turno, visible para empleados/admins. |

---

## Políticas de Autenticación y Autorización

1. **Autenticación Stateless (JWT):**
   * El cliente envía el token en la cabecera `Authorization: Bearer <token>`.
   * Ausencia de token o formato inválido $\to$ `401 Unauthorized`.
   * Token expirado o con firma alterada $\to$ `401 Unauthorized`.
2. **Autorización (Roles):**
   * Verificación del claim `rol` contenido en el payload firmado.
   * Si el usuario autenticado no posee el rol requerido para el endpoint $\to$ `403 Forbidden`.
3. **Manejo de Contraseñas:**
   * Almacenadas como hash unidireccional generado con algoritmo `bcrypt` y 10 rondas de salt.
   * La respuesta del registro y del perfil omite estrictamente el hash de la contraseña.
