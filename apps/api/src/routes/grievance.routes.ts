import { Router } from 'express';
import { 
  createGrievance, 
  getGrievances, 
  getGrievanceById,
  updateGrievance,
  updateGrievanceStatus,
  deleteGrievance,
  assignGrievance,
  addGrievanceComment,
  getGrievanceComments,
  uploadGrievanceAttachment,
  getGrievanceAttachments,
  escalateGrievance,
  addGrievanceFeedback,
  reopenGrievance
} from '../controllers/grievance.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { 
  createGrievanceSchema, 
  updateGrievanceStatusSchema, 
  assignGrievanceSchema, 
  addCommentSchema, 
  addFeedbackSchema 
} from '../validations/grievance.validation.js';

const router = Router();

// Apply authentication to all grievance routes globally
router.use(authenticate);

// Citizens can create grievances (Zod validated)
router.post('/', requireRole(['CITIZEN']), validate(createGrievanceSchema), createGrievance);

// Role-based grievance viewing (Aligned with schema enums)
router.get('/', requireRole(['CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']), getGrievances);
router.get('/:id', requireRole(['CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']), getGrievanceById);

// Grievance updates
router.patch('/:id', requireRole(['CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']), updateGrievance);
router.patch('/:id/status', requireRole(['OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']), validate(updateGrievanceStatusSchema), updateGrievanceStatus);

// Grievance assignment (Zod validated)
router.post('/:id/assign', requireRole(['DEPARTMENT_ADMIN', 'SUPER_ADMIN']), validate(assignGrievanceSchema), assignGrievance);

// Grievance escalation
router.post('/:id/escalate', requireRole(['CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']), escalateGrievance);

// Feedback and Reopen (Zod validated feedback)
router.post('/:id/feedback', requireRole(['CITIZEN']), validate(addFeedbackSchema), addGrievanceFeedback);
router.post('/:id/reopen', requireRole(['CITIZEN']), reopenGrievance);

// Grievance comments (Zod validated comment creation)
router.post('/:id/comments', requireRole(['CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']), validate(addCommentSchema), addGrievanceComment);
router.get('/:id/comments', requireRole(['CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']), getGrievanceComments);

// Grievance attachments
router.post('/:id/attachments', requireRole(['CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']), upload.single('file'), uploadGrievanceAttachment);
router.get('/:id/attachments', requireRole(['CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']), getGrievanceAttachments);

// Grievance deletion
router.delete('/:id', requireRole(['CITIZEN', 'SUPER_ADMIN']), deleteGrievance);

export default router;