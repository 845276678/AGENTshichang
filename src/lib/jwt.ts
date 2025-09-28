import jwt from 'jsonwebtoken';
import { JWTPayload, TokenPair } from '@/types/auth';
import { UserRole } from '@prisma/client';

// Environment variables with defaults
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // 15 minutes
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // 7 days

export interface TokenGenerationOptions {
  expiresIn?: string;
  audience?: string;
  issuer?: string;
}

/**
 * Generate an access token for a user
 */
export function generateAccessToken(
  userId: string,
  email: string,
  role: UserRole,
  options: TokenGenerationOptions = {}
): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId,
    email,
    role
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: options.expiresIn || JWT_EXPIRES_IN,
    audience: options.audience,
    issuer: options.issuer || 'ai-agent-marketplace',
    subject: userId
  } as any);
}

/**
 * Generate a refresh token for a user
 */
export function generateRefreshToken(
  userId: string,
  options: TokenGenerationOptions = {}
): string {
  const payload = {
    userId,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: options.expiresIn || JWT_REFRESH_EXPIRES_IN,
    audience: options.audience,
    issuer: options.issuer || 'ai-agent-marketplace',
    subject: userId
  } as any);
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(
  userId: string,
  email: string,
  role: UserRole,
  options: TokenGenerationOptions = {}
): TokenPair {
  return {
    accessToken: generateAccessToken(userId, email, role, options),
    refreshToken: generateRefreshToken(userId, options)
  };
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('ACCESS_TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_ACCESS_TOKEN');
    } else {
      throw new Error('TOKEN_VERIFICATION_FAILED');
    }
  }
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): { userId: string; type: string } {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    if (decoded.type !== 'refresh') {
      throw new Error('INVALID_REFRESH_TOKEN');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_REFRESH_TOKEN');
    } else {
      throw new Error('TOKEN_VERIFICATION_FAILED');
    }
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
}

/**
 * Generate a secure random token for password reset, email verification, etc.
 */
export function generateSecureToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a password reset token (JWT)
 */
export function generatePasswordResetToken(userId: string, email: string): string {
  const payload = {
    userId,
    email,
    type: 'password-reset'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h', // 1 hour expiry for password reset
    issuer: 'ai-agent-marketplace',
    subject: userId
  } as any);
}

/**
 * Verify password reset token
 */
export function verifyPasswordResetToken(token: string): { userId: string; email: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'password-reset') {
      throw new Error('INVALID_RESET_TOKEN');
    }
    return {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('RESET_TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_RESET_TOKEN');
    } else {
      throw new Error('TOKEN_VERIFICATION_FAILED');
    }
  }
}

/**
 * Create an email verification token (JWT)
 */
export function generateEmailVerificationToken(userId: string, email: string): string {
  const payload = {
    userId,
    email,
    type: 'email-verification'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h', // 24 hours for email verification
    issuer: 'ai-agent-marketplace',
    subject: userId
  } as any);
}

/**
 * Verify email verification token
 */
export function verifyEmailVerificationToken(token: string): { userId: string; email: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'email-verification') {
      throw new Error('INVALID_VERIFICATION_TOKEN');
    }
    return {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('VERIFICATION_TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_VERIFICATION_TOKEN');
    } else {
      throw new Error('TOKEN_VERIFICATION_FAILED');
    }
  }
}

/**
 * Get token expiry time
 */
export function getTokenExpiry(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as any;
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) {return true;}
  return expiry < new Date();
}

/**
 * Get time until token expires (in milliseconds)
 */
export function getTimeUntilExpiry(token: string): number {
  const expiry = getTokenExpiry(token);
  if (!expiry) {return 0;}
  return Math.max(0, expiry.getTime() - Date.now());
}

/**
 * Verify token - alias for verifyAccessToken for backward compatibility
 */
export function verifyToken(token: string): JWTPayload {
  return verifyAccessToken(token);
}