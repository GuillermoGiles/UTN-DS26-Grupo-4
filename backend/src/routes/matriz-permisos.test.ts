import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

// Prisma de mentira: cualquier modelo y método es un vi.fn(). Ninguna fila de esta
// suite debería llegar a la base: todas cortan en authenticate / authorize.
vi.mock("../config/prisma", () => {
  const modelos = new Map<string, Record<string, unknown>>();
  const modelo = (nombre: string) => {
    if (!modelos.has(nombre)) {
      modelos.set(nombre, new Proxy({}, {
        get: (destino: Record<string, unknown>, metodo: string) =>
          (destino[metodo] ??= vi.fn()),
      }));
    }
    return modelos.get(nombre);
  };
  return { prisma: new Proxy({}, { get: (_t, nombre: string) => modelo(nombre) }) };
});

import app from "../app";
import { JWT_SECRET } from "../config/env";

type Rol = "CLIENTE" | "EMPLEADO" | "ADMIN";
type Metodo = "get" | "post" | "put" | "patch" | "delete";

const token = (rol: Rol) => jwt.sign({ id: 99, rol }, JWT_SECRET, { expiresIn: "1h" });

/**
 * Las filas de Documentación/05 - Diseño de API/Matriz_Permisos.md agregadas con
 * vehículos, lavados, usuarios, panel y los endpoints nuevos de turnos y clientes.
 * "prohibido": roles que tienen que recibir 403. Sin token, siempre 401.
 */
const matriz: { metodo: Metodo; ruta: string; prohibido: Rol[] }[] = [
  // Vehículos
  { metodo: "get", ruta: "/api/vehiculos", prohibido: ["CLIENTE"] },
  { metodo: "get", ruta: "/api/vehiculos/1", prohibido: ["CLIENTE"] },
  { metodo: "post", ruta: "/api/vehiculos", prohibido: [] },
  { metodo: "put", ruta: "/api/vehiculos/1", prohibido: ["CLIENTE"] },
  { metodo: "post", ruta: "/api/vehiculos/1/service", prohibido: ["CLIENTE"] },
  { metodo: "delete", ruta: "/api/vehiculos/1", prohibido: ["CLIENTE", "EMPLEADO"] },
  // Lavados
  { metodo: "get", ruta: "/api/lavados", prohibido: ["CLIENTE"] },
  { metodo: "get", ruta: "/api/lavados/1", prohibido: ["CLIENTE"] },
  { metodo: "post", ruta: "/api/lavados", prohibido: ["CLIENTE"] },
  { metodo: "put", ruta: "/api/lavados/1", prohibido: ["CLIENTE"] },
  { metodo: "delete", ruta: "/api/lavados/1", prohibido: ["CLIENTE", "EMPLEADO"] },
  // Usuarios (personal)
  { metodo: "get", ruta: "/api/usuarios", prohibido: ["CLIENTE", "EMPLEADO"] },
  { metodo: "get", ruta: "/api/usuarios/1", prohibido: ["CLIENTE", "EMPLEADO"] },
  { metodo: "post", ruta: "/api/usuarios", prohibido: ["CLIENTE", "EMPLEADO"] },
  { metodo: "put", ruta: "/api/usuarios/1", prohibido: ["CLIENTE", "EMPLEADO"] },
  { metodo: "delete", ruta: "/api/usuarios/1", prohibido: ["CLIENTE", "EMPLEADO"] },
  // Panel
  { metodo: "get", ruta: "/api/panel/resumen", prohibido: ["CLIENTE", "EMPLEADO"] },
  // Turnos: endpoints nuevos
  { metodo: "get", ruta: "/api/turnos/mios", prohibido: ["EMPLEADO", "ADMIN"] },
  { metodo: "patch", ruta: "/api/turnos/1/estado", prohibido: ["CLIENTE"] },
  { metodo: "patch", ruta: "/api/turnos/1/cancelar", prohibido: [] },
  // Clientes: portal del cliente
  { metodo: "get", ruta: "/api/clientes/mio", prohibido: ["EMPLEADO", "ADMIN"] },
  { metodo: "put", ruta: "/api/clientes/mio", prohibido: ["EMPLEADO", "ADMIN"] },
];

describe("Matriz de permisos (cada fila 401/403 es un test sin DB)", () => {
  beforeEach(() => vi.clearAllMocks());

  describe.each(matriz)("$metodo $ruta", ({ metodo, ruta, prohibido }) => {
    it("responde 401 sin token", async () => {
      const res = await request(app)[metodo](ruta).send({});
      expect(res.status).toBe(401);
    });

    it.each(prohibido.length ? prohibido : ["(ninguno)"])("responde 403 con rol %s", async (rol) => {
      if (rol === "(ninguno)") return; // todos los roles logueados pueden: no hay 403 que probar
      const res = await request(app)[metodo](ruta)
        .set("Authorization", `Bearer ${token(rol as Rol)}`)
        .send({});
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "No tenés permiso para esta operación" });
    });
  });
});

describe("GET /api/turnos/disponibles es público", () => {
  it("responde 400 sin fecha (valida antes de tocar la base)", async () => {
    const res = await request(app).get("/api/turnos/disponibles");
    expect(res.status).toBe(400);
    expect(res.body.detalles[0].campo).toBe("fecha");
  });
});
