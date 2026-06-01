/*
  Warnings:

  - You are about to drop the `_StudentToTutor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_StudentToTutor" DROP CONSTRAINT "_StudentToTutor_A_fkey";

-- DropForeignKey
ALTER TABLE "_StudentToTutor" DROP CONSTRAINT "_StudentToTutor_B_fkey";

-- DropTable
DROP TABLE "_StudentToTutor";

-- CreateTable
CREATE TABLE "_TutorStudents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TutorStudents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TutorStudents_B_index" ON "_TutorStudents"("B");

-- AddForeignKey
ALTER TABLE "_TutorStudents" ADD CONSTRAINT "_TutorStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorStudents" ADD CONSTRAINT "_TutorStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
