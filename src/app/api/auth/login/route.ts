import { NextRequest, NextResponse } from 'next/server';
import { loginSchema, validateInput } from '@/lib/validations';
import UserService from '@/lib/services/user.service';
import { generateTokenPair } from '@/lib/jwt';
import { emailService } from '@/lib/email';
import { withRateLimit, loginRateLimit } from '@/lib/rate-limit';
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

function getClientInfo(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  let ipAddress = 'unknown';

  if (forwarded) {
    ipAddress = forwarded.split(',')[0].trim();
  } else if (realIp) {
    ipAddress = realIp;
  } else if (cfConnectingIp) {
    ipAddress = cfConnectingIp;
  }

  if (process.env.NODE_ENV === 'development' && ipAddress === 'unknown') {
    ipAddress = '127.0.0.1';
  }

  return { userAgent, ipAddress };
}

async function loginHandler(request: NextRequest): Promise<NextResponse> {
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
    const validation = validateInput(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 });
    }

    const { email, password, rememberMe } = validation.data;

    // Find user by identifier (email/username/phone)
    const user = await UserService.findByIdentifier(email);
    if (!user) {
      throw AuthErrors.invalidCredentials();
    }

    // Check if account is suspended
    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      throw AuthErrors.accountSuspended();
    }

    // Verify password
    const isValidPassword = await UserService.verifyPassword(user, password);
    if (!isValidPassword) {
      throw AuthErrors.invalidCredentials();
    }

    // Check if email is verified (optional - you can skip this check if needed)
    if (!user.isEmailVerified && user.status === 'INACTIVE') {
      throw AuthErrors.accountNotVerified('Please verify your email before logging in');
    }

    // Generate tokens
    const tokens = generateTokenPair(user.id, user.email, user.role);

    // Store refresh token and session in database
    const { userAgent, ipAddress } = getClientInfo(request);
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + (rememberMe ? 30 : 7)); // 30 days or 7 days

    // Create refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt,
        isRevoked: false
      }
    });

    // Create user session
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + (rememberMe ? 30 : 7));

    await prisma.userSession.create({
      data: {
        token: tokens.accessToken,
        userId: user.id,
        ipAddress,
        userAgent,
        expiresAt: sessionExpiresAt
      }
    });

    // Update last login time
    await UserService.updateLastLogin(user.id);

    // Send security notification email for new device/location
    try {
      await emailService.sendSecurityNotification(
        user.email,
        user.username,
        'Account login',
        ipAddress,
        userAgent
      );
    } catch (error) {
      // Don't fail login if email fails
      console.error('Failed to send security notification:', error);
    }

    // Return success response
    const response = createSuccessResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          credits: user.credits,
          level: user.level,
          isEmailVerified: user.isEmailVerified,
          avatar: user.avatar,
          role: user.role,
          status: user.status
        },
        tokens,
        message: 'Login successful'
      },
      'Login successful'
    );

    // Set refresh token in httpOnly cookie if rememberMe is true
    if (rememberMe) {
      response.cookies.set('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/'
      });
    }

    return addSecurityHeaders(response);

  } catch (error) {
    return handleApiError(error);
  }
}

// Apply rate limiting to the handler
export const POST = withRateLimit(loginHandler, loginRateLimit);