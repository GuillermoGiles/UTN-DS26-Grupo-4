import type { SignOptions } from "jsonwebtoken";

function obligatorio(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre} en el .env`);
  }
  return valor;
}

export const JWT_SECRET = obligatorio("JWT_SECRET");
// Vencimiento del token. Se lee de JWT_EXPIRES_IN (formato ms: "2h", "30m", "7d");
// si no está definida, 2 horas. Ver comentario en .env.example.
export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "2h") as SignOptions["expiresIn"];
export const SALT_ROUNDS = 10;
