#!/usr/bin/env node

/**
 * Comprehensive Authentication System Testing Script
 * Tests the AI Agent Marketplace authentication system
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3002';

// Test utilities
const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));
    
    return {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      data,
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Network Error',
      ok: false,
      error: error.message,
    };
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test data
const testUsers = {
  valid: {
    email: 'test@example.com',
    username: 'testuser',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User'
  },
  invalid: {
    email: 'invalid-email',
    username: '',
    password: '123',
    firstName: '',
    lastName: ''
  }
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  tests: []
};

// Logging utilities
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  section: (msg) => console.log(`\n🔍 ${msg}\n${'='.repeat(msg.length + 4)}`),
};

// Test assertion function
const assert = (condition, message, details = null) => {
  testResults.total++;
  
  if (condition) {
    testResults.passed++;
    log.success(`PASS: ${message}`);
    testResults.tests.push({ status: 'PASS', message, details });
  } else {
    testResults.failed++;
    log.error(`FAIL: ${message}`);
    if (details) {
      console.log(`       Details: ${JSON.stringify(details, null, 2)}`);
    }
    testResults.tests.push({ status: 'FAIL', message, details });
  }
};

// 1. Server Health Check
async function testServerHealth() {
  log.section('Server Health Check');
  
  const response = await makeRequest(`${BASE_URL}/api/health`);
  assert(
    response.ok,
    'Health endpoint should be accessible',
    { status: response.status, data: response.data }
  );
}

// 2. Login Page Access Test
async function testLoginPageAccess() {
  log.section('Login Page Access Test');
  
  try {
    const response = await fetch(`${BASE_URL}/auth/login`);
    assert(
      response.ok,
      'Login page should be accessible',
      { status: response.status, statusText: response.statusText }
    );
    
    const html = await response.text();
    assert(
      html.includes('欢迎回来') || html.includes('Login') || html.includes('login'),
      'Login page should contain login-related content',
      { hasContent: html.length > 0 }
    );
  } catch (error) {
    assert(false, 'Login page should load without errors', { error: error.message });
  }
}

// 3. Registration API Tests
async function testRegistrationAPI() {
  log.section('Registration API Tests');
  
  // Test with empty data (should fail)
  const emptyResponse = await makeRequest(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  
  assert(
    !emptyResponse.ok && emptyResponse.status === 400,
    'Registration with empty data should fail with 400',
    { status: emptyResponse.status, data: emptyResponse.data }
  );
  
  // Test with invalid email (should fail)
  const invalidEmailResponse = await makeRequest(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      ...testUsers.valid,
      email: testUsers.invalid.email
    }),
  });
  
  assert(
    !invalidEmailResponse.ok && invalidEmailResponse.status === 400,
    'Registration with invalid email should fail with 400',
    { status: invalidEmailResponse.status, data: invalidEmailResponse.data }
  );
  
  // Test with weak password (should fail)
  const weakPasswordResponse = await makeRequest(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      ...testUsers.valid,
      password: testUsers.invalid.password
    }),
  });
  
  assert(
    !weakPasswordResponse.ok && weakPasswordResponse.status === 400,
    'Registration with weak password should fail with 400',
    { status: weakPasswordResponse.status, data: weakPasswordResponse.data }
  );
  
  // Test with valid data (should succeed)
  const validResponse = await makeRequest(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(testUsers.valid),
  });
  
  assert(
    validResponse.ok || validResponse.status === 201,
    'Registration with valid data should succeed',
    { status: validResponse.status, data: validResponse.data }
  );
  
  if (validResponse.ok || validResponse.status === 201) {
    assert(
      validResponse.data.success === true,
      'Registration response should indicate success',
      { data: validResponse.data }
    );
    
    assert(
      validResponse.data.data && validResponse.data.data.user,
      'Registration response should contain user data',
      { hasUser: !!validResponse.data.data?.user }
    );
    
    assert(
      !validResponse.data.data.user.password,
      'Registration response should not contain password',
      { hasPassword: !!validResponse.data.data.user?.password }
    );
  }
  
  // Test duplicate registration (should fail)
  await sleep(100); // Small delay to avoid rate limiting
  const duplicateResponse = await makeRequest(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(testUsers.valid),
  });
  
  assert(
    !duplicateResponse.ok && duplicateResponse.status === 409,
    'Duplicate registration should fail with 409',
    { status: duplicateResponse.status, data: duplicateResponse.data }
  );
}

// 4. Login API Tests
async function testLoginAPI() {
  log.section('Login API Tests');
  
  // Test with empty credentials (should fail)
  const emptyResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  
  assert(
    !emptyResponse.ok && emptyResponse.status === 400,
    'Login with empty credentials should fail with 400',
    { status: emptyResponse.status, data: emptyResponse.data }
  );
  
  // Test with invalid credentials (should fail)
  const invalidResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    }),
  });
  
  assert(
    !invalidResponse.ok && invalidResponse.status === 401,
    'Login with invalid credentials should fail with 401',
    { status: invalidResponse.status, data: invalidResponse.data }
  );
  
  // Test with valid credentials (should succeed if user exists)
  const validResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUsers.valid.email,
      password: testUsers.valid.password,
      rememberMe: true
    }),
  });
  
  // Note: This might fail if the user hasn't verified their email
  if (validResponse.ok) {
    assert(
      validResponse.data.success === true,
      'Login response should indicate success',
      { data: validResponse.data }
    );
    
    assert(
      validResponse.data.data && validResponse.data.data.tokens,
      'Login response should contain tokens',
      { hasTokens: !!validResponse.data.data?.tokens }
    );
    
    assert(
      validResponse.data.data.tokens.accessToken,
      'Login response should contain access token',
      { hasAccessToken: !!validResponse.data.data.tokens?.accessToken }
    );
    
    assert(
      validResponse.data.data.tokens.refreshToken,
      'Login response should contain refresh token',
      { hasRefreshToken: !!validResponse.data.data.tokens?.refreshToken }
    );
    
    // Store tokens for later tests
    global.testTokens = validResponse.data.data.tokens;
  } else {
    log.warning('Login test may fail due to email verification requirement');
    assert(
      validResponse.status === 403 || validResponse.status === 401,
      'Login with unverified account should fail with 403 or 401',
      { status: validResponse.status, data: validResponse.data }
    );
  }
}

// 5. Protected Route Test
async function testProtectedRoutes() {
  log.section('Protected Route Tests');
  
  // Test accessing protected route without token (should fail)
  const noTokenResponse = await makeRequest(`${BASE_URL}/api/auth/me`);
  
  assert(
    !noTokenResponse.ok && noTokenResponse.status === 401,
    'Accessing protected route without token should fail with 401',
    { status: noTokenResponse.status, data: noTokenResponse.data }
  );
  
  // Test with invalid token (should fail)
  const invalidTokenResponse = await makeRequest(`${BASE_URL}/api/auth/me`, {
    headers: {
      'Authorization': 'Bearer invalid-token'
    }
  });
  
  assert(
    !invalidTokenResponse.ok && invalidTokenResponse.status === 401,
    'Accessing protected route with invalid token should fail with 401',
    { status: invalidTokenResponse.status, data: invalidTokenResponse.data }
  );
  
  // Test with valid token (if available)
  if (global.testTokens && global.testTokens.accessToken) {
    const validTokenResponse = await makeRequest(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${global.testTokens.accessToken}`
      }
    });
    
    assert(
      validTokenResponse.ok,
      'Accessing protected route with valid token should succeed',
      { status: validTokenResponse.status, data: validTokenResponse.data }
    );
  }
}

// 6. CORS and Security Headers Test
async function testSecurityHeaders() {
  log.section('Security Headers Tests');
  
  const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'OPTIONS'
  });
  
  assert(
    response.status === 200 || response.status === 204,
    'CORS preflight should be handled correctly',
    { status: response.status }
  );
  
  // Test for security headers in actual request
  const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
  });
  
  const securityHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection'
  ];
  
  securityHeaders.forEach(header => {
    assert(
      loginResponse.headers[header] !== undefined,
      `Response should include ${header} security header`,
      { header, value: loginResponse.headers[header] }
    );
  });
}

// 7. Rate Limiting Test
async function testRateLimit() {
  log.section('Rate Limiting Tests');
  
  log.info('Testing rate limiting with multiple rapid requests...');
  
  const promises = Array.from({ length: 10 }, (_, i) => 
    makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: `test${i}@example.com`,
        password: 'testpassword'
      }),
    })
  );
  
  const responses = await Promise.all(promises);
  const rateLimitedResponses = responses.filter(r => r.status === 429);
  
  assert(
    rateLimitedResponses.length > 0,
    'Rate limiting should block excessive requests',
    { 
      totalRequests: responses.length, 
      rateLimitedCount: rateLimitedResponses.length 
    }
  );
}

// 8. Form Validation Test (Client-side)
async function testFormValidation() {
  log.section('Form Validation Tests');
  
  // Test various validation scenarios through API since we can't test client-side directly
  const validationTests = [
    {
      name: 'empty email',
      data: { email: '', password: 'validpassword' },
      shouldFail: true
    },
    {
      name: 'invalid email format',
      data: { email: 'not-an-email', password: 'validpassword' },
      shouldFail: true
    },
    {
      name: 'short password',
      data: { email: 'test@example.com', password: '123' },
      shouldFail: true
    },
    {
      name: 'missing fields',
      data: { email: 'test@example.com' },
      shouldFail: true
    }
  ];
  
  for (const test of validationTests) {
    const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(test.data),
    });
    
    assert(
      test.shouldFail ? !response.ok : response.ok,
      `Validation test for ${test.name} should ${test.shouldFail ? 'fail' : 'pass'}`,
      { 
        testName: test.name,
        status: response.status, 
        data: response.data 
      }
    );
    
    await sleep(100); // Avoid rate limiting
  }
}

// 9. Registration Page Access Test
async function testRegistrationPageAccess() {
  log.section('Registration Page Access Test');
  
  try {
    const response = await fetch(`${BASE_URL}/auth/register`);
    assert(
      response.ok,
      'Registration page should be accessible',
      { status: response.status, statusText: response.statusText }
    );
    
    const html = await response.text();
    assert(
      html.includes('注册') || html.includes('Register') || html.includes('register'),
      'Registration page should contain registration-related content',
      { hasContent: html.length > 0 }
    );
  } catch (error) {
    assert(false, 'Registration page should load without errors', { error: error.message });
  }
}

// 10. JWT Token Validation Test
async function testJWTTokens() {
  log.section('JWT Token Validation Tests');
  
  if (!global.testTokens) {
    log.warning('No tokens available for JWT testing - skipping');
    return;
  }
  
  const { accessToken, refreshToken } = global.testTokens;
  
  // Basic token format validation
  assert(
    typeof accessToken === 'string' && accessToken.split('.').length === 3,
    'Access token should be a valid JWT format',
    { tokenLength: accessToken?.length, parts: accessToken?.split('.').length }
  );
  
  assert(
    typeof refreshToken === 'string' && refreshToken.split('.').length === 3,
    'Refresh token should be a valid JWT format',
    { tokenLength: refreshToken?.length, parts: refreshToken?.split('.').length }
  );
  
  // Test token refresh
  const refreshResponse = await makeRequest(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
  
  if (refreshResponse.ok) {
    assert(
      refreshResponse.data.data && refreshResponse.data.data.accessToken,
      'Token refresh should return new access token',
      { data: refreshResponse.data }
    );
  } else {
    log.warning('Token refresh may not be implemented or may require different approach');
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Comprehensive Authentication System Tests\n');
  console.log(`Testing server at: ${BASE_URL}\n`);
  
  // Check if server is accessible
  try {
    const serverCheck = await fetch(BASE_URL);
    if (!serverCheck.ok && serverCheck.status !== 404) {
      throw new Error(`Server not accessible: ${serverCheck.status}`);
    }
  } catch (error) {
    log.error(`Cannot connect to server at ${BASE_URL}`);
    log.error('Please make sure the Next.js development server is running');
    return;
  }
  
  // Run all test suites
  const testSuites = [
    testServerHealth,
    testLoginPageAccess,
    testRegistrationPageAccess,
    testRegistrationAPI,
    testLoginAPI,
    testProtectedRoutes,
    testSecurityHeaders,
    testFormValidation,
    testJWTTokens,
    testRateLimit, // Run this last as it may affect other tests
  ];
  
  for (const testSuite of testSuites) {
    try {
      await testSuite();
      await sleep(200); // Small delay between test suites
    } catch (error) {
      log.error(`Test suite ${testSuite.name} failed with error: ${error.message}`);
    }
  }
  
  // Print final results
  printResults();
}

// Print test results
function printResults() {
  log.section('Test Results Summary');
  
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%\n`);
  
  if (testResults.failed > 0) {
    log.section('Failed Tests');
    testResults.tests
      .filter(test => test.status === 'FAIL')
      .forEach(test => {
        console.log(`❌ ${test.message}`);
        if (test.details) {
          console.log(`   Details: ${JSON.stringify(test.details, null, 2)}`);
        }
      });
  }
  
  // Save detailed results to file
  const resultsFile = path.join(__dirname, 'auth-test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / testResults.total) * 100).toFixed(1) + '%'
    },
    tests: testResults.tests
  }, null, 2));
  
  log.info(`Detailed results saved to: ${resultsFile}`);
  
  if (testResults.failed === 0) {
    log.success('🎉 All tests passed! Authentication system is working correctly.');
  } else {
    log.warning(`⚠️  ${testResults.failed} test(s) failed. Please review the issues above.`);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testResults,
  BASE_URL
};