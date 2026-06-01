/*
  Warnings:

  - Made the column `kode` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "kode" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;
