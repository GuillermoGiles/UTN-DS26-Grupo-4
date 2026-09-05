import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { registroSchema, loginSchema } from "../validations/auth.validation";

const router = Router();

router.post("/registro", validate(registroSchema), authController.registrar);
router.post("/login", validate(loginSchema), authController.login);
router.get("/yo", authenticate, authController.yo);

export default router;
