/*
  Warnings:

  - You are about to drop the column `cliente` on the `Turno` table. All the data in the column will be lost.
  - You are about to drop the column `tipoServicio` on the `Turno` table. All the data in the column will be lost.
  - Added the required column `clienteId` to the `Turno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicioId` to the `Turno` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Turno" DROP COLUMN "cliente",
DROP COLUMN "tipoServicio",
ADD COLUMN     "clienteId" INTEGER NOT NULL,
ADD COLUMN     "servicioId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
