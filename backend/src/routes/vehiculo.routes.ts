import { Router } from "express";
import * as vehiculoController from "../controllers/vehiculo.controller";
import { validate, validateParams, validateQuery } from "../middleware/validate.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import {
  vehiculoCreateSchema,
  vehiculoUpdateSchema,
  registrarServiceSchema,
  vehiculoQuerySchema,
  idParamSchema,
} from "../validations/vehiculo.validation";

const router = Router();

// Directorio de vehículos con el estado del service (ADMIN y EMPLEADO)
router.get("/", authenticate, authorize("ADMIN", "EMPLEADO"), validateQuery(vehiculoQuerySchema), vehiculoController.getAll);
router.get("/:id", authenticate, authorize("ADMIN", "EMPLEADO"), validateParams(idParamSchema), vehiculoController.getById);

// Alta: el personal indica el titular; un CLIENTE carga autos a su propio nombre
router.post("/", authenticate, authorize("ADMIN", "EMPLEADO", "CLIENTE"), validate(vehiculoCreateSchema), vehiculoController.create);

router.put("/:id", authenticate, authorize("ADMIN", "EMPLEADO"), validateParams(idParamSchema), validate(vehiculoUpdateSchema), vehiculoController.update);
router.post("/:id/service", authenticate, authorize("ADMIN", "EMPLEADO"), validateParams(idParamSchema), validate(registrarServiceSchema), vehiculoController.registrarService);

// CLIENTE: solo sus autos (lo verifica el service → 403 si es ajeno)
router.delete("/:id", authenticate, authorize("ADMIN", "CLIENTE"), validateParams(idParamSchema), vehiculoController.remove);

export default router;
