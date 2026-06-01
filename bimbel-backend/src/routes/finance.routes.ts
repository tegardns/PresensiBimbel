// PRIVATE_FIXED/bimbel-backend/src/routes/finance.routes.ts
import { Router } from "express";
import { getFinance, processPayout } from "../controllers/finance.controller";

const router = Router();

router.get("/", getFinance);
router.post("/payout", processPayout);

export default router;