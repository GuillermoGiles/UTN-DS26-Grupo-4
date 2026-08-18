# Listado de Operaciones (API Design)

A partir del Frontend construido, a continuación se detallan las operaciones que necesita cada pantalla y sobre qué entidad actúan. Esto servirá como base para la construcción de los endpoints del Backend.

| Pantalla | Operación (Verbo) | Entidad |
| :--- | :--- | :--- |
| **Inicio (Home)** | Listar servicios destacados | `Servicio` |
| **Catálogo de Servicios** | Listar todos los servicios | `Servicio` |
| **Alta de Servicio** | Crear un servicio nuevo | `Servicio` |
| **Directorio de Clientes** | Listar todos los clientes | `Cliente` |
| **Alta de Cliente** | Crear un cliente nuevo | `Cliente` |
| **Perfil Cliente** | Ver el detalle de un cliente | `Cliente` |
| **Alta de Vehículo** | Crear un vehículo para un cliente | `Vehiculo` |
| **Alta de Turno** | Crear un turno nuevo | `Turno` |
| **Alta de Lavado** | Crear un registro de lavado | `Lavado` |
| **Alta de Usuario** | Crear un usuario/empleado nuevo | `Usuario` |

---

## Tabla de Endpoints REST

A continuación se detalla el contrato de la API REST con los endpoints definidos para cada entidad del dominio.

### Servicios (`/api/servicios`)

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/api/servicios` | Listar todos / Filtrar por tipo | — | 200 | — |
| GET | `/api/servicios/:id` | Ver detalle de un servicio | — | 200 | 404 |
| POST | `/api/servicios` | Crear un servicio nuevo | `{nombre, precio, desc, tipo}` | 201 | 400 |
| PUT | `/api/servicios/:id` | Editar un servicio | `{nombre, precio, desc, tipo}` | 200 | 404 |
| DELETE | `/api/servicios/:id` | Borrar un servicio | — | 204 | 404 |

### Clientes (`/api/clientes`)

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/api/clientes` | Listar todos los clientes | — | 200 | — |
| GET | `/api/clientes/:id` | Ver detalle de un cliente | — | 200 | 404 |
| POST | `/api/clientes` | Crear un cliente nuevo | `{nombre, vehiculo, patente, telefono}` | 201 | 400 |
| PUT | `/api/clientes/:id` | Editar un cliente | `{nombre, vehiculo, patente, telefono}` | 200 | 404 |
| DELETE | `/api/clientes/:id` | Borrar un cliente | — | 204 | 404 |

### Vehículos (`/api/vehiculos`)

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/api/vehiculos` | Listar todos los vehículos | — | 200 | — |
| GET | `/api/vehiculos/:id` | Ver detalle de un vehículo | — | 200 | 404 |
| POST | `/api/vehiculos` | Crear un vehículo | `{patente, marca, modelo, clienteId}` | 201 | 400 |
| PUT | `/api/vehiculos/:id` | Editar un vehículo | `{patente, marca, modelo, clienteId}` | 200 | 404 |
| DELETE | `/api/vehiculos/:id` | Borrar un vehículo | — | 204 | 404 |

### Turnos (`/api/turnos`)

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/api/turnos` | Listar todos los turnos | — | 200 | — |
| GET | `/api/turnos/:id` | Ver detalle de un turno | — | 200 | 404 |
| POST | `/api/turnos` | Crear un turno nuevo | `{fecha, hora, cliente, tipoServicio}` | 201 | 400 |
| PUT | `/api/turnos/:id` | Editar un turno | `{fecha, hora, cliente, tipoServicio}` | 200 | 404 |
| DELETE | `/api/turnos/:id` | Cancelar un turno | — | 204 | 404 |

### Lavados (`/api/lavados`)

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/api/lavados` | Listar todos los registros | — | 200 | — |
| GET | `/api/lavados/:id` | Ver detalle de un lavado | — | 200 | 404 |
| POST | `/api/lavados` | Crear un registro de lavado | `{patente, modelo, tipoLavado, empleado}` | 201 | 400 |
| PUT | `/api/lavados/:id` | Editar un registro | `{patente, modelo, tipoLavado, empleado}` | 200 | 404 |
| DELETE | `/api/lavados/:id` | Borrar un registro | — | 204 | 404 |

### Usuarios (`/api/usuarios`)

| Método | Ruta | Operaciones que cubre | Body | Éxito | Errores |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/api/usuarios` | Listar todos los usuarios | — | 200 | — |
| GET | `/api/usuarios/:id` | Ver detalle de un usuario | — | 200 | 404 |
| POST | `/api/usuarios` | Crear un usuario/empleado | `{nombre, email, password, rol}` | 201 | 400 |
| PUT | `/api/usuarios/:id` | Editar un usuario | `{nombre, email, rol}` | 200 | 404 |
| DELETE | `/api/usuarios/:id` | Borrar un usuario | — | 204 | 404 |
