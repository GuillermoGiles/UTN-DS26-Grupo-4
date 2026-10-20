/*
  Vehículo como entidad propia, Lavado, estado del Turno y vínculo Usuario ↔ Cliente.

  La base ya tenía datos (C17: "contar cómo lo resolvieron"):
  - Antes de borrar Cliente.vehiculo / Cliente.patente, cada cliente pasa su auto a la
    tabla Vehiculo. La patente se normaliza (sin espacios ni guiones, en mayúsculas) y
    el texto "Marca Modelo" se parte en el primer espacio.
  - Los turnos existentes quedan PENDIENTE y se vinculan al vehículo de su cliente.
*/

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO');

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "usuarioId" INTEGER;

-- AlterTable
ALTER TABLE "Turno" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estado" "EstadoTurno" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "nota" TEXT,
ADD COLUMN     "vehiculoId" INTEGER;

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" SERIAL NOT NULL,
    "patente" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER,
    "km" INTEGER NOT NULL DEFAULT 0,
    "kmUltimoService" INTEGER,
    "fechaUltimoService" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" INTEGER NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lavado" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "precio" DOUBLE PRECISION NOT NULL,
    "observaciones" TEXT,
    "vehiculoId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,
    "empleadoId" INTEGER NOT NULL,

    CONSTRAINT "Lavado_pkey" PRIMARY KEY ("id")
);

-- MigrateData: el vehículo de cada cliente pasa a la tabla Vehiculo
INSERT INTO "Vehiculo" ("patente", "marca", "modelo", "clienteId")
SELECT
    UPPER(REPLACE(REPLACE("patente", ' ', ''), '-', '')),
    SPLIT_PART(TRIM("vehiculo"), ' ', 1),
    CASE
        WHEN POSITION(' ' IN TRIM("vehiculo")) > 0
            THEN TRIM(SUBSTRING(TRIM("vehiculo") FROM POSITION(' ' IN TRIM("vehiculo")) + 1))
        ELSE '-'
    END,
    "id"
FROM "Cliente"
ON CONFLICT DO NOTHING;

-- MigrateData: cada turno existente queda vinculado al vehículo de su cliente
UPDATE "Turno" t
SET "vehiculoId" = (
    SELECT v."id" FROM "Vehiculo" v WHERE v."clienteId" = t."clienteId" ORDER BY v."id" LIMIT 1
);

-- DropIndex
DROP INDEX "Cliente_patente_key";

-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "patente",
DROP COLUMN "vehiculo";

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_patente_key" ON "Vehiculo"("patente");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_usuarioId_key" ON "Cliente"("usuarioId");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lavado" ADD CONSTRAINT "Lavado_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lavado" ADD CONSTRAINT "Lavado_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lavado" ADD CONSTRAINT "Lavado_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
