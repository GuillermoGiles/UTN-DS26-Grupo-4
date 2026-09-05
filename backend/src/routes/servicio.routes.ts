import { Router } from "express";
import * as servicioController from "../controllers/servicio.controller";
import { validate, validateParams } from "../middleware/validate.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { servicioCreateSchema, servicioUpdateSchema, idParamSchema } from "../validations/servicio.validation";

const router = Router();

// Catálogo público
router.get("/", servicioController.getAll);
router.get("/:id", validateParams(idParamSchema), servicioController.getById);

// Gestión exclusiva para ADMIN
router.post("/", authenticate, authorize("ADMIN"), validate(servicioCreateSchema), servicioController.create);
router.put("/:id", authenticate, authorize("ADMIN"), validateParams(idParamSchema), validate(servicioUpdateSchema), servicioController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), validateParams(idParamSchema), servicioController.remove);

export default router;

