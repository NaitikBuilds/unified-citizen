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
  getGrievanceComments
} from '../controllers/grievance.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';

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

// Grievance comments
router.post('/:id/comments', authenticate, requireRole(['Citizen', 'Department Officer', 'Department Admin', 'Super Admin', 'Verifier']), addGrievanceComment);
router.get('/:id/comments', authenticate, requireRole(['Citizen', 'Department Officer', 'Department Admin', 'Super Admin', 'Verifier']), getGrievanceComments);

// Grievance deletion
router.delete('/:id', authenticate, requireRole(['Citizen', 'Super Admin']), deleteGrievance);

export default router;