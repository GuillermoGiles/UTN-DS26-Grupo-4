import { prisma } from "../src/config/prisma";
import bcrypt from "bcrypt";
import { hoyAR, sumarDias } from "../src/utils/fechas";

// Seed idempotente: se puede correr varias veces (upsert por campos únicos).
// Los turnos y lavados se crean solo si la tabla está vacía, con fechas relativas
// a "hoy" para que la agenda y el panel tengan datos el día de la demo.

const usuarios = [
  { email: "admin@sanjose.test", nombre: "Administrador San José", rol: "ADMIN" as const, password: "AdminPassword123" },
  { email: "empleado@sanjose.test", nombre: "Operario Taller", rol: "EMPLEADO" as const, password: "EmpleadoPassword123" },
  { email: "cliente@sanjose.test", nombre: "Cliente Frecuente", rol: "CLIENTE" as const, password: "ClientePassword123" },
];

const clientes = [
  {
    nombre: "Blasko Telechea", dni: "28456921", telefono: "11-1234-5678", email: "blasko@mail.test",
    vehiculos: [{ patente: "FGH452", marca: "Fiat", modelo: "Duna", anio: 1998, km: 182_500, kmUltimoService: 171_000, mesesDesdeService: 8 }],
  },
  {
    nombre: "Lautaro Diguilmi", dni: "35111222", telefono: "11-9876-5432", email: "lautaro@mail.test",
    vehiculos: [{ patente: "XTZ987", marca: "Toyota", modelo: "Corolla", anio: 2015, km: 96_300, kmUltimoService: 87_000, mesesDesdeService: 4 }],
  },
  {
    nombre: "Federico Corbalan", dni: "40123456", telefono: "11-4567-8901", email: "federico@mail.test",
    vehiculos: [{ patente: "EF456GH", marca: "VW", modelo: "Gol", anio: 2021, km: 41_000, kmUltimoService: 38_000, mesesDesdeService: 2 }],
  },
  {
    // Ficha vinculada a la cuenta cliente@sanjose.test (portal del cliente)
    nombre: "Cliente Frecuente", dni: "32999888", telefono: "221-555-1234", email: "cliente@sanjose.test",
    vehiculos: [
      { patente: "AB123CD", marca: "Toyota", modelo: "Hilux 2.8 TDI", anio: 2021, km: 58_900, kmUltimoService: 50_000, mesesDesdeService: 5 },
      { patente: "AC987ZX", marca: "Ford", modelo: "Fiesta Kinetic", anio: 2018, km: 77_000, kmUltimoService: null, mesesDesdeService: null },
    ],
  },
];

const servicios = [
  { nombre: "Cambio de Aceite", precio: 45000, desc: "Servicio técnico completo con reemplazo de filtros esenciales.", tipo: "lubricentro" },
  { nombre: "Lavado Premium", precio: 12000, desc: "Limpieza artesanal profunda exterior e interior.", tipo: "lavadero" },
  { nombre: "Alineación y Balanceo", precio: 25000, desc: "Ajuste de tren delantero y balanceo computarizado.", tipo: "lubricentro" },
  { nombre: "Limpieza Tapizados", precio: 35000, desc: "Lavado en seco de butacas y alfombras con máquinas de inyección.", tipo: "lavadero" },
  { nombre: "Lavado Básico", precio: 7000, desc: "Lavado exterior con espuma activa, enjuague y secado.", tipo: "lavadero" },
];

function haceMeses(meses: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  return d;
}

