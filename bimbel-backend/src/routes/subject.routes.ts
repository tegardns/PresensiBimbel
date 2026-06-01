// PRIVATE_FIXED/bimbel-backend/src/routes/subject.routes.ts
import { Router } from "express";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  toggleSubjectStatus,
} from "../controllers/subject.controller";

const router = Router();

router.get("/", getSubjects);
router.post("/", createSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);
router.patch("/:id/status", toggleSubjectStatus);

export default router;