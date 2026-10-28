# Deploy — Render (frontend y API) + Neon (PostgreSQL)

Producción sigue la arquitectura de la C23: tres servicios, dos cuentas (Render y Neon), un repo.

```
👤 Navegador
   │ https → archivos
   ▼
🌐 sgi-sanjose  ·  Render Static Site        frontend/ → npm run build → publica dist/
   │ fetch → VITE_API_URL (embebida en el build)
   ▼
🖥  sgi-sanjose-api  ·  Render Web Service    backend/Dockerfile.prod
   │ FRONTEND_URL → CORS · DATABASE_URL → Prisma
   ▼
🗄  Neon PostgreSQL                           región AWS us-east-1 (la misma que Render Virginia)
```

| | URL |
| :--- | :--- |
| **Frontend** | https://sgi-sanjose.onrender.com |
| **Backend** | https://sgi-sanjose-api.onrender.com (la API vive en `/api`) |

Los usuarios de prueba se pasan por el canal del grupo en Discord, **no** van en el repo.

## Qué cambia entre desarrollo y producción

| | Desarrollo (tu compu) | Producción |
| :--- | :--- | :--- |
| Backend | `Dockerfile` + `docker compose`, `tsx watch` | `Dockerfile.prod` (multi-stage): `tsc` una vez, después `node dist/index.js` |
| Migraciones | `prisma migrate dev` (crea y aplica) | `prisma migrate deploy` al arrancar (solo aplica las commiteadas) |
| Frontend | `npm run dev` (Vite en Node) | `npm run build` → archivos estáticos en `dist/`, sin Node |
| Base | PostgreSQL en Docker | Neon |
| Variables | `backend/.env`, `frontend/.env` (no van a Git) | panel de Render (nunca en el repo) |

`.env.example` (en `backend/` y `frontend/`) documenta qué variables existen; el valor lo pone cada entorno.

## Variables de entorno (sin valores)

**`sgi-sanjose-api` (Web Service)**

| Variable | Quién pone el valor | Qué es |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon | Connection string **directa** (no la *pooled*), termina en `?sslmode=require` |
| `JWT_SECRET` | Render (botón *Generate*) | Firma de los tokens. Nadie la escribe ni la comparte |
| `JWT_EXPIRES_IN` | nosotros | `8h` |
| `FRONTEND_URL` | nosotros | La URL exacta del front, con `https` y **sin `/` al final**. Acepta varias separadas por coma |
| `NODE_ENV` | nosotros | `production` |
| `PORT` | Render (la inyecta) | No hace falta cargarla |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | proveedor de correo | Opcionales. Sin ellas los recordatorios quedan como *simulados* (ver abajo) |

**`sgi-sanjose` (Static Site)**

| Variable | Qué es |
| :--- | :--- |
| `VITE_API_URL` | URL del back **con `/api` al final**. Es pública: queda pegada en el JS del build (se ve con F12), por eso en el front nunca va un secreto |

## Paso a paso (orden de creación)

Cada URL existe recién cuando existe el servicio: el back necesita la del front (CORS) y el front la del back (fetch), así que uno arranca con un valor provisorio.

1. **Neon**: proyecto nuevo, región **AWS us-east-1**. Copiar la *connection string* directa → `DATABASE_URL`.
2. **Render → New → Web Service**: el repo, *Language* **Docker**, *Root Directory* `backend`, *Dockerfile Path* `./Dockerfile.prod` (o `backend/Dockerfile.prod` según cómo lo pida), región **Virginia**, plan free. Variables: `DATABASE_URL`, `JWT_SECRET` (generada), `JWT_EXPIRES_IN=8h`, `NODE_ENV=production` y `FRONTEND_URL=http://localhost:5173` provisoria. *Docker Command* vacío: usa el `CMD` de la imagen.
   Al arrancar corre `npm run start:prod` = `prisma migrate deploy && node dist/index.js`. Probar `https://sgi-sanjose-api.onrender.com/` → `{"mensaje":"API SGI San José 🐳"}`.
3. **Render → New → Static Site**: *Root Directory* `frontend`, *Build Command* `npm ci && npm run build`, *Publish Directory* `dist`, variable `VITE_API_URL=https://sgi-sanjose-api.onrender.com/api`. En **Redirects/Rewrites**: `Source /*` → `Destination /index.html` → **Rewrite** (si no, un F5 en `/agenda` da 404).
4. **Volver al back**: `FRONTEND_URL=https://sgi-sanjose.onrender.com`. Cambiar una variable redeploya solo.
5. **Cargar los datos de demo** desde nuestra compu, contra la base de Neon (el seed es idempotente: se puede correr de nuevo sin duplicar):
   ```bash
   NEON='<connection string de Neon>'   # comillas simples: Git Bash no toca los caracteres de la contraseña
docker compose run --rm -e DATABASE_URL="$NEON" api sh -c "npx prisma generate && npx prisma db seed"
   ```
   La imagen de producción no trae `tsx` ni el seed: por eso se corre con la imagen de desarrollo (`prisma generate` va antes porque `docker compose run` no pasa por `npm run dev`). Requiere `backend/.env` (copiarlo de `.env.example`). Nunca pegar la URL en un chat ni en una captura: tiene la contraseña.
