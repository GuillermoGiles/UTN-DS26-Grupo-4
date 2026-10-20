import { Request, Response } from "express";
import * as panelService from "../services/panel.service";

export async function getResumen(_req: Request, res: Response) {
  res.json(await panelService.resumen());
}
