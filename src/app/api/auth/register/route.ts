import { NextRequest, NextResponse } from 'next/server';
import { registerSchema, validateInput } from '@/lib/validations';
import UserService from '@/lib/services/user.service';
import { generateEmailVerificationToken } from '@/lib/jwt';
import { emailService } from '@/lib/email';
import { withRateLimit, registrationRateLimit } from '@/lib/rate-limit';
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
import { prisma } from '@/lib/database';

async function registerHandler(request: NextRequest): Promise<NextResponse> {
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
    const validation = validateInput(registerSchema, body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 });
    }

    const { email, username, password, firstName, lastName } = validation.data;

    // Check if user already exists
    const existence = await UserService.checkExistence(email, username);
    if (existence.emailExists) {
      throw AuthErrors.emailAlreadyExists();
    }
    if (existence.usernameExists) {
      throw AuthErrors.usernameAlreadyExists();
    }

    // Create user using UserService
    const newUser = await UserService.create({
      email,
      username,
      password,
      firstName,
      lastName
    });

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken(newUser.id, newUser.email);

    // Save verification token to database
    await prisma.refreshToken.create({
      data: {
        token: verificationToken,
        userId: newUser.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isRevoked: false
      }
    });

    // Send verification email
    const emailSent = await emailService.sendEmailVerification(
      newUser.email,
      newUser.username,
      verificationToken
    );

    if (!emailSent) {
      console.error('Failed to send verification email to:', newUser.email);
    }

    // Return success response
    const response = createSuccessResponse(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          credits: newUser.credits,
          level: newUser.level,
          isEmailVerified: newUser.isEmailVerified
        },
        message: 'Registration successful. Please check your email to verify your account.',
        requiresEmailVerification: true
      },
      'Registration successful',
      201
    );

    return addSecurityHeaders(response);

  } catch (error) {
    return handleApiError(error);
  }
}

// Apply rate limiting to the handler
export const POST = withRateLimit(registerHandler, registrationRateLimit);