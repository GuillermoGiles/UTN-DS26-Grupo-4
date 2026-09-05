import { Request, Response } from "express";
import * as servicioService from "../services/servicio.service";

export async function getAll(req: Request, res: Response) {
  const tipo = typeof req.query.tipo === "string" ? req.query.tipo : undefined;
  const servicios = await servicioService.findAll(tipo);
  res.json(servicios);
}

export async function getById(req: Request, res: Response) {
  const servicio = await servicioService.findById(Number(req.params.id));
  if (!servicio) {
    res.status(404).json({ error: "Servicio no encontrado" });
    return;
  }
  res.json(servicio);
}

export async function create(req: Request, res: Response) {
  const nuevo = await servicioService.create(req.body);
  res.status(201).json(nuevo);
}

export async function update(req: Request, res: Response) {
  const actualizado = await servicioService.update(Number(req.params.id), req.body);
  if (!actualizado) {
    res.status(404).json({ error: "Servicio no encontrado" });
    return;
  }
  res.json(actualizado);
}

export async function remove(req: Request, res: Response) {
  const ok = await servicioService.remove(Number(req.params.id));
  if (!ok) {
    res.status(404).json({ error: "Servicio no encontrado" });
    return;
  }
  res.status(204).send();
}
