import { http, HttpResponse } from 'msw'

// Mock API handlers for MSW
export const authHandlers = [
  // Login
  http.post('/api/auth/login', ({ __request }) => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
        token: 'mock-jwt-token',
      },
    })
  }),

  // Register
  http.post('/api/auth/register', ({ __request }) => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: '2',
          email: 'newuser@example.com',
          name: 'New User',
          role: 'USER',
        },
        message: 'Registration successful. Please verify your email.',
      },
    })
  }),

  // Me (current user)
  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      },
    })
  }),

  // Logout
  http.post('/api/auth/logout', ({ __request }) => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  }),

  // Forgot password
  http.post('/api/auth/forgot-password', ({ __request }) => {
    return HttpResponse.json({
      success: true,
      message: 'Password reset email sent',
    })
  }),

  // Reset password
  http.post('/api/auth/reset-password', ({ __request }) => {
    return HttpResponse.json({
      success: true,
      message: 'Password reset successfully',
    })
  }),

  // Verify email
  http.post('/api/auth/verify-email', ({ __request }) => {
    return HttpResponse.json({
      success: true,
      message: 'Email verified successfully',
    })
  }),

  // Refresh token
  http.post('/api/auth/refresh', ({ __request }) => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'new-mock-jwt-token',
      },
    })
  }),
]

export const agentsHandlers = [
  // Get all agents
  http.get('/api/agents', ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '12')

    let mockAgents = [
      {
        id: '1',
        name: 'AI Writing Assistant',
        description: 'Advanced AI for content creation',
        price: 29.99,
        category: 'Content Creation',
        tags: ['writing', 'ai', 'content'],
        rating: 4.8,
        downloads: 5420,
        author: 'AI Innovations',
        imageUrl: '/agents/writing-assistant.jpg',
      },
      {
        id: '2',
        name: 'Data Analysis Bot',
        description: 'Powerful data analysis and visualization',
        price: 49.99,
        category: 'Data Science',
        tags: ['data', 'analysis', 'visualization'],
        rating: 4.6,
        downloads: 3210,
        author: 'Data Corp',
        imageUrl: '/agents/data-bot.jpg',
      },
    ]

    // Apply filters
    if (category) {
      mockAgents = mockAgents.filter(agent => agent.category === category)
    }

    if (search) {
      mockAgents = mockAgents.filter(agent =>
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        agent.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    const total = mockAgents.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAgents = mockAgents.slice(startIndex, endIndex)

    return HttpResponse.json({
      success: true,
      data: {
        agents: paginatedAgents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  }),

  // Get single agent
  http.get('/api/agents/:id', ({ params }) => {
    const { id } = params

    if (id === '404') {
      return HttpResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        id,
        name: 'AI Writing Assistant',
        description: 'Advanced AI for content creation',
        longDescription: 'This is a comprehensive AI writing assistant...',
        price: 29.99,
        category: 'Content Creation',
        tags: ['writing', 'ai', 'content'],
        rating: 4.8,
        downloads: 5420,
        author: 'AI Innovations',
        imageUrl: '/agents/writing-assistant.jpg',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        requirements: ['Requirement 1', 'Requirement 2'],
        changelog: [
          { version: '1.2.0', date: '2024-01-15', changes: ['Added new features'] },
        ],
      },
    })
  }),
]

export const categoriesHandlers = [
  http.get('/api/categories', ({ __request }) => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: '1', name: 'Content Creation', count: 25 },
        { id: '2', name: 'Data Science', count: 18 },
        { id: '3', name: 'Customer Service', count: 12 },
        { id: '4', name: 'Development Tools', count: 15 },
      ],
    })
  }),
]

export const searchHandlers = [
  http.get('/api/search/suggestions', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')

    if (!query) {
      return HttpResponse.json({
        success: true,
        data: [],
      })
    }

    const suggestions = [
      'AI Writing Assistant',
      'Data Analysis',
      'Customer Service Bot',
      'Code Generator',
    ].filter(suggestion =>
      suggestion.toLowerCase().includes(query.toLowerCase())
    )

    return HttpResponse.json({
      success: true,
      data: suggestions,
    })
  }),
]

// Payment handlers
export const paymentHandlers = [
  http.post('/api/payments/create-intent', ({ __request }) => {
    return HttpResponse.json({
      success: true,
      data: {
        clientSecret: 'pi_mock_client_secret',
      },
    })
  }),

  http.post('/api/payments/confirm', ({ __request }) => {
    return HttpResponse.json({
      success: true,
      data: {
        paymentId: 'pay_mock_payment_id',
        status: 'succeeded',
      },
    })
  }),
]

// Error handlers for testing error scenarios
export const errorHandlers = [
  http.get('/api/agents/error', ({ __request }) => {
    return HttpResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }),

  http.post('/api/auth/login-error', ({ __request }) => {
    return HttpResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    )
  }),
]

// Default handlers combining all
export const handlers = [
  ...authHandlers,
  ...agentsHandlers,
  ...categoriesHandlers,
  ...searchHandlers,
  ...paymentHandlers,
]