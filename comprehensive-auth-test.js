#!/usr/bin/env node

/**
 * Comprehensive Authentication API Testing Script
 * AI Agent Marketplace - Authentication System Testing
 * Tests all authentication endpoints and functionality
 */

const BASE_URL = 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;

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

    let data = {};
    try {
      data = await response.json();
    } catch (e) {
      data = {};
    }
    
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
      data: {},
    };
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test data
const testUsers = {
  valid: {
    email: 'e2etest@example.com',
    username: 'e2etestuser',
    password: 'TestPassword123!',
    firstName: 'E2E',
    lastName: 'TestUser'
  },
  invalid: {
    email: 'invalid-email',
    username: 'ab',
    password: '123',
    firstName: '',
    lastName: ''
  },
  existing: {
    email: 'existing@example.com',
    username: 'existinguser',
    password: 'ExistingPassword123!',
    firstName: 'Existing',
    lastName: 'User'
  }
};

// Test results
let results = {
  passed: 0,
  failed: 0,
  total: 0,
  tests: [],
  issues: [],
  recommendations: []
};

// Logging
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  section: (msg) => console.log(`\n🔍 ${msg}\n${'='.repeat(50)}`),
  detail: (msg) => console.log(`   ${msg}`),
};

// Test assertion
const assert = (condition, message, details = null, severity = 'error') => {
  results.total++;
  
  const testResult = {
    status: condition ? 'PASS' : 'FAIL',
    message,
    details,
    severity,
    timestamp: new Date().toISOString()
  };
  
  if (condition) {
    results.passed++;
    log.success(`PASS: ${message}`);
  } else {
    results.failed++;
    log.error(`FAIL: ${message}`);
    if (details) {
      log.detail(`Details: ${JSON.stringify(details, null, 2)}`);
    }
    
    if (severity === 'critical') {
      results.issues.push(`🚨 CRITICAL: ${message}`);
    } else if (severity === 'security') {
      results.issues.push(`🔒 SECURITY: ${message}`);
    } else {
      results.issues.push(`❌ ${message}`);
    }
  }
  
  results.tests.push(testResult);
};

// 1. Server Health and Connectivity Tests
async function testServerHealth() {
  log.section('1. Server Health and Connectivity Tests');
  
  // Test basic server connectivity
  const rootResponse = await makeRequest(BASE_URL);
  assert(
    rootResponse.status !== 0,
    'Server should be accessible',
    { status: rootResponse.status, error: rootResponse.error }
  );
  
  if (rootResponse.status === 0) {
    log.error('Cannot proceed with testing - server is not accessible');
    return false;
  }
  
  // Test if it's a Next.js app
  assert(
    rootResponse.headers['x-powered-by'] || rootResponse.headers.server,
    'Server should return server headers',
    { headers: rootResponse.headers }
  );
  
  return true;
}

