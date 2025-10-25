import { NextRequest, NextResponse } from 'next/server';
import { refreshTokenSchema, validateInput } from '@/lib/validations';
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';
import { userDb, refreshTokenDb } from '@/lib/mock-db';
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  AuthErrors 
} from '@/lib/errors';
import { 
  handleCorsPreflightRequest,
  addSecurityHeaders 
} from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic'

async function refreshTokenHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest(request);
    }

    // Only allow POST method
    if (request.method !== 'POST') {
      return createErrorResponse('Method not allowed', 405);
    }

    // Get refresh token from body or cookies
    let refreshToken: string;
    
    try {
      const body = await request.json();
      const validation = validateInput(refreshTokenSchema, body);
      
      if (!validation.success) {
        // Try to get from cookies
        refreshToken = request.cookies.get('refreshToken')?.value || '';
        
        if (!refreshToken) {
          return NextResponse.json({
            success: false,
            message: 'Validation failed',
            errors: validation.errors
          }, { status: 400 });
        }
      } else {
        refreshToken = validation.data.refreshToken;
      }
    } catch (error) {
      // If JSON parsing fails, try to get from cookies
      refreshToken = request.cookies.get('refreshToken')?.value || '';
      
      if (!refreshToken) {
        return createErrorResponse('Refresh token is required', 400);
      }
    }

    // Verify the refresh token
    let tokenPayload;
    try {
      tokenPayload = verifyRefreshToken(refreshToken);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'REFRESH_TOKEN_EXPIRED') {
          throw AuthErrors.expiredToken('Refresh token has expired');
        } else if (error.message === 'INVALID_REFRESH_TOKEN') {
          throw AuthErrors.invalidToken('Invalid refresh token');
        }
      }
      throw AuthErrors.invalidToken('Token verification failed');
    }

    // Check if refresh token exists in database and is not revoked
    const storedToken = await refreshTokenDb.findByToken(refreshToken);
    if (!storedToken) {
      throw AuthErrors.invalidToken('Refresh token not found');
    }

    if (storedToken.isRevoked) {
      throw AuthErrors.invalidToken('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await refreshTokenDb.revoke(refreshToken);
      throw AuthErrors.expiredToken('Refresh token has expired');
    }

    // Verify token belongs to the user
    if (storedToken.userId !== tokenPayload.userId) {
      throw AuthErrors.invalidToken('Token does not match user');
    }

    // Get user information
    const user = await userDb.findById(tokenPayload.userId);
    if (!user) {
      // User was deleted, revoke the token
      await refreshTokenDb.revoke(refreshToken);
      throw AuthErrors.userNotFound();
    }

    // Check if user account is still active
    if (user.status === 'SUSPENDED') {
      await refreshTokenDb.revokeAllForUser(user.id);
      throw AuthErrors.accountSuspended();
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, user.email, user.role);

    const response = createSuccessResponse(
      {
        accessToken: newAccessToken,
        message: 'Token refreshed successfully'
      },
      'Token refreshed successfully'
    );

    return addSecurityHeaders(response);

  } catch (error) {
    return handleApiError(error);
  }
}

// Apply rate limiting to the handler
export const POST = withRateLimit(refreshTokenHandler, apiRateLimit);