import { NextRequest, NextResponse } from 'next/server';
import { refreshTokenDb } from '@/lib/mock-db';
import { withAuth } from '@/lib/auth-middleware';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError 
} from '@/lib/errors';
import { 
  handleCorsPreflightRequest,
  addSecurityHeaders 
} from '@/lib/auth-middleware';
import { JWTPayload } from '@/types/auth';

export const dynamic = 'force-dynamic'

async function logoutHandler(request: NextRequest, user: JWTPayload): Promise<NextResponse> {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest(request);
    }

    // Only allow POST method
    if (request.method !== 'POST') {
      return createErrorResponse('Method not allowed', 405);
    }

    // Parse request body to get refresh token
    let refreshToken: string | null = null;
    
    try {
      const body = await request.json();
      refreshToken = body.refreshToken;
    } catch (error) {
      // If no body or invalid JSON, check cookies
      refreshToken = request.cookies.get('refreshToken')?.value || null;
    }

    // If refresh token provided, revoke it
    if (refreshToken) {
      await refreshTokenDb.revoke(refreshToken);
    }

    // For "logout from all devices" functionality, revoke all refresh tokens for the user
    const logoutAll = request.nextUrl.searchParams.get('all') === 'true';
    if (logoutAll) {
      await refreshTokenDb.revokeAllForUser(user.userId);
    }

    const response = createSuccessResponse(
      {
        message: logoutAll ? 'Logged out from all devices successfully' : 'Logged out successfully'
      },
      'Logout successful'
    );

    // Clear refresh token cookie
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    return addSecurityHeaders(response);

  } catch (error) {
    return handleApiError(error);
  }
}

// Apply authentication middleware
export const POST = withAuth(logoutHandler);