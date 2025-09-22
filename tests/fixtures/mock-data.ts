// Mock data fixtures for tests

export const mockUsers = {
  user1: {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'USER',
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  admin: {
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  unverified: {
    id: '3',
    email: 'unverified@example.com',
    name: 'Unverified User',
    role: 'USER',
    emailVerified: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
}

export const mockAgents = {
  writingAssistant: {
    id: '1',
    name: 'AI Writing Assistant',
    description: 'Advanced AI for content creation',
    longDescription: 'This comprehensive AI writing assistant helps you create engaging content across various formats including blogs, articles, social media posts, and marketing copy.',
    price: 29.99,
    category: 'Content Creation',
    tags: ['writing', 'ai', 'content', 'copywriting'],
    rating: 4.8,
    downloads: 5420,
    author: 'AI Innovations',
    authorId: '1',
    imageUrl: '/agents/writing-assistant.jpg',
    features: [
      'Multi-format content generation',
      'SEO optimization',
      'Tone adjustment',
      'Plagiarism checking',
    ],
    requirements: [
      'Internet connection',
      'Modern web browser',
      'API key setup',
    ],
    changelog: [
      {
        version: '1.2.0',
        date: '2024-01-15',
        changes: [
          'Added SEO optimization features',
          'Improved content quality',
          'Bug fixes and performance improvements',
        ],
      },
      {
        version: '1.1.0',
        date: '2024-01-01',
        changes: [
          'Added tone adjustment',
          'New template library',
        ],
      },
    ],
    status: 'PUBLISHED',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  dataAnalyzer: {
    id: '2',
    name: 'Data Analysis Bot',
    description: 'Powerful data analysis and visualization',
    longDescription: 'A comprehensive data analysis tool that helps you process, analyze, and visualize complex datasets with ease.',
    price: 49.99,
    category: 'Data Science',
    tags: ['data', 'analysis', 'visualization', 'statistics'],
    rating: 4.6,
    downloads: 3210,
    author: 'Data Corp',
    authorId: '2',
    imageUrl: '/agents/data-bot.jpg',
    features: [
      'Statistical analysis',
      'Data visualization',
      'Export capabilities',
      'Real-time processing',
    ],
    requirements: [
      'Python 3.8+',
      'Pandas library',
      'Matplotlib',
    ],
    changelog: [
      {
        version: '2.0.0',
        date: '2024-01-10',
        changes: [
          'Major UI overhaul',
          'Added real-time processing',
          'Performance improvements',
        ],
      },
    ],
    status: 'PUBLISHED',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z',
  },
  customerService: {
    id: '3',
    name: 'Customer Service Bot',
    description: 'AI-powered customer support automation',
    longDescription: 'Intelligent customer service bot that handles inquiries, provides support, and escalates complex issues to human agents.',
    price: 79.99,
    category: 'Customer Service',
    tags: ['customer-service', 'automation', 'chat', 'support'],
    rating: 4.7,
    downloads: 2150,
    author: 'Service Solutions',
    authorId: '3',
    imageUrl: '/agents/customer-service.jpg',
    features: [
      '24/7 availability',
      'Multi-language support',
      'Smart escalation',
      'Analytics dashboard',
    ],
    requirements: [
      'Web integration',
      'Customer database access',
      'Chat platform',
    ],
    changelog: [
      {
        version: '1.5.0',
        date: '2024-01-20',
        changes: [
          'Added multi-language support',
          'Improved escalation logic',
          'Enhanced analytics',
        ],
      },
    ],
    status: 'PUBLISHED',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
  },
  draftAgent: {
    id: '4',
    name: 'Draft Agent',
    description: 'This agent is still in draft',
    longDescription: 'A draft agent for testing purposes',
    price: 19.99,
    category: 'Development Tools',
    tags: ['draft', 'testing'],
    rating: 0,
    downloads: 0,
    author: 'Test Author',
    authorId: '1',
    imageUrl: '/agents/draft.jpg',
    features: ['Basic functionality'],
    requirements: ['Testing environment'],
    changelog: [],
    status: 'DRAFT',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
}

export const mockCategories = [
  {
    id: '1',
    name: 'Content Creation',
    description: 'AI agents for creating and editing content',
    count: 25,
    imageUrl: '/categories/content.jpg',
  },
  {
    id: '2',
    name: 'Data Science',
    description: 'Tools for data analysis and machine learning',
    count: 18,
    imageUrl: '/categories/data.jpg',
  },
  {
    id: '3',
    name: 'Customer Service',
    description: 'Automation for customer support and engagement',
    count: 12,
    imageUrl: '/categories/customer.jpg',
  },
  {
    id: '4',
    name: 'Development Tools',
    description: 'AI assistants for software development',
    count: 15,
    imageUrl: '/categories/dev.jpg',
  },
]

export const mockOrders = {
  order1: {
    id: '1',
    userId: '1',
    total: 79.98,
    status: 'COMPLETED',
    items: [
      {
        id: '1',
        agentId: '1',
        agentName: 'AI Writing Assistant',
        price: 29.99,
        quantity: 1,
      },
      {
        id: '2',
        agentId: '2',
        agentName: 'Data Analysis Bot',
        price: 49.99,
        quantity: 1,
      },
    ],
    paymentMethod: 'CARD',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  pendingOrder: {
    id: '2',
    userId: '1',
    total: 29.99,
    status: 'PENDING',
    items: [
      {
        id: '3',
        agentId: '1',
        agentName: 'AI Writing Assistant',
        price: 29.99,
        quantity: 1,
      },
    ],
    paymentMethod: 'CARD',
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
  },
}

export const mockReviews = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    agentId: '1',
    rating: 5,
    comment: 'Excellent AI writing assistant! Saves me hours of work.',
    createdAt: '2024-01-10T00:00:00.000Z',
  },
  {
    id: '2',
    userId: '2',
    userName: 'Jane Smith',
    agentId: '1',
    rating: 4,
    comment: 'Great tool, but could use more customization options.',
    createdAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: '3',
    userId: '3',
    userName: 'Bob Johnson',
    agentId: '2',
    rating: 5,
    comment: 'Perfect for data analysis. Highly recommended!',
    createdAt: '2024-01-14T00:00:00.000Z',
  },
]

export const mockPayments = {
  successfulPayment: {
    id: 'pay_123456',
    amount: 2999,
    currency: 'usd',
    status: 'succeeded',
    paymentMethod: 'card',
    orderId: '1',
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  failedPayment: {
    id: 'pay_789012',
    amount: 2999,
    currency: 'usd',
    status: 'failed',
    paymentMethod: 'card',
    error: 'Your card was declined.',
    orderId: '2',
    createdAt: '2024-01-20T00:00:00.000Z',
  },
}

// Helper functions to create mock data with overrides
export const createMockUser = (overrides = {}) => ({
  ...mockUsers.user1,
  ...overrides,
})

export const createMockAgent = (overrides = {}) => ({
  ...mockAgents.writingAssistant,
  ...overrides,
})

export const createMockOrder = (overrides = {}) => ({
  ...mockOrders.order1,
  ...overrides,
})

export const createMockReview = (overrides = {}) => ({
  ...mockReviews[0],
  ...overrides,
})