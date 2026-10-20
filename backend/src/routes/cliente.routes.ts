import { Router } from "express";
import * as clienteController from "../controllers/cliente.controller";
import { validate, validateParams, validateQuery } from "../middleware/validate.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import {
  clienteCreateSchema,
  clienteUpdateSchema,
  clienteMioUpdateSchema,
  clienteQuerySchema,
  idParamSchema,
} from "../validations/cliente.validation";

const router = Router();

// Portal del cliente: su propia ficha (va antes de "/:id" para que "mio" no se tome como id)
router.get("/mio", authenticate, authorize("CLIENTE"), clienteController.getMio);
router.put("/mio", authenticate, authorize("CLIENTE"), validate(clienteMioUpdateSchema), clienteController.updateMio);

// Gestión operativa de clientes (ADMIN y EMPLEADO)
router.get("/", authenticate, authorize("ADMIN", "EMPLEADO"), validateQuery(clienteQuerySchema), clienteController.getAll);
router.get("/:id", authenticate, authorize("ADMIN", "EMPLEADO"), validateParams(idParamSchema), clienteController.getById);
router.post("/", authenticate, authorize("ADMIN", "EMPLEADO"), validate(clienteCreateSchema), clienteController.create);
router.put("/:id", authenticate, authorize("ADMIN", "EMPLEADO"), validateParams(idParamSchema), validate(clienteUpdateSchema), clienteController.update);

// Eliminación de clientes (exclusiva ADMIN)
router.delete("/:id", authenticate, authorize("ADMIN"), validateParams(idParamSchema), clienteController.remove);

export default router;
