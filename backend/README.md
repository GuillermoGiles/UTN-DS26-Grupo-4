# Backend — SGI San José (Lavadero y Lubricentro)

API REST con **Express 5 + TypeScript**, **Prisma 7** sobre **PostgreSQL 16**, validación con **Zod**,
autenticación **JWT** y contraseñas con **bcrypt**. Se levanta con **Docker Compose**.

## Puesta en marcha

```bash
cp backend/.env.example backend/.env    # desde la raíz; cambiar JWT_SECRET y POSTGRES_PASSWORD
docker compose up -d --build
docker compose exec api npm run setup   # prisma generate + migrate deploy + seed
```

La API queda en `http://localhost:3000`. Usuarios del seed: `admin@sanjose.test` / `AdminPassword123`,
`empleado@sanjose.test` / `EmpleadoPassword123`, `cliente@sanjose.test` / `ClientePassword123`.

| Script | Qué hace |
| :--- | :--- |
| `npm run dev` | API con recarga automática (lo que corre el contenedor) |
| `npm start` | API sin recarga (producción) |
| `npm run setup` | Genera el cliente, aplica las migraciones del repo y carga el seed |
| `npm run test:sin-db` / `npm test` | Tests (ver abajo) |
| `npx prisma migrate dev --name <x>` | **Solo al cambiar el schema:** crea una migración nueva |
| `npx prisma studio` | Ver la base en el navegador (puerto 5555) |

## Estructura

```text
backend/
├── prisma/
│   ├── schema.prisma         # Usuario, Cliente, Vehiculo, Servicio, Turno, Lavado, Insumo, ServicioInsumo,
│   │                         # MovimientoStock, Correo (+ onDelete justificado)
│   ├── migrations/           # Historial (5): la de vehículos migra los datos existentes; la última agrega insumos, DNI y correos
│   └── seed.ts               # Idempotente; fechas relativas a hoy
├── src/
│   ├── app.ts                # Express: CORS, JSON, rutas, 404 y errorHandler (sin listen, para Supertest)
│   ├── index.ts              # listen(PORT) + recordatorios automáticos cada hora
│   ├── config/               # env (JWT_SECRET obligatorio), prisma, mail (SMTP), negocio (horarios, regla de service)
│   ├── routes/               # URL + middlewares (authenticate, authorize, validate)
│   ├── controllers/          # Leen req, llaman al service, eligen el status. Sin try/catch
│   ├── services/             # Lógica de negocio y Prisma. Reglas que necesitan la base → AppError
│   ├── validations/          # Zod de body, params y query
│   ├── middleware/           # auth, validate/validateParams/validateQuery, errorHandler
│   ├── errors/AppError.ts    # Error de negocio con status (400/403/409)
│   ├── utils/                # Funciones puras: fechas en hora de Argentina, patentes, próximo service
│   └── types/                # Includes de Prisma tipados y extensión de Request
├── api.http                  # Todos los endpoints con sus casos de error, en orden
└── Dockerfile
```

## Endpoints

El contrato completo (body, éxito y errores de cada uno) está en
[`Operaciones.md`](../Documentación/05%20-%20Diseño%20de%20API/Operaciones.md) y los permisos por rol en
[`Matriz_Permisos.md`](../Documentación/05%20-%20Diseño%20de%20API/Matriz_Permisos.md). Resumen:

| Recurso | Rutas | Quién |
| :--- | :--- | :--- |
| `/api/auth` | `POST /registro`, `POST /login`, `GET /yo` | Público / logueado |
| `/api/servicios` | CRUD (`?tipo=`), `PUT /:id/insumos` (receta) | Lectura pública, escritura ADMIN |
| `/api/clientes` | CRUD (`?q=` nombre, DNI, teléfono o patente), `GET/PUT /mio` | Personal; `/mio` el CLIENTE |
| `/api/vehiculos` | CRUD (`?q=`), `POST /:id/service` | Personal; el CLIENTE puede dar de alta los suyos |
| `/api/turnos` | CRUD (`?fecha=&estado=`), `GET /disponibles`, `GET /mios`, `PATCH /:id/estado`, `PATCH /:id/cancelar`, `POST /:id/recordatorio` | Ver matriz |
| `/api/lavados` | CRUD (`?fecha=`) | Personal; anular solo ADMIN |
| `/api/insumos` | CRUD, `POST /:id/movimientos` | Consulta el personal, administra el ADMIN |
| `/api/correos` | `GET /`, `POST /recordatorios` | Historial ADMIN; envío personal |
| `/api/usuarios` | CRUD | ADMIN |
| `/api/panel` | `GET /resumen` | ADMIN |

## Reglas de negocio

Las que se pueden decidir mirando solo el body están en Zod (formato de patente, horario de atención,
fecha AAAA-MM-DD). Las que necesitan consultar la base están en los services y responden con `AppError`:

- Un horario admite un turno activo; los cancelados liberan el lugar → `409`.
- No se reservan turnos en un día u horario que ya pasó (hora de Argentina) ni los domingos → `400`.
- Un `CLIENTE` reserva y carga autos **siempre a nombre de su ficha**, aunque mande otro `clienteId`.
- El vehículo del turno tiene que ser del cliente → `400`. El cliente solo cancela sus turnos pendientes o confirmados → `403`/`409`.
- Un lavado necesita un servicio de tipo lavadero y un vehículo existente → `400`. El precio se copia del servicio en ese momento.
- Al completar un turno se descuentan los insumos de su receta (una sola vez por turno); si es de lubricentro, además se registra el service del vehículo. Registrar un lavado también descuenta.
- El stock nunca queda negativo: un ajuste manual que lo dejaría bajo cero → `400`; el descuento automático deja en 0 y el insumo queda en alerta.
- Recordatorios: cada hora, a los turnos activos de mañana con e-mail que todavía no lo recibieron. Sin SMTP configurado quedan `SIMULADO`.
- El registro público siempre crea un `CLIENTE` (se ignora `rol`) junto con su ficha; si el email ya estaba cargado, se vincula.
- El ADMIN no puede borrarse a sí mismo ni quitarse el rol.

## Errores

Siempre JSON: `{ "error": "..." }` (y `detalles` por campo en los 400 de Zod, con mensajes en español).

| Status | Cuándo |
| :---: | :--- |
| 400 | Zod (body, params, query) o regla de negocio |
| 401 | Sin token, token adulterado o vencido |
| 403 | Rol sin permiso |
| 404 | No existe (registro o ruta) |
| 409 | Único repetido (`P2002`), FK inexistente o registros relacionados (`P2003`), horario ocupado |
| 500 | Error no controlado (se loguea en el servidor) |

## Recordatorios por e-mail

Variables opcionales en `.env` (ver `.env.example`): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`.
Con Gmail: activar la verificación en 2 pasos y crear una contraseña de aplicación. Sin ellas, cada recordatorio
se registra como `SIMULADO` y se ve en la pantalla Correos.

## CORS

`FRONTEND_URL` acepta uno o varios orígenes separados por coma (ej. `http://localhost:5173,https://sgi-sanjose.vercel.app`). Nunca `*`.

## Testing

210 tests con Vitest + Supertest: 208 sin base (Prisma mockeado, ~3 s) y 2 contra PostgreSQL (`*.db.test.ts`).
El detalle de qué cubre cada archivo está en la [sección Testing del README principal](../README.md#-testing).

```bash
npm run test:sin-db    # no necesita Docker
npm test               # necesita la base con el seed
```
