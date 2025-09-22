# Authentication API Documentation

This document describes the authentication API endpoints for the AI Agent Marketplace.

## Base URL

```
http://localhost:3000/api/auth
```

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": {
    "field": ["Error message"]
  }
}
```

## Rate Limiting

All endpoints implement rate limiting. Rate limit headers are included in responses:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets
- `Retry-After`: Seconds to wait before retry (when rate limited)

## Endpoints

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Rate Limit:** 3 requests per hour per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules:**
- `email`: Valid email format, 5-254 characters
- `username`: 3-30 characters, alphanumeric + underscore/hyphen only
- `password`: Minimum 8 characters, must contain uppercase, lowercase, and number
- `firstName`, `lastName`: Optional, 1-50 characters, letters/spaces/hyphens only

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": false,
      "role": "USER",
      "status": "PENDING_VERIFICATION",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Registration successful. Please check your email to verify your account.",
    "requiresEmailVerification": true
  }
}
```

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": true,
      "role": "USER",
      "status": "ACTIVE",
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    },
    "message": "Login successful"
  }
}
```

### 3. User Logout

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Required

**Query Parameters:**
- `all=true`: Logout from all devices (revokes all refresh tokens)

**Request Body (optional):**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": {
    "message": "Logged out successfully"
  }
}
```

### 4. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Rate Limit:** 3 requests per hour per IP

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent",
  "data": {
    "message": "If an account with that email exists, a password reset link has been sent."
  }
}
```

### 5. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Rate Limit:** 2 requests per 5 minutes per IP

**Request Body:**
```json
{
  "token": "password-reset-token",
  "password": "NewSecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "message": "Password has been reset successfully. Please log in with your new password."
  }
}
```

### 6. Refresh Access Token

**Endpoint:** `POST /api/auth/refresh`

**Rate Limit:** 100 requests per 15 minutes per IP

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

*Note: Refresh token can also be provided via httpOnly cookie*

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-jwt-access-token",
    "message": "Token refreshed successfully"
  }
}
```

### 7. Get Current User

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "User information retrieved successfully",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": true,
      "role": "USER",
      "status": "ACTIVE",
      "bio": "User bio",
      "avatar": "avatar-url",
      "emailNotifications": true,
      "marketingEmails": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 8. Verify Email

**Endpoint:** `GET /api/auth/verify-email`

**Query Parameters:**
- `token`: Email verification token (required)

**Example:** `/api/auth/verify-email?token=verification-token`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verification successful",
  "data": {
    "message": "Email verified successfully! Welcome to AI Agent Marketplace. You can now log in to your account."
  }
}
```

## Error Codes

- `INVALID_CREDENTIALS`: Invalid email or password
- `USER_NOT_FOUND`: User account not found
- `EMAIL_ALREADY_EXISTS`: Email is already registered
- `USERNAME_ALREADY_EXISTS`: Username is already taken
- `INVALID_TOKEN`: Invalid or malformed token
- `EXPIRED_TOKEN`: Token has expired
- `TOKEN_NOT_FOUND`: Token not found in database
- `ACCOUNT_NOT_VERIFIED`: Email verification required
- `ACCOUNT_SUSPENDED`: Account has been suspended
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `VALIDATION_ERROR`: Request validation failed
- `INTERNAL_SERVER_ERROR`: Server error

## Security Features

1. **Password Security**
   - Minimum 8 characters
   - Must contain uppercase, lowercase, and numbers
   - Hashed using bcrypt with salt rounds

2. **JWT Tokens**
   - Access tokens expire in 15 minutes
   - Refresh tokens expire in 7 days
   - Secure token generation and validation

3. **Rate Limiting**
   - Different limits for different endpoints
   - IP-based and user-based limiting
   - Automatic cleanup of expired entries

4. **Email Security**
   - Email verification required for new accounts
   - Password reset tokens expire in 1 hour
   - Security notifications for account activity

5. **CORS Protection**
   - Configurable allowed origins
   - Proper headers for cross-origin requests

6. **Additional Security Headers**
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block
   - Content-Security-Policy
   - Strict-Transport-Security (production)

## Environment Setup

Copy `.env.example` to `.env.local` and configure the following variables:

```bash
# Required for JWT tokens
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Required for email functionality
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@ai-agent-marketplace.com

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Development Notes

1. **Mock Database**: Currently uses in-memory storage for development. Replace with actual database in production.

2. **Email Service**: Configured for Gmail SMTP. Update for your preferred email provider.

3. **Rate Limiting**: Uses in-memory storage. Consider Redis for production with multiple servers.

4. **Security**: All endpoints implement proper error handling, validation, and security headers.

## Testing

Use tools like Postman or curl to test the endpoints:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"TestPassword123!"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'

# Get current user (with token)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```