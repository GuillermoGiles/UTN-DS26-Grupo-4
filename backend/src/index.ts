import express from "express";
import servicioRoutes from "./routes/servicio.routes";
import clienteRoutes from "./routes/cliente.routes";
import turnoRoutes from "./routes/turno.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ mensaje: "API SGI San José 🐳" });
});

app.use("/api/servicios", servicioRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/turnos", turnoRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
