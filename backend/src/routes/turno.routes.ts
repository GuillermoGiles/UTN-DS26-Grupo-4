import { Router } from "express";
import * as turnoController from "../controllers/turno.controller";
import { validate, validateParams } from "../middleware/validate.middleware";
import {
  turnoCreateSchema,
  turnoUpdateSchema,
  idParamSchema,
} from "../validations/turno.validation";

const router = Router();

router.get("/", turnoController.getAll);
router.get("/:id", validateParams(idParamSchema), turnoController.getById);
router.post("/", validate(turnoCreateSchema), turnoController.create);
router.put(
  "/:id",
  validateParams(idParamSchema),
  validate(turnoUpdateSchema),
  turnoController.update
);
router.delete("/:id", validateParams(idParamSchema), turnoController.remove);

export default router;
