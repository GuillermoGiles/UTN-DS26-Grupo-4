# Deploy — Render (API + PostgreSQL) y Vercel (frontend)

```
Navegador ──► Vercel (React, estático) ──fetch──► Render (Express) ──► Render PostgreSQL
                VITE_API_URL ─────────────────────▲      FRONTEND_URL (CORS) ──► URL de Vercel
```

Las dos URLs se apuntan entre sí, por eso el orden es: **1)** backend, **2)** frontend con la URL del backend, **3)** volver al backend y cargar la URL del frontend.

## 1. Backend y base en Render

1. Entrar a [render.com](https://render.com) con la cuenta de GitHub que tiene acceso al repo.
2. **New → Blueprint** y elegir `UTN-DS26-Grupo-4`. Render lee `render.yaml` de la raíz y propone crear:
   - `sgi-sanjose-db`: PostgreSQL (plan free).
   - `sgi-sanjose-api`: servicio web Docker con `backend/Dockerfile`.
3. Pide el valor de `FRONTEND_URL`. Por ahora poner `http://localhost:5173` (se corrige en el paso 3).
4. **Apply**. El primer deploy tarda unos minutos. Al arrancar, el contenedor corre
   `npm run start:render`: `prisma generate → prisma migrate deploy → prisma db seed → tsx src/index.ts`.
5. Probar: abrir `https://sgi-sanjose-api.onrender.com/` → `{"mensaje":"API SGI San José 🐳"}`.
   Y `.../api/servicios` → el catálogo del seed.

Qué configura el blueprint solo:
- `DATABASE_URL` sale de la base (`fromDatabase`), no hay que copiarla.
- `JWT_SECRET` lo genera Render (`generateValue`): una cadena aleatoria, nunca `cambiame`.
- `JWT_EXPIRES_IN=8h`, `NODE_ENV=production`.
- Solo redeploya cuando cambia algo dentro de `backend/`.

> Plan free: el servicio se duerme tras unos minutos sin uso y el primer pedido tarda ~1 minuto en despertarlo.
> **Antes de la exposición, abrir la URL de la API un rato antes.** La base free de Render vence a los 30 días: si se recrea, el seed vuelve a cargar los datos de demo.

## 2. Frontend en Vercel

1. Entrar a [vercel.com](https://vercel.com) con GitHub → **Add New → Project** → importar el repo.
2. **Root Directory: `frontend`** (importante: si no, Vercel busca el `package.json` en la raíz).
3. Framework: Vite (lo detecta solo; `frontend/vercel.json` ya define build y salida).
4. **Environment Variables:** `VITE_API_URL` = `https://sgi-sanjose-api.onrender.com/api` (la URL del paso 1, con `/api` al final).
5. **Deploy.** Queda en algo como `https://utn-ds26-grupo-4.vercel.app`.

`vercel.json` reescribe todas las rutas a `index.html`: así un F5 en `/agenda` o `/mi-cuenta` no da 404 (las rutas las resuelve React Router, no el servidor).

> `VITE_API_URL` se lee **al compilar**. Si se cambia, hay que hacer **Redeploy** en Vercel para que tome el valor nuevo.

## 3. Cerrar el círculo (CORS)

En Render → `sgi-sanjose-api` → **Environment** → `FRONTEND_URL` = la URL de Vercel. Se pueden poner varias separadas por coma:

```
https://utn-ds26-grupo-4.vercel.app,http://localhost:5173
```

Guardar: Render reinicia el servicio solo.

## 3 bis. Recordatorios por e-mail (opcional)

Sin configuración, los recordatorios quedan registrados como *simulados* (se ven en la pantalla Correos).
Para que lleguen de verdad con Gmail:

1. En la cuenta de Gmail del taller: activar la **verificación en 2 pasos** y crear una **contraseña de aplicación**.
2. En Render → `sgi-sanjose-api` → **Environment**: completar `SMTP_USER` (el Gmail) y `SMTP_PASS` (la contraseña de aplicación). `SMTP_HOST` y `SMTP_PORT` ya vienen del blueprint.
3. Guardar. En **Correos** desaparece el aviso de "no configurado".

> En el plan free el servicio se duerme: los recordatorios automáticos solo salen mientras está despierto. Para la demo alcanza con el botón "Enviar los de mañana".

## 4. Verificación (Entrega 4)

| Prueba | Esperado |
| :--- | :--- |
| Abrir la URL de Vercel | Inicio con los servicios reales del seed |
| Login `admin@sanjose.test` | Cae en `/panel` con la caja del día |
| F5 en `/panel` | Sigue logueado (rehidratación con `/auth/yo`) |
| Crear cuenta nueva y reservar un turno | Aparece en Mi cuenta y en la agenda del empleado |
| Escribir `/usuarios` logueado como cliente | `/sin-permiso` |
| Completar un cambio de aceite en la agenda | En Insumos baja el aceite y aparece la alerta del filtro |
| En la consola del navegador | Sin errores de CORS |

Si aparece **"blocked by CORS policy"**: `FRONTEND_URL` no coincide exacto con la URL de Vercel (sin `/` al final, con `https`).
Si el login da **"Failed to fetch"**: `VITE_API_URL` está mal o la API está dormida (abrirla primero).

## Alternativa sin Blueprint

En Render se puede crear a mano: **New → PostgreSQL**, después **New → Web Service** (Docker), Dockerfile `backend/Dockerfile`, contexto `backend`, *Docker Command* `npm run start:render` (el mismo de `render.yaml`), y las mismas variables.
