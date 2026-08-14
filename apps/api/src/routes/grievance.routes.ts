import { Router } from 'express';
import { createGrievance } from '../controllers/grievance.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';

const router = Router();

// Citizens can create grievances
router.post('/', authenticate, requireRole(['Citizen']), createGrievance);

export default router;