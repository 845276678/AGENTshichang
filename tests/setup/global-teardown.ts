import { teardownTestDatabase } from '../utils/test-database'

export default async function globalTeardown() {
  console.log('Tearing down test environment...')

  try {
    // Cleanup test database
    await teardownTestDatabase()
    console.log('Test database cleanup complete')
  } catch (error) {
    console.error('Failed to cleanup test environment:', error)
  }
}