# Guía de exposición — SGI San José (Grupo 4)

## 1. Antes de exponer

- [ ] Abrir la URL de la API en Render 5 minutos antes (el plan free se duerme).
- [ ] Probar el login de los tres usuarios del seed en la URL de Vercel.
- [ ] Tener abiertos: la app, `backend/api.http`, `Matriz_Permisos.md` y una terminal con `npm run test:sin-db`.
- [ ] Repartir quién muestra cada bloque (la demo de abajo tiene 5 partes, una por integrante).

## 2. Demo (≈ 12 minutos)

El hilo es el problema del negocio: hoy todo está en cuadernos, nadie sabe cuándo le toca el service a cada auto y los turnos se pisan.

**Parte 1: el cliente (3 min)**
1. Inicio sin sesión: los servicios vienen de la API. Mostrar que la NavBar solo ofrece *Ingresar* y *Crear cuenta*.
2. **Crear cuenta** → queda logueado en **Mi cuenta**. Agregar un auto escribiendo la patente en minúscula y con espacios (`ab 123-cd`): se guarda `AB 123 CD`.
3. **Reservar turno**: los horarios tachados están ocupados o ya pasaron. Elegir uno → aparece en *Próximos turnos*.
4. Escribir `/panel` en la barra → **Acceso denegado**. "Esconder el link no alcanza: la ruta tiene su `PrivateRoute` y la API su 403".

**Parte 2: el empleado (3 min)**
1. Login empleado → cae directo en la **Agenda** de hoy (datos del seed) y ahí está el turno que reservó el cliente.
2. Cambiar el estado de un turno a *En proceso* y *Completado*.
3. **Nuevo → Ingreso al lavadero**: un auto que llega sin turno. Vuelve a la agenda con el lavado y el total.
4. **Vehículos** → filtro *Solo service vencido o próximo* → abrir uno → **Registrar service** → pasa a *al día*.
5. F5 en la agenda: la sesión sigue (el `AuthProvider` le pregunta a `/auth/yo`).

**Parte 3: el administrador (2 min)**
1. Login admin → **Panel**: caja del día, autos atendidos, turnos y la lista de autos para avisar (con el teléfono).
2. **Servicios**: solo el admin ve *Editar* / *Borrar*. Borrar *Cambio de Aceite* → mensaje del 409 (ya tiene turnos: `onDelete: Restrict`).
3. **Usuarios → Nuevo**: alta de un empleado.

**Parte 4: la API sin la interfaz (2 min)** — con `api.http`
1. `POST /api/auth/registro` con `"rol": "ADMIN"` → el usuario se crea igual como CLIENTE.
2. Reservar un horario ocupado → `409`. Un cliente cancelando un turno ajeno → `403`.
3. Lavado con un servicio de lubricentro → `400` (regla en el service, no en Zod: necesita la base).

**Parte 5: calidad (2 min)**
1. `npm run test:sin-db` → 160 tests en verde en segundos, sin Docker.
2. Mostrar `matriz-permisos.test.ts`: la matriz de permisos escrita como tabla; cada celda es un test.
3. `npx tsc --noEmit` en back y front → 0 errores.

## 3. Dónde está cada tema de la cursada

| Clase | Tema | Dónde mostrarlo |
| :--- | :--- | :--- |
| C02 | Git, ramas, PRs | Historial de PRs con revisión cruzada; tabla de Git flow en el README |
| C04–C05 | Requerimientos, modelado, backlog | `Documentación/01` a `03`; `Entidades.md` con el diagrama actualizado |
| C06 | UX/UI | Wireframes en `Documentación/04` ↔ pantallas *Reservar turno*, *Agenda*, *Historial de vehículo* |
| C07 | Scrum / Trello | Tablero y calendario de planificación |
| C08–C09 | React, layout y routing | `App.tsx` (rutas agrupadas por barrera), `components/Layout/` |
| C10 | Formularios y validación | React Hook Form + Zod en `frontend/src/schemas/` (ej. `clienteNuevoSchema`: vehículo obligatorio solo si se marca) |
| C11 | Hooks y consumo de APIs | `useFetch` con `recargar()`, `useDebounce` en los buscadores, `apiFetch` |
| C12 | useContext | `AuthContext.tsx` + `useAuth.ts` |
| C13 | Docker | `docker-compose.yml` (api + db con healthcheck), `Dockerfile` |
| C14 | Fundamentos backend | Capas `routes → controllers → services → prisma`; `app.ts` separado de `index.ts` |
| C17 | Relaciones y validaciones | `schema.prisma` con cada `onDelete` justificado; migración con datos existentes; validación en Zod vs en el service (`AppError`) |
| C18 | Autenticación | JWT + bcrypt; `passwordHash` nunca sale; registro que no permite elegir rol |
| C19 | Integración front–back | Todas las pantallas contra la API, mensajes reales del servidor en la UI, CORS por variable |
| C20 | Autorización en el front | `PrivateRoute` (cargando → login → rol), NavBar por rol, 401 global que cierra la sesión |
| C21 | Testing | 178 tests; pirámide (utils puros → rutas con Supertest → DB); Dado/Cuando/Entonces |
| Entrega 4 | Deploy | Render (`render.yaml`) + Vercel (`vercel.json`), ver `07 - Deploy` |

## 4. Preguntas que pueden hacer

**¿Por qué el vehículo es una tabla aparte y no un campo del cliente?**
Un cliente puede tener varios autos y el historial de service es del auto. Al principio estaba como texto; la migración `20261020120000` lo pasó a tabla sin perder los datos (crea un vehículo por cliente y vincula sus turnos).

**¿Qué pasa si borro un cliente?**
Si no tiene turnos, se borran sus vehículos (`Cascade`). Si tiene turnos, Postgres frena (`Restrict`) y la API responde 409: no se pierde el historial.

**¿Por qué algunas validaciones están en Zod y otras en el service?**
Zod mira solo el body (formato de patente, horario de atención). "¿El horario está ocupado?", "¿el auto es de este cliente?" necesitan consultar la base: van en el service y lanzan `AppError` con su status.

**¿Qué impide que un cliente reserve a nombre de otro?**
El service ignora el `clienteId` del body cuando el rol es CLIENTE y usa la ficha vinculada a su cuenta. Hay un test para eso en `comportamiento.test.ts`.

**Si escondo el botón, ¿ya está protegido?**
No. Hay tres capas: el link no se muestra, la ruta tiene `PrivateRoute` y la API responde 401/403. La regla real vive en la API; las otras dos son para la experiencia del usuario.

**¿Cómo se calcula el próximo service?**
10.000 km o 6 meses desde el último, lo que pase primero; avisa a los 1.000 km o 30 días. No se guarda porque depende de la fecha de hoy: la API lo calcula en cada respuesta (`utils/service.ts`, función pura con sus tests).

**¿Por qué "hoy" se calcula con la zona horaria de Argentina?**
En el deploy el servidor está en UTC: a las 22 h de La Plata para el servidor ya es mañana. `utils/fechas.ts` fija `America/Argentina/Buenos_Aires`.

**¿Qué pasa cuando vence el token?**
La API responde 401; `apiFetch` dispara el evento `sesion-expirada`, el `AuthProvider` cierra la sesión y manda a `/login` con el aviso y la ruta de la que venía.

**¿Los tests necesitan la base?**
160 no: Prisma está mockeado y Supertest usa `app` sin levantar el puerto. Los 2 `*.db.test.ts` sí, y están separados para que la base apagada no rompa el resto.
