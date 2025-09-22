# 🧪 Testing Infrastructure Documentation

## Overview

This document provides a comprehensive guide to the testing infrastructure for the AI Agent Marketplace project. The testing strategy follows industry best practices with a focus on reliability, maintainability, and comprehensive coverage.

## Testing Strategy

### Test Pyramid

Our testing approach follows the test pyramid principle:

```
    /\
   /  \     E2E Tests (Few)
  /____\    - Critical user flows
 /      \   - Cross-browser testing
/________\  Integration Tests (Some)
           - API endpoints
           - Database interactions
           Unit Tests (Many)
           - Components
           - Utilities
           - Business logic
```

### Coverage Goals

- **Unit Tests**: 85% coverage for components, 80% for utilities
- **Integration Tests**: 75% coverage for API routes
- **E2E Tests**: Critical user flows covered
- **Security**: 100% coverage for authentication and payment flows

## Test Types

### 1. Unit Tests

**Location**: `tests/unit/`

**Purpose**: Test individual components and functions in isolation

**Tools**:
- Jest as test runner
- React Testing Library for component testing
- Jest DOM for DOM assertions

**Examples**:
```bash
npm run test:unit           # Run unit tests
npm run test:unit:watch     # Watch mode
```

**Key Features**:
- Component rendering tests
- User interaction testing
- Props and state validation
- Error boundary testing
- Hook testing

### 2. Integration Tests

**Location**: `tests/integration/`

**Purpose**: Test API endpoints and database interactions

**Tools**:
- Jest for test runner
- Supertest for HTTP testing
- Test database with Prisma

**Examples**:
```bash
npm run test:integration    # Run integration tests
```

**Key Features**:
- API endpoint testing
- Authentication flow testing
- Database operation testing
- Payment processing testing
- File upload testing

### 3. End-to-End Tests

**Location**: `tests/e2e/`

**Purpose**: Test complete user workflows

**Tools**:
- Playwright for browser automation
- Cross-browser testing (Chrome, Firefox, Safari)

**Examples**:
```bash
npm run test:e2e           # Run E2E tests
npm run test:e2e:ui        # Run with UI
npm run test:e2e:headed    # Run with browser visible
```

**Key Features**:
- User authentication flows
- Marketplace browsing and purchasing
- Admin panel functionality
- Payment processing
- Mobile responsiveness

## Configuration Files

### Jest Configuration (`jest.config.js`)

```javascript
// Main Jest configuration
// - Next.js integration
// - TypeScript support
// - Coverage thresholds
// - Module mapping
```

### Playwright Configuration (`playwright.config.js`)

```javascript
// E2E test configuration
// - Browser setup
// - Base URL configuration
// - Test timeouts
// - Reporting
```

### Test Database (`tests/utils/test-database.ts`)

```typescript
// Test database utilities
// - Database setup/teardown
// - Seed data management
// - Test isolation
```

## Test Utilities and Helpers

### Component Testing Utilities (`tests/utils/test-utils.tsx`)

```typescript
// Custom render function with providers
// Mock data generators
// Test helper functions
// Form testing utilities
```

### API Testing Utilities (`tests/utils/api-test-utils.ts`)

```typescript
// Request/response helpers
// Mock services
// Authentication helpers
// Database mocking
```

### Mock Data (`tests/fixtures/mock-data.ts`)

```typescript
// Consistent test data
// User fixtures
// Agent fixtures
// Order fixtures
```

## Running Tests

### Local Development

```bash
# Install dependencies
npm install

# Run all tests
npm run test:all

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Watch mode for development
npm run test:watch
npm run test:coverage:watch

# Generate coverage report
npm run test:coverage
npm run coverage:report
```

### Coverage Analysis

```bash
# Generate coverage report
npm run test:coverage

# Serve coverage report
npm run coverage:serve

# Run coverage analysis script
./scripts/coverage-analysis.sh
```

## CI/CD Integration

### GitHub Actions Workflows

#### Testing Pipeline (`.github/workflows/testing.yml`)

**Triggers**:
- Push to main/develop branches
- Pull requests to main/develop
- Scheduled daily runs

**Jobs**:
1. **Code Quality**: TypeScript, ESLint, Prettier
2. **Unit & Integration Tests**: Jest with coverage
3. **E2E Tests**: Playwright cross-browser testing
4. **Security Scanning**: Dependency and secret scanning
5. **Performance Testing**: Lighthouse CI (PRs only)
6. **Accessibility Testing**: Pa11y CI (PRs only)

#### Deployment Pipeline (`.github/workflows/ci-cd.yml`)

**Features**:
- Docker image building
- Staging/production deployment
- Performance testing
- Security scanning

### Coverage Reporting

- **Codecov Integration**: Automatic coverage reporting
- **PR Comments**: Coverage diff on pull requests
- **GitHub Status Checks**: Fail PRs below thresholds

## Test Data Management

### Database Testing

