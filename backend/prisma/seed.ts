import { prisma } from "../src/config/prisma";

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

const turnos = [
  { fecha: "2026-08-20", hora: "09:00", cliente: "Blasko Telechea", tipoServicio: "Cambio de Aceite" },
  { fecha: "2026-08-20", hora: "10:30", cliente: "Lautaro Diguilmi", tipoServicio: "Lavado Premium" },
  { fecha: "2026-08-21", hora: "14:00", cliente: "Federico Corbalan", tipoServicio: "Alineación y Balanceo" },
];

async function main() {
  await prisma.cliente.createMany({ data: clientes });
  await prisma.servicio.createMany({ data: servicios });
  await prisma.turno.createMany({ data: turnos });
  console.log("Seed completado: clientes, servicios y turnos creados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
