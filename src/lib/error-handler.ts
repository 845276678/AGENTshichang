import { NextResponse } from 'next/server'

export interface ApiError extends Error {
  statusCode: number
  code?: string
  details?: any
}

export class ValidationError extends Error implements ApiError {
  statusCode = 400
  code = 'VALIDATION_ERROR'

  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error implements ApiError {
  statusCode = 401
  code = 'AUTHENTICATION_ERROR'

  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error implements ApiError {
  statusCode = 403
  code = 'AUTHORIZATION_ERROR'

  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error implements ApiError {
  statusCode = 404
  code = 'NOT_FOUND_ERROR'

  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error implements ApiError {
  statusCode = 409
  code = 'CONFLICT_ERROR'

  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends Error implements ApiError {
  statusCode = 429
  code = 'RATE_LIMIT_ERROR'

  constructor(message: string = 'Rate limit exceeded') {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class InternalServerError extends Error implements ApiError {
  statusCode = 500
  code = 'INTERNAL_SERVER_ERROR'

  constructor(message: string = 'Internal server error') {
    super(message)
    this.name = 'InternalServerError'
  }
}

export function isApiError(error: any): error is ApiError {
  return error && typeof error.statusCode === 'number'
}

export function createErrorResponse(error: ApiError | Error) {
  if (isApiError(error)) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      },
      { status: error.statusCode }
    )
  }

  // Log unexpected errors
  console.error('Unexpected error:', error)

  return NextResponse.json(
    {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    },
    { status: 500 }
  )
}

export async function withErrorHandling<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  try {
    return await handler()
  } catch (error: any) {
    return createErrorResponse(error)
  }
}

export function logError(error: Error, context?: Record<string, any>) {
  const timestamp = new Date().toISOString()
  const logData = {
    timestamp,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
  }

  console.error('Error:', JSON.stringify(logData, null, 2))

  // In production, you might want to send this to a logging service
  // like Sentry, DataDog, or CloudWatch
}