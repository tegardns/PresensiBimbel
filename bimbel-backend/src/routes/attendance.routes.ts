// PRIVATE_FIXED/bimbel-backend/src/routes/attendance.routes.ts
import { Router } from "express";
import { getAttendances } from "../controllers/attendance.controller";

const router = Router();

router.get("/", getAttendances);

export default router;
