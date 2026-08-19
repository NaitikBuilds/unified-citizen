import { Router } from "express";
import {
  getSummary,
  getStatuses,
  getPriorities,
  getDepartments,
  getSlaCompliance,
  getTrend,
  getGeographic,
} from "../controllers/analytics.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { analyticsQuerySchema } from "../validations/analytics.validation.js";

const router = Router();

// All analytics routes require authentication and staff/admin role
router.use(authenticate);
router.use(requireRole(["OFFICER", "DEPARTMENT_ADMIN", "SUPER_ADMIN"]));

router.get("/summary", validate(analyticsQuerySchema), getSummary);
router.get(
  "/status-distribution",
  validate(analyticsQuerySchema),
  getStatuses,
);
router.get(
  "/priority-distribution",
  validate(analyticsQuerySchema),
  getPriorities,
);
router.get(
  "/department-performance",
  validate(analyticsQuerySchema),
  getDepartments,
);
router.get(
  "/sla-compliance",
  validate(analyticsQuerySchema),
  getSlaCompliance,
);
router.get("/monthly-trend", validate(analyticsQuerySchema), getTrend);
router.get("/geographic-data", validate(analyticsQuerySchema), getGeographic);

export default router;
