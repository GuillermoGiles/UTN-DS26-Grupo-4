import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import servicioRoutes from "./routes/servicio.routes";
import clienteRoutes from "./routes/cliente.routes";
import turnoRoutes from "./routes/turno.routes";
import { errorHandler } from "./middleware/errorHandler";

// Arma la app de Express (middlewares, rutas y errorHandler) SIN escuchar en un puerto.
// La usan index.ts (para levantar el servidor) y los tests con supertest.
const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL ?? "http://localhost:5173"]
}));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ mensaje: "API SGI San José 🐳" });
});

app.use("/api/auth", authRoutes);
app.use("/api/servicios", servicioRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/turnos", turnoRoutes);

// Manejo de rutas inexistentes (404) para devolver JSON en lugar de HTML
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use(errorHandler);

export default app;
