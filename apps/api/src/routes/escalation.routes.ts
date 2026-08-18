import { Router } from 'express';
import { getEscalationsByGrievance, listEscalations } from '../controllers/escalation.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { getEscalationsByGrievanceSchema, listEscalationsSchema } from '../validations/escalation.validation.js';

const router = Router();

// All escalation reads require an authenticated session.
router.use(authenticate);

// Department-scoped / citizen-scoped collection (scoping is server-side,
// derived from the token — see services/escalation.service.ts getEscalationsForUser).
router.get(
  '/',
  requireRole(['CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']),
  validate(listEscalationsSchema),
  listEscalations,
);

// Per-grievance escalations (404 unknown grievance, 403 out of scope).
router.get(
  '/:grievanceId',
  requireRole(['CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']),
  validate(getEscalationsByGrievanceSchema),
  getEscalationsByGrievance,
);

export default router;
