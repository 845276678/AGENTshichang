/**
 * Security utilities for the AI Agent Marketplace
 */

// XSS protection
export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization (for production, consider using DOMPurify)
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Input validation
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  },

  password: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  filename: (filename: string): boolean => {
    // Prevent directory traversal and dangerous filenames
    const dangerousPatterns = [
      /\.\./,
      /[<>:"|?*]/,
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,
      /^\./
    ]

    return !dangerousPatterns.some(pattern => pattern.test(filename)) &&
           filename.length > 0 &&
           filename.length <= 255
  },

  url: (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return ['http:', 'https:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  }
}

// Content Security Policy headers
export const cspHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []

    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)

    if (validRequests.length >= this.maxRequests) {
      return false
    }

    validRequests.push(now)
    this.requests.set(identifier, validRequests)

    return true
  }

  getRemainingRequests(identifier: string): number {
    const requests = this.requests.get(identifier) || []
    const now = Date.now()
    const validRequests = requests.filter(time => now - time < this.windowMs)

    return Math.max(0, this.maxRequests - validRequests.length)
  }
}

// CSRF protection
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export const verifyCSRFToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken && token.length === 64
}

// Secure headers for API responses
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  ...cspHeaders
}

// Data encryption utilities (for sensitive data)
export const hashData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Secure session management
export const generateSessionId = (): string => {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Input size limits
export const INPUT_LIMITS = {
  EMAIL_MAX_LENGTH: 254,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 2000,
  FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  AGENT_NAME_MAX_LENGTH: 100,
  COMMENT_MAX_LENGTH: 1000
} as const

// Validate request size
export const validateRequestSize = (data: any, maxSize: number = 1024 * 1024): boolean => {
  const jsonString = JSON.stringify(data)
  return jsonString.length <= maxSize
}

// SQL injection prevention helpers
export const escapeSQL = (input: string): string => {
  return input.replace(/'/g, "''").replace(/;/g, '\\;')
}

// Safe redirect validation
export const isValidRedirect = (url: string, allowedDomains: string[] = []): boolean => {
  try {
    const urlObj = new URL(url, window?.location?.origin)

    // Allow relative URLs
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true
    }

    // Check against allowed domains
    return allowedDomains.some(domain =>
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    )
  } catch {
    return false
  }
}

export default {
  sanitizeHtml,
  validateInput,
  RateLimiter,
  generateCSRFToken,
  verifyCSRFToken,
  securityHeaders,
  hashData,
  generateSessionId,
  INPUT_LIMITS,
  validateRequestSize,
  escapeSQL,
  isValidRedirect
}