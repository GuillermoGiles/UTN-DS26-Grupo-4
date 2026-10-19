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

## 🧪 Testing

El proyecto cuenta con una suite integral de testing automatizado implementada con **Vitest**, abarcando pruebas unitarias puras, pruebas de integración HTTP (Supertest), validaciones de dominio (Zod) y pruebas de componentes visuales (React Testing Library + jsdom).

La suite sigue los principios de la **Pirámide de Testing**, priorizando pruebas rápidas e independientes en memoria (sin dependencias externas), complementadas con integración de endpoints y control de acceso basado en roles (RBAC).

---

### 1. Comandos para Correr los Tests

Tanto el backend como el frontend cuentan con scripts estandarizados configurados en sus respectivos `package.json`.

#### 🔹 Backend (`backend/`)

Desde la carpeta `backend/` (en el host o dentro del contenedor):

```bash
# Correr toda la suite de tests una sola vez
npm test

# Correr solo los tests que NO tocan la base de datos (55 tests en milisegundos)
npm run test:sin-db

# Correr en modo interactivo / watch (re-ejecuta automáticamente al guardar cambios)
npm run test:watch

# Generar reporte de cobertura de código (coverage v8)
npm run coverage
```

*Si se prefiere ejecutar directamente mediante Docker:*
```bash
# Desde la raíz del repositorio:
docker compose run --rm api npm test
docker compose run --rm api npm run test:sin-db
```

#### 🔹 Frontend (`frontend/`)

Desde la carpeta `frontend/`:

```bash
# Correr toda la suite de componentes y páginas una sola vez
npm test

# Correr en modo interactivo / watch
npm run test:watch

# Generar reporte de cobertura de frontend
npm run coverage
```

---

### 2. Qué Hace Falta Levantar (Entornos y Dependencias)

La suite de pruebas fue diseñada bajo el principio de **aislamiento e independencia de infraestructura**, clasificando los tests según sus requisitos de ejecución:

| Tipo de Suite | ¿Qué hace falta levantar? | Explicación Técnica |
| :--- | :--- | :--- |
| **Suite Rápida (Sin DB)**<br>*(55 tests en Backend + 5 tests en Frontend)* | **NADA** 🟢<br>*(No requiere Docker, ni PostgreSQL, ni levantar Express en puerto 3000)* | • **Backend:** `supertest` interactúa directamente en memoria con la instancia exportada de `src/app.ts` sin llamar a `app.listen(PORT)`. Prisma está mockeado con `vi.mock("../config/prisma")`. Los tokens JWT se firman al vuelo en los tests con el secreto de prueba (`JWT_SECRET="secreto-solo-para-tests"` inyectado desde `vitest.config.mts`).<br>• **Frontend:** Corre enteramente en memoria sobre `jsdom` con `@testing-library/react`. No necesita conexión de red ni la API levantada. |
| **Suite con Base de Datos**<br>*(Archivo `*.db.test.ts`)* | **PostgreSQL en Docker** 🐳<br>*(Migraciones y seed cargados)* | Requiere tener corriendo el contenedor de base de datos (`docker compose up -d db`) con datos sembrados. Permite validar consultas reales contra PostgreSQL. |

#### Requisitos Previos en Local:
1. **Instalación de dependencias:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. **Generación del cliente de Prisma (backend):**
   ```bash
   cd backend && npx prisma generate
   ```

#### ⚠️ Separación de Tests con Base de Datos (`*.db.test.ts`):
Para evitar que la caída de un servicio externo o la falta de Docker rompa el ciclo de desarrollo continuo (CI), **todo test que interactúa con PostgreSQL está segregado en archivos con extensión `*.db.test.ts`** y claramente señalizado con un comentario de advertencia en su cabecera.

* **Si Docker está apagado:** `npm run test:sin-db` corre el 100% de la lógica de negocio, validaciones y permisos manteniéndose en **verde** (55 tests aprobados).
* **Si se corre `npm test` con Docker apagado:** Solo fallará el archivo `servicio.routes.db.test.ts` con error de conexión `Can't reach database server at 127.0.0.1:5432`, mientras que el resto de los 55 tests de backend se mantienen verdes.

