import { NextResponse } from 'next/server';
import { AuthErrorCodes, AuthResponse } from '@/types/auth';
import { ZodError } from 'zod';

/**
 * Custom error classes for different types of errors
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, code: AuthErrorCodes, statusCode: number = 401) {
    super(message, statusCode, code);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, AuthErrorCodes.VALIDATION_ERROR, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

/**
 * Create standardized error responses
 */
export function createErrorResponse(
  error: string | Error | AppError,
  statusCode: number = 500,
  code?: string
): NextResponse<AuthResponse> {
  let message: string;
  let errorCode: string;
  let details: any;

  if (error instanceof AppError) {
    message = error.message;
    statusCode = error.statusCode;
    errorCode = error.code;
    details = error.details;
  } else if (error instanceof Error) {
    message = error.message;
    errorCode = code || 'INTERNAL_ERROR';
  } else {
    message = error;
    errorCode = code || 'INTERNAL_ERROR';
  }

  const response: AuthResponse = {
    success: false,
    message,
    errors: details,
    code: errorCode
  } as any;

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Create success responses
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<AuthResponse<T>> {
  const response: AuthResponse<T> = {
    success: true,
    data,
    message
  };

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Handle validation errors from Zod
 */
export function handleValidationError(error: ZodError): NextResponse<AuthResponse> {
  const errors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return createErrorResponse(
    new ValidationError('Validation failed', errors)
  );
}

/**
 * Generic error handler for API routes
 */
export function handleApiError(error: unknown): NextResponse<AuthResponse> {
  console.error('API Error:', error);

  // Handle different types of errors
  if (error instanceof ZodError) {
    return handleValidationError(error);
  }

  if (error instanceof AppError) {
    return createErrorResponse(error);
  }

  if (error instanceof Error) {
    // Don't expose internal errors in production
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message;

    return createErrorResponse(
      new AppError(
        message,
        500,
        AuthErrorCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  // Unknown error type
  return createErrorResponse(
    new AppError(
      'An unexpected error occurred',
      500,
      AuthErrorCodes.INTERNAL_SERVER_ERROR
    )
  );
}

/**
 * Wrapper for API route handlers with error handling
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Auth-specific error creators
 */
export const AuthErrors = {
  invalidCredentials: (message: string = 'Invalid email or password') =>
    new AuthError(message, AuthErrorCodes.INVALID_CREDENTIALS, 401),

  userNotFound: (message: string = 'User not found') =>
    new AuthError(message, AuthErrorCodes.USER_NOT_FOUND, 404),

  emailAlreadyExists: (message: string = 'Email already registered') =>
    new ConflictError(message, { field: 'email' }),

  usernameAlreadyExists: (message: string = 'Username already taken') =>
    new ConflictError(message, { field: 'username' }),

  invalidToken: (message: string = 'Invalid or expired token') =>
    new AuthError(message, AuthErrorCodes.INVALID_TOKEN, 401),

  expiredToken: (message: string = 'Token has expired') =>
    new AuthError(message, AuthErrorCodes.EXPIRED_TOKEN, 401),

  accountNotVerified: (message: string = 'Account email not verified') =>
    new AuthError(message, AuthErrorCodes.ACCOUNT_NOT_VERIFIED, 403),

  accountSuspended: (message: string = 'Account is suspended') =>
    new AuthError(message, AuthErrorCodes.ACCOUNT_SUSPENDED, 403),

  rateLimitExceeded: (message: string = 'Too many requests') =>
    new AppError(message, 429, AuthErrorCodes.RATE_LIMIT_EXCEEDED)
};

/**
 * Validation error helpers
 */
export const ValidationErrors = {
  required: (field: string) =>
    new ValidationError(`${field} is required`),

  invalid: (field: string, reason?: string) =>
    new ValidationError(`Invalid ${field}${reason ? `: ${reason}` : ''}`),

  tooShort: (field: string, minLength: number) =>
    new ValidationError(`${field} must be at least ${minLength} characters long`),

  tooLong: (field: string, maxLength: number) =>
    new ValidationError(`${field} must be less than ${maxLength} characters long`),

  format: (field: string, format: string) =>
    new ValidationError(`${field} must be a valid ${format}`)
};

/**
 * Log error with context
 */
export function logError(
  error: Error,
  context: {
    endpoint?: string;
    userId?: string;
    requestId?: string;
    metadata?: Record<string, any>;
  } = {}
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context
  };

  // In production, you would send this to a logging service
  console.error('Application Error:', JSON.stringify(logData, null, 2));
}

/**
 * Create API route with built-in error handling
 */
export function createApiRoute(
  handler: (request: Request) => Promise<NextResponse>
) {
  return withErrorHandler(async (request: Request) => {
    // Add request ID for tracking
    const requestId = crypto.randomUUID();
    
    try {
      return await handler(request);
    } catch (error) {
      // Log error with context
      if (error instanceof Error) {
        logError(error, {
          requestId,
          endpoint: new URL(request.url).pathname
        });
      }
      
      throw error;
    }
  });
}

/**
 * Sanitize error messages for client
 */
export function sanitizeErrorMessage(error: Error): string {
  // In production, avoid exposing sensitive information
  if (process.env.NODE_ENV === 'production') {
    if (error instanceof AppError) {
      return error.message;
    }
    return 'An error occurred while processing your request';
  }

  return error.message;
}

/**
 * Check if error should be reported to monitoring
 */
export function shouldReportError(error: Error): boolean {
  // Don't report validation errors and 4xx client errors
  if (error instanceof ValidationError) {return false;}
  if (error instanceof AuthError && error.statusCode < 500) {return false;}
  if (error instanceof NotFoundError) {return false;}
  
  return true;
}

/**
 * Format error for monitoring/logging service
 */
export function formatErrorForReporting(
  error: Error,
  context: Record<string, any> = {}
): Record<string, any> {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
    severity: error instanceof AppError && error.statusCode < 500 ? 'warning' : 'error'
  };
}