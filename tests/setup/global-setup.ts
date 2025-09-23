import { setupTestDatabase } from '../utils/test-database'

export default async function globalSetup() {
  console.log('Setting up test environment...')

  try {
    // Setup test database
    await setupTestDatabase()
    console.log('Test database setup complete')

    // Set test environment variables
    process.env.NODE_ENV = 'test'
    process.env.JWT_SECRET = 'test-jwt-secret-key'
    process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
    process.env.NEXTAUTH_URL = 'http://localhost:3000'

    // Disable logging in tests
    console.log = jest.fn()
    console.warn = jest.fn()
    console.error = jest.fn()

  } catch (error) {
    console.error('Failed to setup test environment:', error)
    throw error
  }
}