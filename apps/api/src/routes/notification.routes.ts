import { Router } from 'express';
import { getNotifications, markNotificationAsRead } from '../controllers/notification.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { paginationQuerySchema } from '../validations/pagination.validation.js';
import { notificationIdParamSchema } from '../validations/notification.validation.js';

const router = Router();

router.get('/', authenticate, validate(paginationQuerySchema), getNotifications);
router.patch(
  '/:id/read',
  authenticate,
  validate(notificationIdParamSchema),
  markNotificationAsRead,
);

export default router;