import { Router } from 'express';
import { 
  getMyProfile, 
  updateMyProfile, 
  getAllUsers, 
  getUserById, 
  updateUserRoleOrDept 
} from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';

const router = Router();

// Self profile routes
router.get('/me', authenticate, getMyProfile);
router.patch('/me', authenticate, updateMyProfile);

// Admin-only user management routes
router.get('/', authenticate, requireRole(['Super Admin', 'Department Admin']), getAllUsers);
router.get('/:id', authenticate, requireRole(['Super Admin', 'Department Admin']), getUserById);
router.patch('/:id', authenticate, requireRole(['Super Admin']), updateUserRoleOrDept);

export default router;