import { Request, Response } from "express";
import * as turnoService from "../services/turno.service";

export async function getAll(_req: Request, res: Response) {
  const turnos = await turnoService.findAll();
  res.json(turnos);
}

export async function getById(req: Request, res: Response) {
  const turno = await turnoService.findById(Number(req.params.id));
  if (!turno) {
    res.status(404).json({ error: "Turno no encontrado" });
    return;
  }
  res.json(turno);
}

export async function create(req: Request, res: Response) {
  const nuevo = await turnoService.create(req.body);
  res.status(201).json(nuevo);
}

export async function update(req: Request, res: Response) {
  const actualizado = await turnoService.update(Number(req.params.id), req.body);
  res.json(actualizado);
}

export async function remove(req: Request, res: Response) {
  await turnoService.remove(Number(req.params.id));
  res.status(204).send();
}