async function main() {
  // 1. Usuarios (contraseñas hasheadas, Clase 18)
  const usuariosPorEmail = new Map<string, number>();
  for (const { password, ...datos } of usuarios) {
    const passwordHash = await bcrypt.hash(password, 10);
    const u = await prisma.usuario.upsert({
      where: { email: datos.email },
      update: { nombre: datos.nombre, rol: datos.rol, passwordHash },
      create: { ...datos, passwordHash },
    });
    usuariosPorEmail.set(u.email, u.id);
  }

  // 2. Clientes con sus vehículos (la ficha con el mismo email que una cuenta CLIENTE queda vinculada)
  for (const { vehiculos, ...c } of clientes) {
    const usuarioId = usuariosPorEmail.get(c.email) ?? null;
    // Se busca la ficha por email; si no, por la patente de su auto (una base que viene
    // de la migración de vehículos tiene los clientes viejos sin email).
    const existente =
      (await prisma.cliente.findUnique({ where: { email: c.email } })) ??
      (await prisma.vehiculo.findUnique({ where: { patente: vehiculos[0].patente }, include: { cliente: true } }))?.cliente ??
      null;
    const cliente = existente
      ? await prisma.cliente.update({ where: { id: existente.id }, data: { ...c, usuarioId } })
      : await prisma.cliente.create({ data: { ...c, usuarioId } });
    for (const { mesesDesdeService, ...v } of vehiculos) {
      const datos = {
        ...v,
        fechaUltimoService: mesesDesdeService !== null ? haceMeses(mesesDesdeService) : null,
        clienteId: cliente.id,
      };
      await prisma.vehiculo.upsert({ where: { patente: v.patente }, update: datos, create: datos });
    }
  }

  // 3. Servicios
  for (const s of servicios) {
    const existe = await prisma.servicio.findFirst({ where: { nombre: s.nombre } });
    if (!existe) await prisma.servicio.create({ data: s });
  }

  const servicio = async (nombre: string) => (await prisma.servicio.findFirstOrThrow({ where: { nombre } })).id;
  const vehiculo = async (patente: string) => prisma.vehiculo.findUniqueOrThrow({ where: { patente } });

  // 4. Turnos de ayer, hoy y mañana
  if ((await prisma.turno.count()) === 0) {
    const hoy = hoyAR();
    const plan = [
      { fecha: sumarDias(hoy, -1), hora: "09:00", patente: "FGH452", servicio: "Cambio de Aceite", estado: "COMPLETADO" as const },
      { fecha: sumarDias(hoy, -1), hora: "11:30", patente: "AB123CD", servicio: "Lavado Premium", estado: "COMPLETADO" as const },
      { fecha: hoy, hora: "09:00", patente: "XTZ987", servicio: "Alineación y Balanceo", estado: "EN_PROCESO" as const },
      { fecha: hoy, hora: "10:30", patente: "EF456GH", servicio: "Lavado Premium", estado: "CONFIRMADO" as const },
      { fecha: hoy, hora: "15:00", patente: "AB123CD", servicio: "Cambio de Aceite", estado: "PENDIENTE" as const },
      { fecha: sumarDias(hoy, 1), hora: "10:00", patente: "AC987ZX", servicio: "Limpieza Tapizados", estado: "PENDIENTE" as const },
    ];
    for (const t of plan) {
      const v = await vehiculo(t.patente);
      await prisma.turno.create({
        data: {
          fecha: t.fecha,
          hora: t.hora,
          estado: t.estado,
          clienteId: v.clienteId,
          vehiculoId: v.id,
          servicioId: await servicio(t.servicio),
        },
      });
    }
  }

  // 5. Lavados "en el momento" de hoy, registrados por el empleado
  if ((await prisma.lavado.count()) === 0) {
    const empleadoId = usuariosPorEmail.get("empleado@sanjose.test")!;
    const lavados = [
      { patente: "FGH452", servicio: "Lavado Básico", observaciones: "Llegó sin turno" },
      { patente: "XTZ987", servicio: "Lavado Premium", observaciones: null },
    ];
    for (const l of lavados) {
      const s = await prisma.servicio.findFirstOrThrow({ where: { nombre: l.servicio } });
      await prisma.lavado.create({
        data: {
          vehiculoId: (await vehiculo(l.patente)).id,
          servicioId: s.id,
          precio: s.precio,
          observaciones: l.observaciones,
          empleadoId,
        },
      });
    }
  }

  // 6. Insumos con sus recetas (lo que consume cada servicio) y su carga inicial
  const insumos = [
    { nombre: "Aceite sintético 5W-30", unidad: "litros", stock: 40, stockMinimo: 12 },
    { nombre: "Filtro de aceite", unidad: "unidades", stock: 6, stockMinimo: 5 },
    { nombre: "Filtro de aire", unidad: "unidades", stock: 3, stockMinimo: 4 },
    { nombre: "Shampoo para autos", unidad: "litros", stock: 18, stockMinimo: 5 },
    { nombre: "Cera líquida", unidad: "litros", stock: 6, stockMinimo: 2 },
  ];
  for (const i of insumos) {
    const existe = await prisma.insumo.findUnique({ where: { nombre: i.nombre } });
    if (!existe) {
      await prisma.insumo.create({ data: { ...i, movimientos: { create: { cantidad: i.stock, motivo: "Carga inicial" } } } });
    }
  }
  const insumo = async (nombre: string) => (await prisma.insumo.findUniqueOrThrow({ where: { nombre } })).id;
  const recetas: Record<string, [string, number][]> = {
    "Cambio de Aceite": [["Aceite sintético 5W-30", 4], ["Filtro de aceite", 1], ["Filtro de aire", 1]],
    "Lavado Premium": [["Shampoo para autos", 0.5], ["Cera líquida", 0.2]],
    "Lavado Básico": [["Shampoo para autos", 0.3]],
  };
  for (const [servicioNombre, items] of Object.entries(recetas)) {
    const servicioId = await servicio(servicioNombre);
    if ((await prisma.servicioInsumo.count({ where: { servicioId } })) > 0) continue;
    for (const [insumoNombre, cantidad] of items) {
      await prisma.servicioInsumo.create({ data: { servicioId, insumoId: await insumo(insumoNombre), cantidad } });
    }
  }

  console.log("Seed completado: usuarios por rol, clientes con vehículos, servicios, turnos, lavados e insumos.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
