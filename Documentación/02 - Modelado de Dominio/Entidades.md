# Verificación del Modelo de Dominio (Fase 2)

Durante la implementación del Frontend (Bloque 2), hemos aterrizado el modelo de dominio en esquemas de datos concretos utilizando Zod. A continuación, se detallan las entidades y atributos que terminamos usando en las pantallas de la aplicación:

### 1. Cliente
Representa a las personas que utilizan los servicios del lavadero/lubricentro.
- **id** (number)
- **nombre** (string)
- **vehiculo** (string) - *Nota: Podría normalizarse a una entidad separada en el futuro.*
- **patente** (string)
- **telefono** (string)

### 2. Servicio
Representa los servicios que ofrece el local (ej. Lavado Premium, Cambio de Aceite).
- **id** (number)
- **nombre** (string)
- **precio** (number)
- **desc** (string)
- **tipo** (string) - *lavadero o lubricentro*

### 3. Turno
Representa una reserva anticipada de un cliente para un servicio.
- **fecha** (string/date)
- **hora** (string/time)
- **cliente** (string) - *Referencia al cliente o patente*
- **tipoServicio** (string)

### 4. Lavado
Representa un registro de lavado realizado en el momento.
- **patente** (string)
- **modelo** (string)
- **tipoLavado** (string)
- **empleado** (string)

### 5. Usuario (Empleado/Admin)
Representa al personal que utiliza el sistema.
- **nombre** (string)
- **email** (string)
- **rol** (string) - *admin o empleado*

> Las entidades coinciden en gran medida con el modelado original de la Fase 1, con algunas simplificaciones prácticas para la etapa de maquetado del Frontend (como mantener el vehículo como un string dentro del Cliente).