6. **Probar en el navegador** (ver la verificación de abajo) y pasar las dos URLs y los usuarios de prueba por Discord.

`render.yaml` deja escrita esta misma configuración (servicios, Dockerfile, rewrite y variables sin valores).

## Cómo se mantiene: auto-deploy

```
git push origin main (merge de un PR)
 → Render detecta el commit
 → ¿cambió frontend/? → build del Static Site → publica dist/
 → ¿cambió backend/?  → build de Dockerfile.prod → migrate deploy → arranca
 → si algo falla       → sigue online la versión anterior
```

- Se deploya solo desde `main`: el trabajo se hace en ramas y entra por PR con review.
- **Cambiar el modelo:** `npx prisma migrate dev --name <descripcion>` en local, commitear la carpeta nueva de `prisma/migrations/` y mergear. Producción la aplica sola con `migrate deploy`; si la migración falla, no se deploya.
- Esto es CD (entrega continua). CI (que los tests corran en cada PR con GitHub Actions) queda fuera del alcance: hoy los tests se corren a mano antes de mergear.

## Verificación (Entrega 4)

| Prueba | Resultado esperado |
| :--- | :--- |
| Abrir la URL del back | `{"mensaje":"API SGI San José 🐳"}` (si tarda ~1 minuto, estaba dormida) |
| Abrir la URL del front | Inicio con los servicios reales de la base |
| Login con los tres roles | Cliente → Mi cuenta · Empleado → Agenda · Admin → Panel |
| Un CRUD completo | Ej. crear, editar y borrar un servicio como ADMIN |
| **F5 en una ruta interna** (`/agenda`, `/mi-cuenta`) | Sigue en la misma pantalla y con la sesión (no 404) |
| Escribir `/panel` siendo cliente | Acceso denegado |

## Qué falla y por qué

| Síntoma | Causa | Arreglo |
| :--- | :--- | :--- |
| Consola: fetch a `undefined/...` | `VITE_API_URL` no estaba al hacer el build | Cargarla en el Static Site y redeployar |
| 404 en todos los pedidos a la API | `VITE_API_URL` sin `/api` al final | `https://sgi-sanjose-api.onrender.com/api` |
| Consola: bloqueado por CORS | `FRONTEND_URL` sigue en localhost o tiene `/` al final | La URL exacta del front |
| Log: `Falta JWT_SECRET` | La variable no está en el panel | Agregarla con *Generate* |
| Log: `P1001 Can't reach database server` | URL de Neon mal pegada o la *pooled* | Copiarla de nuevo, la directa |
| Seed: `Cannot find module '.prisma/client/default'` | Falta generar el cliente de Prisma en el contenedor | `sh -c "npx prisma generate && npx prisma db seed"` |
| Seed: `getaddrinfo EAI_AGAIN` | La URL llegó cortada al comando | Guardarla en una variable con comillas simples y usar `"$NEON"` |
| 404 al hacer F5 en `/agenda` | Falta la regla de rewrite | `/*` → `/index.html` (Rewrite) |
| El build falla con un error de TypeScript | El `tsc` no perdona | Correr `npm run build` local y arreglarlo antes de mergear |
| Log: `SECURITY WARNING: The SSL modes...` | Aviso informativo de `pg` | No es error |
| El primer pedido tarda ~1 minuto | El back free se duerme sin tráfico | Abrir la URL del back unos minutos antes de usarla (warm-up) |
| Los recordatorios quedan *simulados* | No hay SMTP configurado, o se usó Gmail | Render free bloquea los puertos 25, 465 y 587: usar un proveedor con puerto **2525** (ej. Brevo: `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=2525`) |

## Deuda técnica conocida

| Hoy | Lo que haría un equipo real |
| :--- | :--- |
| Las migraciones corren al arrancar el contenedor | Un paso aparte del pipeline, antes de levantar la versión nueva |
| El seed se corre a mano desde una compu | Script versionado o un entorno de staging con datos propios |
| Token en `localStorage` | Cookie `httpOnly` + refresh token |
| Sin CI | Tests y lint en cada PR; el deploy no sale si fallan |
| Back free que se duerme | Instancia paga o un healthcheck que lo mantenga despierto |
