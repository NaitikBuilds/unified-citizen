import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Access denied. Unauthorized.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      return;
    }

    next();
  };
}

export function requireDepartmentMatch(
  targetDepartmentIdGetter: (req: AuthenticatedRequest) => string | Promise<string>
) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Access denied. Unauthorized.' });
        return;
      }

      // SUPER_ADMIN can access any department
      if (req.user.role === 'SUPER_ADMIN') {
        next();
        return;
      }

      const targetDepartmentId = await targetDepartmentIdGetter(req);

      if (!req.user.departmentId || req.user.departmentId !== targetDepartmentId) {
        res.status(403).json({ error: 'Access denied. You do not belong to this department.' });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error during department validation.' });
    }
  };
}