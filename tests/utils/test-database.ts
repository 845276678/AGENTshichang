import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { randomBytes } from 'crypto'

// Test database configuration
export class TestDatabase {
  private static instance: PrismaClient | null = null
  private static testDbUrl: string | null = null

  static async setup(): Promise<PrismaClient> {
    if (this.instance) {
      return this.instance
    }

    // Generate unique database name for this test run
    const testId = randomBytes(8).toString('hex')
    this.testDbUrl = `file:./test-${testId}.db`

    // Set environment variable for Prisma
    process.env.DATABASE_URL = this.testDbUrl

    // Create new Prisma client instance
    this.instance = new PrismaClient({
      datasources: {
        db: {
          url: this.testDbUrl,
        },
      },
      log: [], // Disable logs in tests
    })

    try {
      // Run database migrations
      execSync('npx prisma migrate deploy', {
        env: { ...process.env, DATABASE_URL: this.testDbUrl },
        stdio: 'ignore',
      })

      // Connect to database
      await this.instance.$connect()

      console.log(`Test database setup complete: ${this.testDbUrl}`)
    } catch (error) {
      console.error('Failed to setup test database:', error)
      throw error
    }

    return this.instance
  }

  static async teardown(): Promise<void> {
    if (this.instance) {
      await this.instance.$disconnect()
      this.instance = null
    }

    // Clean up test database file
    if (this.testDbUrl) {
      try {
        const fs = require('fs')
        const path = require('path')
        const dbPath = path.resolve(this.testDbUrl.replace('file:', ''))
        if (fs.existsSync(dbPath)) {
          fs.unlinkSync(dbPath)
        }
      } catch (error) {
        console.warn('Failed to clean up test database file:', error)
      }
      this.testDbUrl = null
    }
  }

  static getInstance(): PrismaClient {
    if (!this.instance) {
      throw new Error('Test database not initialized. Call TestDatabase.setup() first.')
    }
    return this.instance
  }

  static async cleanup(): Promise<void> {
    if (!this.instance) return

    // Clean up all test data
    const tablenames = await this.instance.$queryRaw<
      Array<{ name: string }>
    >`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';`

    for (const { name } of tablenames) {
      try {
        await this.instance.$executeRawUnsafe(`DELETE FROM "${name}";`)
      } catch (error) {
        console.warn(`Failed to clean table ${name}:`, error)
      }
    }
  }

