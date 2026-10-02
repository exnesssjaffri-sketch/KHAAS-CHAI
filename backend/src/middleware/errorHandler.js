// Centralized Error Handler
import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: err.flatten()
    });
  }

  // Supabase errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          success: false,
          message: 'Resource already exists'
        });
      case '23503': // Foreign key violation
        return res.status(400).json({
          success: false,
          message: 'Referenced resource not found'
        });
      case '23502': // Not null violation
        return res.status(400).json({
          success: false,
          message: 'Required field is missing'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
    }
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Default error
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
}