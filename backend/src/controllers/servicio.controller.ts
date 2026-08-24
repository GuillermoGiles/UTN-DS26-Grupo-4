import { Request, Response } from "express";
import * as servicioService from "../services/servicio.service";
import { asyncHandler } from "../middleware/asyncHandler";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const { tipo } = req.query;
  const filtro = tipo === undefined ? undefined : String(tipo);
  const servicios = await servicioService.findAll(filtro);
  res.json(servicios);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const servicio = await servicioService.findById(Number(req.params.id));
  if (!servicio) {
    res.status(404).json({ error: "Servicio no encontrado" });
    return;
  }
  res.json(servicio);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const nuevo = await servicioService.create(req.body);
  res.status(201).json(nuevo);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const actualizado = await servicioService.update(Number(req.params.id), req.body);
  if (!actualizado) {
    res.status(404).json({ error: "Servicio no encontrado" });
    return;
  }
  res.json(actualizado);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const ok = await servicioService.remove(Number(req.params.id));
  if (!ok) {
    res.status(404).json({ error: "Servicio no encontrado" });
    return;
  }
  res.status(204).send();
});
