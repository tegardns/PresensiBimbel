// PRIVATE_FIXED/bimbel-backend/src/server.ts
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import studentRoutes from "./routes/student.routes";
import tutorRoutes from "./routes/tutor.routes";
import levelRoutes from "./routes/level.routes";
import subjectRoutes from "./routes/subject.routes";
import attendanceRoutes from "./routes/attendance.routes";
import financeRoutes from "./routes/finance.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/finance", financeRoutes);

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
