import { Router } from "express";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";

const router = Router();

// Public / Authenticated retrieval routes
router.get("/", authenticate, getAllDepartments);
router.get("/:id", authenticate, getDepartmentById);

// Admin-only modification routes
router.post("/", authenticate, requireRole(["SUPER_ADMIN"]), createDepartment);
router.patch(
  "/:id",
  authenticate,
  requireRole(["SUPER_ADMIN"]),
  updateDepartment,
);
router.delete(
  "/:id",
  authenticate,
  requireRole(["SUPER_ADMIN"]),
  deleteDepartment,
);

export default router;
