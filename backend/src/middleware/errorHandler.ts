import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler middleware
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Route not found' });
};
