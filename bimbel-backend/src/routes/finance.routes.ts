// PRIVATE_FIXED/bimbel-backend/src/routes/finance.routes.ts
import { Router } from "express";
import { getFinance } from "../controllers/finance.controller";

const router = Router();

router.get("/", getFinance);

export default router;