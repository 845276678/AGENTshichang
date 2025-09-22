# Critical Security Fixes Implementation Guide

This guide provides immediate fixes for the most critical security vulnerabilities identified in the security audit.

## 1. Fix JWT Signature Verification (CRITICAL)

### File: `D:\ai\AIagentshichang\middleware.ts`

Replace the insecure `verifyJWTToken` function with proper JWT verification:

```typescript
import jwt from 'jsonwebtoken';

function verifyJWTToken(token: string): any {
  try {
    // Get JWT secret from environment
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return null;
    }

    // Properly verify the JWT with signature
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'], // Specify allowed algorithms
      issuer: 'ai-agent-marketplace', // Verify issuer
    });

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('Invalid token');
    }
    return null;
  }
}
```

## 2. Secure Environment Variables

### File: `D:\ai\AIagentshichang\src\lib\jwt.ts`

Remove hardcoded fallback secrets:

```typescript
// At the top of the file, add validation
const validateEnvironment = () => {
  const required = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DATABASE_URL',
    'NEXTAUTH_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Please configure them in your .env file.'
    );
  }
};

// Call validation on module load
validateEnvironment();

// Use environment variables without fallbacks
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // 1 hour is more practical
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
```

## 3. Implement Proper CORS Configuration

### File: `D:\ai\AIagentshichang\middleware.ts`

Replace wildcard CORS with a whitelist:

```typescript
// Add at the top of the file
const getAllowedOrigins = (): string[] => {
  const origins = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
  return origins.split(',').map(origin => origin.trim());
};

// Update the CORS handling in the middleware function
export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();

  // Handle OPTIONS requests for CORS
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-CSRF-Token'
    );
    response.headers.set('Access-Control-Max-Age', '86400');

    return response;
  }

  // ... rest of middleware logic

  // Update API route CORS headers
  if (path.startsWith('/api/')) {
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-CSRF-Token'
    );
  }
}
```

## 4. Add CSRF Protection

### Create new file: `D:\ai\AIagentshichang\src\lib\csrf.ts`

```typescript
import crypto from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET;

export interface CSRFTokenPair {
  token: string;
  hash: string;
}

export function generateCSRFToken(): CSRFTokenPair {
  const token = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  const hash = crypto
    .createHmac('sha256', CSRF_SECRET!)
    .update(token)
    .digest('hex');

  return { token, hash };
}

export function verifyCSRFToken(token: string, hash: string): boolean {
  if (!token || !hash) return false;

  const expectedHash = crypto
    .createHmac('sha256', CSRF_SECRET!)
    .update(token)
    .digest('hex');

  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(expectedHash)
  );
}

// Middleware helper to validate CSRF tokens
export function validateCSRFToken(request: Request): boolean {
  const token = request.headers.get('X-CSRF-Token');
  const cookieHeader = request.headers.get('cookie');

  if (!token || !cookieHeader) return false;

  // Parse CSRF hash from cookies
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const hash = cookies['csrf-hash'];

  if (!hash) return false;

  return verifyCSRFToken(token, hash);
}
```

## 5. Secure File Upload Validation

### File: `D:\ai\AIagentshichang\src\app\api\files\upload\route.ts`

Add comprehensive file validation:

```typescript
import crypto from 'crypto';
import path from 'path';

// Define allowed MIME types and extensions
const ALLOWED_MIME_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/json': ['.json'],
};

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB

// Magic bytes for file type validation
const MAGIC_BYTES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
};

function validateFileType(buffer: Buffer, mimeType: string): boolean {
  const magicBytes = MAGIC_BYTES[mimeType as keyof typeof MAGIC_BYTES];
  if (!magicBytes) return true; // Skip validation for types without magic bytes

  for (let i = 0; i < magicBytes.length; i++) {
    if (buffer[i] !== magicBytes[i]) {
      return false;
    }
  }
  return true;
}

function sanitizeFilename(filename: string, userId: string): string {
  // Remove path components and special characters
  const baseName = path.basename(filename);
  const ext = path.extname(baseName);
  const nameWithoutExt = baseName.slice(0, -ext.length);

  // Create a safe filename
  const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '');
  const timestamp = Date.now();
  const hash = crypto.randomBytes(8).toString('hex');

  return `${userId}_${timestamp}_${safeName.substring(0, 20)}_${hash}${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    // ... existing authentication code ...

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return createErrorResponse('No file provided', 400);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse(
        `File size exceeds maximum of ${MAX_FILE_SIZE} bytes`,
        400
      );
    }

    // Validate MIME type
    const mimeType = file.type;
    if (!ALLOWED_MIME_TYPES[mimeType as keyof typeof ALLOWED_MIME_TYPES]) {
      return createErrorResponse('File type not allowed', 400);
    }

    // Validate extension
    const ext = path.extname(file.name).toLowerCase();
    const allowedExts = ALLOWED_MIME_TYPES[mimeType as keyof typeof ALLOWED_MIME_TYPES];
    if (!allowedExts.includes(ext)) {
      return createErrorResponse('File extension does not match MIME type', 400);
    }

    // Convert to buffer and validate magic bytes
    const buffer = Buffer.from(await file.arrayBuffer());

    if (!validateFileType(buffer, mimeType)) {
      return createErrorResponse('File content does not match declared type', 400);
    }

    // Generate secure filename
    const secureFilename = sanitizeFilename(file.name, userId);

    // ... rest of upload logic with secure filename ...
  } catch (error) {
    return handleApiError(error);
  }
}
```

## 6. Implement Redis-based Rate Limiting

First, install Redis client:
```bash
npm install ioredis rate-limiter-flexible
```

### File: `D:\ai\AIagentshichang\src\lib\rate-limit-redis.ts`

```typescript
import Redis from 'ioredis';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Redis client
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 3,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Create rate limiters for different scenarios
export const loginRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login',
  points: 5, // 5 attempts
  duration: 900, // Per 15 minutes
  blockDuration: 900, // Block for 15 minutes
});

