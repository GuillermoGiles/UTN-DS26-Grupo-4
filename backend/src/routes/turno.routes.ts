import { Router } from "express";
import * as turnoController from "../controllers/turno.controller";

const router = Router();

// Las rutas van RELATIVAS: el prefijo /api/turnos lo monta index.ts.
router.get("/", turnoController.getAll);
router.get("/:id", turnoController.getById);
router.post("/", turnoController.create);
router.put("/:id", turnoController.update);
router.delete("/:id", turnoController.remove);

export default router;