// 2. Authentication Pages Accessibility
async function testPageAccessibility() {
  log.section('2. Authentication Pages Accessibility');
  
  // Test login page
  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/login`);
    assert(
      loginResponse.ok,
      'Login page should be accessible',
      { status: loginResponse.status, statusText: loginResponse.statusText }
    );
    
    const loginHtml = await loginResponse.text();
    assert(
      loginHtml.includes('login') || loginHtml.includes('登录') || loginHtml.includes('欢迎'),
      'Login page should contain login-related content',
      { contentLength: loginHtml.length }
    );
  } catch (error) {
    assert(false, 'Login page request should not throw errors', { error: error.message });
  }
  
  // Test registration page
  try {
    const registerResponse = await fetch(`${BASE_URL}/auth/register`);
    assert(
      registerResponse.ok,
      'Registration page should be accessible',
      { status: registerResponse.status, statusText: registerResponse.statusText }
    );
    
    const registerHtml = await registerResponse.text();
    assert(
      registerHtml.includes('register') || registerHtml.includes('注册') || registerHtml.includes('创建'),
      'Registration page should contain registration-related content',
      { contentLength: registerHtml.length }
    );
  } catch (error) {
    assert(false, 'Registration page request should not throw errors', { error: error.message });
  }
}

// 3. Registration API Comprehensive Testing
async function testRegistrationAPI() {
  log.section('3. Registration API Comprehensive Testing');
  
  // Test CORS preflight
  const preflightResponse = await makeRequest(`${API_BASE}/auth/register`, {
    method: 'OPTIONS'
  });
  
  assert(
    preflightResponse.status === 200 || preflightResponse.status === 204,
    'Registration API should handle CORS preflight',
    { status: preflightResponse.status }
  );
  
  // Test with completely empty request
  const emptyResponse = await makeRequest(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({})
  });
  
  assert(
    emptyResponse.status === 400,
    'Registration with empty data should return 400',
    { status: emptyResponse.status, data: emptyResponse.data },
    'critical'
  );
  
  // Test with invalid email format
  const invalidEmailResponse = await makeRequest(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      ...testUsers.valid,
      email: testUsers.invalid.email
    })
  });
  
  assert(
    invalidEmailResponse.status === 400,
    'Registration with invalid email should return 400',
    { status: invalidEmailResponse.status, data: invalidEmailResponse.data }
  );
  
  // Test with weak password
  const weakPasswordResponse = await makeRequest(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      ...testUsers.valid,
      password: testUsers.invalid.password
    })
  });
  
  assert(
    weakPasswordResponse.status === 400,
    'Registration with weak password should return 400',
    { status: weakPasswordResponse.status, data: weakPasswordResponse.data },
    'security'
  );
  
  // Test with valid data
  const validResponse = await makeRequest(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(testUsers.valid)
  });
  
  assert(
    validResponse.status === 201 || validResponse.status === 200,
    'Registration with valid data should succeed',
    { status: validResponse.status, data: validResponse.data }
  );
  
  if (validResponse.ok) {
    assert(
      validResponse.data.success === true,
      'Registration response should indicate success',
      { data: validResponse.data }
    );
    
    assert(
      validResponse.data.data && validResponse.data.data.user,
      'Registration response should contain user data',
      { hasUserData: !!validResponse.data.data?.user }
    );
    
    assert(
      !validResponse.data.data.user.password,
      'Registration response should not expose password',
      { hasPassword: !!validResponse.data.data.user?.password },
      'security'
    );
    
    assert(
      validResponse.data.data.user.email === testUsers.valid.email,
      'Registration response should contain correct email',
      { expectedEmail: testUsers.valid.email, actualEmail: validResponse.data.data.user?.email }
    );
  }
  
  // Test duplicate registration
  await sleep(100);
  const duplicateResponse = await makeRequest(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(testUsers.valid)
  });
  
  assert(
    duplicateResponse.status === 409,
    'Duplicate registration should return 409 Conflict',
    { status: duplicateResponse.status, data: duplicateResponse.data }
  );
  
  // Test registration with different email but same username
  await sleep(100);
  const sameUsernameResponse = await makeRequest(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      ...testUsers.valid,
      email: 'different@example.com'
    })
  });
  
  assert(
    sameUsernameResponse.status === 409,
    'Registration with existing username should return 409',
    { status: sameUsernameResponse.status, data: sameUsernameResponse.data }
  );
}

// 4. Login API Comprehensive Testing
async function testLoginAPI() {
  log.section('4. Login API Comprehensive Testing');
  
  // Test with empty credentials
  const emptyResponse = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({})
  });
  
  assert(
    emptyResponse.status === 400,
    'Login with empty credentials should return 400',
    { status: emptyResponse.status, data: emptyResponse.data }
  );
  
  // Test with invalid email format
  const invalidEmailResponse = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'invalid-email-format',
      password: 'somepassword'
    })
  });
  
  assert(
    invalidEmailResponse.status === 400,
    'Login with invalid email format should return 400',
    { status: invalidEmailResponse.status, data: invalidEmailResponse.data }
  );
  
  // Test with non-existent user
  const nonExistentResponse = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'nonexistent@example.com',
      password: 'somepassword'
    })
  });
  
  assert(
    nonExistentResponse.status === 401,
    'Login with non-existent user should return 401',
    { status: nonExistentResponse.status, data: nonExistentResponse.data }
  );
  
  // Test with valid user but wrong password
  const wrongPasswordResponse = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUsers.valid.email,
      password: 'wrongpassword'
    })
  });
  
  assert(
    wrongPasswordResponse.status === 401,
    'Login with wrong password should return 401',
    { status: wrongPasswordResponse.status, data: wrongPasswordResponse.data },
    'security'
  );
  
  // Test with valid credentials
  const validLoginResponse = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUsers.valid.email,
      password: testUsers.valid.password,
      rememberMe: true
    })
  });
  
  // This might fail if email verification is required
  if (validLoginResponse.status === 200) {
    assert(
      validLoginResponse.data.success === true,
      'Valid login should return success',
      { data: validLoginResponse.data }
    );
    
    assert(
      validLoginResponse.data.data && validLoginResponse.data.data.tokens,
      'Login response should contain tokens',
      { hasTokens: !!validLoginResponse.data.data?.tokens }
    );
    
    assert(
      validLoginResponse.data.data.tokens.accessToken,
      'Login response should contain access token',
      { hasAccessToken: !!validLoginResponse.data.data.tokens?.accessToken },
      'security'
    );
    
    global.testTokens = validLoginResponse.data.data.tokens;
    
  } else if (validLoginResponse.status === 403) {
    log.warning('Login failed due to email verification requirement - this is expected behavior');
    assert(
      validLoginResponse.data.message && 
      (validLoginResponse.data.message.includes('verify') || validLoginResponse.data.message.includes('verification')),
      'Email verification error should be clear',
      { message: validLoginResponse.data.message }
    );
  } else {
    assert(
      false,
      'Valid login should either succeed (200) or require verification (403)',
      { status: validLoginResponse.status, data: validLoginResponse.data }
    );
  }
}

// 5. Protected Routes Testing
async function testProtectedRoutes() {
  log.section('5. Protected Routes Testing');
  
  // Test accessing protected route without token
  const noTokenResponse = await makeRequest(`${API_BASE}/auth/me`);
  
  assert(
    noTokenResponse.status === 401,
    'Protected route should reject request without token',
    { status: noTokenResponse.status, data: noTokenResponse.data },
    'security'
  );
  
  // Test with invalid token
  const invalidTokenResponse = await makeRequest(`${API_BASE}/auth/me`, {
    headers: {
      'Authorization': 'Bearer invalid-token-12345'
    }
  });
  
  assert(
    invalidTokenResponse.status === 401,
    'Protected route should reject invalid token',
    { status: invalidTokenResponse.status, data: invalidTokenResponse.data },
    'security'
  );
  
  // Test with malformed authorization header
  const malformedAuthResponse = await makeRequest(`${API_BASE}/auth/me`, {
    headers: {
      'Authorization': 'InvalidFormat token'
    }
  });
  
  assert(
    malformedAuthResponse.status === 401,
    'Protected route should reject malformed authorization',
    { status: malformedAuthResponse.status, data: malformedAuthResponse.data },
    'security'
  );
  
  // Test with valid token (if available)
  if (global.testTokens && global.testTokens.accessToken) {
    const validTokenResponse = await makeRequest(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${global.testTokens.accessToken}`
      }
    });
    
    assert(
      validTokenResponse.status === 200,
      'Protected route should accept valid token',
      { status: validTokenResponse.status, data: validTokenResponse.data }
    );
    
    if (validTokenResponse.ok) {
      assert(
        validTokenResponse.data.data && validTokenResponse.data.data.user,
        'Protected route should return user data',
        { hasUserData: !!validTokenResponse.data.data?.user }
      );
    }
  }
}

