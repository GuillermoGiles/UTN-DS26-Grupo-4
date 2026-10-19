import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

vi.mock("../config/prisma", () => ({
  prisma: {
    turno: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    cliente: {
      create: vi.fn(),
    },
    servicio: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    usuario: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import app from "../app";
import { prisma } from "../config/prisma";
import { JWT_SECRET } from "../config/env";

const tokenCliente = jwt.sign({ id: 3, rol: "CLIENTE" }, JWT_SECRET, { expiresIn: "1h" });
const tokenEmpleado = jwt.sign({ id: 2, rol: "EMPLEADO" }, JWT_SECRET, { expiresIn: "1h" });
const tokenAdmin = jwt.sign({ id: 1, rol: "ADMIN" }, JWT_SECRET, { expiresIn: "1h" });

describe("Comportamiento específico (Dado / Cuando / Entonces)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/turnos - Reserva de turno", () => {
    it("Dado un cliente autenticado con datos válidos, Cuando solicita un turno por POST, Entonces responde 201 con el turno creado", async () => {
      // Dado (Arrange)
      const payloadTurno = {
        fecha: "2026-10-25",
        hora: "10:30",
        clienteId: 1,
        servicioId: 2,
      };
      const turnoCreado = {
        id: 10,
        ...payloadTurno,
        cliente: {
          id: 1,
          nombre: "Carlos Gómez",
          vehiculo: "Ford Fiesta",
          patente: "AA123BB",
          telefono: "2215001122",
        },
        servicio: {
          id: 2,
          nombre: "Cambio de aceite y filtro",
          precio: 35000,
          desc: "Aceite sintético 5W30",
          tipo: "lubricentro",
        },
      };
      vi.mocked(prisma.turno.create).mockResolvedValueOnce(turnoCreado);

      // Cuando (Act)
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send(payloadTurno);

      // Entonces (Assert)
      expect(res.status).toBe(201);
      expect(res.body).toEqual(turnoCreado);
      expect(prisma.turno.create).toHaveBeenCalledWith({
        data: payloadTurno,
        include: { cliente: true, servicio: true },
      });
    });

    it("Dado un cliente autenticado con un body sin horario, Cuando envía POST /api/turnos, Entonces responde 400 y no toca la DB", async () => {
      // Dado (Arrange)
      const turnoIncompleto = {
        fecha: "2026-10-25",
        hora: "   ",
        clienteId: 1,
        servicioId: 2,
      };

      // Cuando (Act)
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send(turnoIncompleto);

      // Entonces (Assert)
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Datos inválidos");
      expect(res.body.detalles).toContainEqual({
        campo: "hora",
        mensaje: "La hora es obligatoria",
      });
      expect(prisma.turno.create).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/clientes - Alta de cliente y normalización de patente", () => {
    it("Dado un empleado con los datos de un cliente cuya patente está en minúsculas, Cuando envía POST /api/clientes, Entonces la guarda en mayúsculas y responde 201", async () => {
      // Dado (Arrange)
      const nuevoCliente = {
        nombre: "María López",
        vehiculo: "Peugeot 208",
        patente: " ab456cd ",
        telefono: "2216112233",
      };
      const clientePersistido = {
        id: 5,
        nombre: "María López",
        vehiculo: "Peugeot 208",
        patente: "AB456CD",
        telefono: "2216112233",
      };
      vi.mocked(prisma.cliente.create).mockResolvedValueOnce(clientePersistido);

      // Cuando (Act)
      const res = await request(app)
        .post("/api/clientes")
        .set("Authorization", `Bearer ${tokenEmpleado}`)
        .send(nuevoCliente);

      // Entonces (Assert)
      expect(res.status).toBe(201);
      expect(res.body).toEqual(clientePersistido);
      expect(prisma.cliente.create).toHaveBeenCalledWith({
        data: {
          nombre: "María López",
          vehiculo: "Peugeot 208",
          patente: "AB456CD",
          telefono: "2216112233",
        },
      });
    });
  });

  describe("POST /api/servicios - Alta de servicio por ADMIN", () => {
    it("Dado un administrador con un servicio válido, Cuando envía POST /api/servicios, Entonces crea el servicio y responde 201", async () => {
      // Dado (Arrange)
      const nuevoServicio = {
        nombre: "Alineación y balanceo",
        precio: 22000,
        desc: "Control de tren delantero y balanceo de 4 ruedas",
        tipo: "lubricentro",
      };
      const servicioPersistido = { id: 8, ...nuevoServicio };
      vi.mocked(prisma.servicio.create).mockResolvedValueOnce(servicioPersistido);

      // Cuando (Act)
      const res = await request(app)
        .post("/api/servicios")
        .set("Authorization", `Bearer ${tokenAdmin}`)
        .send(nuevoServicio);

      // Entonces (Assert)
      expect(res.status).toBe(201);
      expect(res.body).toEqual(servicioPersistido);
      expect(prisma.servicio.create).toHaveBeenCalledWith({
        data: nuevoServicio,
      });
    });
  });

  describe("POST /api/auth/login y /api/auth/registro - Comportamiento de sesión", () => {
    it("Dado un usuario registrado, Cuando intenta loguearse con contraseña incorrecta, Entonces recibe 401 con el mismo mensaje genérico", async () => {
      // Dado (Arrange)
      const passwordHashReal = await bcrypt.hash("ClaveCorrecta123", 4);
      vi.mocked(prisma.usuario.findUnique).mockResolvedValueOnce({
        id: 3,
        email: "cliente@sanjose.test",
        nombre: "Cliente Frecuente",
        passwordHash: passwordHashReal,
        rol: "CLIENTE",
        createdAt: new Date("2026-09-01T10:00:00Z"),
      });

      // Cuando (Act)
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "cliente@sanjose.test", password: "ClaveIncorrecta999" });

      // Entonces (Assert)
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Credenciales inválidas" });
    });

    it("Dado un visitante con datos válidos, Cuando se registra en POST /api/auth/registro, Entonces responde 201 con rol CLIENTE y sin exponer passwordHash", async () => {
      // Dado (Arrange)
      vi.mocked(prisma.usuario.create).mockResolvedValueOnce({
        id: 9,
        nombre: "Lucía Fernández",
        email: "lucia@sanjose.test",
        rol: "CLIENTE",
        createdAt: new Date("2026-10-18T12:00:00Z"),
      } as never);

      // Cuando (Act)
      const res = await request(app)
        .post("/api/auth/registro")
        .send({
          nombre: "Lucía Fernández",
          email: "lucia@sanjose.test",
          password: "miPassword123",
        });

      // Entonces (Assert)
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: 9,
        nombre: "Lucía Fernández",
        email: "lucia@sanjose.test",
        rol: "CLIENTE",
      });
      expect(res.body).not.toHaveProperty("passwordHash");
    });
  });
});
