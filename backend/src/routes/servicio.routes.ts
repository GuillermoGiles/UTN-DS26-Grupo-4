import { Router } from "express";
import * as servicioController from "../controllers/servicio.controller";
import { validate, validateParams } from "../middleware/validate.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { servicioCreateSchema, servicioUpdateSchema, idParamSchema } from "../validations/servicio.validation";
import { recetaSchema } from "../validations/insumo.validation";
import * as insumoController from "../controllers/insumo.controller";

const router = Router();

// Catálogo público
router.get("/", servicioController.getAll);
router.get("/:id", validateParams(idParamSchema), servicioController.getById);

// Gestión exclusiva para ADMIN
router.post("/", authenticate, authorize("ADMIN"), validate(servicioCreateSchema), servicioController.create);
router.put("/:id", authenticate, authorize("ADMIN"), validateParams(idParamSchema), validate(servicioUpdateSchema), servicioController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), validateParams(idParamSchema), servicioController.remove);

// Receta: qué insumos consume el servicio (se descuentan solos al completarlo)
router.put("/:id/insumos", authenticate, authorize("ADMIN"), validateParams(idParamSchema), validate(recetaSchema), insumoController.definirReceta);

export default router;

