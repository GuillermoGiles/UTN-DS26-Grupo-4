# Listado de Operaciones y contrato de la API

## Operaciones por pantalla

| Pantalla | Operación | Entidad |
| :--- | :--- | :--- |
| **Inicio** | Ver servicios destacados | `Servicio` |
| **Catálogo de Servicios** | Listar; editar y borrar (ADMIN) | `Servicio` |
| **Alta / Edición de Servicio** | Crear / modificar un servicio | `Servicio` |
| **Registro** | Crear cuenta de cliente (con su ficha) | `Usuario`, `Cliente` |
| **Login** | Iniciar sesión / quién soy | `Usuario` |
| **Mi cuenta (cliente)** | Ver mis datos, autos con próximo service y turnos; editar teléfono; agregar auto; cancelar turno | `Cliente`, `Vehiculo`, `Turno` |
| **Reservar turno** | Ver horarios libres del día y reservar | `Turno` |
| **Agenda del día** | Listar turnos por fecha, cambiar estado, reprogramar, enviar recordatorio; ver lavados del día | `Turno`, `Lavado`, `Correo` |
| **Directorio de Clientes** | Listar y buscar por nombre, DNI, teléfono o patente; editar; borrar (ADMIN) | `Cliente` |
| **Alta de Cliente** | Crear cliente con su primer vehículo | `Cliente`, `Vehiculo` |
| **Ficha de Cliente** | Ver vehículos y turnos de un cliente | `Cliente` |
| **Directorio de Vehículos** | Listar y buscar con estado del service; borrar (ADMIN) | `Vehiculo` |
| **Historial de Vehículo** | Ver turnos y lavados; registrar service | `Vehiculo` |
| **Alta de Vehículo** | Crear un vehículo para un cliente | `Vehiculo` |
| **Ingreso al lavadero** | Registrar un lavado sin turno | `Lavado` |
| **Insumos** | Ver stock y alertas; cargar, ajustar, crear (ADMIN); historial de movimientos | `Insumo`, `MovimientoStock` |
| **Alta / Edición de Servicio** (receta) | Definir qué insumos consume el servicio (ADMIN) | `ServicioInsumo` |
| **Correos** | Historial de recordatorios y envío de los de mañana (ADMIN) | `Correo` |
| **Usuarios** | Listar personal, dar de alta, borrar (ADMIN) | `Usuario` |
| **Panel** | Resumen del día: turnos, caja, service atrasado (ADMIN) | todas |

---

## Endpoints

Errores comunes a todos: `400` datos inválidos (Zod, body/params/query), `401` sin token o
token inválido/vencido, `403` rol sin permiso, `404` no existe, `409` conflicto (dato único
repetido, registro relacionado o regla de negocio). Los permisos por rol están en
[Matriz_Permisos.md](./Matriz_Permisos.md) y todos los casos se pueden probar con `backend/api.http`.

### Auth (`/api/auth`)

| Método | Ruta | Qué hace | Body | Éxito | Errores |
| :--- | :--- | :--- | :--- | :---: | :--- |
| POST | `/registro` | Crea cuenta `CLIENTE` + ficha de cliente (ignora `rol`) | `{nombre, email, telefono, dni?, password}` | 201 | 400, 409 |
| POST | `/login` | Devuelve token y usuario | `{email, password}` | 200 | 400, 401 |
| GET | `/yo` | Usuario del token (rehidratación) | — | 200 | 401 |

### Servicios (`/api/servicios`)

| Método | Ruta | Qué hace | Body | Éxito | Errores |
| :--- | :--- | :--- | :--- | :---: | :--- |
| GET | `/` | Catálogo (`?tipo=lavadero\|lubricentro`) | — | 200 | — |
| GET | `/:id` | Detalle | — | 200 | 400, 404 |
| POST | `/` | Crear | `{nombre, precio, desc, tipo}` | 201 | 400 |
| PUT | `/:id` | Editar (parcial) | campos a cambiar | 200 | 400, 404 |
| DELETE | `/:id` | Borrar | — | 204 | 404, 409 si tiene turnos/lavados |
| PUT | `/:id/insumos` | Reemplazar la receta | `{insumos: [{insumoId, cantidad}]}` | 200 | 400 (insumo repetido, cantidad ≤ 0), 404 |

### Clientes (`/api/clientes`)

| Método | Ruta | Qué hace | Body | Éxito | Errores |
| :--- | :--- | :--- | :--- | :---: | :--- |
| GET | `/` | Listar (`?q=` nombre, DNI, teléfono o patente) | — | 200 | 400 |
| GET | `/:id` | Ficha con vehículos (y próximo service) y turnos | — | 200 | 400, 404 |
| POST | `/` | Crear, opcionalmente con su primer vehículo | `{nombre, telefono, email?, dni?, vehiculo?: {patente, marca, modelo, anio?, km?}}` | 201 | 400, 409 |
| PUT | `/:id` | Editar | `{nombre?, telefono?, email?}` | 200 | 400, 404, 409 |
| DELETE | `/:id` | Borrar (sus vehículos en cascada) | — | 204 | 404, 409 si tiene turnos |
| GET | `/mio` | Mi ficha (cliente logueado) | — | 200 | 404 si la cuenta no tiene ficha |
| PUT | `/mio` | Editar mi nombre/teléfono | `{nombre?, telefono?}` | 200 | 400 |

### Vehículos (`/api/vehiculos`)

Cada vehículo se devuelve con `service: { estado, proximoKm, proximaFecha }`.

