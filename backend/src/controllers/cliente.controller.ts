import { Request, Response } from "express";
import * as clienteService from "../services/cliente.service";

export async function getAll(_req: Request, res: Response) {
  const clientes = await clienteService.findAll();
  res.json(clientes);
}

export async function getById(req: Request, res: Response) {
  const cliente = await clienteService.findById(Number(req.params.id));
  if (!cliente) {
    res.status(404).json({ error: "Cliente no encontrado" });
    return;
  }
  res.json(cliente);
}

export async function create(req: Request, res: Response) {
  const nuevo = await clienteService.create(req.body);
  res.status(201).json(nuevo);
}

export async function update(req: Request, res: Response) {
  const actualizado = await clienteService.update(Number(req.params.id), req.body);
  if (!actualizado) {
    res.status(404).json({ error: "Cliente no encontrado" });
    return;
  }
  res.json(actualizado);
}

export async function remove(req: Request, res: Response) {
  const ok = await clienteService.remove(Number(req.params.id));
  if (!ok) {
    res.status(404).json({ error: "Cliente no encontrado" });
    return;
  }
  res.status(204).send();
}
