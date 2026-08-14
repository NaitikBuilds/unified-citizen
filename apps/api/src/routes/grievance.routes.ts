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
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// Citizens can create grievances
router.post('/', authenticate, requireRole(['Citizen']), createGrievance);

// Role-based grievance viewing
router.get('/', authenticate, requireRole(['Citizen', 'Department Officer', 'Department Admin', 'Super Admin', 'Verifier']), getGrievances);
router.get('/:id', authenticate, requireRole(['Citizen', 'Department Officer', 'Department Admin', 'Super Admin', 'Verifier']), getGrievanceById);

// Grievance updates
router.patch('/:id', authenticate, requireRole(['Citizen', 'Department Officer', 'Department Admin', 'Super Admin']), updateGrievance);
router.patch('/:id/status', authenticate, requireRole(['Department Officer', 'Department Admin', 'Super Admin']), updateGrievanceStatus);

// Grievance assignment
router.post('/:id/assign', authenticate, requireRole(['Department Admin', 'Super Admin']), assignGrievance);

// Grievance escalation
router.post('/:id/escalate', authenticate, requireRole(['Citizen', 'Department Officer', 'Department Admin', 'Super Admin']), escalateGrievance);

// Feedback and Reopen
router.post('/:id/feedback', authenticate, requireRole(['Citizen']), addGrievanceFeedback);
router.post('/:id/reopen', authenticate, requireRole(['Citizen']), reopenGrievance);

// Grievance comments
router.post('/:id/comments', authenticate, requireRole(['Citizen', 'Department Officer', 'Department Admin', 'Super Admin', 'Verifier']), addGrievanceComment);
router.get('/:id/comments', authenticate, requireRole(['Citizen', 'Department Officer', 'Department Admin', 'Super Admin', 'Verifier']), getGrievanceComments);

// Grievance attachments
router.post('/:id/attachments', authenticate, requireRole(['Citizen', 'Department Officer', 'Department Admin', 'Super Admin', 'Verifier']), upload.single('file'), uploadGrievanceAttachment);
router.get('/:id/attachments', authenticate, requireRole(['Citizen', 'Department Officer', 'Department Admin', 'Super Admin', 'Verifier']), getGrievanceAttachments);

// Grievance deletion
router.delete('/:id', authenticate, requireRole(['Citizen', 'Super Admin']), deleteGrievance);

export default router;