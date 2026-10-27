import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

vi.mock("../config/prisma", () => ({
  prisma: {
    turno: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    cliente: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    vehiculo: {
      findUnique: vi.fn(),
      delete: vi.fn(),
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
    // Catálogo que "devuelve la base" para la regla de servicios del turno
    const CATALOGO = [
      { id: 2, nombre: "Cambio de aceite y filtro", precio: 35000, desc: "", tipo: "lubricentro" },
      { id: 3, nombre: "Alineación y Balanceo", precio: 25000, desc: "", tipo: "lubricentro" },
      { id: 5, nombre: "Lavado Básico", precio: 7000, desc: "", tipo: "lavadero" },
      { id: 6, nombre: "Lavado Premium", precio: 12000, desc: "", tipo: "lavadero" },
    ];
    beforeEach(() => {
      vi.mocked(prisma.servicio.findMany).mockImplementation((async (args: { where: { id: { in: number[] } } }) =>
        CATALOGO.filter((s) => args.where.id.in.includes(s.id))) as never);
      // El vehículo 4 es del cliente 1 (todas las reservas lo usan)
      vi.mocked(prisma.vehiculo.findUnique).mockResolvedValue({ id: 4, clienteId: 1 } as never);
    });

    it("Dado un cliente autenticado con datos válidos, Cuando solicita un turno por POST, Entonces responde 201 con el turno creado a nombre de su propia ficha", async () => {
      // Dado (Arrange): el usuario 3 (CLIENTE) tiene la ficha de cliente 1 con el vehículo 4
      const fichaPropia = {
        id: 1,
        nombre: "Carlos Gómez",
        telefono: "2215001122",
        email: "carlos@mail.test",
        dni: null,
        usuarioId: 3,
        createdAt: new Date("2026-09-01T10:00:00Z"),
      };
      const payloadTurno = {
        fecha: "2030-10-25",
        hora: "10:30",
        vehiculoId: 4,
        servicioIds: [2],
      };
      const turnoCreado = {
        id: 10,
        ...payloadTurno,
        clienteId: 1,
        estado: "PENDIENTE",
        nota: null,
        createdAt: new Date("2026-10-20T12:00:00Z"),
        cliente: fichaPropia,
        vehiculo: { id: 4, patente: "AA123BB", marca: "Ford", modelo: "Fiesta" },
        servicios: [{ turnoId: 10, servicioId: 2, servicio: CATALOGO[0] }],
      };
      vi.mocked(prisma.cliente.findUnique).mockResolvedValueOnce(fichaPropia);
      vi.mocked(prisma.vehiculo.findUnique).mockResolvedValueOnce({ id: 4, clienteId: 1 } as never);
      vi.mocked(prisma.turno.count).mockResolvedValueOnce(0); // horario libre
      vi.mocked(prisma.turno.create).mockResolvedValueOnce(turnoCreado as never);

      // Cuando (Act)
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send(payloadTurno);

      // Entonces (Assert)
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ id: 10, clienteId: 1, estado: "PENDIENTE" });
      const { servicioIds: _ids, ...resto } = payloadTurno;
      expect(prisma.turno.create).toHaveBeenCalledWith({
        data: { ...resto, clienteId: 1, servicios: { create: [{ servicioId: 2 }] } },
        include: {
          cliente: true,
          servicios: { include: { servicio: true }, orderBy: { servicioId: "asc" } },
          vehiculo: true,
        },
      });
    });

    it("Dado un cliente que manda el clienteId de otra persona, Cuando reserva, Entonces el turno queda igual a nombre de su propia ficha", async () => {
      // Dado
      vi.mocked(prisma.cliente.findUnique).mockResolvedValueOnce({ id: 1, usuarioId: 3 } as never);
      vi.mocked(prisma.turno.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.turno.create).mockResolvedValueOnce({ id: 11 } as never);

      // Cuando
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send({ fecha: "2030-10-25", hora: "11:00", servicioIds: [2], clienteId: 99, vehiculoId: 4 });

      // Entonces
      expect(res.status).toBe(201);
      expect(vi.mocked(prisma.turno.create).mock.calls[0][0].data.clienteId).toBe(1);
    });

    it("Dado un horario que ya está ocupado, Cuando un empleado intenta reservarlo, Entonces responde 409 y no crea el turno", async () => {
      // Dado
      vi.mocked(prisma.turno.count).mockResolvedValueOnce(1); // ya hay un turno en ese horario

      // Cuando
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenEmpleado}`)
        .send({ fecha: "2030-10-25", hora: "09:00", clienteId: 1, servicioIds: [2], vehiculoId: 4 });

      // Entonces
      expect(res.status).toBe(409);
      expect(res.body).toEqual({ error: "El horario 09:00 del 2030-10-25 ya está ocupado" });
      expect(prisma.turno.create).not.toHaveBeenCalled();
    });

    it("Dado un día que ya pasó, Cuando se intenta reservar, Entonces responde 400 y no crea el turno", async () => {
      // Cuando
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenEmpleado}`)
        .send({ fecha: "2020-01-15", hora: "10:00", clienteId: 1, servicioIds: [2], vehiculoId: 4 });

      // Entonces
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "No se pueden reservar turnos en un día u horario que ya pasó" });
      expect(prisma.turno.create).not.toHaveBeenCalled();
    });

    it("Dado un domingo, Cuando se intenta reservar, Entonces responde 400 porque el taller no atiende", async () => {
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenEmpleado}`)
        .send({ fecha: "2030-10-20", hora: "10:00", clienteId: 1, servicioIds: [2], vehiculoId: 4 }); // 20/10/2030 es domingo

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "El taller no atiende los domingos" });
    });

    it("Dado un cliente que elige un cambio de aceite, una alineación y un lavado, Cuando reserva, Entonces el turno se crea con los tres servicios", async () => {
      // Dado
      vi.mocked(prisma.cliente.findUnique).mockResolvedValueOnce({ id: 1, usuarioId: 3 } as never);
      vi.mocked(prisma.turno.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.turno.create).mockResolvedValueOnce({ id: 12 } as never);

      // Cuando
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send({ fecha: "2030-10-25", hora: "12:00", servicioIds: [2, 3, 5], vehiculoId: 4 });

      // Entonces
      expect(res.status).toBe(201);
      expect(vi.mocked(prisma.turno.create).mock.calls[0][0].data.servicios).toEqual({
        create: [{ servicioId: 2 }, { servicioId: 3 }, { servicioId: 5 }],
      });
    });

    it("Dado un cliente que elige Lavado Básico y Lavado Premium, Cuando reserva, Entonces responde 400 y no crea el turno", async () => {
      // Dado
      vi.mocked(prisma.cliente.findUnique).mockResolvedValueOnce({ id: 1, usuarioId: 3 } as never);

      // Cuando
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send({ fecha: "2030-10-25", hora: "12:00", servicioIds: [2, 5, 6], vehiculoId: 4 });

      // Entonces
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Solo se puede elegir un servicio de lavadero por turno");
      expect(prisma.turno.create).not.toHaveBeenCalled();
    });

    it("Dado un cliente que no elige vehículo, Cuando reserva, Entonces responde 400 y no crea el turno", async () => {
      // Cuando
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send({ fecha: "2030-10-25", hora: "12:00", servicioIds: [2] });

      // Entonces
      expect(res.status).toBe(400);
      expect(res.body.detalles).toContainEqual({ campo: "vehiculoId", mensaje: "Elegí el vehículo del turno" });
      expect(prisma.turno.create).not.toHaveBeenCalled();
    });

    it("Dado un servicio que no existe, Cuando se reserva, Entonces responde 400 y no crea el turno", async () => {
      // Dado
      vi.mocked(prisma.cliente.findUnique).mockResolvedValueOnce({ id: 1, usuarioId: 3 } as never);

      // Cuando
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send({ fecha: "2030-10-25", hora: "12:00", servicioIds: [2, 999], vehiculoId: 4 });

      // Entonces
      expect(res.status).toBe(400);
      expect(prisma.turno.create).not.toHaveBeenCalled();
    });

    it("Dado un cliente autenticado con un body sin horario, Cuando envía POST /api/turnos, Entonces responde 400 y no toca la DB", async () => {
      // Dado (Arrange)
      const turnoIncompleto = {
        fecha: "2030-10-25",
        hora: "   ",
        clienteId: 1,
        vehiculoId: 4,
        servicioIds: [2],
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

  describe("DELETE /api/vehiculos/:id - El cliente elimina un auto de Mis autos", () => {
    const autoDe = (usuarioId: number) => ({ id: 4, clienteId: 1, cliente: { id: 1, usuarioId } });

    it("Dado un auto propio sin turnos reservados, Cuando el cliente lo elimina, Entonces responde 204 y se borra", async () => {
      // Dado: el usuario 3 (tokenCliente) es el titular
      vi.mocked(prisma.vehiculo.findUnique).mockResolvedValueOnce(autoDe(3) as never);
      vi.mocked(prisma.turno.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.vehiculo.delete).mockResolvedValueOnce({ id: 4 } as never);

      // Cuando
      const res = await request(app).delete("/api/vehiculos/4").set("Authorization", `Bearer ${tokenCliente}`);

      // Entonces
      expect(res.status).toBe(204);
      expect(prisma.vehiculo.delete).toHaveBeenCalledWith({ where: { id: 4 } });
    });

    it("Dado un auto de otro cliente, Cuando el cliente intenta eliminarlo, Entonces responde 403 y no borra nada", async () => {
      // Dado: el titular es el usuario 99
      vi.mocked(prisma.vehiculo.findUnique).mockResolvedValueOnce(autoDe(99) as never);

      // Cuando
      const res = await request(app).delete("/api/vehiculos/4").set("Authorization", `Bearer ${tokenCliente}`);

      // Entonces
      expect(res.status).toBe(403);
      expect(prisma.vehiculo.delete).not.toHaveBeenCalled();
    });

    it("Dado un auto propio con un turno reservado, Cuando el cliente lo elimina, Entonces responde 409 y no borra nada", async () => {
      // Dado
      vi.mocked(prisma.vehiculo.findUnique).mockResolvedValueOnce(autoDe(3) as never);
      vi.mocked(prisma.turno.count).mockResolvedValueOnce(1);

      // Cuando
      const res = await request(app).delete("/api/vehiculos/4").set("Authorization", `Bearer ${tokenCliente}`);

      // Entonces
      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/turnos reservados/);
      expect(prisma.vehiculo.delete).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/clientes - Alta de cliente con su primer vehículo", () => {
    it("Dado un empleado con los datos de un cliente cuya patente está en minúsculas y con espacios, Cuando envía POST /api/clientes, Entonces crea cliente y vehículo juntos con la patente normalizada y responde 201", async () => {
      // Dado (Arrange)
      const nuevoCliente = {
        nombre: "María López",
        telefono: "2216112233",
        vehiculo: { patente: " ab 456-cd ", marca: "Peugeot", modelo: "208" },
      };
      const clientePersistido = {
        id: 5,
        nombre: "María López",
        telefono: "2216112233",
        email: null,
        usuarioId: null,
        createdAt: new Date("2026-10-20T12:00:00Z"),
        vehiculos: [{ id: 9, patente: "AB456CD", marca: "Peugeot", modelo: "208" }],
        _count: { turnos: 0 },
      };
      vi.mocked(prisma.cliente.create).mockResolvedValueOnce(clientePersistido as never);

      // Cuando (Act)
      const res = await request(app)
        .post("/api/clientes")
        .set("Authorization", `Bearer ${tokenEmpleado}`)
        .send(nuevoCliente);

      // Entonces (Assert)
      expect(res.status).toBe(201);
      expect(res.body.vehiculos[0].patente).toBe("AB456CD");
      const { data } = vi.mocked(prisma.cliente.create).mock.calls[0][0];
      expect(data).toMatchObject({
        nombre: "María López",
        telefono: "2216112233",
        vehiculos: { create: { patente: "AB456CD", marca: "Peugeot", modelo: "208", km: 0 } },
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
          telefono: "221-600-7788",
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