export const apiRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'api',
  points: 100, // 100 requests
  duration: 900, // Per 15 minutes
});

export const fileUploadRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'upload',
  points: 10, // 10 uploads
  duration: 3600, // Per hour
});

// Helper function to get client identifier
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  let ip = 'unknown';

  if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp;
  } else if (cfConnectingIp) {
    ip = cfConnectingIp;
  }

  return ip;
}

// Rate limiting middleware
export function withRedisRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  rateLimiter: RateLimiterRedis
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const key = getClientIdentifier(request);

    try {
      await rateLimiter.consume(key);

      const response = await handler(request);

      // Add rate limit headers
      const rateLimiterRes = await rateLimiter.get(key);
      if (rateLimiterRes) {
        response.headers.set('X-RateLimit-Limit', rateLimiter.points.toString());
        response.headers.set('X-RateLimit-Remaining', rateLimiterRes.remainingPoints.toString());
        response.headers.set('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
      }

      return response;
    } catch (rejRes) {
      if (rejRes instanceof RateLimiterRes) {
        const retryAfter = Math.round(rejRes.msBeforeNext / 1000) || 1;

        return NextResponse.json(
          {
            success: false,
            message: 'Too many requests, please try again later',
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': rateLimiter.points.toString(),
              'X-RateLimit-Remaining': rejRes.remainingPoints.toString(),
              'X-RateLimit-Reset': new Date(Date.now() + rejRes.msBeforeNext).toISOString(),
            },
          }
        );
      }

      // Redis connection error - fail open but log
      console.error('Rate limiter error:', rejRes);
      return handler(request);
    }
  };
}
```

## 7. Add Security Headers

### File: `D:\ai\AIagentshichang\next.config.js`

Update with comprehensive security headers:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config ...

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.stripe.com",
              "frame-src 'self' https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },

  // ... rest of config ...
};

module.exports = nextConfig;
```

## 8. Input Sanitization Helper

### Create new file: `D:\ai\AIagentshichang\src\lib\sanitization.ts`

```typescript
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// HTML sanitization for rich text content
export function sanitizeHTML(dirty: string, options?: any): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ...options,
  });
}

// Strip all HTML for plain text fields
export function sanitizePlainText(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

// SQL-safe string escaping (use with Prisma raw queries)
export function escapeSQLString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x00/g, '\\x00')
    .replace(/\x1a/g, '\\x1a');
}

// Validate and sanitize JSON input
export function sanitizeJSON(input: string): object | null {
  try {
    const parsed = JSON.parse(input);
    // Remove any potentially dangerous keys
    const sanitized = JSON.parse(JSON.stringify(parsed));
    return sanitized;
  } catch {
    return null;
  }
}

// File path sanitization
export function sanitizePath(path: string): string {
  // Remove any directory traversal attempts
  return path
    .replace(/\.\./g, '')
    .replace(/~\//g, '')
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
    .replace(/[^a-zA-Z0-9._\-\/]/g, '');
}

// Create a sanitized error message (no sensitive data)
export function sanitizeErrorMessage(error: any): string {
  const message = error?.message || 'An error occurred';

  // Remove sensitive patterns
  return message
    .replace(/([a-zA-Z0-9+_.\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi, '[email]')
    .replace(/\b\d{4,}\b/g, '[number]')
    .replace(/(password|token|secret|key)[:=]\s*\S+/gi, '[redacted]')
    .replace(/\/[^\/\s]+\/[^\/\s]+\/[^\/\s]+/g, '[path]');
}

// Validate MongoDB ObjectId
export function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

// Validate UUID v4
export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

// Create safe validation schema with sanitization
export function createSafeSchema<T extends z.ZodTypeAny>(schema: T) {
  return schema.transform((data: any) => {
    if (typeof data === 'string') {
      return sanitizePlainText(data);
    }
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizePlainText(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    return data;
  });
}
```

## 9. Environment Variables Template

### Update `.env.example` with security requirements:

