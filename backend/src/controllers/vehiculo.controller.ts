import { Request, Response } from "express";
import * as vehiculoService from "../services/vehiculo.service";

export async function getAll(req: Request, res: Response) {
  const { q } = req.query as { q?: string };
  res.json(await vehiculoService.findAll(q));
}

export async function getById(req: Request, res: Response) {
  const vehiculo = await vehiculoService.findById(Number(req.params.id));
  if (!vehiculo) {
    res.status(404).json({ error: "Vehículo no encontrado" });
    return;
  }
  res.json(vehiculo);
}

export async function create(req: Request, res: Response) {
  const nuevo = await vehiculoService.create(req.body, req.usuario!);
  res.status(201).json(nuevo);
}

export async function update(req: Request, res: Response) {
  const actualizado = await vehiculoService.update(Number(req.params.id), req.body);
  if (!actualizado) {
    res.status(404).json({ error: "Vehículo no encontrado" });
    return;
  }
  res.json(actualizado);
}

export async function registrarService(req: Request, res: Response) {
  const vehiculo = await vehiculoService.registrarService(Number(req.params.id), req.body.km);
  if (!vehiculo) {
    res.status(404).json({ error: "Vehículo no encontrado" });
    return;
  }
  res.json(vehiculo);
}

export async function remove(req: Request, res: Response) {
  const ok = await vehiculoService.remove(Number(req.params.id), req.usuario!);
  if (!ok) {
    res.status(404).json({ error: "Vehículo no encontrado" });
    return;
  }
  res.status(204).send();
}
