import express from "express";
import { z } from "zod";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import servicioRoutes from "./routes/servicio.routes";
import clienteRoutes from "./routes/cliente.routes";
import turnoRoutes from "./routes/turno.routes";
import vehiculoRoutes from "./routes/vehiculo.routes";
import lavadoRoutes from "./routes/lavado.routes";
import usuarioRoutes from "./routes/usuario.routes";
import panelRoutes from "./routes/panel.routes";
import { errorHandler } from "./middleware/errorHandler";

// Arma la app de Express (middlewares, rutas y errorHandler) SIN escuchar en un puerto.
// La usan index.ts (para levantar el servidor) y los tests con supertest.
// Mensajes por defecto de Zod en español (ej. cuando falta un campo obligatorio)
z.config(z.locales.es());

const app = express();

// FRONTEND_URL admite varios orígenes separados por coma
// (ej. "http://localhost:5173,https://sgi-sanjose.vercel.app"). Nunca "*".
const origenesPermitidos = (process.env.FRONTEND_URL ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({ origin: origenesPermitidos }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ mensaje: "API SGI San José 🐳" });
});

app.use("/api/auth", authRoutes);
app.use("/api/servicios", servicioRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/turnos", turnoRoutes);
app.use("/api/vehiculos", vehiculoRoutes);
app.use("/api/lavados", lavadoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/panel", panelRoutes);

// Manejo de rutas inexistentes (404) para devolver JSON en lugar de HTML
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use(errorHandler);

export default app;
