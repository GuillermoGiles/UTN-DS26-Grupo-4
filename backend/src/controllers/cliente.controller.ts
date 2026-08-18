import { Request, Response } from "express";
import * as clienteService from "../services/cliente.service";
import { asyncHandler } from "../middleware/asyncHandler";

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const clientes = await clienteService.findAll();
  res.json(clientes);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const cliente = await clienteService.findById(Number(req.params.id));
  if (!cliente) {
    res.status(404).json({ error: "Cliente no encontrado" });
    return;
  }
  res.json(cliente);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const nuevo = await clienteService.create(req.body);
  res.status(201).json(nuevo);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const actualizado = await clienteService.update(Number(req.params.id), req.body);
  if (!actualizado) {
    res.status(404).json({ error: "Cliente no encontrado" });
    return;
  }
  res.json(actualizado);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const ok = await clienteService.remove(Number(req.params.id));
  if (!ok) {
    res.status(404).json({ error: "Cliente no encontrado" });
    return;
  }
  res.status(204).send();
});
