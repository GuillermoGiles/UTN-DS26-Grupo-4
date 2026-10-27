-- Un turno puede incluir varios servicios: Turno.servicioId pasa a la tabla intermedia TurnoServicio.
-- La base ya tenía turnos: primero se copian a TurnoServicio y recién después se borra la columna,
-- así ningún turno pierde su servicio.

-- CreateTable
CREATE TABLE "TurnoServicio" (
    "turnoId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,

    CONSTRAINT "TurnoServicio_pkey" PRIMARY KEY ("turnoId","servicioId")
);

-- Migración de datos: cada turno existente conserva su servicio
INSERT INTO "TurnoServicio" ("turnoId", "servicioId")
SELECT "id", "servicioId" FROM "Turno";

-- AddForeignKey
ALTER TABLE "TurnoServicio" ADD CONSTRAINT "TurnoServicio_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoServicio" ADD CONSTRAINT "TurnoServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Turno" DROP CONSTRAINT "Turno_servicioId_fkey";

-- AlterTable
ALTER TABLE "Turno" DROP COLUMN "servicioId";
