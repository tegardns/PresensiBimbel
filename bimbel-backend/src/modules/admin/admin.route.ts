import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware";
import { allowRoles } from "../../middlewares/role.middleware";

const router = Router();

router.get("/dashboard", verifyToken, allowRoles("admin"), (req, res) => {
  res.json({ message: "Selamat datang Admin" });
});

export default router;
