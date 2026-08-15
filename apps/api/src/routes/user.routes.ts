import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
  updateUserRoleOrDept,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";

const router = Router();

// Self profile routes
router.get("/me", authenticate, getMyProfile);
router.patch("/me", authenticate, updateMyProfile);

// Admin-only user management routes
router.get(
  "/",
  authenticate,
  requireRole(["SUPER_ADMIN", "DEPARTMENT_ADMIN"]),
  getAllUsers,
);

router.get(
  "/:id",
  authenticate,
  requireRole(["SUPER_ADMIN", "DEPARTMENT_ADMIN"]),
  getUserById,
);

router.patch(
  "/:id",
  authenticate,
  requireRole(["SUPER_ADMIN"]),
  updateUserRoleOrDept,
);

export default router;
