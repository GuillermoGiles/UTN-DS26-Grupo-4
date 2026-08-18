import { Router } from "express";
import * as clienteController from "../controllers/cliente.controller";

const router = Router();

// Las rutas van RELATIVAS: el prefijo /api/clientes lo monta index.ts.
router.get("/", clienteController.getAll);
router.get("/:id", clienteController.getById);
router.post("/", clienteController.create);
router.put("/:id", clienteController.update);
router.delete("/:id", clienteController.remove);

export default router;
