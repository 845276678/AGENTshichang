import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// JWT token verification (simplified version for middleware)
function verifyJWTToken(token: string): any {
  try {
    // In a real implementation, you would verify the signature
    // For now, we just decode the payload
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp <= now) {
      return null; // Token expired
    }
    
    return payload;
  } catch (error) {
    return null; // Invalid token
  }
}

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/agents',
    '/categories',
    '/payment',
    '/docs',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-email',
    '/api/health'
  ]

  // Define protected paths that require authentication
  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/settings',
    '/my-agents',
    '/create-agent',
    '/checkin',
    '/api/auth/me',
    '/api/auth/logout',
    '/api/auth/profile'
  ]

  // Define admin paths that require admin role
  const adminPaths = [
    '/admin',
    '/api/admin'
  ]

  // Check if path is public
  const isPublicPath = publicPaths.some(p => 
    path === p || 
    path.startsWith(`${p}/`) ||
    path.startsWith('/_next/') ||
    path.startsWith('/static/') ||
    path === '/favicon.ico'
  )

  // Check if path is protected
  const isProtectedPath = protectedPaths.some(p => 
    path === p || path.startsWith(`${p}/`)
  )

  // Check if path is admin
  const isAdminPath = adminPaths.some(p => 
    path === p || path.startsWith(`${p}/`)
  )

  // Handle OPTIONS requests for CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  let response = NextResponse.next()

  // Get token from Authorization header or cookies
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') || 
                request.cookies.get('auth.access_token')?.value

  let user = null
  if (token) {
    user = verifyJWTToken(token)
  }

  // Redirect unauthenticated users from protected paths
  if (isProtectedPath && !user) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    } else {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect authenticated users from auth pages
  if (user && (path.startsWith('/auth/login') || path.startsWith('/auth/register'))) {
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }

  // Check admin access
  if (isAdminPath && (!user || user.role !== 'ADMIN')) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    } else {
      const unauthorizedUrl = new URL('/unauthorized', request.url)
      return NextResponse.redirect(unauthorizedUrl)
    }
  }

  // Check for suspended accounts
  if (user && user.status === 'SUSPENDED' && !isPublicPath) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Account suspended' },
        { status: 403 }
      )
    } else {
      const suspendedUrl = new URL('/account-suspended', request.url)
      return NextResponse.redirect(suspendedUrl)
    }
  }

  // Check for email verification requirement
  if (
    user && 
    !user.isEmailVerified && 
    isProtectedPath && 
    !path.startsWith('/auth/verify-email')
  ) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Email verification required' },
        { status: 403 }
      )
    } else {
      const verifyUrl = new URL('/auth/verify-email', request.url)
      return NextResponse.redirect(verifyUrl)
    }
  }

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )

  // Add CORS headers for API routes
  if (path.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )
  }

  // Add user info to headers for downstream usage (optional)
  if (user && !isPublicPath) {
    response.headers.set('X-User-ID', user.userId)
    response.headers.set('X-User-Role', user.role)
    response.headers.set('X-User-Email', user.email)
  }

  // Rate limiting headers (placeholder - implement actual rate limiting as needed)
  response.headers.set('X-RateLimit-Limit', '1000')
  response.headers.set('X-RateLimit-Remaining', '999')
  response.headers.set('X-RateLimit-Reset', String(Math.floor(Date.now() / 1000) + 3600))

  return response
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}