import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";
import { validate, validateParams } from "../middleware/validate.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { usuarioCreateSchema, usuarioUpdateSchema, idParamSchema } from "../validations/usuario.validation";

const router = Router();

// Administración de cuentas: todo exclusivo ADMIN
router.use(authenticate, authorize("ADMIN"));

router.get("/", usuarioController.getAll);
router.get("/:id", validateParams(idParamSchema), usuarioController.getById);
router.post("/", validate(usuarioCreateSchema), usuarioController.create);
router.put("/:id", validateParams(idParamSchema), validate(usuarioUpdateSchema), usuarioController.update);
router.delete("/:id", validateParams(idParamSchema), usuarioController.remove);

export default router;
