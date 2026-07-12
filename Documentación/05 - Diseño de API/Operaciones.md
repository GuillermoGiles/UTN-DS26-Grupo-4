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

*Nota: Todas estas operaciones se mapearán próximamente a métodos HTTP (GET, POST, etc.) en el Backend.*
