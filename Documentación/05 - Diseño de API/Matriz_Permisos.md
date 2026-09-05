# Matriz de Permisos — SGI Lavadero y Lubricentro San José

Definición de control de acceso basado en roles (RBAC) para los endpoints de la API REST según los requerimientos de seguridad de la Clase 18.

## Roles del Sistema

* **Público / Invitado:** Usuario no autenticado (visualización pública de la oferta comercial).
* **CLIENTE:** Cliente registrado (puede consultar y solicitar turnos propios, y ver su información personal).
* **EMPLEADO:** Operario del lavadero/lubricentro (gestión operativa de clientes, turnos y servicios realizados).
* **ADMIN:** Encargado general o dueño (administración total: servicios, precios, empleados y reportes).

---

## Matriz de Control de Acceso por Endpoint

| Entidad | Endpoint | Método | Público | CLIENTE | EMPLEADO | ADMIN |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Auth** | `/api/auth/registro` | POST | ✅ 201 | ✅ 201 | ✅ 201 | ✅ 201 |
| | `/api/auth/login` | POST | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 |
| | `/api/auth/yo` | GET | ❌ 401 | ✅ 200 | ✅ 200 | ✅ 200 |
| **Servicios** | `/api/servicios` | GET | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 |
| | `/api/servicios/:id` | GET | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 |
| | `/api/servicios` | POST | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 201 |
| | `/api/servicios/:id` | PUT | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 200 |
| | `/api/servicios/:id` | DELETE | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 204 |
| **Clientes** | `/api/clientes` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 |
| | `/api/clientes/:id` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 |
| | `/api/clientes` | POST | ❌ 401 | ❌ 403 | ✅ 201 | ✅ 201 |
| | `/api/clientes/:id` | PUT | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 |
| | `/api/clientes/:id` | DELETE | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 204 |
| **Turnos** | `/api/turnos` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 |
| | `/api/turnos/:id` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 |
| | `/api/turnos` | POST | ❌ 401 | ✅ 201 | ✅ 201 | ✅ 201 |
| | `/api/turnos/:id` | PUT | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 |
| | `/api/turnos/:id` | DELETE | ❌ 401 | ❌ 403 | ✅ 204 | ✅ 204 |

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
