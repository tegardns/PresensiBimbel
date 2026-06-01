-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "status" SET DEFAULT 'tertunda';

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
