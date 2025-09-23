import { NextRequest, NextResponse } from 'next/server'


// Helper to create a Next.js request object for testing
export function createTestRequest(
  method: string,
  url: string,
  body?: any,
  headers?: Record<string, string>
): NextRequest {
  const requestInit: RequestInit = {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  }

  if (body) {
    requestInit.body = JSON.stringify(body)
  }

  return new NextRequest(url, requestInit)
}

// Helper to extract response data
export async function getResponseData(response: NextResponse) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// Mock database operations
export const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  userSession: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  agent: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  order: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  payment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  review: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}

// Mock external services
export const mockServices = {
  email: {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendSecurityNotification: jest.fn(),
    sendWelcomeEmail: jest.fn(),
  },
  jwt: {
    generateTokenPair: jest.fn(() => ({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    })),
    verifyToken: jest.fn(),
    generateEmailVerificationToken: jest.fn(() => 'mock-verification-token'),
    generatePasswordResetToken: jest.fn(() => 'mock-reset-token'),
  },
  payment: {
    createPaymentIntent: jest.fn(),
    confirmPayment: jest.fn(),
    refundPayment: jest.fn(),
  },
  storage: {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    getSignedUrl: jest.fn(),
  },
}

// Mock rate limiting
export const mockRateLimit = {
  check: jest.fn(() => Promise.resolve({ success: true })),
  reset: jest.fn(),
}

// Setup function to configure mocks before each test
export function setupApiMocks() {
  // Reset all mocks
  Object.values(mockPrisma).forEach(model => {
    Object.values(model).forEach(method => {
      if (jest.isMockFunction(method)) {
        method.mockReset()
      }
    })
  })

  Object.values(mockServices).forEach(service => {
    Object.values(service).forEach(method => {
      if (jest.isMockFunction(method)) {
        method.mockReset()
      }
    })
  })

  // Mock environment variables
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test-jwt-secret'
  process.env.DATABASE_URL = 'file:./test.db'
  process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
  process.env.NEXTAUTH_URL = 'http://localhost:3000'

  // Mock console methods to reduce noise in tests
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'log').mockImplementation(() => {})
}

// Cleanup function
export function cleanupApiMocks() {
  jest.restoreAllMocks()
}

// Mock user data
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  password: '$2b$10$hashedpassword', // bcrypt hash of 'password123'
  isEmailVerified: true,
  status: 'ACTIVE',
  role: 'USER',
  credits: 100,
  level: 1,
  avatar: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  lastLogin: new Date('2024-01-01'),
}

export const mockAdmin = {
  ...mockUser,
  id: 'admin-1',
  email: 'admin@example.com',
  username: 'admin',
  role: 'ADMIN',
}

// Test database helpers
export class TestDatabase {
  static async seed() {
    // Seed test data
    mockPrisma.user.findUnique.mockImplementation(({ where }) => {
      if (where.email === mockUser.email || where.id === mockUser.id) {
        return Promise.resolve(mockUser)
      }
      if (where.email === mockAdmin.email || where.id === mockAdmin.id) {
        return Promise.resolve(mockAdmin)
      }
      return Promise.resolve(null)
    })

    mockPrisma.user.findFirst.mockImplementation(({ where }) => {
      if (where.email === mockUser.email) {
        return Promise.resolve(mockUser)
      }
      if (where.email === mockAdmin.email) {
        return Promise.resolve(mockAdmin)
      }
      return Promise.resolve(null)
    })
  }

  static async cleanup() {
    // Reset database state
    Object.values(mockPrisma).forEach(model => {
      Object.values(model).forEach(method => {
        if (jest.isMockFunction(method)) {
          method.mockReset()
        }
      })
    })
  }
}

// Auth helpers
export function createAuthHeaders(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
  }
}

export function createAdminAuthHeaders() {
  return createAuthHeaders('admin-token')
}

export function createUserAuthHeaders() {
  return createAuthHeaders('user-token')
}

// File upload helpers
export function createMockFile(name: string, content: string, type: string = 'text/plain') {
  return new File([content], name, { type })
}

export function createMockFormData(files: Record<string, File>, fields: Record<string, string> = {}) {
  const formData = new FormData()

  Object.entries(files).forEach(([key, file]) => {
    formData.append(key, file)
  })

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value)
  })

  return formData
}

// Validation helpers
export function expectSuccessResponse(response: any, data?: any) {
  expect(response.success).toBe(true)
  if (data !== undefined) {
    expect(response.data).toEqual(data)
  }
}

export function expectErrorResponse(response: any, message?: string, _status?: number) {
  expect(response.success).toBe(false)
  if (message) {
    expect(response.message || response.error).toMatch(message)
  }
}

export function expectValidationError(response: any, field?: string) {
  expect(response.success).toBe(false)
  expect(response.errors || response.message).toBeDefined()
  if (field) {
    expect(JSON.stringify(response.errors || response.message)).toMatch(field)
  }
}