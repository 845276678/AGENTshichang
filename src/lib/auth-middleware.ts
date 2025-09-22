import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/jwt';
import { User, UserRole, JWTPayload, AuthErrorCodes } from '@/types/auth';

export interface AuthenticatedRequest extends NextRequest {
  user: Omit<User, 'password'>;
}

/**
 * Middleware to authenticate requests using JWT tokens
 */
export async function authenticateToken(request: NextRequest): Promise<{
  success: boolean;
  user?: JWTPayload;
  error?: string;
}> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader || '');

    if (!token) {
      return {
        success: false,
        error: 'No authorization token provided'
      };
    }

    const payload = verifyAccessToken(token);
    
    return {
      success: true,
      user: payload
    };
  } catch (error) {
    let errorMessage = 'Token verification failed';
    
    if (error instanceof Error) {
      switch (error.message) {
        case 'ACCESS_TOKEN_EXPIRED':
          errorMessage = 'Access token has expired';
          break;
        case 'INVALID_ACCESS_TOKEN':
          errorMessage = 'Invalid access token';
          break;
        case 'TOKEN_VERIFICATION_FAILED':
          errorMessage = 'Token verification failed';
          break;
        default:
          errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Higher-order function to create protected API routes
 */
export function withAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>,
  options: {
    requiredRoles?: UserRole[];
    allowUnverified?: boolean;
  } = {}
) {
  return async (request: NextRequest) => {
    try {
      const authResult = await authenticateToken(request);
      
      if (!authResult.success || !authResult.user) {
        return NextResponse.json(
          {
            success: false,
            message: authResult.error || 'Authentication failed',
            code: AuthErrorCodes.INVALID_TOKEN
          },
          { status: 401 }
        );
      }

      const user = authResult.user;

      // Check required roles
      if (options.requiredRoles && options.requiredRoles.length > 0) {
        if (!options.requiredRoles.includes(user.role)) {
          return NextResponse.json(
            {
              success: false,
              message: 'Insufficient permissions',
              code: AuthErrorCodes.INVALID_CREDENTIALS
            },
            { status: 403 }
          );
        }
      }

      // In a real implementation, you would fetch the full user from database
      // and check if email is verified, account status, etc.
      
      return handler(request, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          code: AuthErrorCodes.INTERNAL_SERVER_ERROR
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware for admin-only routes
 */
export function withAdminAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return withAuth(handler, {
    requiredRoles: [UserRole.ADMIN]
  });
}

/**
 * Middleware for moderator and admin routes
 */
export function withModeratorAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return withAuth(handler, {
    requiredRoles: [UserRole.ADMIN, UserRole.MODERATOR]
  });
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export async function optionalAuth(request: NextRequest): Promise<{
  user?: JWTPayload;
}> {
  try {
    const authResult = await authenticateToken(request);
    
    if (authResult.success && authResult.user) {
      return { user: authResult.user };
    }
    
    return {};
  } catch (error) {
    // Silent fail for optional auth
    return {};
  }
}

/**
 * Extract user information from request (for use in protected routes)
 */
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  // This would typically be set by the auth middleware
  // For now, we'll parse the token again
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader || '');

    if (!token) {
      return null;
    }

    return verifyAccessToken(token);
  } catch (error) {
    return null;
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(user: JWTPayload, role: UserRole): boolean {
  return user.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: JWTPayload, roles: UserRole[]): boolean {
  return roles.includes(user.role);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: JWTPayload): boolean {
  return user.role === UserRole.ADMIN;
}

/**
 * Check if user is moderator or admin
 */
export function isModerator(user: JWTPayload): boolean {
  return user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN;
}

/**
 * Create CORS headers for auth endpoints
 */
export function createCorsHeaders(origin?: string): Headers {
  const headers = new Headers();
  
  // Allow specific origins in production, all origins in development
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment || (origin && allowedOrigins.includes(origin))) {
    headers.set('Access-Control-Allow-Origin', origin || '*');
  }
  
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return headers;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const corsHeaders = createCorsHeaders(origin || undefined);
  
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Strict transport security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content security policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  
  return response;
}

/**
 * Validate request content type
 */
export function validateContentType(request: NextRequest, expectedType: string = 'application/json'): boolean {
  const contentType = request.headers.get('content-type');
  return contentType?.includes(expectedType) || false;
}