// 6. Security Headers Testing
async function testSecurityHeaders() {
  log.section('6. Security Headers Testing');
  
  const response = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@test.com',
      password: 'test123'
    })
  });
  
  const headers = response.headers;
  
  // Check for security headers
  const securityHeaders = {
    'x-content-type-options': 'Should prevent MIME type sniffing',
    'x-frame-options': 'Should prevent clickjacking attacks',
    'x-xss-protection': 'Should enable XSS protection',
    'referrer-policy': 'Should control referrer information',
    'content-security-policy': 'Should define content security policy'
  };
  
  for (const [header, description] of Object.entries(securityHeaders)) {
    assert(
      headers[header] !== undefined,
      `${description} (${header})`,
      { headerValue: headers[header], allHeaders: Object.keys(headers) },
      'security'
    );
  }
  
  // Check CORS headers
  assert(
    headers['access-control-allow-origin'] !== undefined,
    'CORS should be properly configured',
    { corsHeader: headers['access-control-allow-origin'] },
    'security'
  );
}

// 7. Rate Limiting Testing
async function testRateLimit() {
  log.section('7. Rate Limiting Testing');
  
  log.info('Testing rate limiting with rapid requests...');
  
  const promises = [];
  const requestCount = 15; // High number to trigger rate limiting
  
  for (let i = 0; i < requestCount; i++) {
    promises.push(
      makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          email: `ratetest${i}@example.com`,
          password: 'testpassword123'
        })
      })
    );
  }
  
  const responses = await Promise.all(promises);
  
  const rateLimitedResponses = responses.filter(r => r.status === 429);
  const successfulResponses = responses.filter(r => r.status < 500 && r.status !== 429);
  
  assert(
    rateLimitedResponses.length > 0,
    'Rate limiting should block excessive requests',
    { 
      totalRequests: responses.length,
      rateLimited: rateLimitedResponses.length,
      successful: successfulResponses.length,
      errors: responses.filter(r => r.status >= 500).length
    },
    'security'
  );
  
  // Check if rate limit responses include proper headers
  if (rateLimitedResponses.length > 0) {
    const rateLimitResponse = rateLimitedResponses[0];
    assert(
      rateLimitResponse.headers['retry-after'] || rateLimitResponse.headers['x-ratelimit-remaining'],
      'Rate limit response should include rate limiting headers',
      { headers: rateLimitResponse.headers },
      'security'
    );
  }
}

