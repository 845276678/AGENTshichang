import { Agent } from '@/components/ui/agent-card'

export const categories = [
  { id: 'business', name: 'Business', count: 147 },
  { id: 'creative', name: 'Creative', count: 89 },
  { id: 'development', name: 'Development', count: 76 },
  { id: 'analysis', name: 'Analysis', count: 54 },
  { id: 'communication', name: 'Communication', count: 43 },
  { id: 'education', name: 'Education', count: 67 },
  { id: 'productivity', name: 'Productivity', count: 91 },
  { id: 'ai-ml', name: 'AI & ML', count: 32 },
]

export const priceRanges = [
  { id: 'free', label: 'Free', min: 0, max: 0 },
  { id: 'budget', label: '$1 - $10', min: 1, max: 10 },
  { id: 'standard', label: '$10 - $50', min: 10, max: 50 },
  { id: 'premium', label: '$50+', min: 50, max: Infinity },
]

export const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'downloads', label: 'Most Downloaded' },
]

export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'CodeMaster Pro',
    description: 'Advanced AI coding assistant that helps you write, debug, and optimize code across multiple programming languages with intelligent suggestions and automated testing.',
    category: 'Development',
    price: 29,
    rating: 4.8,
    reviewCount: 1247,
    downloads: 15420,
    tags: ['Code Generation', 'Debugging', 'Optimization', 'Testing'],
    author: {
      id: '1',
      name: 'TechCorp',
      verified: true
    },
    createdAt: '2024-01-15',
    updatedAt: '2024-09-01',
    featured: true,
    trending: true
  },
  {
    id: '2',
    name: 'DesignWiz',
    description: 'Creative AI that generates stunning graphics, logos, and design assets for your projects with just a few prompts. Perfect for marketers and designers.',
    category: 'Creative',
    price: 0,
    rating: 4.6,
    reviewCount: 892,
    downloads: 8930,
    tags: ['Logo Design', 'Graphics', 'Branding', 'UI/UX'],
    author: {
      id: '2',
      name: 'CreativeStudio',
      verified: true
    },
    createdAt: '2024-02-10',
    updatedAt: '2024-08-28',
    featured: true
  },
  {
    id: '3',
    name: 'DataAnalyst AI',
    description: 'Powerful analytics agent that processes large datasets, generates insights, and creates beautiful visualizations for business intelligence.',
    category: 'Analysis',
    price: 49,
    rating: 4.9,
    reviewCount: 623,
    downloads: 5240,
    tags: ['Data Analysis', 'Visualization', 'Insights', 'BI'],
    author: {
      id: '3',
      name: 'DataLabs',
      verified: true
    },
    createdAt: '2024-01-20',
    updatedAt: '2024-09-05',
    featured: true
  },
  {
    id: '4',
    name: 'ContentWriter Pro',
    description: 'AI-powered content creation tool that generates blog posts, articles, social media content, and marketing copy with SEO optimization.',
    category: 'Creative',
    price: 19,
    rating: 4.5,
    reviewCount: 1834,
    downloads: 12750,
    tags: ['Content Writing', 'SEO', 'Marketing', 'Copywriting'],
    author: {
      id: '4',
      name: 'ContentCorp',
      verified: true
    },
    createdAt: '2024-03-05',
    updatedAt: '2024-09-10',
    trending: true
  },
  {
    id: '5',
    name: 'TaskMaster',
    description: 'Intelligent task management and workflow automation agent that helps teams stay organized and productive with smart scheduling.',
    category: 'Productivity',
    price: 15,
    rating: 4.7,
    reviewCount: 956,
    downloads: 7845,
    tags: ['Task Management', 'Automation', 'Scheduling', 'Productivity'],
    author: {
      id: '5',
      name: 'ProductivityPlus',
      verified: false
    },
    createdAt: '2024-02-20',
    updatedAt: '2024-08-15'
  },
  {
    id: '6',
    name: 'ChatBot Builder',
    description: 'No-code chatbot creation platform that allows businesses to build and deploy conversational AI agents for customer support.',
    category: 'Communication',
    price: 35,
    rating: 4.4,
    reviewCount: 567,
    downloads: 3920,
    tags: ['Chatbot', 'Customer Support', 'No-Code', 'Conversational AI'],
    author: {
      id: '6',
      name: 'ChatTech',
      verified: true
    },
    createdAt: '2024-04-01',
    updatedAt: '2024-09-12'
  },
  {
    id: '7',
    name: 'EmailGenius',
    description: 'Smart email marketing automation agent that personalizes campaigns, optimizes send times, and tracks engagement metrics.',
    category: 'Business',
    price: 25,
    rating: 4.6,
    reviewCount: 1123,
    downloads: 9875,
    tags: ['Email Marketing', 'Automation', 'Personalization', 'Analytics'],
    author: {
      id: '7',
      name: 'MarketingPro',
      verified: true
    },
    createdAt: '2024-01-30',
    updatedAt: '2024-09-08'
  },
  {
    id: '8',
    name: 'LearnBot',
    description: 'Educational AI that creates personalized learning paths, interactive lessons, and adaptive assessments for students and professionals.',
    category: 'Education',
    price: 0,
    rating: 4.8,
    reviewCount: 2156,
    downloads: 18340,
    tags: ['Education', 'Learning', 'Assessment', 'Personalization'],
    author: {
      id: '8',
      name: 'EduTech',
      verified: true
    },
    createdAt: '2024-03-15',
    updatedAt: '2024-09-14',
    featured: true
  },
  {
    id: '9',
    name: 'SalesForce AI',
    description: 'Advanced sales automation and lead generation agent that helps businesses identify prospects, manage pipelines, and close deals faster.',
    category: 'Business',
    price: 59,
    rating: 4.7,
    reviewCount: 834,
    downloads: 6420,
    tags: ['Sales', 'Lead Generation', 'CRM', 'Pipeline Management'],
    author: {
      id: '9',
      name: 'SalesTech Inc',
      verified: true
    },
    createdAt: '2024-02-28',
    updatedAt: '2024-09-06'
  },
  {
    id: '10',
    name: 'ImageProcessor',
    description: 'AI-powered image editing and enhancement tool that automatically improves photo quality, removes backgrounds, and applies artistic effects.',
    category: 'Creative',
    price: 12,
    rating: 4.3,
    reviewCount: 678,
    downloads: 4530,
    tags: ['Image Editing', 'Enhancement', 'Background Removal', 'Filters'],
    author: {
      id: '10',
      name: 'PixelWorks',
      verified: false
    },
    createdAt: '2024-04-10',
    updatedAt: '2024-08-20'
  },
  {
    id: '11',
    name: 'SecurityGuard',
    description: 'Cybersecurity monitoring agent that detects threats, analyzes vulnerabilities, and provides real-time security recommendations.',
    category: 'Business',
    price: 89,
    rating: 4.9,
    reviewCount: 345,
    downloads: 2180,
    tags: ['Cybersecurity', 'Threat Detection', 'Monitoring', 'Security'],
    author: {
      id: '11',
      name: 'SecureTech',
      verified: true
    },
    createdAt: '2024-03-20',
    updatedAt: '2024-09-11'
  },
  {
    id: '12',
    name: 'TranslateBot',
    description: 'Multi-language translation agent that provides accurate, contextual translations with support for 100+ languages and cultural nuances.',
    category: 'Communication',
    price: 8,
    rating: 4.5,
    reviewCount: 1456,
    downloads: 11240,
    tags: ['Translation', 'Languages', 'Communication', 'Localization'],
    author: {
      id: '12',
      name: 'LinguaTech',
      verified: true
    },
    createdAt: '2024-01-25',
    updatedAt: '2024-09-09'
  },
  {
    id: '13',
    name: 'CodeReviewer',
    description: 'Automated code review agent that analyzes code quality, suggests improvements, and ensures adherence to best practices and coding standards.',
    category: 'Development',
    price: 39,
    rating: 4.6,
    reviewCount: 789,
    downloads: 6890,
    tags: ['Code Review', 'Quality Assurance', 'Best Practices', 'Standards'],
    author: {
      id: '13',
      name: 'DevTools Ltd',
      verified: true
    },
    createdAt: '2024-02-15',
    updatedAt: '2024-08-30'
  },
  {
    id: '14',
    name: 'VoiceClone',
    description: 'Advanced voice synthesis agent that creates realistic voice clones for podcasting, audiobooks, and multimedia content production.',
    category: 'Creative',
    price: 45,
    rating: 4.4,
    reviewCount: 523,
    downloads: 3640,
    tags: ['Voice Synthesis', 'Audio', 'Podcasting', 'Text-to-Speech'],
    author: {
      id: '14',
      name: 'AudioTech',
      verified: true
    },
    createdAt: '2024-04-05',
    updatedAt: '2024-09-07'
  },
  {
    id: '15',
    name: 'MeetingBot',
    description: 'Smart meeting assistant that transcribes conversations, extracts action items, and generates comprehensive meeting summaries automatically.',
    category: 'Productivity',
    price: 22,
    rating: 4.7,
    reviewCount: 1067,
    downloads: 8750,
    tags: ['Meeting', 'Transcription', 'Summaries', 'Action Items'],
    author: {
      id: '15',
      name: 'MeetTech',
      verified: true
    },
    createdAt: '2024-03-10',
    updatedAt: '2024-09-13'
  },
  {
    id: '16',
    name: 'MLTrainer',
    description: 'Machine learning model training and optimization agent that simplifies the process of building, training, and deploying ML models.',
    category: 'AI & ML',
    price: 79,
    rating: 4.8,
    reviewCount: 412,
    downloads: 2950,
    tags: ['Machine Learning', 'Model Training', 'Optimization', 'Deployment'],
    author: {
      id: '16',
      name: 'ML Solutions',
      verified: true
    },
    createdAt: '2024-01-10',
    updatedAt: '2024-09-04',
    trending: true
  },
  {
    id: '17',
    name: 'BudgetPlanner',
    description: 'Personal finance management agent that tracks expenses, creates budgets, and provides financial insights and recommendations.',
    category: 'Business',
    price: 0,
    rating: 4.5,
    reviewCount: 2340,
    downloads: 16780,
    tags: ['Finance', 'Budgeting', 'Expense Tracking', 'Financial Planning'],
    author: {
      id: '17',
      name: 'FinanceTech',
      verified: false
    },
    createdAt: '2024-02-05',
    updatedAt: '2024-08-25'
  },
  {
    id: '18',
    name: 'DocumentParser',
    description: 'Intelligent document processing agent that extracts data from PDFs, forms, and images with high accuracy and structured output.',
    category: 'Productivity',
    price: 31,
    rating: 4.6,
    reviewCount: 656,
    downloads: 5430,
    tags: ['Document Processing', 'OCR', 'Data Extraction', 'Automation'],
    author: {
      id: '18',
      name: 'DocuTech',
      verified: true
    },
    createdAt: '2024-03-25',
    updatedAt: '2024-09-02'
  },
  {
    id: '19',
    name: 'GameDev Assistant',
    description: 'Game development AI that helps with level design, character creation, dialogue generation, and game balancing for indie developers.',
    category: 'Creative',
    price: 27,
    rating: 4.4,
    reviewCount: 445,
    downloads: 3120,
    tags: ['Game Development', 'Level Design', 'Character Creation', 'Dialogue'],
    author: {
      id: '19',
      name: 'GameStudio',
      verified: false
    },
    createdAt: '2024-04-15',
    updatedAt: '2024-08-18'
  },
  {
    id: '20',
    name: 'HealthTracker',
    description: 'Personal health monitoring agent that analyzes fitness data, provides health insights, and creates personalized wellness recommendations.',
    category: 'Health',
    price: 18,
    rating: 4.7,
    reviewCount: 1234,
    downloads: 9650,
    tags: ['Health', 'Fitness', 'Wellness', 'Tracking'],
    author: {
      id: '20',
      name: 'HealthTech',
      verified: true
    },
    createdAt: '2024-01-05',
    updatedAt: '2024-09-15'
  }
]

export const featuredAgents = mockAgents.filter(agent => agent.featured)
export const trendingAgents = mockAgents.filter(agent => agent.trending)