import { Router } from "express";
import * as lavadoController from "../controllers/lavado.controller";
import { validate, validateParams, validateQuery } from "../middleware/validate.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import {
  lavadoCreateSchema,
  lavadoUpdateSchema,
  lavadoQuerySchema,
  idParamSchema,
} from "../validations/lavado.validation";

const router = Router();

// Ingreso de vehículos al lavadero sin turno (ADMIN y EMPLEADO). ?fecha= filtra por día
router.get("/", authenticate, authorize("ADMIN", "EMPLEADO"), validateQuery(lavadoQuerySchema), lavadoController.getAll);
router.get("/:id", authenticate, authorize("ADMIN", "EMPLEADO"), validateParams(idParamSchema), lavadoController.getById);
router.post("/", authenticate, authorize("ADMIN", "EMPLEADO"), validate(lavadoCreateSchema), lavadoController.create);
router.put("/:id", authenticate, authorize("ADMIN", "EMPLEADO"), validateParams(idParamSchema), validate(lavadoUpdateSchema), lavadoController.update);

// Anular un lavado toca la caja: solo ADMIN
router.delete("/:id", authenticate, authorize("ADMIN"), validateParams(idParamSchema), lavadoController.remove);

export default router;
