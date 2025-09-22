import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/mock-db';
import { withAuth } from '@/lib/auth-middleware';
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
import { JWTPayload } from '@/types/auth';

async function getCurrentUserHandler(request: NextRequest, user: JWTPayload): Promise<NextResponse> {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest(request);
    }

    // Only allow GET method
    if (request.method !== 'GET') {
      return createErrorResponse('Method not allowed', 405);
    }

    // Get full user information from database
    const currentUser = await userDb.findById(user.userId);
    if (!currentUser) {
      throw AuthErrors.userNotFound('User not found');
    }

    // Check if user account is still active
    if (currentUser.status === 'SUSPENDED') {
      throw AuthErrors.accountSuspended();
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = currentUser;

    const response = createSuccessResponse(
      {
        user: userWithoutPassword
      },
      'User information retrieved successfully'
    );

    return addSecurityHeaders(response);

  } catch (error) {
    return handleApiError(error);
  }
}

// Apply authentication middleware
export const GET = withAuth(getCurrentUserHandler);