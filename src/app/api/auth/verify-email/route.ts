import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailVerificationToken } from '@/lib/jwt';
import { userDb, emailVerificationTokenDb } from '@/lib/mock-db';
import { emailService } from '@/lib/email';
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
import { UserStatus } from '@/types/auth';

async function verifyEmailHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest(request);
    }

    // Only allow GET method
    if (request.method !== 'GET') {
      return createErrorResponse('Method not allowed', 405);
    }

    // Get token from query parameters
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return createErrorResponse('Verification token is required', 400);
    }

    // Verify the email verification token
    let tokenPayload;
    try {
      tokenPayload = verifyEmailVerificationToken(token);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'VERIFICATION_TOKEN_EXPIRED') {
          throw AuthErrors.expiredToken('Email verification token has expired');
        } else if (error.message === 'INVALID_VERIFICATION_TOKEN') {
          throw AuthErrors.invalidToken('Invalid email verification token');
        }
      }
      throw AuthErrors.invalidToken('Token verification failed');
    }

    // Find the token in database to ensure it hasn't been used
    const verificationTokenRecord = await emailVerificationTokenDb.findByToken(token);
    if (!verificationTokenRecord) {
      throw AuthErrors.invalidToken('Email verification token not found');
    }

    if (verificationTokenRecord.isUsed) {
      throw AuthErrors.invalidToken('Email verification token has already been used');
    }

    if (verificationTokenRecord.expiresAt < new Date()) {
      throw AuthErrors.expiredToken('Email verification token has expired');
    }

    // Find user
    const user = await userDb.findById(tokenPayload.userId);
    if (!user) {
      throw AuthErrors.userNotFound();
    }

    // Verify token belongs to the user
    if (user.email !== tokenPayload.email) {
      throw AuthErrors.invalidToken('Token does not match user email');
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      const response = createSuccessResponse(
        {
          message: 'Email is already verified. You can now log in to your account.'
        },
        'Email already verified'
      );
      return addSecurityHeaders(response);
    }

    // Update user email verification status
    await userDb.update(user.id, {
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      updatedAt: new Date()
    });

    // Mark verification token as used
    await emailVerificationTokenDb.markAsUsed(token);

    // Delete all other verification tokens for this user
    await emailVerificationTokenDb.deleteAllForUser(user.id);

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.username);
    } catch (error) {
      // Don't fail verification if welcome email fails
      console.error('Failed to send welcome email:', error);
    }

    const response = createSuccessResponse(
      {
        message: 'Email verified successfully! Welcome to AI Agent Marketplace. You can now log in to your account.'
      },
      'Email verification successful'
    );

    return addSecurityHeaders(response);

  } catch (error) {
    return handleApiError(error);
  }
}

// Apply rate limiting to the handler
export const GET = withRateLimit(verifyEmailHandler, apiRateLimit);