Para levantar la base y ejecutar la suite completa:
```bash
# 1. Levantar contenedor de base de datos
docker compose up -d db

# 2. Correr migraciones y sembrar datos iniciales (seed)
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed

# 3. Correr todos los tests (56 tests verdes)
npm test
```

---

### 3. Funcionalidades Cubiertas

El repositorio cuenta con **61 tests automatizados** (56 en Backend y 5 en Frontend), superando ampliamente el requerimiento mínimo de 5 tests verdes.

```text
Suite Total: 61 tests
├── Backend: 56 tests (55 sin DB + 1 con DB real)
└── Frontend: 5 tests (jsdom + Testing Library)
```

#### 📦 Cobertura en Backend (`backend/src/`)

1. **Infraestructura y Humo (`src/app.test.ts` - 2 tests):**
   - `GET /`: Responde HTTP 200 con `{ mensaje: "API SGI San José 🐳" }`, validando que Express y `app.ts` cargan sin requerir un puerto abierto.
   - `GET /api/no-existe`: Responde HTTP 404 en formato JSON `{ error: "Ruta no encontrada" }` mediante el middleware global de fallback.

2. **Seguridad y Middlewares de Autenticación (`src/middleware/auth.middleware.test.ts` - 4 tests):**
   - `authorize`: Responde 403 Forbidden a usuarios con rol `CLIENTE` cuando el endpoint exige `ADMIN`, verificando mediante spies `vi.fn()` que `next()` no sea invocado.
   - `authorize`: Permite la continuidad (`next()` invocado 1 vez) a usuarios con rol `EMPLEADO` en rutas habilitadas para `ADMIN` o `EMPLEADO`.
   - `authenticate`: Procesa correctamente un token JWT válido, asignando el objeto de usuario decodificado a `req.usuario` y llamando a `next()`.
   - `authenticate`: Responde 401 Unauthorized ante un token con expiración vencida (`expiresIn: "-1s"`), retornando `{ error: "Token expirado" }`.

3. **Validaciones de Dominio con Zod (`src/validations/validations.test.ts` - 6 tests):**
   - `servicioCreateSchema`: Rechaza precios negativos (`precio < 0`) informando el campo específico causante del error.
   - `servicioCreateSchema`: Aplica `.trim()` saneando espacios en blanco innecesarios en nombres de servicio.
   - `clienteCreateSchema`: Normaliza patentes vehiculares eliminando espacios y convirtiendo a mayúsculas (`"  ae987xz  "` $\to$ `"AE987XZ"`).
   - `clienteCreateSchema`: Rechaza patentes con longitud menor a la reglamentaria (< 6 caracteres).
   - `idParamSchema`: Coacciona y convalida parámetros de ruta numéricos (`"42"` $\to$ `42`).
   - `turnoCreateSchema`: Rechaza identificadores foráneos (`clienteId`, `servicioId`) que no sean enteros positivos.

