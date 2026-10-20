# Matriz de Permisos — SGI Lavadero y Lubricentro San José

Definición de control de acceso basado en roles (RBAC) para los endpoints de la API REST según los requerimientos de seguridad de la Clase 18.

## Roles del Sistema

* **Público / Invitado:** Usuario no autenticado (visualización pública de la oferta comercial).
* **CLIENTE:** Cliente registrado (puede consultar y solicitar turnos propios, y ver su información personal).
* **EMPLEADO:** Operario del lavadero/lubricentro (gestión operativa de clientes, turnos y servicios realizados).
* **ADMIN:** Encargado general o dueño (administración total: servicios, precios, empleados y reportes).

---

## Matriz de Control de Acceso por Endpoint

Cada fila con ❌ 401 / ❌ 403 tiene su test sin base de datos en `backend/src/routes/*.test.ts`
(las filas nuevas, en `matriz-permisos.test.ts`).

| Entidad | Endpoint | Método | Público | CLIENTE | EMPLEADO | ADMIN | Qué hace la UI |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Auth** | `/api/auth/registro` | POST | ✅ 201 | ✅ 201 | ✅ 201 | ✅ 201 | Formulario público `/registro`. Siempre crea un CLIENTE (el `rol` del body se ignora) y lo deja logueado. |
| | `/api/auth/login` | POST | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 | Formulario `/login`. La NavBar pasa a mostrar el nombre, el rol y "Salir". |
| | `/api/auth/yo` | GET | ❌ 401 | ✅ 200 | ✅ 200 | ✅ 200 | Lo llama el `AuthProvider` al recargar (F5) para rehidratar la sesión. |
| **Servicios** | `/api/servicios` | GET | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 | Catálogo público. |
| | `/api/servicios/:id` | GET | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 | Precarga del formulario de edición. |
| | `/api/servicios` | POST | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 201 | Botón "Nuevo servicio" solo para ADMIN; ruta `/servicios/nuevo` con `PrivateRoute rol="ADMIN"`. |
| | `/api/servicios/:id` | PUT | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 200 | Botón "Editar" en cada tarjeta, solo ADMIN; ruta `/servicios/:id/editar` protegida. |
| | `/api/servicios/:id` | DELETE | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 204 | Botón "Borrar" solo ADMIN, con confirmación. Muestra el 409 si el servicio ya se usó. |
| **Clientes** | `/api/clientes` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Directorio `/clientes` con buscador. |
| | `/api/clientes/:id` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Ficha `/clientes/:id` con autos y turnos. |
| | `/api/clientes` | POST | ❌ 401 | ❌ 403 | ✅ 201 | ✅ 201 | Formulario `/clientes/nuevo` (con primer vehículo opcional). |
| | `/api/clientes/:id` | PUT | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Edición desde la ficha del cliente. |
| | `/api/clientes/:id` | DELETE | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 204 | Botón "Borrar" solo ADMIN. Muestra el 409 si tiene turnos. |
| | `/api/clientes/mio` | GET | ❌ 401 | ✅ 200 | ❌ 403 | ❌ 403 | Portal `/mi-cuenta`: datos, autos con próximo service y turnos. Link "Mi cuenta" solo para CLIENTE. |
| | `/api/clientes/mio` | PUT | ❌ 401 | ✅ 200 | ❌ 403 | ❌ 403 | "Editar datos" en `/mi-cuenta`. |
| **Vehículos** | `/api/vehiculos` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Directorio `/vehiculos` con buscador y estado del service. |
| | `/api/vehiculos/:id` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Historial `/vehiculos/:id`. |
| | `/api/vehiculos` | POST | ❌ 401 | ✅ 201 | ✅ 201 | ✅ 201 | Personal: `/vehiculos/nuevo` (elige titular). Cliente: "Agregar auto" en `/mi-cuenta` (queda a su nombre). |
| | `/api/vehiculos/:id` | PUT | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | (API) edición de datos del vehículo. |
| | `/api/vehiculos/:id/service` | POST | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | "Registrar service" en el historial del vehículo. |
| | `/api/vehiculos/:id` | DELETE | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 204 | Botón "Borrar" solo ADMIN. |
| **Turnos** | `/api/turnos/disponibles` | GET | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 | El formulario de reserva muestra solo los horarios libres del día elegido. |
| | `/api/turnos/mios` | GET | ❌ 401 | ✅ 200 | ❌ 403 | ❌ 403 | (API) turnos del cliente; el portal los obtiene con `/clientes/mio`. |
| | `/api/turnos` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Agenda `/agenda` por fecha. |
| | `/api/turnos/:id` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | (API) detalle del turno. |
| | `/api/turnos` | POST | ❌ 401 | ✅ 201 | ✅ 201 | ✅ 201 | `/turnos/nuevo` para cualquier logueado. El cliente elige entre sus autos; el personal elige cliente y auto. |
| | `/api/turnos/:id` | PUT | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | (API) reprogramar. |
| | `/api/turnos/:id/estado` | PATCH | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Selector de estado en cada fila de la agenda. |
| | `/api/turnos/:id/cancelar` | PATCH | ❌ 401 | ✅ 200* | ✅ 200 | ✅ 200 | "Cancelar" en `/mi-cuenta` (solo turnos propios pendientes o confirmados) y en la agenda. *Turno ajeno → 403. |
| | `/api/turnos/:id` | DELETE | ❌ 401 | ❌ 403 | ✅ 204 | ✅ 204 | (API) borrado físico. |
| **Lavados** | `/api/lavados` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Lavados del día en `/agenda`. |
| | `/api/lavados/:id` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | (API) detalle. |
| | `/api/lavados` | POST | ❌ 401 | ❌ 403 | ✅ 201 | ✅ 201 | Formulario `/lavados/nuevo` ("Ingreso al lavadero"). |
| | `/api/lavados/:id` | PUT | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | (API) corrección. |
| | `/api/lavados/:id` | DELETE | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 204 | Botón "Anular" en la agenda, solo ADMIN. |
| **Servicios** (receta) | `/api/servicios/:id/insumos` | PUT | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 200 | "Insumos que consume" en `/servicios/:id/editar`, solo ADMIN. |
| **Insumos** | `/api/insumos` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Pantalla `/insumos` con alertas; contador rojo en el menú cuando hay insumos en el mínimo. |
| | `/api/insumos/:id` | GET | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | "Movimientos" en cada tarjeta de insumo. |
| | `/api/insumos` | POST | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 201 | Botón "Nuevo insumo", solo ADMIN. |
| | `/api/insumos/:id` | PUT | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 200 | (API) cambiar nombre, unidad o mínimo. |
| | `/api/insumos/:id/movimientos` | POST | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 200 | Botón "Cargar / ajustar", solo ADMIN (el empleado no lo ve). |
| | `/api/insumos/:id` | DELETE | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 204 | (API) baja de un insumo. |
| **Correos** | `/api/correos` | GET | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 200 | Pantalla `/correos`, link solo ADMIN. |
| | `/api/correos/recordatorios` | POST | ❌ 401 | ❌ 403 | ✅ 200 | ✅ 200 | Botón "Enviar los de mañana" en `/correos`. El servidor lo hace solo cada hora. |
| | `/api/turnos/:id/recordatorio` | POST | ❌ 401 | ❌ 403 | ✅ 201 | ✅ 201 | "Enviar recordatorio" en el detalle del turno de la agenda. |
| **Usuarios** | `/api/usuarios` | GET | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 200 | Listado `/usuarios`, link solo ADMIN. |
| | `/api/usuarios/:id` | GET | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 200 | (API) detalle. |
| | `/api/usuarios` | POST | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 201 | Formulario `/usuarios/nuevo` (rol ADMIN o EMPLEADO). |
| | `/api/usuarios/:id` | PUT | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 200 | (API) cambiar rol o contraseña. |
| | `/api/usuarios/:id` | DELETE | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 204 | Botón "Borrar" en `/usuarios` (no aparece en la fila propia). |
| **Panel** | `/api/panel/resumen` | GET | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 200 | Panel `/panel`, link solo ADMIN. |

