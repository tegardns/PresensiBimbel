// PRIVATE_FIXED/bimbel-backend/src/routes/finance.routes.ts
import { Router } from "express";
import { 
  getFinance, 
  processPayout, 
  sendWhatsAppPayout,
  deletePayout,
  bulkDeletePayouts,
  bulkProcessPayouts
} from "../controllers/finance.controller";

const router = Router();

router.get("/", getFinance);
router.post("/payout", processPayout);
router.post("/payout/bulk", bulkProcessPayouts);
router.post("/payout/bulk-delete", bulkDeletePayouts);
router.delete("/payout/:id", deletePayout);

router.post("/send-whatsapp", sendWhatsAppPayout);

export default router;