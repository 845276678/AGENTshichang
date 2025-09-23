import { POST } from '@/app/api/auth/login/route'
import {
  createTestRequest,
  getResponseData,
  setupApiMocks,
  cleanupApiMocks,
  mockPrisma,
  _mockServices,
  mockUser,
  TestDatabase,
  expectSuccessResponse,
  expectErrorResponse,
  expectValidationError,
} from '@/tests/utils/api-test-utils'

// Mock the dependencies
jest.mock('@/lib/database', () => ({
  prisma: require('@/tests/utils/api-test-utils').mockPrisma,
}))

jest.mock('@/lib/services/user.service', () => ({
  default: {
    findByIdentifier: jest.fn(),
    verifyPassword: jest.fn(),
    updateLastLogin: jest.fn(),
  },
}))

jest.mock('@/lib/jwt', () => ({
  generateTokenPair: jest.fn(() => ({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  })),
}))

jest.mock('@/lib/email', () => ({
  emailService: {
    sendSecurityNotification: jest.fn(),
  },
}))

jest.mock('@/lib/rate-limit', () => ({
  withRateLimit: jest.fn((handler) => handler),
  loginRateLimit: {},
}))

const UserService = require('@/lib/services/user.service').default
const { ____generateTokenPair } = require('@/lib/jwt')
const { emailService } = require('@/lib/email')

