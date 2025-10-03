// Main validators index file

// User-related validators
export * from './user'

// Bidding-related validators
export * from './bidding'

// Business-related validators
export * from './business'

// Common validation utilities
import { z } from 'zod'

/**
 * Helper function to validate data against a schema
 * Returns validated data if successful, throws ZodError if validation fails
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Helper function to safely validate data against a schema
 * Returns result object with success status and data/error
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  error?: z.ZodError
} {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, error: result.error }
  }
}

/**
 * Helper to format Zod validation errors into user-friendly messages
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => {
    const path = err.path.join('.')
    return path ? `${path}: ${err.message}` : err.message
  })
}

/**
 * Middleware to validate request body in API routes
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>) {
  return async (req: Request): Promise<{ valid: true; data: T } | { valid: false; errors: string[] }> => {
    try {
      const body = await req.json()
      const data = schema.parse(body)
      return { valid: true, data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, errors: formatValidationErrors(error) }
      }
      return { valid: false, errors: ['Invalid request body'] }
    }
  }
}

// Re-export commonly used schemas for convenience
export {
  CreateUserSchema,
  UpdateUserSchema,
  LoginSchema,
  CreateIdeaSchema,
  UpdateIdeaSchema,
  CreatePaymentSchema,
  CreateNotificationSchema,
  CreateDiscussionSchema,
  UpdateDiscussionSchema
} from './user'

export {
  CreateBiddingSessionSchema,
  UpdateBiddingSessionSchema,
  BiddingRequestSchema,
  UserFeedbackSchema,
  BiddingMessageSchema
} from './bidding'

export {
  GenerateBusinessPlanSchema,
  UpdateBusinessPlanSchema,
  DocumentExportSchema,
  GenerateResearchReportSchema,
  GenerateLandingGuideSchema
} from './business'