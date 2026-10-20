import { Request, Response } from "express";
import * as correoService from "../services/correo.service";

export async function getAll(_req: Request, res: Response) {
  res.json(await correoService.listado());
}

export async function recordatorioDeTurno(req: Request, res: Response) {
  const correo = await correoService.recordatorioDeTurno(Number(req.params.id));
  if (!correo) {
    res.status(404).json({ error: "Turno no encontrado" });
    return;
  }
  res.status(201).json(correo);
}

export async function recordatoriosDeManana(_req: Request, res: Response) {
  res.json(await correoService.enviarRecordatoriosDeManana());
}
