// ⚠️ NECESITA BASE DE DATOS ⚠️
// Le pega a PostgreSQL de verdad: necesita `docker compose up -d db` con las
// migraciones aplicadas y el seed cargado (usa al usuario cliente@sanjose.test).
// Crea un turno y lo borra al final. Para correr solo los tests sin DB: `npm run test:sin-db`.
import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import app from "../app";
import { prisma } from "../config/prisma";
import { esDomingo, hoyAR, sumarDias } from "../utils/fechas";

const creados: number[] = [];

afterAll(async () => {
  if (creados.length) await prisma.turno.deleteMany({ where: { id: { in: creados } } });
  await prisma.$disconnect();
});

describe("Reserva de turno de punta a punta (con DB)", () => {
  it("Dado un cliente logueado, Cuando reserva un horario libre, Entonces ese horario deja de figurar libre y un segundo intento da 409", async () => {
    // Dado: login real con el usuario del seed
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "cliente@sanjose.test", password: "ClientePassword123" });
    expect(login.status).toBe(200);
    const auth = { Authorization: `Bearer ${login.body.token}` };

    // Un día lejano para no chocar con los turnos del seed
    let fecha = sumarDias(hoyAR(), 60);
    if (esDomingo(fecha)) fecha = sumarDias(fecha, 1);
    const antes = await request(app).get(`/api/turnos/disponibles?fecha=${fecha}`);
    const hora = antes.body.libres[0];
    const servicio = await prisma.servicio.findFirstOrThrow();

    // Cuando
    const reserva = await request(app)
      .post("/api/turnos")
      .set(auth)
      .send({ fecha, hora, servicioIds: [servicio.id] });
    expect(reserva.status).toBe(201);
    creados.push(reserva.body.id);

    // Entonces
    expect(reserva.body.cliente.email).toBe("cliente@sanjose.test");
    const despues = await request(app).get(`/api/turnos/disponibles?fecha=${fecha}`);
    expect(despues.body.ocupados).toContain(hora);

    const repetida = await request(app)
      .post("/api/turnos")
      .set(auth)
      .send({ fecha, hora, servicioIds: [servicio.id] });
    expect(repetida.status).toBe(409);
  });
});
