import { Request, Response } from "express";
import * as usuarioService from "../services/usuario.service";

export async function getAll(_req: Request, res: Response) {
  res.json(await usuarioService.findAll());
}

export async function getById(req: Request, res: Response) {
  const usuario = await usuarioService.findById(Number(req.params.id));
  if (!usuario) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  res.json(usuario);
}

export async function create(req: Request, res: Response) {
  const nuevo = await usuarioService.create(req.body);
  res.status(201).json(nuevo);
}

export async function update(req: Request, res: Response) {
  const actualizado = await usuarioService.update(Number(req.params.id), req.body, req.usuario!.id);
  if (!actualizado) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  res.json(actualizado);
}

export async function remove(req: Request, res: Response) {
  const ok = await usuarioService.remove(Number(req.params.id), req.usuario!.id);
  if (!ok) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  res.status(204).send();
}
