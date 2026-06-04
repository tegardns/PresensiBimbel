
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import studentRoutes from "./routes/student.routes";
import tutorRoutes from "./routes/tutor.routes";
import levelRoutes from "./routes/level.routes";
import subjectRoutes from "./routes/subject.routes";
import attendanceRoutes from "./routes/attendance.routes";
import financeRoutes from "./routes/finance.routes";
import notificationRoutes from "./routes/notification.routes";
import adminRoute from "./modules/admin/admin.route";
import tutorRoute from "./modules/tutor/tutor.route";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/tutor", tutorRoute);
app.use("/api/students", studentRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/notifications", notificationRoutes);


app.listen(4000, () => {
  console.log("Server running on port 4000");
});