describe('/api/auth/login', () => {
  beforeEach(() => {
    setupApiMocks()
    TestDatabase.seed()
  })

  afterEach(() => {
    cleanupApiMocks()
    TestDatabase.cleanup()
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Setup mocks
      UserService.findByIdentifier.mockResolvedValue(mockUser)
      UserService.verifyPassword.mockResolvedValue(true)
      UserService.updateLastLogin.mockResolvedValue(undefined)
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 'token-1' })
      mockPrisma.userSession.create.mockResolvedValue({ id: 'session-1' })

      const request = createTestRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      })

      const response = await POST(request)
      const data = await getResponseData(response)

      expect(response.status).toBe(200)
      expectSuccessResponse(data)
      expect(data.data.user.email).toBe('test@example.com')
      expect(data.data.tokens.accessToken).toBe('mock-access-token')
      expect(UserService.findByIdentifier).toHaveBeenCalledWith('test@example.com')
      expect(UserService.verifyPassword).toHaveBeenCalledWith(mockUser, 'password123')
    })

    it('should set refresh token cookie when rememberMe is true', async () => {
      UserService.findByIdentifier.mockResolvedValue(mockUser)
      UserService.verifyPassword.mockResolvedValue(true)
      UserService.updateLastLogin.mockResolvedValue(undefined)
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 'token-1' })
      mockPrisma.userSession.create.mockResolvedValue({ id: 'session-1' })

      const request = createTestRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(response.cookies.get('refreshToken')).toBeDefined()
    })

    it('should fail with invalid email format', async () => {
      const request = createTestRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'invalid-email',
        password: 'password123',
        rememberMe: false,
      })

      const response = await POST(request)
      const data = await getResponseData(response)

      expect(response.status).toBe(400)
      expectValidationError(data, 'email')
    })

    it('should fail with missing password', async () => {
      const request = createTestRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        rememberMe: false,
      })

      const response = await POST(request)
      const data = await getResponseData(response)

      expect(response.status).toBe(400)
      expectValidationError(data, 'password')
    })

    it('should fail with short password', async () => {
      const request = createTestRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: '123',
        rememberMe: false,
      })

      const response = await POST(request)
      const data = await getResponseData(response)

      expect(response.status).toBe(400)
      expectValidationError(data, 'password')
    })

    it('should fail with non-existent user', async () => {
      UserService.findByIdentifier.mockResolvedValue(null)

      const request = createTestRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'nonexistent@example.com',
        password: 'password123',
        rememberMe: false,
      })

      const response = await POST(request)
      const data = await getResponseData(response)

      expect(response.status).toBe(401)
      expectErrorResponse(data, 'Invalid credentials')
    })

    it('should fail with incorrect password', async () => {
      UserService.findByIdentifier.mockResolvedValue(mockUser)
      UserService.verifyPassword.mockResolvedValue(false)

      const request = createTestRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'wrongpassword',
        rememberMe: false,
      })

      const response = await POST(request)
      const data = await getResponseData(response)

      expect(response.status).toBe(401)
      expectErrorResponse(data, 'Invalid credentials')
    })

    it('should fail with suspended account', async () => {
      const suspendedUser = { ...mockUser, status: 'SUSPENDED' }
      UserService.findByIdentifier.mockResolvedValue(suspendedUser)

      const request = createTestRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      })

      const response = await POST(request)
      const data = await getResponseData(response)

      expect(response.status).toBe(403)
      expectErrorResponse(data, 'suspended')
    })

    it('should fail with banned account', async () => {
      const bannedUser = { ...mockUser, status: 'BANNED' }
      UserService.findByIdentifier.mockResolvedValue(bannedUser)

      const request = createTestRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      })

      const response = await POST(request)
      const data = await getResponseData(response)

      expect(response.status).toBe(403)
      expectErrorResponse(data, 'suspended')
    })

    it('should fail with unverified email when account is inactive', async () => {
      const unverifiedUser = {
        ...mockUser,
        isEmailVerified: false,
        status: 'INACTIVE',
      }
      UserService.findByIdentifier.mockResolvedValue(unverifiedUser)
      UserService.verifyPassword.mockResolvedValue(true)

      const request = createTestRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      })

      const response = await POST(request)
      const data = await getResponseData(response)

      expect(response.status).toBe(403)
      expectErrorResponse(data, 'verify your email')
    })

    it('should handle method not allowed', async () => {
      const request = createTestRequest('GET', 'http://localhost:3000/api/auth/login')

      const response = await POST(request)
      const data = await getResponseData(response)

      expect(response.status).toBe(405)
      expectErrorResponse(data, 'Method not allowed')
    })

    it('should handle invalid content type', async () => {
      const request = createTestRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        { email: 'test@example.com', password: 'password123' },
        { 'content-type': 'text/plain' }
      )

      const response = await POST(request)
      const data = await getResponseData(response)

      expect(response.status).toBe(400)
      expectErrorResponse(data, 'Invalid content type')
    })

    it('should handle malformed JSON', async () => {
      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'invalid json',
      })

      const response = await POST(request as any)
      const ___data = await getResponseData(response)

      expect(response.status).toBe(400)
    })

    it('should send security notification email', async () => {
      UserService.findByIdentifier.mockResolvedValue(mockUser)
      UserService.verifyPassword.mockResolvedValue(true)
      UserService.updateLastLogin.mockResolvedValue(undefined)
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 'token-1' })
      mockPrisma.userSession.create.mockResolvedValue({ id: 'session-1' })

      const request = createTestRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      })

      await POST(request)

      expect(emailService.sendSecurityNotification).toHaveBeenCalledWith(
        'test@example.com',
        'testuser',
        'Account login',
        '127.0.0.1',
        expect.any(String)
      )
    })

    it('should continue login even if email notification fails', async () => {
      UserService.findByIdentifier.mockResolvedValue(mockUser)
      UserService.verifyPassword.mockResolvedValue(true)
      UserService.updateLastLogin.mockResolvedValue(undefined)
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 'token-1' })
      mockPrisma.userSession.create.mockResolvedValue({ id: 'session-1' })
      emailService.sendSecurityNotification.mockRejectedValue(new Error('Email failed'))

      const request = createTestRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      })

      const response = await POST(request)
      const data = await getResponseData(response)

      expect(response.status).toBe(200)
      expectSuccessResponse(data)
    })

    it('should extract client IP from headers correctly', async () => {
      UserService.findByIdentifier.mockResolvedValue(mockUser)
      UserService.verifyPassword.mockResolvedValue(true)
      UserService.updateLastLogin.mockResolvedValue(undefined)
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 'token-1' })
      mockPrisma.userSession.create.mockResolvedValue({ id: 'session-1' })

      const request = createTestRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        {
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        },
        {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
          'user-agent': 'Test User Agent',
        }
      )

      await POST(request)

      expect(mockPrisma.userSession.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ipAddress: '192.168.1.1',
          userAgent: 'Test User Agent',
        }),
      })
    })
  })
})