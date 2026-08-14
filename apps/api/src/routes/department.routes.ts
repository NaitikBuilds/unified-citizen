import { Router } from 'express';
import { 
  getAllDepartments, 
  getDepartmentById, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment 
} from '../controllers/department.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';

const router = Router();

// Public / Authenticated retrieval routes
router.get('/', authenticate, getAllDepartments);
router.get('/:id', authenticate, getDepartmentById);

// Admin-only modification routes
router.post('/', authenticate, requireRole(['Super Admin']), createDepartment);
router.patch('/:id', authenticate, requireRole(['Super Admin']), updateDepartment);
router.delete('/:id', authenticate, requireRole(['Super Admin']), deleteDepartment);

export default router;