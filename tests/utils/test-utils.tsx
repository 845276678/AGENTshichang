import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { CartProvider } from '@/contexts/CartContext'

// Test utilities for rendering components with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withAuth?: boolean
  withCart?: boolean
  withQuery?: boolean
  authUser?: any
}

const AllTheProviders = ({
  children,
  withAuth = true,
  withCart = true,
  withQuery = true,
  authUser = null
}: {
  children: ReactNode
  withAuth?: boolean
  withCart?: boolean
  withQuery?: boolean
  authUser?: any
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  let wrapper = <>{children}</>

  if (withQuery) {
    wrapper = (
      <QueryClientProvider client={queryClient}>
        {wrapper}
      </QueryClientProvider>
    )
  }

  if (withAuth) {
    wrapper = (
      <AuthProvider initialUser={authUser}>
        {wrapper}
      </AuthProvider>
    )
  }

  if (withCart) {
    wrapper = (
      <CartProvider>
        {wrapper}
      </CartProvider>
    )
  }

  return wrapper
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { withAuth, withCart, withQuery, authUser, ...renderOptions } = options

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders
        withAuth={withAuth}
        withCart={withCart}
        withQuery={withQuery}
        authUser={authUser}
      >
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Helper functions for testing
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockAgent = (overrides = {}) => ({
  id: '1',
  name: 'Test Agent',
  description: 'A test agent description',
  price: 99.99,
  category: 'AI Assistant',
  tags: ['test', 'ai'],
  rating: 4.5,
  downloads: 1000,
  author: 'Test Author',
  imageUrl: '/test-image.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockCartItem = (overrides = {}) => ({
  id: '1',
  agentId: '1',
  name: 'Test Agent',
  price: 99.99,
  imageUrl: '/test-image.jpg',
  quantity: 1,
  ...overrides,
})

// Wait helpers
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0))

// Mock API responses
export const mockSuccessResponse = (data: any) => ({
  ok: true,
  status: 200,
  json: async () => ({ success: true, data }),
})

export const mockErrorResponse = (message: string, status = 400) => ({
  ok: false,
  status,
  json: async () => ({ success: false, error: message }),
})

// Form helpers
export const fillForm = async (fields: Record<string, string>) => {
  const { userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()

  for (const [label, value] of Object.entries(fields)) {
    const field = document.querySelector(`[name="${label}"]`) ||
                  document.querySelector(`[data-testid="${label}"]`)
    if (field) {
      await user.clear(field as Element)
      await user.type(field as Element, value)
    }
  }
}

// Local storage helpers
export const mockLocalStorage = () => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    store,
  }
}