/*
  Warnings:

  - A unique constraint covering the columns `[nik]` on the table `partners` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "partners_nik_key" ON "partners"("nik");
