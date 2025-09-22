#!/usr/bin/env node

/**
 * Simple test script for authentication API
 * Run with: node test-auth-api.js
 * Make sure the server is running on http://localhost:3000
 */

const API_BASE = 'http://localhost:3000/api/auth';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

async function testRegistration() {
  console.log('\n🔐 Testing User Registration...');
  
  const result = await makeRequest('/register', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      username: 'testuser',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    })
  });

  console.log(`Status: ${result.status}`);
  console.log(`Success: ${result.ok}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testLogin(email = 'test@example.com', password = 'TestPassword123!') {
  console.log('\n🔑 Testing User Login...');
  
  const result = await makeRequest('/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password
    })
  });

  console.log(`Status: ${result.status}`);
  console.log(`Success: ${result.ok}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testGetCurrentUser(accessToken) {
  console.log('\n👤 Testing Get Current User...');
  
  const result = await makeRequest('/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });

  console.log(`Status: ${result.status}`);
  console.log(`Success: ${result.ok}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testRefreshToken(refreshToken) {
  console.log('\n🔄 Testing Token Refresh...');
  
  const result = await makeRequest('/refresh', {
    method: 'POST',
    body: JSON.stringify({
      refreshToken
    })
  });

  console.log(`Status: ${result.status}`);
  console.log(`Success: ${result.ok}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testForgotPassword() {
  console.log('\n🔒 Testing Forgot Password...');
  
  const result = await makeRequest('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com'
    })
  });

  console.log(`Status: ${result.status}`);
  console.log(`Success: ${result.ok}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testLogout(accessToken, refreshToken) {
  console.log('\n👋 Testing User Logout...');
  
  const result = await makeRequest('/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      refreshToken
    })
  });

  console.log(`Status: ${result.status}`);
  console.log(`Success: ${result.ok}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testHealthCheck() {
  console.log('\n❤️ Testing Health Check...');
  
  const result = await makeRequest('/../health', {
    method: 'GET'
  });

  console.log(`Status: ${result.status}`);
  console.log(`Success: ${result.ok}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function runTests() {
  console.log('🚀 Starting Authentication API Tests');
  console.log('=====================================');

  try {
    // Test health check first
    await testHealthCheck();

    // Test registration
    const registerResult = await testRegistration();
    
    // Test login with existing user (admin@example.com from mock data)
    const loginResult = await testLogin('admin@example.com', '$2a$10$dummy.hash.for.testing.purposes');
    
    if (loginResult.ok && loginResult.data.data.tokens) {
      const { accessToken, refreshToken } = loginResult.data.data.tokens;
      
      // Test getting current user
      await testGetCurrentUser(accessToken);
      
      // Test token refresh
      await testRefreshToken(refreshToken);
      
      // Test logout
      await testLogout(accessToken, refreshToken);
    }

    // Test forgot password
    await testForgotPassword();

    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testRegistration,
  testLogin,
  testGetCurrentUser,
  testRefreshToken,
  testForgotPassword,
  testLogout,
  testHealthCheck
};