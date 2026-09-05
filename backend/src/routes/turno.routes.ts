import { Router } from "express";
import * as turnoController from "../controllers/turno.controller";
import { validate, validateParams } from "../middleware/validate.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import {
  turnoCreateSchema,
  turnoUpdateSchema,
  idParamSchema,
} from "../validations/turno.validation";

const router = Router();

// Consulta de agenda operativa (ADMIN y EMPLEADO)
router.get("/", authenticate, authorize("ADMIN", "EMPLEADO"), turnoController.getAll);
router.get("/:id", authenticate, authorize("ADMIN", "EMPLEADO"), validateParams(idParamSchema), turnoController.getById);

// Reserva de turnos (ADMIN, EMPLEADO y CLIENTE)
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "EMPLEADO", "CLIENTE"),
  validate(turnoCreateSchema),
  turnoController.create
);

// Modificación y cancelación de turnos (ADMIN y EMPLEADO)
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "EMPLEADO"),
  validateParams(idParamSchema),
  validate(turnoUpdateSchema),
  turnoController.update
);
router.delete("/:id", authenticate, authorize("ADMIN", "EMPLEADO"), validateParams(idParamSchema), turnoController.remove);

export default router;

