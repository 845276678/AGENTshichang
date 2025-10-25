import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordSchema, validateInput } from '@/lib/validations';
import { hashPassword } from '@/lib/password';
import { verifyPasswordResetToken } from '@/lib/jwt';
import { userDb, passwordResetTokenDb, refreshTokenDb } from '@/lib/mock-db';
import { withRateLimit, sensitiveOperationRateLimit } from '@/lib/rate-limit';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  AuthErrors 
} from '@/lib/errors';
import { 
  handleCorsPreflightRequest,
  validateContentType,
  addSecurityHeaders 
} from '@/lib/auth-middleware';

async function resetPasswordHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest(request);
    }

    // Only allow POST method
    if (request.method !== 'POST') {
      return createErrorResponse('Method not allowed', 405);
    }

    // Validate content type
    if (!validateContentType(request)) {
      return createErrorResponse('Invalid content type. Expected application/json', 400);
    }

    // Parse request body
    const body = await request.json();

    // Validate input data
    const validation = validateInput(resetPasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 });
    }

    const { token, password } = validation.data;

    // Verify the reset token
    let tokenPayload;
    try {
      tokenPayload = verifyPasswordResetToken(token);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'RESET_TOKEN_EXPIRED') {
          throw AuthErrors.expiredToken('Password reset token has expired');
        } else if (error.message === 'INVALID_RESET_TOKEN') {
          throw AuthErrors.invalidToken('Invalid password reset token');
        }
      }
      throw AuthErrors.invalidToken('Token verification failed');
    }

    // Find the token in database to ensure it hasn't been used
    const resetTokenRecord = await passwordResetTokenDb.findByToken(token);
    if (!resetTokenRecord) {
      throw AuthErrors.invalidToken('Password reset token not found');
    }

    if (resetTokenRecord.isUsed) {
      throw AuthErrors.invalidToken('Password reset token has already been used');
    }

    if (resetTokenRecord.expiresAt < new Date()) {
      throw AuthErrors.expiredToken('Password reset token has expired');
    }

    // Find user
    const user = await userDb.findById(tokenPayload.userId);
    if (!user) {
      throw AuthErrors.userNotFound();
    }

    // Verify token belongs to the user
    if (user.email !== tokenPayload.email) {
      throw AuthErrors.invalidToken('Token does not match user');
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await userDb.update(user.id, {
      password: hashedPassword,
      updatedAt: new Date()
    });

    // Mark reset token as used
    await passwordResetTokenDb.markAsUsed(token);

    // Revoke all refresh tokens for this user (force re-login on all devices)
    await refreshTokenDb.revokeAllForUser(user.id);

    // Delete all other password reset tokens for this user
    await passwordResetTokenDb.deleteAllForUser(user.id);

    const response = createSuccessResponse(
      {
        message: 'Password has been reset successfully. Please log in with your new password.'
      },
      'Password reset successful'
    );

    return addSecurityHeaders(response);

  } catch (error) {
    return handleApiError(error);
  }
}

// Apply rate limiting to the handler
export const POST = withRateLimit(resetPasswordHandler, sensitiveOperationRateLimit);