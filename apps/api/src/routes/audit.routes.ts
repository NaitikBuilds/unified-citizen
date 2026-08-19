import { Router } from 'express';
import { getAuditLogsByGrievance, listAuditLogs } from '../controllers/audit.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { getAuditLogsByGrievanceSchema, listAuditLogsSchema } from '../validations/audit.validation.js';

const router = Router();

// All audit reads require an authenticated session.
router.use(authenticate);

// Department-scoped / citizen-scoped collection (scoping is server-side,
// derived from the token — see services/audit.service.ts getAuditLogsForUser).
router.get(
  '/',
  requireRole(['CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']),
  validate(listAuditLogsSchema),
  listAuditLogs,
);

// Per-grievance audit logs (404 unknown grievance, 403 out of scope).
router.get(
  '/:grievanceId',
  requireRole(['CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']),
  validate(getAuditLogsByGrievanceSchema),
  getAuditLogsByGrievance,
);

export default router;
