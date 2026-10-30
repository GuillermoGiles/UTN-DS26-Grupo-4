import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { SALT_ROUNDS } from "../config/env";
import { AppError } from "../errors/AppError";
import type { UsuarioPublico } from "./auth.service";
import { esErrorDeRelacion } from "../utils/prismaErrors";
import type { UsuarioCreate, UsuarioUpdate } from "../validations/usuario.validation";

// Nunca se devuelve passwordHash
const selectPublico = {
  id: true,
  email: true,
  nombre: true,
  rol: true,
  createdAt: true,
} satisfies Prisma.UsuarioSelect;

export async function findAll(): Promise<UsuarioPublico[]> {
  return prisma.usuario.findMany({ select: selectPublico, orderBy: [{ rol: "asc" }, { nombre: "asc" }] });
}

export async function findById(id: number): Promise<UsuarioPublico | null> {
  return prisma.usuario.findUnique({ where: { id }, select: selectPublico });
}

export async function create(datos: UsuarioCreate): Promise<UsuarioPublico> {
  const { password, ...resto } = datos;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return prisma.usuario.create({ data: { ...resto, passwordHash }, select: selectPublico });
}

export async function update(id: number, datos: UsuarioUpdate, adminId: number): Promise<UsuarioPublico | null> {
  if (id === adminId && datos.rol && datos.rol !== "ADMIN") {
    throw new AppError(400, "No podés quitarte el rol de ADMIN a vos mismo");
  }
  const { password, ...resto } = datos;
  const data: Prisma.UsuarioUpdateInput = { ...resto };
  if (password) data.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    return await prisma.usuario.update({ where: { id }, data, select: selectPublico });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
    throw e;
  }
}

export async function remove(id: number, adminId: number): Promise<boolean> {
  if (id === adminId) throw new AppError(400, "No podés borrar tu propio usuario");
  try {
    await prisma.usuario.delete({ where: { id } });
    return true;
  } catch (e) {
    if (esErrorDeRelacion(e)) throw new AppError(409, "No se puede borrar: el usuario tiene lavados registrados");
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return false;
    throw e;
  }
}
