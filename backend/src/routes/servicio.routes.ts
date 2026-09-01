import { Router } from "express";
import * as servicioController from "../controllers/servicio.controller";
import { validate, validateParams } from "../middleware/validate.middleware";
import { servicioCreateSchema, servicioUpdateSchema, idParamSchema } from "../validations/servicio.validation";

const router = Router();

router.get("/", servicioController.getAll);
router.get("/:id", validateParams(idParamSchema), servicioController.getById);
router.post("/", validate(servicioCreateSchema), servicioController.create);
router.put("/:id", validateParams(idParamSchema), validate(servicioUpdateSchema), servicioController.update);
router.delete("/:id", validateParams(idParamSchema), servicioController.remove);

export default router;
