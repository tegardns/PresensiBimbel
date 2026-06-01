import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware";
import { allowRoles } from "../../middlewares/role.middleware";
import {
  getTutorAccounts,
  getTutorsWithoutAccounts,
  createTutorAccount,
  updateTutorAccount,
  deleteTutorAccount,
  changeAdminPassword,
} from "./admin.controller";

const router = Router();

router.get("/dashboard", verifyToken, allowRoles("admin"), (req, res) => {
  res.json({ message: "Selamat datang Admin" });
});

router.get("/tutor-accounts", verifyToken, allowRoles("admin"), getTutorAccounts);
router.get("/tutors-without-accounts", verifyToken, allowRoles("admin"), getTutorsWithoutAccounts);
router.post("/tutor-accounts", verifyToken, allowRoles("admin"), createTutorAccount);
router.put("/tutor-accounts/:id", verifyToken, allowRoles("admin"), updateTutorAccount);
router.delete("/tutor-accounts/:id", verifyToken, allowRoles("admin"), deleteTutorAccount);
router.post("/change-password", verifyToken, allowRoles("admin"), changeAdminPassword);

export default router;
