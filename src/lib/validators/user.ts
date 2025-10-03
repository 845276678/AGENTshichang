import { z } from 'zod'

// Common validators
export const emailValidator = z.string().email('Invalid email format').min(1, 'Email is required')
export const usernameValidator = z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters')
export const passwordValidator = z.string().min(8, 'Password must be at least 8 characters')
export const uuidValidator = z.string().uuid('Invalid UUID format')
export const positiveNumberValidator = z.number().positive('Must be a positive number')
export const dateStringValidator = z.string().datetime('Invalid date format')

// User validation schemas
export const CreateUserSchema = z.object({
  email: emailValidator,
  username: usernameValidator,
  password: passwordValidator,
  role: z.enum(['USER', 'ADMIN', 'MODERATOR', 'PREMIUM_USER']).default('USER'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).default('ACTIVE'),
  credits: z.number().min(0).default(100),
  avatar: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  website: z.string().url().optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  emailVerified: z.boolean().default(false)
})

export const UpdateUserSchema = CreateUserSchema.partial().omit({ password: true }).extend({
  password: passwordValidator.optional()
})

export const LoginSchema = z.object({
  email: emailValidator,
  password: passwordValidator
})

// Idea validation schemas
export const CreateIdeaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters').max(5000, 'Content must be less than 5000 characters'),
  description: z.string().max(500).optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').default([]),
  imageUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  userId: uuidValidator
})

export const UpdateIdeaSchema = CreateIdeaSchema.partial().omit({ userId: true })

// Payment validation schemas
export const CreatePaymentSchema = z.object({
  userId: uuidValidator,
  amount: positiveNumberValidator,
  currency: z.string().length(3, 'Currency must be 3 characters (e.g., USD, CNY)'),
  method: z.enum(['ALIPAY', 'WECHAT', 'CARD', 'BANK_TRANSFER']),
  description: z.string().max(500).optional().nullable(),
  metadata: z.record(z.any()).optional()
})

export const UpdatePaymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED']),
  transactionId: z.string().optional(),
  paidAt: dateStringValidator.optional(),
  failedAt: dateStringValidator.optional(),
  refundedAt: dateStringValidator.optional()
})

// Notification validation schemas
export const CreateNotificationSchema = z.object({
  userId: uuidValidator,
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'BIDDING', 'PAYMENT', 'SYSTEM']),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(1000),
  actionUrl: z.string().url().optional().nullable(),
  metadata: z.record(z.any()).optional()
})

// Discussion validation schemas
export const CreateDiscussionSchema = z.object({
  ideaId: uuidValidator,
  userId: uuidValidator,
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(1).max(5000),
  parentId: uuidValidator.optional().nullable()
})

export const UpdateDiscussionSchema = z.object({
  content: z.string().min(1).max(5000),
  isEdited: z.boolean().default(true)
})

// Type exports
export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type CreateIdeaInput = z.infer<typeof CreateIdeaSchema>
export type UpdateIdeaInput = z.infer<typeof UpdateIdeaSchema>
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>
export type UpdatePaymentStatusInput = z.infer<typeof UpdatePaymentStatusSchema>
export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>
export type CreateDiscussionInput = z.infer<typeof CreateDiscussionSchema>
export type UpdateDiscussionInput = z.infer<typeof UpdateDiscussionSchema>