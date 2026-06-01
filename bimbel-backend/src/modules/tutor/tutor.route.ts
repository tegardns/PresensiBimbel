import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware";
import { allowRoles } from "../../middlewares/role.middleware";

const router = Router();

router.get("/home", verifyToken, allowRoles("tutor"), (req, res) => {
  res.json({
    message: "Selamat datang Tutor",
  });
});

export default router;
