import { Router } from "express";
import * as clienteController from "../controllers/cliente.controller";
import { validate, validateParams } from "../middleware/validate.middleware";
import { clienteCreateSchema, clienteUpdateSchema, idParamSchema } from "../validations/cliente.validation";

const router = Router();

router.get("/", clienteController.getAll);
router.get("/:id", validateParams(idParamSchema), clienteController.getById);
router.post("/", validate(clienteCreateSchema), clienteController.create);
router.put("/:id", validateParams(idParamSchema), validate(clienteUpdateSchema), clienteController.update);
router.delete("/:id", validateParams(idParamSchema), clienteController.remove);

export default router;
