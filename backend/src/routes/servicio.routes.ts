import { Router } from "express";
import * as servicioController from "../controllers/servicio.controller";

const router = Router();

// Las rutas van RELATIVAS: el prefijo /api/servicios lo monta index.ts.
router.get("/", servicioController.getAll);
router.get("/:id", servicioController.getById);
router.post("/", servicioController.create);
router.put("/:id", servicioController.update);
router.delete("/:id", servicioController.remove);

export default router;
