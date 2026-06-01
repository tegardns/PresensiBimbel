// PRIVATE_FIXED/bimbel-backend/src/routes/attendance.routes.ts
import { Router } from "express";
import { 
  getAttendances, 
  approveAttendance, 
  declineAttendance, 
  updateAttendance,
  getAttendanceRekap 
} from "../controllers/attendance.controller";

const router = Router();

router.get("/", getAttendances);
router.get("/rekap", getAttendanceRekap);
router.put("/:id", updateAttendance);
router.post("/:id/approve", approveAttendance);
router.post("/:id/decline", declineAttendance);

export default router;
