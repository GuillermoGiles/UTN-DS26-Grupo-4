import type { SignOptions } from "jsonwebtoken";

function obligatorio(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre} en el .env`);
  }
  return valor;
}

export const JWT_SECRET = obligatorio("JWT_SECRET");
export const JWT_EXPIRES_IN: SignOptions["expiresIn"] = "2h";
export const SALT_ROUNDS = 10;
