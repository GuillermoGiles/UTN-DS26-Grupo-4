import { Router } from "express";
import * as insumoController from "../controllers/insumo.controller";
import { validate, validateParams } from "../middleware/validate.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { insumoCreateSchema, insumoUpdateSchema, movimientoSchema, idParamSchema } from "../validations/insumo.validation";

const router = Router();

// El personal consulta el stock; el ADMIN lo administra
router.get("/", authenticate, authorize("ADMIN", "EMPLEADO"), insumoController.getAll);
router.get("/:id", authenticate, authorize("ADMIN", "EMPLEADO"), validateParams(idParamSchema), insumoController.getById);
router.post("/", authenticate, authorize("ADMIN"), validate(insumoCreateSchema), insumoController.create);
router.put("/:id", authenticate, authorize("ADMIN"), validateParams(idParamSchema), validate(insumoUpdateSchema), insumoController.update);
router.post("/:id/movimientos", authenticate, authorize("ADMIN"), validateParams(idParamSchema), validate(movimientoSchema), insumoController.ajustar);
router.delete("/:id", authenticate, authorize("ADMIN"), validateParams(idParamSchema), insumoController.remove);

export default router;
