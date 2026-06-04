import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import {
  getNotifications,
  sendNotification,
  registerToken,
  getDeviceStats,
} from "../controllers/notification.controller";

const router = Router();

// Endpoint Admin
router.get("/", verifyToken, allowRoles("admin"), getNotifications);
router.post("/send", verifyToken, allowRoles("admin"), sendNotification);
router.get("/devices", verifyToken, allowRoles("admin"), getDeviceStats);

// Endpoint Tutor
router.post("/register-token", verifyToken, registerToken);

export default router;
