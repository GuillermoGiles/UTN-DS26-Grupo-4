import { Request, Response } from "express";
import * as lavadoService from "../services/lavado.service";

export async function getAll(req: Request, res: Response) {
  const { fecha } = req.query as { fecha?: string };
  res.json(await lavadoService.findAll(fecha));
}

export async function getById(req: Request, res: Response) {
  const lavado = await lavadoService.findById(Number(req.params.id));
  if (!lavado) {
    res.status(404).json({ error: "Lavado no encontrado" });
    return;
  }
  res.json(lavado);
}

export async function create(req: Request, res: Response) {
  const nuevo = await lavadoService.create(req.body, req.usuario!.id);
  res.status(201).json(nuevo);
}

export async function update(req: Request, res: Response) {
  const actualizado = await lavadoService.update(Number(req.params.id), req.body);
  if (!actualizado) {
    res.status(404).json({ error: "Lavado no encontrado" });
    return;
  }
  res.json(actualizado);
}

export async function remove(req: Request, res: Response) {
  const ok = await lavadoService.remove(Number(req.params.id));
  if (!ok) {
    res.status(404).json({ error: "Lavado no encontrado" });
    return;
  }
  res.status(204).send();
}