| Método | Ruta | Qué hace | Body | Éxito | Errores |
| :--- | :--- | :--- | :--- | :---: | :--- |
| GET | `/` | Listar (`?q=` patente, marca, modelo o titular) | — | 200 | 400 |
| GET | `/:id` | Historial: turnos y lavados | — | 200 | 400, 404 |
| POST | `/` | Crear. El personal indica `clienteId`; un CLIENTE carga a su nombre | `{patente, marca, modelo, anio?, km?, clienteId?}` | 201 | 400, 409 patente repetida |
| PUT | `/:id` | Editar | campos a cambiar | 200 | 400, 404, 409 |
| POST | `/:id/service` | Registrar service hoy con esos km | `{km}` | 200 | 400, 404 |
| DELETE | `/:id` | Borrar. ADMIN cualquiera; un CLIENTE solo los suyos ("Mis autos") | — | 204 | 403 auto ajeno, 404, 409 si tiene turnos reservados o lavados |

### Turnos (`/api/turnos`)

| Método | Ruta | Qué hace | Body | Éxito | Errores |
| :--- | :--- | :--- | :--- | :---: | :--- |
| GET | `/disponibles?fecha=` | Horarios del día: `{horarios, ocupados, libres}` | — | 200 | 400 |
| GET | `/mios` | Turnos del cliente logueado | — | 200 | — |
| GET | `/` | Agenda (`?fecha=`, `?estado=`) | — | 200 | 400 |
| GET | `/:id` | Detalle | — | 200 | 400, 404 |
| POST | `/` | Reservar uno o más servicios. Un CLIENTE reserva para sí (se ignora `clienteId`) | `{fecha, hora, servicioIds: number[], vehiculoId, clienteId?, nota?}` | 201 | 400 (pasado, domingo, horario fuera de atención, sin vehículo o vehículo de otro cliente, sin servicios, servicio inexistente, más de un servicio de lavadero), 409 horario ocupado |
| PUT | `/:id` | Editar / reprogramar | campos a cambiar (incluye `estado`) | 200 | 400, 404, 409 |
| PATCH | `/:id/estado` | Cambiar estado. Al pasar a COMPLETADO descuenta los insumos (una vez) y registra el service si es de lubricentro | `{estado}` | 200 | 400, 404 |
| POST | `/:id/recordatorio` | Enviar el recordatorio por e-mail | — | 201 | 400 sin e-mail, 404, 409 turno cancelado o completado |
| PATCH | `/:id/cancelar` | Cancelar (el cliente, solo los suyos sin empezar) | — | 200 | 403, 404, 409 |
| DELETE | `/:id` | Borrar | — | 204 | 404 |

### Lavados (`/api/lavados`)

| Método | Ruta | Qué hace | Body | Éxito | Errores |
| :--- | :--- | :--- | :--- | :---: | :--- |
| GET | `/` | Listar (`?fecha=`) | — | 200 | 400 |
| GET | `/:id` | Detalle | — | 200 | 400, 404 |
| POST | `/` | Registrar ingreso (empleado = usuario logueado; precio = el del servicio) | `{vehiculoId, servicioId, observaciones?}` | 201 | 400 vehículo inexistente o servicio que no es de lavadero |
| PUT | `/:id` | Editar | campos a cambiar | 200 | 400, 404 |
| DELETE | `/:id` | Anular | — | 204 | 404 |

### Insumos (`/api/insumos`)

Cada insumo se devuelve con `bajo: true` cuando `stock <= stockMinimo`.

| Método | Ruta | Qué hace | Body | Éxito | Errores |
| :--- | :--- | :--- | :--- | :---: | :--- |
| GET | `/` | Listar con los servicios que lo usan | — | 200 | — |
| GET | `/:id` | Detalle con los últimos movimientos | — | 200 | 400, 404 |
| POST | `/` | Alta con carga inicial | `{nombre, unidad, stock, stockMinimo}` | 201 | 400, 409 nombre repetido |
| PUT | `/:id` | Editar nombre, unidad o mínimo (el stock no) | campos a cambiar | 200 | 400, 404 |
| POST | `/:id/movimientos` | Carga (+) o ajuste (−) con motivo | `{cantidad, motivo}` | 200 | 400 si dejaría stock negativo, 404 |
| DELETE | `/:id` | Borrar (sale de las recetas) | — | 204 | 404 |

### Correos (`/api/correos`)

| Método | Ruta | Qué hace | Éxito |
| :--- | :--- | :--- | :---: |
| GET | `/` | `{configurado, totales, correos}` (últimos 50) | 200 |
| POST | `/recordatorios` | Envía los recordatorios de los turnos activos de mañana que todavía no lo recibieron (lo mismo que hace el servidor solo, cada hora) | 200 |

### Usuarios (`/api/usuarios`) — personal

| Método | Ruta | Qué hace | Body | Éxito | Errores |
| :--- | :--- | :--- | :--- | :---: | :--- |
| GET | `/` | Listar (sin `passwordHash`) | — | 200 | — |
| GET | `/:id` | Detalle | — | 200 | 400, 404 |
| POST | `/` | Alta de personal | `{nombre, email, password, rol: ADMIN\|EMPLEADO}` | 201 | 400, 409 |
| PUT | `/:id` | Editar nombre, rol o contraseña | `{nombre?, rol?, password?}` | 200 | 400, 404 |
| DELETE | `/:id` | Borrar | — | 204 | 400 si es uno mismo, 404, 409 si tiene lavados |

### Panel (`/api/panel`)

| Método | Ruta | Qué hace | Éxito |
| :--- | :--- | :--- | :---: |
| GET | `/resumen` | `{turnosDelDia, turnosPendientes, vehiculosAtendidos, ingresosDelDia, agenda, lavados, serviceAtrasado, semana, estados, insumosBajos}` del día | 200 |
