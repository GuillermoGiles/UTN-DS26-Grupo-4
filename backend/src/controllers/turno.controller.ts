import { Request, Response } from "express";
import type { EstadoTurno } from "@prisma/client";
import * as turnoService from "../services/turno.service";

export async function getAll(req: Request, res: Response) {
  const { fecha, estado } = req.query as { fecha?: string; estado?: EstadoTurno };
  res.json(await turnoService.findAll({ fecha, estado }));
}

export async function getById(req: Request, res: Response) {
  const turno = await turnoService.findById(Number(req.params.id));
  if (!turno) {
    res.status(404).json({ error: "Turno no encontrado" });
    return;
  }
  res.json(turno);
}

export async function getDisponibles(req: Request, res: Response) {
  const { fecha } = req.query as { fecha: string };
  res.json(await turnoService.disponibles(fecha));
}

export async function getMios(req: Request, res: Response) {
  res.json(await turnoService.misTurnos(req.usuario!.id));
}

export async function create(req: Request, res: Response) {
  const nuevo = await turnoService.create(req.body, req.usuario!);
  res.status(201).json(nuevo);
}

export async function update(req: Request, res: Response) {
  const actualizado = await turnoService.update(Number(req.params.id), req.body);
  if (!actualizado) {
    res.status(404).json({ error: "Turno no encontrado" });
    return;
  }
  res.json(actualizado);
}

export async function cambiarEstado(req: Request, res: Response) {
  const turno = await turnoService.cambiarEstado(Number(req.params.id), req.body.estado);
  if (!turno) {
    res.status(404).json({ error: "Turno no encontrado" });
    return;
  }
  res.json(turno);
}

export async function cancelar(req: Request, res: Response) {
  const turno = await turnoService.cancelar(Number(req.params.id), req.usuario!);
  if (!turno) {
    res.status(404).json({ error: "Turno no encontrado" });
    return;
  }
  res.json(turno);
}

export async function remove(req: Request, res: Response) {
  const ok = await turnoService.remove(Number(req.params.id));
  if (!ok) {
    res.status(404).json({ error: "Turno no encontrado" });
    return;
  }
  res.status(204).send();
}
