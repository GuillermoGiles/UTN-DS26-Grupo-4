import { Router } from "express";
import * as correoController from "../controllers/correo.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), correoController.getAll);
// Dispara a mano lo mismo que hace el programador automático cada hora
router.post("/recordatorios", authenticate, authorize("ADMIN", "EMPLEADO"), correoController.recordatoriosDeManana);

export default router;
