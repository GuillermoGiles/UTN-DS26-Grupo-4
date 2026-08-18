import { Request, Response } from "express";
import * as servicioService from "../services/servicio.service";

// El controller traduce HTTP <-> dominio y elige el status code.
// No busca ni guarda datos: eso es del service.

export function getAll(req: Request, res: Response) {
  const { tipo } = req.query;
  const filtro = tipo === undefined ? undefined : String(tipo);
  return res.json(servicioService.findAll(filtro));
}

export function getById(req: Request, res: Response) {
  const servicio = servicioService.findById(Number(req.params.id));
  if (!servicio) return res.status(404).json({ error: "Servicio no encontrado" });
  return res.json(servicio);
}

export function create(req: Request, res: Response) {
  const nuevo = servicioService.create(req.body);
  return res.status(201).json(nuevo);
}

export function update(req: Request, res: Response) {
  const actualizado = servicioService.update(Number(req.params.id), req.body);
  if (!actualizado) return res.status(404).json({ error: "Servicio no encontrado" });
  return res.json(actualizado);
}

export function remove(req: Request, res: Response) {
  const eliminado = servicioService.remove(Number(req.params.id));
  if (!eliminado) return res.status(404).json({ error: "Servicio no encontrado" });
  return res.status(204).send();
}
