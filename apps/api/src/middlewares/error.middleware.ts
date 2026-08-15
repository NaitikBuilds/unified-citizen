import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors: any = undefined;

  // Handle Zod Validation Errors (Requirement #18)
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.issues.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A resource with this unique identifier already exists.';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Requested record not found.';
  }

  if (statusCode === 500) {
    console.error('API Error (500):', err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}