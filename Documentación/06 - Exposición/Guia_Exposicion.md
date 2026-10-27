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
3. **Reservar turno**: elegir *Cambio de Aceite* + *Alineación* + *Lavado Básico* y después tocar *Lavado Premium*: reemplaza al Básico (un solo lavado por turno) y el total se recalcula. Los horarios tachados están ocupados o ya pasaron. Elegir uno → aparece en *Próximos turnos*.
4. Escribir `/panel` en la barra → **Acceso denegado**. "Esconder el link no alcanza: la ruta tiene su `PrivateRoute` y la API su 403".

**Parte 2: el empleado (3 min)**
1. Login empleado → cae directo en la **Agenda** de hoy (datos del seed) y ahí está el turno que reservó el cliente.
2. Elegir el turno de las 15:00 (cambio de aceite) y tocar *Completado*. Ir a **Insumos**: el aceite bajó 4 L y el filtro de aceite quedó en **stock bajo** (contador rojo en el menú). "Lo pedía el alcance: descuento automático al terminar un servicio".
3. En otro turno: **Enviar recordatorio** y **Reprogramar** a otro día con los horarios libres.
4. **Ingreso al lavadero**: un auto que llega sin turno. Vuelve a la agenda con el lavado y el total.
5. **Clientes** → buscar por DNI con puntos (`28.456`). F5: la sesión sigue (el `AuthProvider` le pregunta a `/auth/yo`).

**Parte 3: el administrador (2 min)**
1. Login admin → **Panel**: caja del día y de la semana, estados de hoy, stock bajo y autos para avisar (con el teléfono). Todo sale de la base: ningún número está fijo.
2. **Insumos** → *Cargar / ajustar* el filtro → la alerta desaparece. **Servicios → Editar** → "Insumos que consume" (la receta).
3. **Correos**: el historial de recordatorios. Sin SMTP quedan *simulados*; con las variables de Gmail salen de verdad.
4. **Servicios**: borrar *Cambio de Aceite* → mensaje del 409 (ya tiene turnos: `onDelete: Restrict`).

**Parte 4: la API sin la interfaz (2 min)** — con `api.http`
1. `POST /api/auth/registro` con `"rol": "ADMIN"` → el usuario se crea igual como CLIENTE.
2. Reservar un horario ocupado → `409`. Un cliente cancelando un turno ajeno → `403`.
3. Lavado con un servicio de lubricentro → `400` (regla en el service, no en Zod: necesita la base).

**Parte 5: calidad (2 min)**
1. `npm run test:sin-db` → 212 tests en verde en segundos, sin Docker.
2. Mostrar `matriz-permisos.test.ts`: la matriz de permisos escrita como tabla; cada celda es un test.
3. `npx tsc --noEmit` en back y front → 0 errores.

## 3. Dónde está cada tema de la cursada

| Clase | Tema | Dónde mostrarlo |
| :--- | :--- | :--- |
| C02 | Git, ramas, PRs | Historial de PRs con revisión cruzada; tabla de Git flow en el README |
| C04–C05 | Requerimientos, modelado, backlog | `Documentación/01` a `03`; `Entidades.md` con el diagrama actualizado |
| C06 | UX/UI | Wireframes en `Documentación/04` ↔ pantallas *Reservar turno*, *Agenda*, *Historial de vehículo*; sistema visual propio en `index.css` sobre React Bootstrap |
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
| C21 | Testing | 239 tests; pirámide (utils puros → rutas con Supertest → DB); Dado/Cuando/Entonces |
| Visión y Alcance | Los 5 módulos de la sección 5.1 | Clientes y vehículos (con DNI), turnos online sin superposición, historial y próximo service, **stock de insumos** con descuento y alertas, precios; **recordatorios por e-mail** |
| Entrega 4 | Deploy | Render (`render.yaml`) + Vercel (`vercel.json`), ver `07 - Deploy` |

## 4. Preguntas que pueden hacer

**¿Por qué el vehículo es una tabla aparte y no un campo del cliente?**
Un cliente puede tener varios autos y el historial de service es del auto. Al principio estaba como texto; la migración `20261020120000` lo pasó a tabla sin perder los datos (crea un vehículo por cliente y vincula sus turnos).

**¿Cómo se guarda un turno con varios servicios?**
Con una relación N:M **explícita**: la tabla `TurnoServicio` (clave compuesta turno + servicio). Explícita para elegir el `onDelete`: si se borra el turno se van sus renglones (`Cascade`), pero un servicio que figura en un turno no se puede borrar (`Restrict` → 409). La migración `20261027120000` copió el servicio de cada turno existente a la tabla nueva antes de borrar la columna. "Un solo lavado por turno" es regla de negocio (necesita el tipo de cada servicio, o sea la base): la pantalla la aplica al elegir y la API la vuelve a validar con 400.

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
212 no: Prisma está mockeado y Supertest usa `app` sin levantar el puerto. Los 2 `*.db.test.ts` sí, y están separados para que la base apagada no rompa el resto.

**¿Cómo funciona el descuento de stock?**
Cada servicio tiene una receta (`ServicioInsumo`: qué insumo y cuánto). Al pasar un turno a COMPLETADO, en una transacción se descuenta la receta y se marca `stockDescontado`, así volver a completarlo no descuenta dos veces. Si no alcanza, queda en 0 (el trabajo ya se hizo) y el insumo entra en alerta. Cada cambio queda como `MovimientoStock`.

**¿Los recordatorios son automáticos de verdad?**
Sí: `index.ts` corre cada hora `enviarRecordatoriosDeManana()`, que busca los turnos activos de mañana con e-mail y sin recordatorio. Está en `index.ts` y no en `app.ts` para que los tests no lo disparen. Sin SMTP se registran como *simulados* para poder mostrarlo.
