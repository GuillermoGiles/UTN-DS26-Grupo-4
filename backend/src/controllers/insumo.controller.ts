import { Request, Response } from "express";
import * as insumoService from "../services/insumo.service";

export async function getAll(_req: Request, res: Response) {
  res.json(await insumoService.findAll());
}

export async function getById(req: Request, res: Response) {
  const insumo = await insumoService.findById(Number(req.params.id));
  if (!insumo) {
    res.status(404).json({ error: "Insumo no encontrado" });
    return;
  }
  res.json(insumo);
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await insumoService.create(req.body));
}

export async function update(req: Request, res: Response) {
  const insumo = await insumoService.update(Number(req.params.id), req.body);
  if (!insumo) {
    res.status(404).json({ error: "Insumo no encontrado" });
    return;
  }
  res.json(insumo);
}

export async function ajustar(req: Request, res: Response) {
  const insumo = await insumoService.ajustar(Number(req.params.id), req.body.cantidad, req.body.motivo);
  if (!insumo) {
    res.status(404).json({ error: "Insumo no encontrado" });
    return;
  }
  res.json(insumo);
}

export async function remove(req: Request, res: Response) {
  const ok = await insumoService.remove(Number(req.params.id));
  if (!ok) {
    res.status(404).json({ error: "Insumo no encontrado" });
    return;
  }
  res.status(204).send();
}

export async function definirReceta(req: Request, res: Response) {
  const receta = await insumoService.definirReceta(Number(req.params.id), req.body.insumos);
  if (!receta) {
    res.status(404).json({ error: "Servicio no encontrado" });
    return;
  }
  res.json(receta);
}
