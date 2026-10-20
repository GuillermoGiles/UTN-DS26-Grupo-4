import { Router } from "express";
import * as turnoController from "../controllers/turno.controller";
import { validate, validateParams, validateQuery } from "../middleware/validate.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import {
  turnoCreateSchema,
  turnoUpdateSchema,
  turnoEstadoSchema,
  turnoQuerySchema,
  disponiblesQuerySchema,
  idParamSchema,
} from "../validations/turno.validation";

const router = Router();

// Horarios libres de un día: público, para que cualquiera vea cuándo hay lugar.
// (Va antes de "/:id" para que "disponibles" no se tome como id.)
router.get("/disponibles", validateQuery(disponiblesQuerySchema), turnoController.getDisponibles);

// Turnos del cliente logueado
router.get("/mios", authenticate, authorize("CLIENTE"), turnoController.getMios);

// Consulta de agenda operativa (ADMIN y EMPLEADO), filtrable por ?fecha= y ?estado=
router.get("/", authenticate, authorize("ADMIN", "EMPLEADO"), validateQuery(turnoQuerySchema), turnoController.getAll);
router.get("/:id", authenticate, authorize("ADMIN", "EMPLEADO"), validateParams(idParamSchema), turnoController.getById);

// Reserva de turnos (ADMIN, EMPLEADO y CLIENTE)
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "EMPLEADO", "CLIENTE"),
  validate(turnoCreateSchema),
  turnoController.create
);

// Modificación y cambio de estado (ADMIN y EMPLEADO)
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "EMPLEADO"),
  validateParams(idParamSchema),
  validate(turnoUpdateSchema),
  turnoController.update
);
router.patch(
  "/:id/estado",
  authenticate,
  authorize("ADMIN", "EMPLEADO"),
  validateParams(idParamSchema),
  validate(turnoEstadoSchema),
  turnoController.cambiarEstado
);

// Cancelación: el personal cualquiera; el CLIENTE solo los suyos (lo verifica el service)
router.patch(
  "/:id/cancelar",
  authenticate,
  authorize("ADMIN", "EMPLEADO", "CLIENTE"),
  validateParams(idParamSchema),
  turnoController.cancelar
);

router.delete("/:id", authenticate, authorize("ADMIN", "EMPLEADO"), validateParams(idParamSchema), turnoController.remove);

export default router;
