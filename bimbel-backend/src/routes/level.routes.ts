// PRIVATE_FIXED/bimbel-backend/src/routes/level.routes.ts
import { Router } from "express";
import { getLevels, updateLevel } from "../controllers/level.controller";

const router = Router();

router.get("/", getLevels);
router.put("/:id", updateLevel);

export default router;