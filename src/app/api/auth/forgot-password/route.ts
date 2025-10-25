import { NextRequest, NextResponse } from 'next/server';
import { forgotPasswordSchema, validateInput } from '@/lib/validations';
import { generatePasswordResetToken } from '@/lib/jwt';
import { userDb, passwordResetTokenDb } from '@/lib/mock-db';
import { emailService } from '@/lib/email';
import { withRateLimit, passwordResetRateLimit } from '@/lib/rate-limit';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError
} from '@/lib/errors';
import { 
  handleCorsPreflightRequest,
  validateContentType,
  addSecurityHeaders 
} from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic'


async function forgotPasswordHandler(request: NextRequest): Promise<NextResponse> {
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
    const validation = validateInput(forgotPasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 });
    }

    const { email } = validation.data;

    // Find user by email
    const user = await userDb.findByEmail(email);
    
    // For security reasons, always return success even if email doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return createSuccessResponse(
        {
          message: 'If an account with that email exists, a password reset link has been sent.'
        },
        'Password reset email sent'
      );
    }

    // Delete any existing password reset tokens for this user
    await passwordResetTokenDb.deleteAllForUser(user.id);

    // Generate password reset token
    const resetToken = generatePasswordResetToken(user.id, user.email);
    
    // Save reset token to database
    await passwordResetTokenDb.create({
      token: resetToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      isUsed: false
    });

    // Send password reset email
    const emailSent = await emailService.sendPasswordReset(
      user.email,
      user.username,
      resetToken
    );

    if (!emailSent) {
      console.error('Failed to send password reset email to:', user.email);
      // Still return success to prevent information leakage
    }

    const response = createSuccessResponse(
      {
        message: 'If an account with that email exists, a password reset link has been sent.'
      },
      'Password reset email sent'
    );

    return addSecurityHeaders(response);

  } catch (error) {
    return handleApiError(error);
  }
}

// Apply rate limiting to the handler
export const POST = withRateLimit(forgotPasswordHandler, passwordResetRateLimit);