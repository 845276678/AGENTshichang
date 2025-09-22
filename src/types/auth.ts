// Authentication related types
import { UserRole, UserStatus } from '@/generated/prisma'

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string; // Display name
  password?: string; // Optional for response types
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isEmailVerified: boolean;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Profile fields
  bio?: string;
  website?: string;
  location?: string;
  // Settings
  emailNotifications: boolean;
  marketingEmails: boolean;
}

// Re-export the Prisma enums for convenience
export { UserRole, UserStatus } from '@/generated/prisma'

// JWT Token payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Token types
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  isRevoked: boolean;
  deviceInfo?: string;
  ipAddress?: string;
}

// Password reset token
export interface PasswordResetToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  isUsed: boolean;
}

// Email verification token
export interface EmailVerificationToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  isUsed: boolean;
}

// Auth session
export interface AuthSession {
  user: Omit<User, 'password'>;
  tokens: TokenPair;
}

// API Request types
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// API Response types
export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  tokens: TokenPair;
  message: string;
}

export interface RegisterResponse {
  user: Omit<User, 'password'>;
  message: string;
  requiresEmailVerification: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
  message: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export enum AuthErrorCodes {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS = 'USERNAME_ALREADY_EXISTS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Database models (for when using actual database)
export interface UserModel extends User {
  // Additional database-specific fields
  passwordResetTokens?: PasswordResetToken[];
  emailVerificationTokens?: EmailVerificationToken[];
  refreshTokens?: RefreshToken[];
}