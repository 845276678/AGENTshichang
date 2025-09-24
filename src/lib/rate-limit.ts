import { NextRequest, NextResponse } from 'next/server';
import { AuthErrorCodes, RateLimitInfo } from '@/types/auth';

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (request: NextRequest) => string;
}

/**
 * Create a rate limiter middleware
 */
export function createRateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    keyGenerator = (request: NextRequest) => getClientIdentifier(request)
  } = config;

  return async (
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    const key = keyGenerator(request);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up expired entries
    cleanupExpiredEntries(windowStart);
    
    // Get current count for this key
    const current = rateLimitStore.get(key);
    const resetTime = now + windowMs;
    
    if (!current || current.resetTime < now) {
      // First request in this window or window has expired
      rateLimitStore.set(key, { count: 1, resetTime });
    } else {
      // Increment count
      current.count++;
      rateLimitStore.set(key, current);
      
      // Check if limit exceeded
      if (current.count > maxRequests) {
        const retryAfter = Math.ceil((current.resetTime - now) / 1000);
        
        return NextResponse.json(
          {
            success: false,
            message,
            code: AuthErrorCodes.RATE_LIMIT_EXCEEDED,
            rateLimitInfo: {
              limit: maxRequests,
              remaining: 0,
              reset: Math.floor(current.resetTime / 1000),
              retryAfter
            }
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.floor(current.resetTime / 1000).toString(),
              'Retry-After': retryAfter.toString()
            }
          }
        );
      }
    }
    
    // Execute the handler
    const response = await handler(request);
    
    // Add rate limit headers to response
    const currentData = rateLimitStore.get(key);
    if (currentData) {
      const remaining = Math.max(0, maxRequests - currentData.count);
      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', Math.floor(currentData.resetTime / 1000).toString());
    }
    
    return response;
  };
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  let ip = 'unknown';
  
  if (forwarded) {
    // x-forwarded-for may contain multiple IPs, get the first one
    ip = forwarded.split(',')[0]?.trim() || 'unknown';
  } else if (realIp) {
    ip = realIp;
  } else if (cfConnectingIp) {
    ip = cfConnectingIp;
  }
  
  // In development, use a default IP
  if (process.env.NODE_ENV === 'development' && ip === 'unknown') {
    ip = '127.0.0.1';
  }
  
  return ip;
}

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries(cutoffTime: number): void {
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < cutoffTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Pre-configured rate limiters for different scenarios
 */

// Strict rate limiter for login attempts
export const loginRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again in 15 minutes'
});

// Rate limiter for registration
export const registrationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 registrations per hour
  message: 'Too many registration attempts, please try again in 1 hour'
});

// Rate limiter for password reset requests
export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 password reset requests per hour
  message: 'Too many password reset requests, please try again in 1 hour'
});

// General API rate limiter
export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many API requests, please try again later'
});

// Strict rate limiter for sensitive operations
export const sensitiveOperationRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 2, // 2 attempts per 5 minutes
  message: 'Too many attempts for this sensitive operation, please try again later'
});

/**
 * Rate limiter based on user ID (for authenticated requests)
 */
export function createUserRateLimit(config: RateLimitConfig) {
  return createRateLimit({
    ...config,
    keyGenerator: (request: NextRequest) => {
      // Try to get user ID from token
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (token) {
        try {
          // This would decode the JWT to get user ID
          // For now, use the token itself as identifier
          return `user:${token.substring(0, 20)}`;
        } catch (error) {
          // Fall back to IP-based limiting
          return getClientIdentifier(request);
        }
      }
      
      return getClientIdentifier(request);
    }
  });
}

/**
 * Rate limiter for email-based operations
 */
export function createEmailRateLimit(config: RateLimitConfig) {
  return createRateLimit({
    ...config,
    keyGenerator: (request: NextRequest) => {
      // Try to get email from request body
      // Note: This is a simplified approach, in practice you'd need to parse the body
      const url = new URL(request.url);
      const email = url.searchParams.get('email');
      
      if (email) {
        return `email:${email}`;
      }
      
      // Fall back to IP-based limiting
      return getClientIdentifier(request);
    }
  });
}

/**
 * Higher-order function to apply rate limiting to API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  rateLimiter: (request: NextRequest, handler: (request: NextRequest) => Promise<NextResponse>) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    return rateLimiter(request, handler);
  };
}

/**
 * Get current rate limit status for a client
 */
export function getRateLimitStatus(
  request: NextRequest,
  config: RateLimitConfig
): RateLimitInfo | null {
  const key = config.keyGenerator ? config.keyGenerator(request) : getClientIdentifier(request);
  const current = rateLimitStore.get(key);
  
  if (!current) {
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Math.floor((Date.now() + config.windowMs) / 1000)
    };
  }
  
  const remaining = Math.max(0, config.maxRequests - current.count);
  const reset = Math.floor(current.resetTime / 1000);
  
  return {
    limit: config.maxRequests,
    remaining,
    reset,
    ...(remaining === 0 && { retryAfter: Math.ceil((current.resetTime - Date.now()) / 1000) })
  };
}

/**
 * Reset rate limit for a specific key (useful for testing or admin operations)
 */
export function resetRateLimit(key: string): boolean {
  return rateLimitStore.delete(key);
}

/**
 * Clear all rate limit data (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Get all current rate limit data (for monitoring/debugging)
 */
export function getAllRateLimitData(): Map<string, { count: number; resetTime: number }> {
  return new Map(rateLimitStore);
}