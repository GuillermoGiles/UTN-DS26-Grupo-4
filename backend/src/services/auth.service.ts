import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { JWT_SECRET, JWT_EXPIRES_IN, SALT_ROUNDS } from "../config/env";
import { RegistroInput, LoginInput } from "../validations/auth.validation";
import { Rol } from "@prisma/client";

export interface UsuarioPublico {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;
  createdAt: Date;
}

export async function registrar(datos: RegistroInput): Promise<UsuarioPublico> {
  const hash = await bcrypt.hash(datos.password, SALT_ROUNDS);
  // La cuenta y la ficha de cliente se crean juntas (nested write: todo o nada).
  // Si el lubricentro ya lo tenía cargado con ese email, se vincula esa ficha
  // y el cliente ve su historial desde el primer login.
  const usuario = await prisma.usuario.create({
    data: {
      nombre: datos.nombre,
      email: datos.email,
      passwordHash: hash,
      rol: "CLIENTE", // el registro público nunca asigna otro rol
      cliente: {
        connectOrCreate: {
          where: { email: datos.email },
          create: { nombre: datos.nombre, email: datos.email, telefono: datos.telefono, dni: datos.dni },
        },
      },
    },
    select: {
      id: true,
      email: true,
      nombre: true,
      rol: true,
      createdAt: true,
    },
  });

  return usuario;
}

export async function login(datos: LoginInput): Promise<{ token: string; usuario: UsuarioPublico } | null> {
  const usuario = await prisma.usuario.findUnique({
    where: { email: datos.email },
  });

  if (!usuario) return null;

  const coincide = await bcrypt.compare(datos.password, usuario.passwordHash);
  if (!coincide) return null;

  const payload = { id: usuario.id, rol: usuario.rol };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    usuario: {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      createdAt: usuario.createdAt,
    },
  };
}

export async function findById(id: number): Promise<UsuarioPublico | null> {
  return prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nombre: true,
      rol: true,
      createdAt: true,
    },
  });
}
