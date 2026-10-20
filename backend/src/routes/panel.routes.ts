import { Router } from "express";
import * as panelController from "../controllers/panel.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Métricas del día (caja, agenda, service atrasado): solo ADMIN
router.get("/resumen", authenticate, authorize("ADMIN"), panelController.getResumen);

export default router;