---

## Rutas del Frontend y su Barrera (`PrivateRoute`)

La misma matriz, vista desde el router (`frontend/src/App.tsx`). Cada grupo es una *layout route* `<Route element={<PrivateRoute rol=... />}>` que anticipa el 401/403 del back **sin llamarlo**:

| Barrera | Qué hace `PrivateRoute` | Rutas |
| :--- | :--- | :--- |
| Pública | No pasa por `PrivateRoute`. | `/`, `/login`, `/registro`, `/servicios`, `/sin-permiso` |
| Login (cualquier rol) | Sin usuario → `/login`. | `/turnos/nuevo` |
| Solo `CLIENTE` | Sin usuario → `/login`. Personal → `/sin-permiso`. | `/mi-cuenta` |
| `EMPLEADO` o `ADMIN` | Sin usuario → `/login`. Con `CLIENTE` → `/sin-permiso`. | `/agenda`, `/clientes`, `/clientes/nuevo`, `/clientes/:id`, `/vehiculos`, `/vehiculos/nuevo`, `/vehiculos/:id`, `/lavados/nuevo`, `/insumos` |
| Solo `ADMIN` | Sin usuario → `/login`. Con `CLIENTE` o `EMPLEADO` → `/sin-permiso`. | `/panel`, `/servicios/nuevo`, `/servicios/:id/editar`, `/usuarios`, `/usuarios/nuevo`, `/correos` |

Mientras el `AuthProvider` todavía no sabe quién sos (`cargando`, esperando `GET /api/auth/yo`), `PrivateRoute` muestra un spinner y **no decide nada**: así un F5 en una ruta protegida no "flashea" a `/login`.

Las redirecciones usan `replace` para que "atrás" no vuelva a la ruta protegida y atrape al usuario. Al mandar a `/login` se guarda la ruta de origen (`state.desde`) y el login devuelve al usuario ahí. La excepción es cuando el usuario tocó **Salir**: `AuthContext` marca la salida como voluntaria y `PrivateRoute` lo manda al inicio, así el próximo que entre no cae en la pantalla del anterior.

> **Esconder ≠ proteger.** Se esconde el link (renderizado por rol) **y** se protege la ruta (`PrivateRoute`). Si alguien escribe la URL a mano, `PrivateRoute` lo para; si saltea la UI entera con `curl`, el back responde 401/403. La regla vive en la API.

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
4. **Intercepción y Manejo de Sesión Vencida (Capa de Red y Estado Global):**
   * **Cliente HTTP (`apiFetch`):** Encapsula los errores del backend bajo la clase personalizada `ApiError` (con `status`, `message` y payload `data`).
   * **Detección de expiración:** Si el backend responde `401 Unauthorized` ante una petición donde se había enviado un token JWT, se dispara el evento global de navegador `sesion-expirada`. (Si el 401 surge de un intento fallido en `/auth/login` sin token previo, no se dispara para no interferir con la validación del formulario).
   * **Reacción en `AuthContext`:** Un `EventListener` suscripto a `sesion-expirada` invoca `logout()` (limpiando `localStorage` y el usuario en memoria) y redirige automáticamente hacia `/login` preservando la ruta previa (`state.desde`) y enviando `state.sesionExpirada: true`.
   * **Feedback visual en UI:** La pantalla `Login` detecta la bandera `sesionExpirada` y notifica al usuario con una alerta de advertencia para que vuelva a ingresar.

