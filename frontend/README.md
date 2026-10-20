# Frontend — SGI Lavadero y Lubricentro San José

SPA en React + TypeScript que consume la API del backend. No hay datos de mentira: todas las
pantallas leen y escriben contra `/api` con el token de la sesión.

## Stack

React 19 + TypeScript · Vite · React Router 7 · React Bootstrap · React Hook Form + Zod · React Icons · Vitest + Testing Library

**Diseño:** sistema visual propio en `src/index.css` sobre Bootstrap (tokens de color, tarjetas, tablas, badges, formularios).
Tipografías Fraunces (títulos) y DM Sans (texto) empaquetadas con `@fontsource`: no dependen de Google Fonts ni de internet.
El personal trabaja con barra lateral; invitados y clientes, con barra superior; login y registro en pantalla partida.

## Cómo correrlo

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev               # http://localhost:5173 (el backend tiene que estar levantado)
```

| Comando | Qué hace |
| :--- | :--- |
| `npx tsc -p tsconfig.app.json --noEmit` | Chequeo de tipos (tiene que dar 0 errores) |
| `npm run lint` | ESLint |
| `npm test` | Tests de componentes y formularios (no necesitan el backend) |
| `npm run build` | Build de producción en `dist/` |

## Usuarios para probar (seed del backend)

| Rol | Email | Contraseña | Entra a |
| :--- | :--- | :--- | :--- |
| ADMIN | `admin@sanjose.test` | `AdminPassword123` | `/panel` |
| EMPLEADO | `empleado@sanjose.test` | `EmpleadoPassword123` | `/agenda` |
| CLIENTE | `cliente@sanjose.test` | `ClientePassword123` | `/mi-cuenta` |

También se puede crear una cuenta de cliente nueva desde **Crear cuenta**.

## Estructura

```
src/
├── App.tsx               # Rutas agrupadas por barrera (PrivateRoute por rol)
├── context/AuthContext.tsx  # Sesión: login, logout, rehidratación con /auth/yo, 401 global
├── services/
│   ├── api.ts            # apiFetch: URL base, Bearer token, ApiError, evento sesion-expirada
│   └── sesion.ts         # token en localStorage
├── hooks/
│   ├── useAuth.ts        # contexto + hook de sesión
│   ├── useFetch.ts       # GET con data/loading/error + recargar()
│   └── useDebounce.ts    # buscadores sin pedir en cada tecla
├── components/
│   ├── Layout/           # Layout (elige la estructura según rol y ruta), Sidebar, Header, Marca, Footer
│   ├── AuthSplit.tsx     # pantalla partida de login y registro
│   ├── PrivateRoute.tsx  # 1. ¿cargando?  2. ¿logueado? → /login  3. ¿rol? → /sin-permiso
│   ├── Badges.tsx        # estado del turno, estado del service, patente
│   ├── Estado.tsx        # Cargando / ErrorCarga / Vacio
│   ├── Formulario.tsx    # marco de formularios, botón de guardar y encabezado de página
│   └── ServicioDestacado.tsx
├── pages/                # una por ruta (ver tabla)
├── schemas/              # Zod de cada formulario (+ campos.ts con piezas comunes)
├── types/                # tipos alineados con las respuestas de la API
├── utils/                # formato de fechas/pesos/patentes, inicio según rol
└── test/                 # renderConAuth (AuthContext falso) y usuarios de prueba
```

## Rutas

| Ruta | Página | Quién |
| :--- | :--- | :--- |
| `/` | Inicio con servicios reales | Público |
| `/servicios` | Catálogo (Editar/Borrar solo ADMIN) | Público |
| `/login`, `/registro` | Ingreso y alta de cuenta de cliente | Público |
| `/turnos/nuevo` | Reserva con horarios libres del día | Cualquier logueado |
| `/mi-cuenta` | Datos, autos con próximo service, turnos (cancelar) | CLIENTE |
| `/agenda` | Turnos del día: estado, reprogramar, recordatorio; lavados sin turno | EMPLEADO, ADMIN |
| `/clientes`, `/clientes/nuevo`, `/clientes/:id` | Directorio con búsqueda, alta con vehículo, ficha | EMPLEADO, ADMIN |
| `/vehiculos`, `/vehiculos/nuevo`, `/vehiculos/:id` | Directorio con estado del service, alta, historial | EMPLEADO, ADMIN |
| `/lavados/nuevo` | Ingreso al lavadero sin turno | EMPLEADO, ADMIN |
| `/insumos` | Stock con alertas; cargas y ajustes solo ADMIN | EMPLEADO, ADMIN |
| `/panel` | Caja del día y de la semana, estados, stock bajo, service atrasado | ADMIN |
| `/correos` | Historial de recordatorios y envío de los de mañana | ADMIN |
| `/servicios/nuevo`, `/servicios/:id/editar` | Alta y edición de servicio, con los insumos que consume | ADMIN |
| `/usuarios`, `/usuarios/nuevo` | Personal del sistema | ADMIN |

La matriz completa (endpoint, rol y qué hace la UI) está en
`Documentación/05 - Diseño de API/Matriz_Permisos.md`.

## Testing

`npm test` corre sin el backend: la sesión se simula con `renderConAuth` y la API con `vi.mock`.

- `PrivateRoute.test.tsx`: invitado → `/login`, rol equivocado → `/sin-permiso`, rol correcto → contenido, después de "Salir" → inicio.
- `Insumos.test.tsx`: alerta de stock mínimo; el EMPLEADO no ve Cargar / ajustar; el ADMIN sí.
- `Header.test.tsx`: qué links ve cada rol en la NavBar.
- `Servicios.test.tsx`: Editar/Borrar solo para ADMIN; el error de la API se muestra.
- `SinPermiso.test.tsx`: la pantalla del 403.
- `schemas.test.ts`: contraseñas que no coinciden, vehículo obligatorio si se marca, DNI y patente normalizados, conversión de los `<select>` a ids.