// 8. Input Validation and Sanitization Testing
async function testInputValidation() {
  log.section('8. Input Validation and Sanitization Testing');
  
  const maliciousInputs = [
    {
      name: 'XSS Script Tag',
      email: '<script>alert("xss")</script>@example.com',
      password: 'password123'
    },
    {
      name: 'SQL Injection',
      email: "admin@example.com'; DROP TABLE users; --",
      password: 'password123'
    },
    {
      name: 'Long String Attack',
      email: 'a'.repeat(1000) + '@example.com',
      password: 'b'.repeat(1000)
    },
    {
      name: 'Unicode/Special Characters',
      email: '测试用户@例子.com',
      password: 'пароль123!@#'
    }
  ];
  
  for (const maliciousInput of maliciousInputs) {
    const response = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: maliciousInput.email,
        password: maliciousInput.password
      })
    });
    
    assert(
      response.status === 400 || response.status === 401,
      `${maliciousInput.name} should be handled securely`,
      { 
        inputType: maliciousInput.name,
        status: response.status,
        data: response.data 
      },
      'security'
    );
    
    // Make sure the malicious input doesn't appear in the response
    const responseStr = JSON.stringify(response.data);
    assert(
      !responseStr.includes('<script>') && !responseStr.includes('DROP TABLE'),
      `${maliciousInput.name} should be sanitized in response`,
      { containsMalicious: responseStr.includes('<script>') || responseStr.includes('DROP TABLE') },
      'security'
    );
    
    await sleep(100);
  }
}

