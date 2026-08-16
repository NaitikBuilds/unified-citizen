import { Router } from "express";
import {
  updateMyProfile,
  getAllUsers,
  getUserById,
  updateUserRoleOrDept,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  updateProfileSchema,
  updateUserRoleOrDeptSchema,
  userIdParamSchema,
} from "../validations/user.validation.js";
import { paginationQuerySchema } from "../validations/pagination.validation.js";

const router = Router();

// Self profile route (GET /auth/me is the canonical profile endpoint)
router.patch("/me", authenticate, validate(updateProfileSchema), updateMyProfile);

// Admin-only user management routes
router.get(
  "/",
  authenticate,
  requireRole(["SUPER_ADMIN", "DEPARTMENT_ADMIN"]),
  validate(paginationQuerySchema),
  getAllUsers,
);

router.get(
  "/:id",
  authenticate,
  requireRole(["SUPER_ADMIN", "DEPARTMENT_ADMIN"]),
  validate(userIdParamSchema),
  getUserById,
);

router.patch(
  "/:id",
  authenticate,
  requireRole(["SUPER_ADMIN"]),
  validate(updateUserRoleOrDeptSchema),
  updateUserRoleOrDept,
);

export default router;