  // Seed test data
  static async seed(): Promise<void> {
    const db = this.getInstance()

    // Create test users
    await db.user.createMany({
      data: [
        {
          id: 'user-1',
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          password: '$2b$10$YourHashedPasswordHere', // bcrypt hash
          isEmailVerified: true,
          status: 'ACTIVE',
          role: 'USER',
          credits: 100,
          level: 1,
        },
        {
          id: 'admin-1',
          email: 'admin@example.com',
          username: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          password: '$2b$10$YourHashedPasswordHere',
          isEmailVerified: true,
          status: 'ACTIVE',
          role: 'ADMIN',
          credits: 1000,
          level: 10,
        },
        {
          id: 'user-2',
          email: 'inactive@example.com',
          username: 'inactive',
          firstName: 'Inactive',
          lastName: 'User',
          password: '$2b$10$YourHashedPasswordHere',
          isEmailVerified: false,
          status: 'INACTIVE',
          role: 'USER',
          credits: 0,
          level: 1,
        },
      ],
      skipDuplicates: true,
    })

    // Create test categories
    await db.category.createMany({
      data: [
        {
          id: 'cat-1',
          name: 'AI Assistant',
          description: 'AI-powered assistant tools',
          slug: 'ai-assistant',
        },
        {
          id: 'cat-2',
          name: 'Data Science',
          description: 'Data analysis and machine learning tools',
          slug: 'data-science',
        },
        {
          id: 'cat-3',
          name: 'Productivity',
          description: 'Tools to boost productivity',
          slug: 'productivity',
        },
      ],
      skipDuplicates: true,
    })

    // Create test agents
    await db.agent.createMany({
      data: [
        {
          id: 'agent-1',
          name: 'Test Agent 1',
          description: 'A test agent for unit testing',
          longDescription: 'This is a comprehensive test agent used for testing purposes.',
          price: 29.99,
          categoryId: 'cat-1',
          authorId: 'user-1',
          status: 'PUBLISHED',
          tags: ['test', 'ai', 'assistant'],
          features: ['Feature 1', 'Feature 2'],
          requirements: ['Requirement 1'],
          version: '1.0.0',
          downloads: 100,
          rating: 4.5,
          reviewCount: 10,
        },
        {
          id: 'agent-2',
          name: 'Test Agent 2',
          description: 'Another test agent',
          longDescription: 'This is another test agent for testing different scenarios.',
          price: 0, // Free agent
          categoryId: 'cat-2',
          authorId: 'user-1',
          status: 'PUBLISHED',
          tags: ['test', 'free', 'data'],
          features: ['Free feature'],
          requirements: ['Basic requirement'],
          version: '2.0.0',
          downloads: 500,
          rating: 4.8,
          reviewCount: 25,
        },
        {
          id: 'agent-3',
          name: 'Draft Agent',
          description: 'A draft agent',
          longDescription: 'This agent is still in draft status.',
          price: 49.99,
          categoryId: 'cat-1',
          authorId: 'user-1',
          status: 'DRAFT',
          tags: ['draft', 'testing'],
          features: ['Draft feature'],
          requirements: ['Draft requirement'],
          version: '0.1.0',
          downloads: 0,
          rating: 0,
          reviewCount: 0,
        },
      ],
      skipDuplicates: true,
    })

    // Create test orders
    await db.order.createMany({
      data: [
        {
          id: 'order-1',
          userId: 'user-1',
          status: 'COMPLETED',
          total: 29.99,
          currency: 'USD',
          paymentMethod: 'CARD',
          paymentStatus: 'PAID',
        },
        {
          id: 'order-2',
          userId: 'user-1',
          status: 'PENDING',
          total: 49.99,
          currency: 'USD',
          paymentMethod: 'CARD',
          paymentStatus: 'PENDING',
        },
      ],
      skipDuplicates: true,
    })

    // Create test order items
    await db.orderItem.createMany({
      data: [
        {
          id: 'item-1',
          orderId: 'order-1',
          agentId: 'agent-1',
          quantity: 1,
          price: 29.99,
        },
        {
          id: 'item-2',
          orderId: 'order-2',
          agentId: 'agent-3',
          quantity: 1,
          price: 49.99,
        },
      ],
      skipDuplicates: true,
    })

    // Create test reviews
    await db.review.createMany({
      data: [
        {
          id: 'review-1',
          userId: 'user-1',
          agentId: 'agent-1',
          rating: 5,
          comment: 'Excellent agent!',
        },
        {
          id: 'review-2',
          userId: 'admin-1',
          agentId: 'agent-2',
          rating: 4,
          comment: 'Good free agent.',
        },
      ],
      skipDuplicates: true,
    })

    console.log('Test database seeded successfully')
  }

  // Helper methods for tests
  static async createTestUser(userData: Partial<any> = {}) {
    const db = this.getInstance()
    const defaultUser = {
      email: `test-${Date.now()}@example.com`,
      username: `testuser-${Date.now()}`,
      firstName: 'Test',
      lastName: 'User',
      password: '$2b$10$YourHashedPasswordHere',
      isEmailVerified: true,
      status: 'ACTIVE',
      role: 'USER',
      credits: 100,
      level: 1,
    }

    return await db.user.create({
      data: { ...defaultUser, ...userData },
    })
  }

  static async createTestAgent(agentData: Partial<any> = {}) {
    const db = this.getInstance()
    const defaultAgent = {
      name: `Test Agent ${Date.now()}`,
      description: 'A test agent',
      longDescription: 'This is a test agent for testing purposes.',
      price: 29.99,
      categoryId: 'cat-1',
      authorId: 'user-1',
      status: 'PUBLISHED',
      tags: ['test'],
      features: ['Feature 1'],
      requirements: ['Requirement 1'],
      version: '1.0.0',
      downloads: 0,
      rating: 0,
      reviewCount: 0,
    }

    return await db.agent.create({
      data: { ...defaultAgent, ...agentData },
    })
  }

  static async createTestOrder(orderData: Partial<any> = {}) {
    const db = this.getInstance()
    const defaultOrder = {
      userId: 'user-1',
      status: 'PENDING',
      total: 29.99,
      currency: 'USD',
      paymentMethod: 'CARD',
      paymentStatus: 'PENDING',
    }

    return await db.order.create({
      data: { ...defaultOrder, ...orderData },
    })
  }
}

// Jest setup helpers
export async function setupTestDatabase() {
  return await TestDatabase.setup()
}

export async function teardownTestDatabase() {
  await TestDatabase.teardown()
}

export async function cleanupTestDatabase() {
  await TestDatabase.cleanup()
}

export async function seedTestDatabase() {
  await TestDatabase.seed()
}