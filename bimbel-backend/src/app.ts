// PRIVATE_FIXED/bimbel-backend/src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import prisma from "./config/prisma";

import authRoute from "./modules/auth/auth.route";
import adminRoute from "./modules/admin/admin.route";
import tutorRoute from "./modules/tutor/tutor.route";
import studentRoutes from "./routes/student.routes";
import subjectRoutes from "./routes/subject.routes";
import levelRoutes from "./routes/level.routes";
import attendanceRoutes from "./routes/attendance.routes";
import financeRoutes from "./routes/finance.routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/db-test", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.use("/api/auth", authRoute);

app.use("/api/admin", adminRoute);
app.use("/api/tutor", tutorRoute);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/finance", financeRoutes);

export default app;
