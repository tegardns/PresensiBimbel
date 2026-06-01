import { Router } from "express";
import {
  getTutors,
  createTutor,
  updateTutor,
  deleteTutor,
  toggleTutorStatus,
  getStudents,
} from "../controllers/tutor.controller";

const router = Router();

router.get("/", getTutors);
router.get("/students", getStudents); // 🔥 NEW
router.post("/", createTutor);
router.put("/:id", updateTutor);
router.delete("/:id", deleteTutor);
router.patch("/:id/status", toggleTutorStatus);

export default router;
