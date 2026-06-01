/*
  Warnings:

  - You are about to drop the column `isActive` on the `Level` table. All the data in the column will be lost.
  - Made the column `code` on table `Level` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_levelId_fkey";

-- DropIndex
DROP INDEX "Level_name_key";

-- DropIndex
DROP INDEX "Subject_name_key";

-- AlterTable
ALTER TABLE "Level" DROP COLUMN "isActive",
ALTER COLUMN "code" SET NOT NULL,
ALTER COLUMN "durasiMenit" DROP DEFAULT,
ALTER COLUMN "hargaJual" DROP DEFAULT,
ALTER COLUMN "potonganAdmin" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
