// PRIVATE_FIXED/bimbel-backend/src/routes/attendance.routes.ts
import { Router } from "express";
import { 
  getAttendances, 
  approveAttendance, 
  declineAttendance, 
  updateAttendance,
  getAttendanceRekap,
  deleteAttendance,
  bulkDeleteAttendances
} from "../controllers/attendance.controller";

const router = Router();

router.get("/", getAttendances);
router.get("/rekap", getAttendanceRekap);
router.post("/bulk-delete", bulkDeleteAttendances);
router.put("/:id", updateAttendance);
router.delete("/:id", deleteAttendance);
router.post("/:id/approve", approveAttendance);
router.post("/:id/decline", declineAttendance);


export default router;
