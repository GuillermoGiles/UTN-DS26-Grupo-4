import { Rol } from "@prisma/client";

export {};

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        rol: Rol;
      };
    }
  }
}
