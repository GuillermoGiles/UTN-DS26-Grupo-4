import { Request, Response } from "express";
import * as clienteService from "../services/cliente.service";

// El controller traduce HTTP <-> dominio y elige el status code.
// No busca ni guarda datos: eso es del service.

export function getAll(_req: Request, res: Response) {
  return res.json(clienteService.findAll());
}

export function getById(req: Request, res: Response) {
  const cliente = clienteService.findById(Number(req.params.id));
  if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
  return res.json(cliente);
}

export function create(req: Request, res: Response) {
  const nuevo = clienteService.create(req.body);
  return res.status(201).json(nuevo);
}

export function update(req: Request, res: Response) {
  const actualizado = clienteService.update(Number(req.params.id), req.body);
  if (!actualizado) return res.status(404).json({ error: "Cliente no encontrado" });
  return res.json(actualizado);
}

export function remove(req: Request, res: Response) {
  const eliminado = clienteService.remove(Number(req.params.id));
  if (!eliminado) return res.status(404).json({ error: "Cliente no encontrado" });
  return res.status(204).send();
}
