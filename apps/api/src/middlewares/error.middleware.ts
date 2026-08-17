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

  // Handle Zod Validation Errors
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

  // Handle Multer upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File is too large. Maximum allowed size is 5MB.';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field. Expected a single file field named "file".';
  }

  if (statusCode === 500) {
    console.error('API Error (500):', err);
    // Never leak internal error details (Prisma internals, filesystem paths,
    // connection strings, stack traces) to clients outside development.
    if (process.env.NODE_ENV !== 'development') {
      message = 'Internal server error';
    }
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && statusCode === 500 && { stack: err.stack }),
  });
}