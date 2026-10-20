# Sistema de Gestión Integral para el Lavadero y Lubricentro "San José"

## Descripción del Proyecto
El negocio "San José" ofrece lavados y servicios de mantenimiento (cambio de aceite y filtros), pero hoy maneja toda su información en cuadernos o papeles. Esto trae varios problemas: es difícil acordarse qué se le hizo a cada auto en el pasado, los turnos se amontonan porque no hay una agenda clara y es complicado avisarle a los clientes cuando su auto está listo o le toca un nuevo servicio.

## Miembros del Equipo
- **Guillermo Giles**, 33359, guillermogiles, [GitHub](https://github.com/guille123giles-cloud)
- **Martinez Baltazar**, 33242, baltazar martinez, [GitHub](https://github.com/gitbal-hzd)
- **Puertas Bautista**, 33604, bautistapuertas, [GitHub](https://github.com/Bautistapuertas)
- **Olivan Jeremias**, 33643, JereOlivan, [GitHub](https://github.com/JereOlivan)
- **Luna Guelfo Leon**, 32273, LeonLuna13, [GitHub](https://github.com/LeonLuna13)

---

## Qué hace el sistema

| Rol | Puede |
| :--- | :--- |
| **Cliente** | Crear su cuenta, reservar turnos eligiendo entre los horarios libres, ver sus autos con el próximo service (cada 10.000 km o 6 meses) y el historial, cancelar turnos pendientes y recibir el recordatorio por e-mail el día anterior. |
| **Empleado** | Agenda del día: estado de cada turno, reprogramar y enviar recordatorios. Autos que llegan al lavadero sin turno, alta y búsqueda de clientes (por DNI, nombre o patente) y vehículos, historial y registro de service, consulta de stock. |
| **Administrador** | Todo lo anterior, más el panel (caja del día y de la semana, stock bajo, service atrasado), el catálogo de precios con los insumos que consume cada servicio, el control de stock, el historial de correos y las cuentas del personal. |

**Stack:** React 19 + TypeScript + Vite + React Bootstrap (diseño propio, tipografías Fraunces y DM Sans empaquetadas) · Node.js + Express 5 + TypeScript · Prisma 7 + PostgreSQL 16 · Zod en los dos lados · JWT + bcrypt · Docker Compose · Vitest + Supertest + Testing Library.

## Cómo levantarlo

```bash
# 1. Variables de entorno
cp backend/.env.example backend/.env       # cambiá JWT_SECRET y POSTGRES_PASSWORD
cp frontend/.env.example frontend/.env

# 2. Backend + base de datos
docker compose up -d --build
docker compose exec api npm run setup      # migraciones + seed con datos de demo

# 3. Frontend
cd frontend && npm install && npm run dev  # http://localhost:5173
```

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| ADMIN | `admin@sanjose.test` | `AdminPassword123` |
| EMPLEADO | `empleado@sanjose.test` | `EmpleadoPassword123` |
| CLIENTE | `cliente@sanjose.test` | `ClientePassword123` |

El seed crea turnos de ayer, hoy y mañana, insumos con sus recetas y DNI de ejemplo, así la agenda, el panel y el stock tienen datos el día que se corra.

**Recordatorios por e-mail:** sin configuración quedan registrados como *simulados* (se ven en la pantalla Correos). Para que salgan de verdad, completar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` y `SMTP_PASS` en `backend/.env` (con Gmail, una contraseña de aplicación).
Para probar la API sin el front está `backend/api.http` (REST Client), que corre entero de arriba hacia abajo con los casos de error de cada entidad.

> **Cambiar el modelo:** después de tocar `schema.prisma`, `npx prisma migrate dev --name <descripcion>` dentro del contenedor genera la migración nueva. `npm run setup` usa `migrate deploy`, que solo aplica las del repo.

## Deploy

Backend y base en **Render** (`render.yaml`, blueprint), frontend en **Vercel** (`frontend/vercel.json`).
Paso a paso en [Documentación/07 - Deploy](./Documentación/07%20-%20Deploy/Deploy.md).

## Documentación

| | |
| :--- | :--- |
| [Índice de documentación](./Documentación/README.md) | Visión, análisis, dominio, backlog, wireframes |
| [Entidades.md](./Documentación/02%20-%20Modelado%20de%20Dominio/Entidades.md) | Modelo, relaciones y por qué cada `onDelete` |
| [Operaciones.md](./Documentación/05%20-%20Diseño%20de%20API/Operaciones.md) | Contrato de la API: endpoints, body, éxito y errores |
| [Matriz_Permisos.md](./Documentación/05%20-%20Diseño%20de%20API/Matriz_Permisos.md) | Rol × endpoint × qué hace la UI, y las barreras del router |
| [Guía de exposición](./Documentación/06%20-%20Exposición/Guia_Exposicion.md) | Guion de la demo y dónde está cada tema de la cursada |
| [backend/README.md](./backend/README.md) · [frontend/README.md](./frontend/README.md) | Detalle de cada parte |

---

## 🧪 Testing

**230 tests automatizados**: 210 en el backend (208 sin base de datos + 2 contra PostgreSQL) y 20 en el frontend.

```text
Suite total: 230 tests
├── Backend: 210 (208 sin DB en ~3 s + 2 con DB real)
└── Frontend: 20 (jsdom + Testing Library, sin backend)
```

### 1. Comandos

```bash
# Backend (desde backend/, en el host o con: docker compose run --rm api <comando>)
npm run test:sin-db     # 208 tests, no necesita Docker
npm test                # todos, incluidos los *.db.test.ts (necesita la base con el seed)
npm run test:watch
npm run coverage

# Frontend (desde frontend/)
npm test
npx tsc -p tsconfig.app.json --noEmit   # chequeo de tipos
npm run lint
```

### 2. Qué hace falta levantar

| Suite | Qué hace falta | Cómo |
| :--- | :--- | :--- |
| Sin DB (208 back + 20 front) | **Nada** | `supertest` usa `app` sin `listen`; Prisma está mockeado con `vi.mock`; el JWT se firma con el secreto de prueba de `vitest.config.mts`. El front corre en jsdom con la API mockeada. |
| Con DB (`*.db.test.ts`) | PostgreSQL con migraciones y seed | `docker compose up -d db` + `npm run setup`. Si la base está apagada solo fallan esos 2 archivos; el resto sigue verde. |

### 3. Qué cubren

**Backend (`backend/src/`)**

| Archivo | Tests | Qué verifica |
| :--- | :---: | :--- |
| `app.test.ts` | 2 | La API carga sin puerto; 404 en JSON. |
| `middleware/auth.middleware.test.ts` | 4 | `authorize` corta con 403 y deja pasar al rol correcto; `authenticate` carga `req.usuario` y responde 401 con token vencido. |
| `validations/validations.test.ts` | 10 | Precio negativo, trim, patente normalizada (`" ae 987-xz "` → `AE987XZ`), formato argentino, ids coercionados, DNI normalizado, insumo y receta inválidos. |
| `utils/utils.test.ts` | 12 | Próximo service (ok / próximo / vencido por km o por fecha), fechas en hora de Argentina, "ya pasó", domingos, patentes y horarios. |
| `services/insumo.service.test.ts` | 3 | Descuento automático de insumos según la receta; si no alcanza queda en 0 sin frenar el trabajo; sin movimientos vacíos. |
| `routes/{auth,servicio,cliente,turno}.routes.test.ts` | 38 | Matriz de permisos original (401/403/400), incluida la **escalada de privilegios**: registrarse mandando `rol: ADMIN` crea igual un CLIENTE. |
| `routes/matriz-permisos.test.ts` | 129 | Cada celda de los endpoints nuevos (vehículos, lavados, usuarios, panel, insumos, recetas, correos, turnos y portal del cliente): 401 sin token, 403 para cada rol sin permiso, y que los roles permitidos sí pasan la barrera. |
| `routes/comportamiento.test.ts` | 10 | Dado/Cuando/Entonces: el cliente reserva a nombre de su ficha aunque mande otro `clienteId`; horario ocupado → 409; día pasado → 400; domingo → 400; alta de cliente con su auto; login con mensaje genérico; registro sin `passwordHash`. |
| `routes/*.db.test.ts` | 2 | Contra PostgreSQL: catálogo del seed; login real → reserva → el horario deja de estar libre → repetir da 409. |

**Frontend (`frontend/src/`)**

| Archivo | Tests | Qué verifica |
| :--- | :---: | :--- |
| `components/PrivateRoute.test.tsx` | 4 | Invitado → `/login`; rol equivocado → `/sin-permiso`; rol correcto → contenido; después de "Salir" → inicio. |
| `components/Layout/Header.test.tsx` | 4 | Qué links ve cada rol (invitado, cliente, empleado, admin) y el botón Salir. |
| `pages/Insumos.test.tsx` | 3 | Alerta de stock mínimo; el EMPLEADO ve el stock pero no carga; el ADMIN tiene Cargar / ajustar y Nuevo insumo. |
| `pages/Servicios.test.tsx` | 3 | Editar/Borrar solo para ADMIN; Reservar para el cliente; el error de la API se muestra. |
| `pages/SinPermiso.test.tsx` | 2 | La pantalla del 403 con el rol actual. |
| `schemas/schemas.test.ts` | 4 | Contraseñas que no coinciden; vehículo obligatorio si se marca; body final del alta de cliente; `<select>` → ids numéricos. |

---

### 4. Git Flow y Coordinación de Revisiones Cruzadas

Para dar cumplimiento a la pauta de trabajo en equipo de la actividad **[AG-C21]**, la división de tareas, creación de ramas y revisión cruzada de código se coordinó de la siguiente forma:

| Integrante | Rol Asignado | Rama de Trabajo | Pull Request | Revisor Cruzado |
| :--- | :--- | :--- | :--- | :--- |
| **Participante 1**<br>*(Configuración e Infraestructura)* | Configuración base de Vitest en backend y frontend, scripts npm, tipados, `vitest.config.mts` y separación de `*.db.test.ts`. | `test/c21-config-vitest` | **PR #54** | Baltazar Martinez / Leon Luna |
| **Participante 2**<br>*(Seguridad e Integración)* | Transformación de la Matriz de Permisos en suite automatizada (401/403/400) sin tocar la base de datos con Supertest. | `feature/test-seguridad-integracion` | **PR #55** | Bautista Puertas |
| **Participante 3**<br>*(Comportamiento Específico)* | Implementación de casos de negocio bajo estructura Dado/Cuando/Entonces y validaciones de datos (6 tests AAA). | `feature/test-comportamiento` | **PR #56** | Leon Luna |
| **Participante 4**<br>*(Documentación Técnica y Git Flow)* | Redacción exhaustiva de la sección Testing en `README.md`, detalle de comandos, dependencias, cobertura y control de Git flow. | `feature/doc-testing-gitflow` | **PR #57** | Guillermo Giles / Jeremias Olivan |
| **Participante 5**<br>*(Gestión y Entrega)* | Administración del tablero Trello (Done), facilitación de retrospectiva y planning, y comunicación final en Discord. | Coordinación General | — | Todo el equipo |

#### Buenas Prácticas Aplicadas en las Revisiones de Código (PRs):
- **Tests independientes:** Ningún test depende del resultado ni del orden de ejecución de otro.
- **Sin efectos secundarios:** Las pruebas sin base de datos mockean las dependencias de I/O para no ensuciar datos ni requerir servicios externos.
- **Nomenclatura descriptiva:** Nombres que completan la frase *"it..."* explicando exactamente qué comportamiento se verifica y qué falló si el indicador se pone rojo.
- **Validación previa al Merge:** Cada PR fue aprobado únicamente tras verificar que `npm test` y el chequeo de tipos (`tsc --noEmit`) pasaran limpiamente.
