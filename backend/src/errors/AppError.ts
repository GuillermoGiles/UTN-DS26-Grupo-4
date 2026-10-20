/**
 * Error de negocio con su status HTTP. Los services lo lanzan cuando una regla
 * del dominio no se cumple (horario ocupado, vehículo de otro cliente, etc.) y el
 * errorHandler lo traduce a { error: mensaje } con ese status.
 * Estas reglas necesitan consultar la base, por eso no pueden vivir en Zod.
 */
export class AppError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}
