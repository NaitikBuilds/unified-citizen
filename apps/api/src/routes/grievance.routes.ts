import { Router } from 'express';
import { 
  createGrievance, 
  getGrievances, 
  getGrievanceById 
} from '../controllers/grievance.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';

const router = Router();

// Citizens can create grievances
router.post('/', authenticate, requireRole(['Citizen']), createGrievance);

// Role-based grievance viewing
router.get('/', authenticate, requireRole(['Citizen', 'Department Officer', 'Department Admin', 'Super Admin', 'Verifier']), getGrievances);
router.get('/:id', authenticate, requireRole(['Citizen', 'Department Officer', 'Department Admin', 'Super Admin', 'Verifier']), getGrievanceById);

export default router;