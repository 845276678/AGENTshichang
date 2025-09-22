/**
 * Global teardown for Playwright tests
 * Cleans up after all tests are completed
 */

async function globalTeardown() {
  console.log('🧹 Cleaning up after E2E tests...');
  
  // Clean up any test data created during testing
  // This could include removing test users from database, etc.
  
  console.log('✅ Global teardown completed');
}

module.exports = globalTeardown;