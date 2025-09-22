import { z } from 'zod';
import { UserRole } from '@/types/auth';

// Common validation patterns
const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email must be less than 255 characters')
  .toLowerCase()
  .trim();

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number');

const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
  .toLowerCase()
  .trim();

const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .trim();

const tokenSchema = z
  .string()
  .min(1, 'Token is required')
  .trim();

// Registration validation schema
export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional()
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
}).strict();

export type LoginInput = z.infer<typeof loginSchema>;

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: emailSchema
}).strict();

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Reset password validation schema
export const resetPasswordSchema = z.object({
  token: tokenSchema,
  password: passwordSchema
}).strict();

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Refresh token validation schema
export const refreshTokenSchema = z.object({
  refreshToken: tokenSchema
}).strict();

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// Email verification validation schema
export const verifyEmailSchema = z.object({
  token: tokenSchema
}).strict();

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

// Update profile validation schema
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional()
}).strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema
}).strict();

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Update email preferences validation schema
export const updateEmailPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean()
}).strict();

export type UpdateEmailPreferencesInput = z.infer<typeof updateEmailPreferencesSchema>;

// Admin user creation schema
export const createUserSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  isEmailVerified: z.boolean().default(false)
}).strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Admin user update schema
export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  username: usernameSchema.optional(),
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  role: z.nativeEnum(UserRole).optional(),
  isEmailVerified: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional()
}).strict();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Query parameters for user listing
export const getUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'email', 'username']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
}).strict();

export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;

// Validation helper functions
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors: Record<string, string[]> = {};
    
    result.error.errors.forEach((error) => {
      const path = error.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(error.message);
    });
    
    return { success: false, errors };
  }
}

// Custom validation for unique fields (to be used in API routes)
export async function validateUniqueEmail(email: string, excludeUserId?: string): Promise<boolean> {
  // This would typically check against a database
  // For now, we'll implement a mock check
  // In a real implementation, you'd query your database here
  
  // Mock implementation - replace with actual database check
  const existingUsers = [
    { id: '1', email: 'admin@example.com' },
    { id: '2', email: 'user@example.com' }
  ];
  
  const existingUser = existingUsers.find(user => user.email === email);
  
  if (!existingUser) {
    return true; // Email is unique
  }
  
  // If we're updating a user, exclude their own email from the check
  if (excludeUserId && existingUser.id === excludeUserId) {
    return true;
  }
  
  return false; // Email is not unique
}

export async function validateUniqueUsername(username: string, excludeUserId?: string): Promise<boolean> {
  // This would typically check against a database
  // For now, we'll implement a mock check
  
  // Mock implementation - replace with actual database check
  const existingUsers = [
    { id: '1', username: 'admin' },
    { id: '2', username: 'testuser' }
  ];
  
  const existingUser = existingUsers.find(user => user.username === username);
  
  if (!existingUser) {
    return true; // Username is unique
  }
  
  // If we're updating a user, exclude their own username from the check
  if (excludeUserId && existingUser.id === excludeUserId) {
    return true;
  }
  
  return false; // Username is not unique
}

// Sanitization helpers
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizeUsername(username: string): string {
  return username.toLowerCase().trim();
}