4. **Suite de Integración y Matriz de Permisos RBAC (`src/routes/*.routes.test.ts` - 37 tests sin DB):**
   *Transformación integral de la Matriz de Permisos (`Documentación/05 - Diseño de API/Matriz_Permisos.md`) en tests de integración con Supertest:*
   - **Autenticación (`auth.routes.test.ts` - 5 tests):**
     - `GET /api/auth/yo`: 401 sin token, 401 sin formato Bearer, 401 con token adulterado (firma inválida), y 401 con token expirado.
     - `POST /api/auth/login`: 401 con mensaje uniforme `"Credenciales inválidas"` ante email inexistente.
   - **Servicios (`servicio.routes.test.ts` - 11 tests):**
     - `POST /api/servicios`: 401 sin token, 401 con token adulterado, 403 para `CLIENTE`, 403 para `EMPLEADO`, y 400 (no 403) para `ADMIN` con payload inválido (garantizando que la autorización se ejecuta antes que la validación).
     - `PUT /api/servicios/:id`: 401 sin token, 403 para `CLIENTE`, 403 para `EMPLEADO`.
     - `DELETE /api/servicios/:id`: 401 sin token, 403 para `CLIENTE`, 403 para `EMPLEADO`.
   - **Clientes (`cliente.routes.test.ts` - 11 tests):**
     - `GET /api/clientes` y `GET /api/clientes/:id`: 401 público, 403 para `CLIENTE`.
     - `POST /api/clientes`: 401 público, 403 para `CLIENTE`, 400 para `EMPLEADO` con datos erróneos.
     - `PUT /api/clientes/:id`: 401 público, 403 para `CLIENTE`.
     - `DELETE /api/clientes/:id`: 401 público, 403 para `CLIENTE`, 403 para `EMPLEADO` (baja exclusiva de `ADMIN`).
   - **Turnos (`turno.routes.test.ts` - 10 tests):**
     - `GET /api/turnos` y `GET /api/turnos/:id`: 401 público, 403 para `CLIENTE` no autorizado.
     - `POST /api/turnos`: 401 público, 401 con firma adulterada, 400 con body incompleto.
     - `PUT /api/turnos/:id`: 401 público, 403 para `CLIENTE`.
     - `DELETE /api/turnos/:id`: 401 público, 403 para `CLIENTE`.

5. **Testing de Comportamiento Específico AAA (`src/routes/comportamiento.test.ts` - 6 tests):**
   *Implementación estricta del patrón Arrange-Act-Assert (Dado / Cuando / Entonces) definido en clase:*
   - **Reserva de turno:** *Dado* un cliente autenticado con datos válidos, *Cuando* solicita un turno por `POST /api/turnos`, *Entonces* responde 201 con el turno creado vinculando cliente y servicio.
   - **Rechazo de turno sin horario:** *Dado* un cliente autenticado con payload incompleto, *Cuando* envía la solicitud, *Entonces* responde 400 con `"La hora es obligatoria"` y nunca invoca `prisma.turno.create`.
   - **Normalización de cliente:** *Dado* un empleado con patente en minúsculas, *Cuando* envía `POST /api/clientes`, *Entonces* responde 201 y persiste la patente en mayúsculas.
   - **Alta de servicio por ADMIN:** *Dado* un administrador autenticado, *Cuando* envía un nuevo servicio válido, *Entonces* responde 201 con el servicio persistido.
   - **Seguridad en login:** *Dado* un usuario registrado, *Cuando* intenta loguearse con contraseña errónea, *Entonces* recibe 401 con el mismo mensaje genérico que si el usuario no existiera.
   - **Registro seguro:** *Dado* un visitante con datos válidos, *Cuando* se registra en `POST /api/auth/registro`, *Entonces* responde 201 con rol `CLIENTE` y omite estrictamente el campo `passwordHash`.

6. **Integración con Base de Datos Real (`src/routes/servicio.routes.db.test.ts` - 1 test con DB):**
   - `GET /api/servicios`: Consulta real contra PostgreSQL que responde 200 con el listado sembrado por el seed, cerrando la conexión limpiamente en `afterAll()`.

---

#### 🖥️ Cobertura en Frontend (`frontend/src/`)

1. **Barrera de Acceso y Rutas Protegidas (`src/components/PrivateRoute.test.tsx` - 3 tests):**
   - *Dado* un visitante sin sesión activa, *Cuando* intenta ingresar a una ruta protegida, *Entonces* es redirigido a `/login` preservando la ruta previa en el estado.
   - *Dado* un usuario con rol `CLIENTE`, *Cuando* intenta acceder a una ruta de rol `ADMIN`, *Entonces* es derivado a `/sin-permiso`.
   - *Dado* un usuario autenticado con rol `ADMIN`, *Cuando* ingresa a su ruta protegida, *Entonces* renderiza el `<Outlet />` con el contenido protegido.

2. **Página de Error de Permisos (`src/pages/SinPermiso.test.tsx` - 2 tests):**
   - Renderiza el encabezado `"Acceso denegado"` y la explicación visual a un usuario no autorizado.
   - Exhibe dinámicamente el badge con el rol actual del usuario en sesión (`CLIENTE`), informando con claridad por qué la acción no está permitida.

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