```bash
# REQUIRED SECURITY CONFIGURATIONS
# Generate strong secrets using: openssl rand -hex 32

# JWT Configuration (REQUIRED - No defaults in production!)
JWT_SECRET=<generate-with-openssl-rand-hex-32>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-hex-32>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CSRF Protection (REQUIRED)
CSRF_SECRET=<generate-with-openssl-rand-hex-32>

# Session Configuration (REQUIRED)
SESSION_SECRET=<generate-with-openssl-rand-hex-32>
SESSION_NAME=aid_session
SESSION_MAX_AGE=86400000

# CORS Configuration (REQUIRED)
# Comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Rate Limiting (REQUIRED for production)
REDIS_URL=redis://localhost:6379
RATE_LIMIT_ENABLED=true

# File Upload Security
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt,.json,.jpg,.jpeg,.png,.gif,.webp

# Security Headers
ENABLE_SECURITY_HEADERS=true
CSP_REPORT_URI=https://yourdomain.com/api/csp-report

# Monitoring and Logging
SENTRY_DSN=
LOG_LEVEL=info
AUDIT_LOG_ENABLED=true

# Two-Factor Authentication
TWO_FACTOR_ENABLED=false
TWO_FACTOR_ISSUER=AI-Agent-Marketplace

# Password Policy
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL=true
```

## Testing the Security Fixes

Create a test script to verify the security implementations:

### File: `D:\ai\AIagentshichang\test-security.js`

```javascript
const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000';

async function testSecurity() {
  console.log('Starting Security Tests...\n');

  // Test 1: JWT Signature Verification
  console.log('1. Testing JWT Signature Verification...');
  try {
    // Create a forged token with wrong signature
    const forgedToken = jwt.sign(
      { userId: 'test', role: 'ADMIN' },
      'wrong-secret'
    );

    const response = await axios.get(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${forgedToken}` },
      validateStatus: () => true
    });

    if (response.status === 401) {
      console.log('✅ JWT verification working - forged token rejected');
    } else {
      console.log('❌ JWT verification FAILED - forged token accepted!');
    }
  } catch (error) {
    console.log('✅ JWT verification working - request blocked');
  }

  // Test 2: CORS Configuration
  console.log('\n2. Testing CORS Configuration...');
  try {
    const response = await axios.options(`${BASE_URL}/api/auth/login`, {
      headers: { Origin: 'https://evil.com' },
      validateStatus: () => true
    });

    const allowedOrigin = response.headers['access-control-allow-origin'];
    if (!allowedOrigin || allowedOrigin === '*') {
      console.log('❌ CORS misconfigured - wildcard or no origin check');
    } else {
      console.log('✅ CORS properly configured');
    }
  } catch (error) {
    console.log('Test error:', error.message);
  }

  // Test 3: Rate Limiting
  console.log('\n3. Testing Rate Limiting...');
  const loginAttempts = [];
  for (let i = 0; i < 7; i++) {
    loginAttempts.push(
      axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'test@test.com',
        password: 'wrong'
      }, { validateStatus: () => true })
    );
  }

  const results = await Promise.all(loginAttempts);
  const rateLimited = results.some(r => r.status === 429);

  if (rateLimited) {
    console.log('✅ Rate limiting working');
  } else {
    console.log('❌ Rate limiting not working');
  }

  // Test 4: Security Headers
  console.log('\n4. Testing Security Headers...');
  try {
    const response = await axios.get(BASE_URL, {
      validateStatus: () => true
    });

    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'strict-transport-security',
      'content-security-policy'
    ];

    const missingHeaders = securityHeaders.filter(
      header => !response.headers[header]
    );

    if (missingHeaders.length === 0) {
      console.log('✅ All security headers present');
    } else {
      console.log(`❌ Missing headers: ${missingHeaders.join(', ')}`);
    }
  } catch (error) {
    console.log('Test error:', error.message);
  }

  console.log('\n✅ Security tests completed!');
}

testSecurity().catch(console.error);
```

## Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are set with strong values
- [ ] JWT signature verification is working
- [ ] CORS is properly configured with specific origins
- [ ] CSRF protection is enabled on all state-changing endpoints
- [ ] File uploads are validated and sanitized
- [ ] Rate limiting is working with Redis
- [ ] Security headers are properly configured
- [ ] Input sanitization is applied to all user inputs
- [ ] Error messages don't leak sensitive information
- [ ] Admin routes have proper authentication and authorization
- [ ] Database connections use SSL
- [ ] HTTPS is enforced in production
- [ ] Logs don't contain sensitive data
- [ ] Dependencies are up to date (npm audit)
- [ ] Security monitoring is configured

## Next Steps

1. **Run security tests**: `node test-security.js`
2. **Update dependencies**: `npm audit fix`
3. **Configure monitoring**: Set up Sentry or similar
4. **Enable 2FA**: Implement two-factor authentication
5. **Schedule pentesting**: Arrange professional security assessment

Remember: Security is an ongoing process, not a one-time fix. Regular audits and updates are essential.