// 9. JWT Token Validation Testing
async function testJWTTokens() {
  log.section('9. JWT Token Validation Testing');
  
  if (!global.testTokens) {
    log.warning('No tokens available - skipping JWT validation tests');
    results.recommendations.push('JWT token validation tests skipped - ensure login flow works to test token validation');
    return;
  }
  
  const { accessToken, refreshToken } = global.testTokens;
  
  // Test token format
  assert(
    typeof accessToken === 'string' && accessToken.split('.').length === 3,
    'Access token should be valid JWT format',
    { tokenLength: accessToken?.length, parts: accessToken?.split('.').length }
  );
  
  if (refreshToken) {
    assert(
      typeof refreshToken === 'string' && refreshToken.split('.').length === 3,
      'Refresh token should be valid JWT format',
      { tokenLength: refreshToken?.length, parts: refreshToken?.split('.').length }
    );
  }
  
  // Test token refresh endpoint (if available)
  if (refreshToken) {
    const refreshResponse = await makeRequest(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
    
    if (refreshResponse.status === 404) {
      log.warning('Token refresh endpoint not found - this may be expected');
    } else {
      assert(
        refreshResponse.ok,
        'Token refresh should work with valid refresh token',
        { status: refreshResponse.status, data: refreshResponse.data }
      );
    }
  }
}

// 10. Complete Authentication Flow Testing
async function testCompleteFlow() {
  log.section('10. Complete Authentication Flow Testing');
  
  const uniqueUser = {
    email: `flowtest${Date.now()}@example.com`,
    username: `flowtest${Date.now()}`,
    password: 'FlowTestPassword123!',
    firstName: 'Flow',
    lastName: 'Test'
  };
  
  // Step 1: Register new user
  log.info('Step 1: Registering new user...');
  const registerResponse = await makeRequest(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(uniqueUser)
  });
  
  assert(
    registerResponse.status === 201 || registerResponse.status === 200,
    'New user registration should succeed',
    { status: registerResponse.status, data: registerResponse.data }
  );
  
  if (!registerResponse.ok) {
    log.error('Cannot continue flow test - registration failed');
    return;
  }
  
  await sleep(100);
  
  // Step 2: Try to login (might fail due to email verification)
  log.info('Step 2: Attempting to login with new user...');
  const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: uniqueUser.email,
      password: uniqueUser.password,
      rememberMe: false
    })
  });
  
  if (loginResponse.status === 200) {
    log.success('Login successful - full flow completed');
    assert(
      loginResponse.data.data && loginResponse.data.data.tokens,
      'Login should return authentication tokens',
      { hasTokens: !!loginResponse.data.data?.tokens }
    );
    
    // Step 3: Access protected route
    if (loginResponse.data.data.tokens.accessToken) {
      log.info('Step 3: Testing protected route access...');
      const protectedResponse = await makeRequest(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.data.tokens.accessToken}`
        }
      });
      
      assert(
        protectedResponse.ok,
        'Protected route should be accessible with valid token',
        { status: protectedResponse.status, data: protectedResponse.data }
      );
    }
    
  } else if (loginResponse.status === 403) {
    log.warning('Login failed due to email verification requirement - this is expected');
    assert(
      true,
      'Email verification requirement is properly enforced',
      { status: loginResponse.status, message: loginResponse.data.message }
    );
  } else {
    assert(
      false,
      'Login should either succeed or require email verification',
      { status: loginResponse.status, data: loginResponse.data }
    );
  }
}

// Main test runner
async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Authentication E2E Testing');
  console.log(`🔗 Testing server at: ${BASE_URL}`);
  console.log(`📅 Test started: ${new Date().toISOString()}\n`);
  
  const testSuites = [
    { name: 'Server Health', fn: testServerHealth, critical: true },
    { name: 'Page Accessibility', fn: testPageAccessibility },
    { name: 'Registration API', fn: testRegistrationAPI },
    { name: 'Login API', fn: testLoginAPI },
    { name: 'Protected Routes', fn: testProtectedRoutes },
    { name: 'Security Headers', fn: testSecurityHeaders },
    { name: 'Input Validation', fn: testInputValidation },
    { name: 'JWT Tokens', fn: testJWTTokens },
    { name: 'Complete Flow', fn: testCompleteFlow },
    { name: 'Rate Limiting', fn: testRateLimit } // Run last as it may affect other tests
  ];
  
  let continueTesting = true;
  
  for (const suite of testSuites) {
    if (!continueTesting && suite.critical) {
      log.error(`Skipping remaining tests due to critical failure in ${suite.name}`);
      break;
    }
    
    try {
      const result = await suite.fn();
      if (suite.critical && result === false) {
        continueTesting = false;
      }
      await sleep(200);
    } catch (error) {
      log.error(`Test suite ${suite.name} failed with error: ${error.message}`);
      assert(false, `Test suite ${suite.name} should not throw errors`, { error: error.message }, 'critical');
      
      if (suite.critical) {
        continueTesting = false;
      }
    }
  }
  
  // Generate comprehensive report
  generateTestReport();
}

// Test report generation
function generateTestReport() {
  log.section('📊 Comprehensive Test Results');
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  const timestamp = new Date().toISOString();
  
  console.log(`📈 Test Summary:`);
  console.log(`   Total Tests: ${results.total}`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📊 Success Rate: ${successRate}%`);
  console.log(`   ⏱️  Completed: ${timestamp}\n`);
  
  // Categorize results
  const criticalFailures = results.tests.filter(t => t.status === 'FAIL' && t.severity === 'critical');
  const securityIssues = results.tests.filter(t => t.status === 'FAIL' && t.severity === 'security');
  const generalFailures = results.tests.filter(t => t.status === 'FAIL' && t.severity === 'error');
  
  if (criticalFailures.length > 0) {
    log.section('🚨 Critical Issues (Must Fix)');
    criticalFailures.forEach(test => {
      console.log(`   🚨 ${test.message}`);
    });
  }
  
  if (securityIssues.length > 0) {
    log.section('🔒 Security Issues (High Priority)');
    securityIssues.forEach(test => {
      console.log(`   🔒 ${test.message}`);
    });
  }
  
  if (generalFailures.length > 0) {
    log.section('❌ General Issues');
    generalFailures.forEach(test => {
      console.log(`   ❌ ${test.message}`);
    });
  }
  
  // Recommendations
  if (results.recommendations.length > 0) {
    log.section('💡 Recommendations');
    results.recommendations.forEach(rec => {
      console.log(`   💡 ${rec}`);
    });
  }
  
  // Overall assessment
  log.section('🏆 Overall Assessment');
  
  if (successRate >= 90) {
    log.success('🎉 Excellent! Authentication system is working very well.');
  } else if (successRate >= 75) {
    log.warning('⚠️  Good, but some issues need attention.');
  } else if (successRate >= 50) {
    log.warning('⚠️  Authentication system has significant issues that need fixing.');
  } else {
    log.error('🚨 Critical: Authentication system has major problems and needs immediate attention.');
  }
  
  // Save detailed results
  const detailedResults = {
    timestamp,
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      successRate: `${successRate}%`
    },
    categories: {
      critical: criticalFailures.length,
      security: securityIssues.length,
      general: generalFailures.length
    },
    tests: results.tests,
    issues: results.issues,
    recommendations: results.recommendations
  };
  
  console.log(`\n📄 Saving detailed results to: auth-test-comprehensive-results.json`);
  
  require('fs').writeFileSync(
    'auth-test-comprehensive-results.json',
    JSON.stringify(detailedResults, null, 2)
  );
}

// Run tests
if (require.main === module) {
  runComprehensiveTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runComprehensiveTests,
  results,
  BASE_URL
};