```typescript
// Test database setup
const testDb = new TestDatabase()
await testDb.setup()
await testDb.seed()

// Clean up after tests
await testDb.cleanup()
await testDb.teardown()
```

### Mock Services

```typescript
// API mocking with MSW
import { server } from '@/tests/mocks/api-handlers'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Best Practices

### Writing Tests

1. **Descriptive Test Names**: Use clear, behavior-focused names
2. **Arrange-Act-Assert**: Structure tests consistently
3. **Test Behavior, Not Implementation**: Focus on user-visible behavior
4. **Isolation**: Each test should be independent
5. **Deterministic**: Tests should always produce the same result

### Component Testing

```typescript
// Good: Testing behavior
test('should show error message when login fails', async () => {
  const user = userEvent.setup()
  render(<LoginForm onSubmit={mockFailingSubmit} />)

  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  await user.type(screen.getByLabelText(/password/i), 'password')
  await user.click(screen.getByRole('button', { name: /login/i }))

  expect(screen.getByText(/login failed/i)).toBeInTheDocument()
})
```

### API Testing

```typescript
// Good: Testing API behavior
test('POST /api/auth/login should return user data on success', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'password123'
    })
    .expect(200)

  expect(response.body.success).toBe(true)
  expect(response.body.data.user.email).toBe('test@example.com')
})
```

### E2E Testing

```typescript
// Good: Testing user workflows
test('user can complete purchase flow', async ({ page }) => {
  await page.goto('/marketplace')
  await page.click('[data-testid="add-to-cart"]')
  await page.goto('/cart')
  await page.click('[data-testid="checkout"]')

  // Fill checkout form
  await page.fill('[name="email"]', 'test@example.com')
  // ... more form filling

  await page.click('[data-testid="complete-purchase"]')

  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
})
```

## Debugging Tests

### Unit Tests

```bash
# Debug with Node.js debugger
npm run test:unit -- --runInBand --detectOpenHandles

# Debug specific test
npm run test:unit -- --testNamePattern="should login successfully"
```

### E2E Tests

```bash
# Run with browser visible
npm run test:e2e:headed

# Run with Playwright UI
npm run test:e2e:ui

# Debug mode
npx playwright test --debug
```

## Performance Considerations

### Test Performance

- **Parallel Execution**: Tests run in parallel by default
- **Test Isolation**: Each test runs in isolation
- **Database Reset**: Efficient database cleanup
- **Mock Services**: External services are mocked

### CI Performance

- **Caching**: Dependencies and build artifacts cached
- **Matrix Testing**: Browser tests run in parallel
- **Artifact Upload**: Test results uploaded for review

## Security Testing

### Authentication Testing

- Login/logout flows
- JWT token validation
- Session management
- Password reset flows
- Account lockout mechanisms

### Authorization Testing

- Role-based access control
- Protected route access
- Admin panel security
- API endpoint permissions

### Input Validation Testing

- SQL injection prevention
- XSS protection
- CSRF protection
- File upload security

## Accessibility Testing

### Automated Testing

- **Pa11y CI**: Automated accessibility scanning
- **Lighthouse**: Accessibility scoring
- **Jest A11y**: Component-level accessibility testing

### Manual Testing Checklist

- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus management
- ARIA labels and roles

## Maintenance

### Regular Tasks

1. **Update Dependencies**: Keep testing tools up to date
2. **Review Coverage**: Monitor coverage trends
3. **Cleanup Tests**: Remove obsolete tests
4. **Performance Monitoring**: Watch test execution times

### Test Health Metrics

- **Coverage Trends**: Track coverage over time
- **Test Execution Time**: Monitor performance
- **Flaky Test Detection**: Identify unreliable tests
- **Test Distribution**: Balance across test types

## Troubleshooting

### Common Issues

1. **Flaky Tests**:
   - Add proper waits
   - Improve test isolation
   - Mock external dependencies

2. **Slow Tests**:
   - Optimize database operations
   - Use more efficient selectors
   - Reduce test data size

3. **Coverage Gaps**:
   - Identify untested branches
   - Add edge case tests
   - Test error conditions

### Getting Help

- Check test logs for detailed error messages
- Use debugging tools for complex issues
- Refer to testing framework documentation
- Ask team members for code review

## File Structure

```
tests/
├── coverage/           # Coverage configuration and reports
├── e2e/               # End-to-end tests
├── fixtures/          # Test data and fixtures
├── integration/       # Integration tests
├── mocks/            # Mock handlers and data
├── setup/            # Test setup and configuration
├── unit/             # Unit tests
└── utils/            # Test utilities and helpers

scripts/
├── coverage-analysis.sh  # Coverage analysis script
└── test-setup.sh         # Test environment setup

.github/workflows/
├── testing.yml           # Testing pipeline
└── ci-cd.yml             # Deployment pipeline
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Last Updated**: September 2024
**Version**: 1.0.0