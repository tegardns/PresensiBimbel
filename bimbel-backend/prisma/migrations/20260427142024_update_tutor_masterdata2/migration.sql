/*
  Warnings:

  - You are about to drop the column `bankAccount` on the `Tutor` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `Tutor` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Tutor` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Tutor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tutor" DROP CONSTRAINT "Tutor_userId_fkey";

-- AlterTable
ALTER TABLE "Tutor" DROP COLUMN "bankAccount",
DROP COLUMN "bankName",
DROP COLUMN "fullName",
DROP COLUMN "phone",
ADD COLUMN     "alamat" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "nama" TEXT,
ADD COLUMN     "namaBank" TEXT,
ADD COLUMN     "noRek" TEXT,
ADD COLUMN     "noWa" TEXT,
ADD COLUMN     "posisi" TEXT,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Tutor" ADD CONSTRAINT "Tutor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
