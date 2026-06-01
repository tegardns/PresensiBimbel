/*
  Warnings:

  - A unique constraint covering the columns `[kode]` on the table `Tutor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kode` to the `Tutor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tutor" ADD COLUMN     "kode" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_StudentToTutor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StudentToTutor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_StudentToTutor_B_index" ON "_StudentToTutor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_kode_key" ON "Tutor"("kode");

-- AddForeignKey
ALTER TABLE "_StudentToTutor" ADD CONSTRAINT "_StudentToTutor_A_fkey" FOREIGN KEY ("A") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentToTutor" ADD CONSTRAINT "_StudentToTutor_B_fkey" FOREIGN KEY ("B") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
