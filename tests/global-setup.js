/**
 * Global setup for Playwright tests
 * Prepares the testing environment
 */

async function globalSetup() {
  console.log('🚀 Setting up E2E test environment...');
  
  // Check if server is running
  try {
    const response = await fetch('http://localhost:3001');
    console.log('✅ Server is accessible');
  } catch (error) {
    console.warn('⚠️ Server may not be running. Please start with: npm run dev');
  }
  
  // Clean up any existing test data if needed
  console.log('🧹 Cleaning up previous test data...');
  
  // You could add database cleanup here if using a real database
  
  console.log('✅ Global setup completed');
}

module.exports = globalSetup;