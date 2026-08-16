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
import { validate } from "../middlewares/validate.middleware.js";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentIdParamSchema,
} from "../validations/department.validation.js";

const router = Router();

// Public / Authenticated retrieval routes
router.get("/", authenticate, getAllDepartments);
router.get("/:id", authenticate, getDepartmentById);

// Admin-only modification routes
router.post(
  "/",
  authenticate,
  requireRole(["SUPER_ADMIN"]),
  validate(createDepartmentSchema),
  createDepartment,
);
router.patch(
  "/:id",
  authenticate,
  requireRole(["SUPER_ADMIN"]),
  validate(updateDepartmentSchema),
  updateDepartment,
);
router.delete(
  "/:id",
  authenticate,
  requireRole(["SUPER_ADMIN"]),
  validate(departmentIdParamSchema),
  deleteDepartment,
);

export default router;
