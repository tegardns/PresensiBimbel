/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Level` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Level" ADD COLUMN     "code" TEXT,
ADD COLUMN     "durasiMenit" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "hargaJual" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "potonganAdmin" INTEGER NOT NULL DEFAULT 10;

-- CreateIndex
CREATE UNIQUE INDEX "Level_code_key" ON "Level"("code");
