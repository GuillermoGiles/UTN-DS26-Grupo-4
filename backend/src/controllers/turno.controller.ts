import { Request, Response } from "express";
import * as turnoService from "../services/turno.service";
import { asyncHandler } from "../middleware/asyncHandler";

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const turnos = await turnoService.findAll();
  res.json(turnos);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const turno = await turnoService.findById(Number(req.params.id));
  if (!turno) {
    res.status(404).json({ error: "Turno no encontrado" });
    return;
  }
  res.json(turno);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const nuevo = await turnoService.create(req.body);
  res.status(201).json(nuevo);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const actualizado = await turnoService.update(Number(req.params.id), req.body);
  if (!actualizado) {
    res.status(404).json({ error: "Turno no encontrado" });
    return;
  }
  res.json(actualizado);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const ok = await turnoService.remove(Number(req.params.id));
  if (!ok) {
    res.status(404).json({ error: "Turno no encontrado" });
    return;
  }
  res.status(204).send();
});
