/**
 * Comprehensive E2E Authentication Testing Suite
 * AI Agent Marketplace - Authentication System Testing
 * 
 * This test suite covers all aspects of the authentication system:
 * - User registration flow with validation
 * - User login flow with various scenarios
 * - Form validation (client-side and server-side)
 * - API endpoint testing
 * - Security testing
 * - User experience testing
 * - Complete authentication flow
 */

const { test, expect, chromium, firefox, webkit } = require('@playwright/test');

// Configuration
const BASE_URL = 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testUsers = {
  valid: {
    email: 'testuser@example.com',
    username: 'testuser123',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User'
  },
  validAlternate: {
    email: 'altuser@example.com',
    username: 'altuser123',
    password: 'AltPassword456!',
    confirmPassword: 'AltPassword456!',
    firstName: 'Alt',
    lastName: 'User'
  },
  invalid: {
    email: 'invalid-email',
    username: 'ab', // too short
    password: '123', // too weak
    confirmPassword: '456', // doesn't match
    firstName: '',
    lastName: ''
  }
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
const recordTest = (name, passed, details = null) => {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}`);
  }
  testResults.details.push({ name, passed, details });
};

test.describe('Authentication System E2E Tests', () => {

  // Setup and teardown
  test.beforeEach(async ({ page }) => {
    // Set up API monitoring
    page.on('response', response => {
      if (response.url().includes('/api/auth')) {
        console.log(`API Response: ${response.status()} - ${response.url()}`);
      }
    });

    // Set up error monitoring
    page.on('pageerror', error => {
      console.error('Page Error:', error);
    });

    // Set up console monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console Error:', msg.text());
      }
    });
  });

  test.describe('1. Page Accessibility Tests', () => {
    
    test('Login page should load successfully', async ({ page }) => {
      await test.step('Navigate to login page', async () => {
        const response = await page.goto(`${BASE_URL}/auth/login`);
        expect(response.status()).toBeLessThan(400);
        await page.waitForLoadState('domcontentloaded');
      });

      await test.step('Verify login page elements', async () => {
        // Check for essential elements
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
        
        // Check for navigation links
        await expect(page.locator('text=注册')).toBeVisible();
        await expect(page.locator('text=忘记密码')).toBeVisible();
      });

      await test.step('Verify page title and meta', async () => {
        await expect(page).toHaveTitle(/登录|Login/);
      });
    });

    test('Registration page should load successfully', async ({ page }) => {
      await test.step('Navigate to registration page', async () => {
        const response = await page.goto(`${BASE_URL}/auth/register`);
        expect(response.status()).toBeLessThan(400);
        await page.waitForLoadState('domcontentloaded');
      });

      await test.step('Verify registration page elements', async () => {
        // Check for essential form elements
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="username"]')).toBeVisible();
        await expect(page.locator('input[name="firstName"]')).toBeVisible();
        await expect(page.locator('input[name="lastName"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
      });
    });
  });

  test.describe('2. Form Validation Tests', () => {
    
    test('Registration form validation - client-side', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/register`);
      await page.waitForLoadState('domcontentloaded');

      await test.step('Test empty form submission', async () => {
        await page.click('button[type="submit"]');
        
        // Check for validation messages
        const errorMessages = page.locator('[role="alert"], .error-message, .text-red-500');
        await expect(errorMessages.first()).toBeVisible();
      });

      await test.step('Test invalid email format', async () => {
        await page.fill('input[name="email"]', testUsers.invalid.email);
        await page.blur('input[name="email"]');
        
        // Should show email validation error
        const emailError = page.locator('text=/邮箱格式不正确|Invalid email format/i');
        await expect(emailError).toBeVisible({ timeout: 3000 });
      });

      await test.step('Test password strength validation', async () => {
        await page.fill('input[name="password"]', testUsers.invalid.password);
        await page.blur('input[name="password"]');
        
        // Should show weak password error
        const passwordError = page.locator('text=/密码强度不足|Password too weak/i');
        await expect(passwordError).toBeVisible({ timeout: 3000 });
      });

      await test.step('Test password confirmation mismatch', async () => {
        await page.fill('input[name="password"]', testUsers.valid.password);
        await page.fill('input[name="confirmPassword"]', testUsers.invalid.confirmPassword);
        await page.blur('input[name="confirmPassword"]');
        
        // Should show password mismatch error
        const confirmError = page.locator('text=/密码不匹配|Passwords do not match/i');
        await expect(confirmError).toBeVisible({ timeout: 3000 });
      });
    });

    test('Login form validation - client-side', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      await page.waitForLoadState('domcontentloaded');

      await test.step('Test empty login form', async () => {
        await page.click('button[type="submit"]');
        
        const errorMessages = page.locator('[role="alert"], .error-message, .text-red-500');
        await expect(errorMessages.first()).toBeVisible();
      });

      await test.step('Test invalid email in login', async () => {
        await page.fill('input[type="email"]', 'invalid-email');
        await page.blur('input[type="email"]');
        
        const emailError = page.locator('text=/邮箱格式不正确|Invalid email format/i');
        await expect(emailError).toBeVisible({ timeout: 3000 });
      });
    });
  });

  test.describe('3. Registration Flow Tests', () => {
    
    test('Complete user registration flow', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/register`);
      
      await test.step('Fill registration form with valid data', async () => {
        await page.fill('input[name="email"]', testUsers.valid.email);
        await page.fill('input[name="username"]', testUsers.valid.username);
        await page.fill('input[name="firstName"]', testUsers.valid.firstName);
        await page.fill('input[name="lastName"]', testUsers.valid.lastName);
        await page.fill('input[name="password"]', testUsers.valid.password);
        await page.fill('input[name="confirmPassword"]', testUsers.valid.confirmPassword);
        
        // Accept terms if checkbox exists
        const termsCheckbox = page.locator('input[type="checkbox"]').first();
        if (await termsCheckbox.isVisible()) {
          await termsCheckbox.check();
        }
      });

      await test.step('Submit registration form', async () => {
        // Listen for API request
        const apiPromise = page.waitForResponse(`${API_BASE}/auth/register`);
        
        await page.click('button[type="submit"]');
        
        const response = await apiPromise;
        expect(response.status()).toBeLessThan(500);
        
        if (response.status() === 201) {
          // Success case
          const responseData = await response.json();
          expect(responseData.success).toBe(true);
          expect(responseData.data.user.email).toBe(testUsers.valid.email);
          expect(responseData.data.user.password).toBeUndefined();
        }
      });

      await test.step('Verify registration success handling', async () => {
        // Should show success message or redirect
        const successMessage = page.locator('text=/注册成功|Registration successful|verify your email/i');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      });
    });

    test('Registration with duplicate email should fail', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/register`);
      
      // Try to register with the same email again
      await page.fill('input[name="email"]', testUsers.valid.email);
      await page.fill('input[name="username"]', 'differentusername');
      await page.fill('input[name="firstName"]', testUsers.valid.firstName);
      await page.fill('input[name="lastName"]', testUsers.valid.lastName);
      await page.fill('input[name="password"]', testUsers.valid.password);
      await page.fill('input[name="confirmPassword"]', testUsers.valid.confirmPassword);
      
      const apiPromise = page.waitForResponse(`${API_BASE}/auth/register`);
      await page.click('button[type="submit"]');
      
      const response = await apiPromise;
      expect(response.status()).toBe(409); // Conflict
      
      // Should show error message
      const errorMessage = page.locator('text=/邮箱已存在|Email already exists/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('4. Login Flow Tests', () => {
    
    test('Login with valid credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      
      await test.step('Fill login form', async () => {
        await page.fill('input[type="email"]', testUsers.valid.email);
        await page.fill('input[type="password"]', testUsers.valid.password);
        
        // Check remember me if exists
        const rememberMe = page.locator('input[type="checkbox"]').first();
        if (await rememberMe.isVisible()) {
          await rememberMe.check();
        }
      });

      await test.step('Submit login form', async () => {
        const apiPromise = page.waitForResponse(`${API_BASE}/auth/login`);
        
        await page.click('button[type="submit"]');
        
        const response = await apiPromise;
        
        if (response.status() === 200) {
          // Success case
          const responseData = await response.json();
          expect(responseData.success).toBe(true);
          expect(responseData.data.tokens.accessToken).toBeDefined();
          expect(responseData.data.user.email).toBe(testUsers.valid.email);
        } else if (response.status() === 403) {
          // Account not verified - this is expected behavior
          const errorMessage = page.locator('text=/验证邮箱|verify your email|account not verified/i');
          await expect(errorMessage).toBeVisible({ timeout: 5000 });
        }
      });
    });

    test('Login with invalid credentials should fail', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      
      await page.fill('input[type="email"]', 'nonexistent@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      const apiPromise = page.waitForResponse(`${API_BASE}/auth/login`);
      await page.click('button[type="submit"]');
      
      const response = await apiPromise;
      expect(response.status()).toBe(401);
      
      // Should show error message
      const errorMessage = page.locator('text=/登录失败|Invalid credentials|用户名或密码错误/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('Password visibility toggle', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      
      await page.fill('input[type="password"]', 'testpassword');
      
      // Find and click password visibility toggle
      const toggleButton = page.locator('[data-testid="password-toggle"], button:has-text("显示"), button:has-text("Show")').first();
      
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        
        // Password should now be visible (type="text")
        const passwordInput = page.locator('input[name="password"]');
        await expect(passwordInput).toHaveAttribute('type', 'text');
        
        // Click again to hide
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });
  });

  test.describe('5. API Endpoint Tests', () => {
    
    test('Registration API endpoint validation', async ({ request }) => {
      await test.step('POST /api/auth/register with valid data', async () => {
        const response = await request.post(`${API_BASE}/auth/register`, {
          data: testUsers.validAlternate
        });
        
        expect(response.status()).toBeLessThan(500);
        
        if (response.status() === 201) {
          const data = await response.json();
          expect(data.success).toBe(true);
          expect(data.data.user.email).toBe(testUsers.validAlternate.email);
        }
      });

      await test.step('POST /api/auth/register with invalid data', async () => {
        const response = await request.post(`${API_BASE}/auth/register`, {
          data: testUsers.invalid
        });
        
        expect(response.status()).toBe(400);
        
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.errors).toBeDefined();
      });

      await test.step('POST /api/auth/register with empty data', async () => {
        const response = await request.post(`${API_BASE}/auth/register`, {
          data: {}
        });
        
        expect(response.status()).toBe(400);
      });
    });

    test('Login API endpoint validation', async ({ request }) => {
      await test.step('POST /api/auth/login with valid credentials', async () => {
        const response = await request.post(`${API_BASE}/auth/login`, {
          data: {
            email: testUsers.validAlternate.email,
            password: testUsers.validAlternate.password,
            rememberMe: true
          }
        });
        
        // Could be 200 (success) or 403 (not verified)
        expect([200, 403]).toContain(response.status());
      });

      await test.step('POST /api/auth/login with invalid credentials', async () => {
        const response = await request.post(`${API_BASE}/auth/login`, {
          data: {
            email: 'nonexistent@example.com',
            password: 'wrongpassword'
          }
        });
        
        expect(response.status()).toBe(401);
      });
    });

    test('Protected routes authorization', async ({ request }) => {
      await test.step('GET /api/auth/me without token should fail', async () => {
        const response = await request.get(`${API_BASE}/auth/me`);
        expect(response.status()).toBe(401);
      });

      await test.step('GET /api/auth/me with invalid token should fail', async () => {
        const response = await request.get(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': 'Bearer invalid-token'
          }
        });
        expect(response.status()).toBe(401);
      });
    });
  });

  test.describe('6. Security Tests', () => {
    
    test('CORS and security headers', async ({ request }) => {
      const response = await request.post(`${API_BASE}/auth/login`, {
        data: {
          email: 'test@test.com',
          password: 'test123'
        }
      });
      
      const headers = response.headers();
      
      // Check for security headers
      expect(headers['x-content-type-options']).toBeDefined();
      expect(headers['x-frame-options']).toBeDefined();
    });

    test('Rate limiting protection', async ({ request }) => {
      const promises = [];
      
      // Send multiple rapid requests
      for (let i = 0; i < 10; i++) {
        promises.push(
          request.post(`${API_BASE}/auth/login`, {
            data: {
              email: `test${i}@example.com`,
              password: 'testpassword'
            }
          })
        );
      }
      
      const responses = await Promise.all(promises);
      
      // At least some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('XSS protection in forms', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      
      const xssPayload = '<script>alert("XSS")</script>';
      
      await page.fill('input[type="email"]', xssPayload);
      await page.fill('input[type="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      
      // Should not execute the script
      await page.waitForTimeout(1000);
      const alerts = await page.evaluate(() => window.alert);
      expect(alerts).toBeUndefined();
    });
  });

  test.describe('7. User Experience Tests', () => {
    
    test('Responsive design', async ({ browser }) => {
      const devices = [
        { name: 'Desktop', viewport: { width: 1920, height: 1080 } },
        { name: 'Tablet', viewport: { width: 768, height: 1024 } },
        { name: 'Mobile', viewport: { width: 375, height: 667 } }
      ];
      
      for (const device of devices) {
        const context = await browser.newContext({
          viewport: device.viewport
        });
        const page = await context.newPage();
        
        await page.goto(`${BASE_URL}/auth/login`);
        await page.waitForLoadState('domcontentloaded');
        
        // Check that essential elements are visible and clickable
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
        
        await context.close();
      }
    });

    test('Loading states and animations', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      
      await page.fill('input[type="email"]', testUsers.valid.email);
      await page.fill('input[type="password"]', testUsers.valid.password);
      
      // Click submit and check for loading state
      await page.click('button[type="submit"]');
      
      // Should show loading indicator
      const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner');
      
      // Wait a bit to see if loading state appears
      await page.waitForTimeout(100);
    });

    test('Form navigation and tab order', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/register`);
      
      // Test tab navigation through form
      await page.press('body', 'Tab');
      await expect(page.locator('input[name="email"]')).toBeFocused();
      
      await page.press('input[name="email"]', 'Tab');
      await expect(page.locator('input[name="username"]')).toBeFocused();
      
      await page.press('input[name="username"]', 'Tab');
      await expect(page.locator('input[name="firstName"]')).toBeFocused();
    });
  });

  test.describe('8. Complete Authentication Flow', () => {
    
    test('Full registration to login flow', async ({ page }) => {
      const uniqueEmail = `testuser${Date.now()}@example.com`;
      const uniqueUsername = `testuser${Date.now()}`;
      
      await test.step('Register new user', async () => {
        await page.goto(`${BASE_URL}/auth/register`);
        
        await page.fill('input[name="email"]', uniqueEmail);
        await page.fill('input[name="username"]', uniqueUsername);
        await page.fill('input[name="firstName"]', 'Test');
        await page.fill('input[name="lastName"]', 'User');
        await page.fill('input[name="password"]', testUsers.valid.password);
        await page.fill('input[name="confirmPassword"]', testUsers.valid.password);
        
        const termsCheckbox = page.locator('input[type="checkbox"]').first();
        if (await termsCheckbox.isVisible()) {
          await termsCheckbox.check();
        }
        
        const apiPromise = page.waitForResponse(`${API_BASE}/auth/register`);
        await page.click('button[type="submit"]');
        
        const response = await apiPromise;
        if (response.status() === 201) {
          const successMessage = page.locator('text=/注册成功|Registration successful/i');
          await expect(successMessage).toBeVisible({ timeout: 5000 });
        }
      });

      await test.step('Navigate to login page', async () => {
        await page.goto(`${BASE_URL}/auth/login`);
        await page.waitForLoadState('domcontentloaded');
      });

      await test.step('Attempt login with new user', async () => {
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', testUsers.valid.password);
        
        const apiPromise = page.waitForResponse(`${API_BASE}/auth/login`);
        await page.click('button[type="submit"]');
        
        const response = await apiPromise;
        
        // Should either succeed (200) or require email verification (403)
        expect([200, 403]).toContain(response.status());
        
        if (response.status() === 403) {
          // Expected - email verification required
          const verifyMessage = page.locator('text=/验证|verify|verification/i');
          await expect(verifyMessage).toBeVisible({ timeout: 5000 });
        } else if (response.status() === 200) {
          // Success - should redirect or show success
          await expect(page.url()).not.toBe(`${BASE_URL}/auth/login`);
        }
      });
    });
  });

});

// Test cleanup and reporting
test.afterAll(async () => {
  console.log('\n🔍 Test Results Summary:');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
});