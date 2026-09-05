import { prisma } from "../src/config/prisma";
import bcrypt from "bcrypt";

const clientes = [
  { nombre: "Blasko Telechea", vehiculo: "Fiat Duna", patente: "FGH 452", telefono: "11-1234-5678" },
  { nombre: "Lautaro Diguilmi", vehiculo: "Toyota Corolla", patente: "XTZ 987", telefono: "11-9876-5432" },
  { nombre: "Federico Corbalan", vehiculo: "VW Gol", patente: "EF 456 GH", telefono: "11-4567-8901" },
];

const servicios = [
  { nombre: "Cambio de Aceite", precio: 45000, desc: "Servicio técnico completo con reemplazo de filtros esenciales.", tipo: "lubricentro" },
  { nombre: "Lavado Premium", precio: 12000, desc: "Limpieza artesanal profunda exterior e interior.", tipo: "lavadero" },
  { nombre: "Alineación y Balanceo", precio: 25000, desc: "Ajuste de tren delantero y balanceo computarizado.", tipo: "lubricentro" },
  { nombre: "Limpieza Tapizados", precio: 35000, desc: "Lavado en seco de butacas y alfombras con máquinas de inyección.", tipo: "lavadero" },
];

const usuarios = [
  { email: "admin@sanjose.test", nombre: "Administrador San José", rol: "ADMIN" as const, password: "AdminPassword123" },
  { email: "empleado@sanjose.test", nombre: "Operario Taller", rol: "EMPLEADO" as const, password: "EmpleadoPassword123" },
  { email: "cliente@sanjose.test", nombre: "Cliente Frecuente", rol: "CLIENTE" as const, password: "ClientePassword123" },
];

async function main() {
  // Clientes con upsert
  for (const c of clientes) {
    await prisma.cliente.upsert({
      where: { patente: c.patente },
      update: c,
      create: c,
    });
  }

  // Servicios
  for (const s of servicios) {
    const existing = await prisma.servicio.findFirst({ where: { nombre: s.nombre } });
    if (!existing) {
      await prisma.servicio.create({ data: s });
    }
  }

  const c1 = await prisma.cliente.findUnique({ where: { patente: "FGH 452" } });
  const c2 = await prisma.cliente.findUnique({ where: { patente: "XTZ 987" } });
  const c3 = await prisma.cliente.findUnique({ where: { patente: "EF 456 GH" } });

  const s1 = await prisma.servicio.findFirst({ where: { nombre: "Cambio de Aceite" } });
  const s2 = await prisma.servicio.findFirst({ where: { nombre: "Lavado Premium" } });
  const s3 = await prisma.servicio.findFirst({ where: { nombre: "Alineación y Balanceo" } });

  if (c1 && c2 && c3 && s1 && s2 && s3) {
    const turnosCount = await prisma.turno.count();
    if (turnosCount === 0) {
      await prisma.turno.createMany({
        data: [
          { fecha: "2026-08-20", hora: "09:00", clienteId: c1.id, servicioId: s1.id },
          { fecha: "2026-08-20", hora: "10:30", clienteId: c2.id, servicioId: s2.id },
          { fecha: "2026-08-21", hora: "14:00", clienteId: c3.id, servicioId: s3.id },
        ],
      });
    }
  }

  // Usuarios con contraseñas hasheadas y upsert (Clase 18)
  for (const { password, ...datos } of usuarios) {
    const hash = await bcrypt.hash(password, 10);
    await prisma.usuario.upsert({
      where: { email: datos.email },
      update: { nombre: datos.nombre, rol: datos.rol, passwordHash: hash },
      create: { ...datos, passwordHash: hash },
    });
  }

  console.log("Seed completado: clientes, servicios, turnos y usuarios por rol creados con contraseñas hasheadas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
