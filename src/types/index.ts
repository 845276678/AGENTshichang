// Core application types
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'USER' | 'AGENT_CREATOR' | 'ADMIN' | 'SUPER_ADMIN'

export type UserLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'

export interface Agent {
  id: string
  name: string
  description: string
  avatar?: string
  category: AgentCategory
  tags: string[]
  capabilities: string[]
  pricing: AgentPricing
  rating: number
  totalReviews: number
  isActive: boolean
  creatorId: string
  creator: User
  createdAt: Date
  updatedAt: Date
}

export type AgentCategory = 
  | 'PRODUCTIVITY'
  | 'CREATIVITY'
  | 'ANALYSIS'
  | 'COMMUNICATION'
  | 'DEVELOPMENT'
  | 'MARKETING'
  | 'EDUCATION'
  | 'ENTERTAINMENT'
  | 'BUSINESS'
  | 'OTHER'

export interface AgentPricing {
  type: PricingType
  basePrice?: number
  currency: 'USD' | 'EUR' | 'GBP' | 'CNY'
  billingPeriod?: 'MONTHLY' | 'YEARLY' | 'ONE_TIME'
  features: string[]
  freeTrialDays?: number
  usageLimit?: {
    requests: number
    period: 'DAY' | 'MONTH'
  }
}

export type PricingType = 'FREE' | 'PAID' | 'FREEMIUM' | 'PAY_PER_USE'

export interface AgentReview {
  id: string
  rating: number
  comment?: string
  userId: string
  user: User
  agentId: string
  agent: Agent
  createdAt: Date
  updatedAt: Date
}

export interface Conversation {
  id: string
  userId: string
  user: User
  agentId: string
  agent: Agent
  messages: Message[]
  status: ConversationStatus
  createdAt: Date
  updatedAt: Date
}

export type ConversationStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'

export interface Message {
  id: string
  conversationId: string
  content: string
  role: MessageRole
  timestamp: Date
  metadata?: Record<string, any>
}

export type MessageRole = 'USER' | 'AGENT' | 'SYSTEM'

export interface Subscription {
  id: string
  userId: string
  user: User
  agentId: string
  agent: Agent
  plan: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
}

export type SubscriptionStatus = 
  | 'ACTIVE'
  | 'CANCELED'
  | 'PAST_DUE'
  | 'PAUSED'
  | 'INCOMPLETE'
  | 'TRIALING'

export interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  interval: 'MONTH' | 'YEAR'
  features: string[]
  agentId: string
}

export interface Transaction {
  id: string
  userId: string
  agentId: string
  subscriptionId?: string
  amount: number
  currency: string
  status: TransactionStatus
  paymentMethod: PaymentMethod
  createdAt: Date
  updatedAt: Date
}

export type TransactionStatus = 
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELED'
  | 'REFUNDED'

export type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' | 'STRIPE' | 'BANK_TRANSFER'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Component Props types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
}

export interface InputProps extends BaseComponentProps {
  type?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

// Form types
export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  agreeToTerms: boolean
}

export interface AgentCreateFormData {
  name: string
  description: string
  category: AgentCategory
  tags: string[]
  capabilities: string[]
  pricing: AgentPricing
  avatar?: File
}

// Search and Filter types
export interface SearchFilters {
  query?: string
  category?: AgentCategory
  priceRange?: {
    min?: number
    max?: number
  }
  rating?: number
  tags?: string[]
  sortBy?: 'relevance' | 'rating' | 'price' | 'newest' | 'popular'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResults<T> {
  items: T[]
  totalCount: number
  filters: SearchFilters
  suggestions?: string[]
}

// Creative Collaboration types
export interface CreativeIdea {
  id: string
  title: string
  description: string
  category: string
  authorId: string
  author: User
  status: IdeaStatus
  submittedAt: Date
  updatedAt: Date
  tags: string[]
  currentPhase: CreativePhase
  biddingEndTime?: Date
  finalPrice?: number
  winningAgentId?: string
  conversations: CreativeConversation[]
}

export type IdeaStatus = 'DRAFT' | 'SUBMITTED' | 'BIDDING' | 'IN_COLLABORATION' | 'COMPLETED' | 'PUBLISHED'

export type CreativePhase = 'INITIAL_SUBMISSION' | 'AI_EVALUATION' | 'ITERATIVE_REFINEMENT' | 'FEASIBILITY_VALIDATION' | 'VALUE_PACKAGING' | 'FINALIZATION'

export interface CreativeConversation {
  id: string
  ideaId: string
  agentId: string
  agent: CreativeAgent
  messages: CreativeMessage[]
  phase: CreativePhase
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  createdAt: Date
  updatedAt: Date
  iterationCount: number
  qualityScore?: number
}

export interface CreativeMessage {
  id: string
  conversationId: string
  content: string
  role: 'USER' | 'AGENT' | 'SYSTEM'
  messageType: CreativeMessageType
  timestamp: Date
  metadata?: CreativeMessageMetadata
  attachments?: CreativeAttachment[]
}

export type CreativeMessageType =
  | 'INITIAL_IDEA'
  | 'QUESTION'
  | 'SUGGESTION'
  | 'CHALLENGE'
  | 'REFINEMENT'
  | 'VALIDATION'
  | 'ENHANCEMENT'
  | 'FINAL_PROPOSAL'

export interface CreativeMessageMetadata {
  questionType?: 'SOCRATIC' | 'SCENARIO' | 'HYPOTHESIS' | 'REVERSE'
  challengeLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
  suggestionCategory?: 'TECHNICAL' | 'BUSINESS' | 'USER_EXPERIENCE' | 'MARKET'
  confidenceScore?: number
  processingTime?: number
  relatedConcepts?: string[]
}

export interface CreativeAttachment {
  id: string
  type: 'IMAGE' | 'DOCUMENT' | 'LINK' | 'DIAGRAM' | 'PROTOTYPE'
  url: string
  title: string
  description?: string
}

export interface CreativeAgent extends Agent {
  personality: AgentPersonality
  cognitionStyle: CognitionStyle
  specialties: string[]
  thinkingPattern: ThinkingPattern
  collaborationPreference: CollaborationPreference
  learningProfile: AgentLearningProfile
  currentMood?: AgentMood
  dailyBudget: number
  biddingStrategy: BiddingStrategy
}

export interface AgentPersonality {
  traits: PersonalityTrait[]
  communicationStyle: 'FORMAL' | 'CASUAL' | 'TECHNICAL' | 'EMPATHETIC' | 'DIRECT'
  questioningApproach: 'SOCRATIC' | 'ANALYTICAL' | 'CREATIVE' | 'PRACTICAL'
  feedbackStyle: 'CONSTRUCTIVE' | 'CHALLENGING' | 'SUPPORTIVE' | 'DETAILED'
}

export type PersonalityTrait =
  | 'ANALYTICAL'
  | 'CREATIVE'
  | 'EMPATHETIC'
  | 'LOGICAL'
  | 'INTUITIVE'
  | 'PRAGMATIC'
  | 'INNOVATIVE'
  | 'METHODICAL'

export interface CognitionStyle {
  primaryThinkingMode: 'SYSTEMATIC' | 'INTUITIVE' | 'EXPERIMENTAL' | 'INTEGRATIVE'
  decisionMakingStyle: 'DATA_DRIVEN' | 'EXPERIENCE_BASED' | 'RISK_TOLERANT' | 'CONSERVATIVE'
  problemSolvingApproach: 'TOP_DOWN' | 'BOTTOM_UP' | 'ITERATIVE' | 'HOLISTIC'
  informationProcessing: 'SEQUENTIAL' | 'PARALLEL' | 'CONTEXTUAL' | 'ABSTRACT'
}

export interface ThinkingPattern {
  preferredQuestionTypes: CreativeMessageType[]
  ideaEvaluationCriteria: string[]
  improvementFocusAreas: string[]
  riskAssessmentLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface CollaborationPreference {
  interactionFrequency: 'HIGH' | 'MEDIUM' | 'LOW'
  feedbackTimeline: 'IMMEDIATE' | 'SCHEDULED' | 'MILESTONE_BASED'
  collaborationDepth: 'SURFACE' | 'MODERATE' | 'DEEP'
  userGuidanceLevel: 'MINIMAL' | 'MODERATE' | 'EXTENSIVE'
}

export interface AgentLearningProfile {
  userPreferencesLearned: UserPreference[]
  adaptationSpeed: 'SLOW' | 'MEDIUM' | 'FAST'
  memoryRetention: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM'
  improvementAreas: string[]
  successPatterns: string[]
}

export interface UserPreference {
  category: string
  preference: string
  confidence: number
  lastUpdated: Date
}

export interface AgentMood {
  energy: number // 1-10
  creativity: number // 1-10
  criticalness: number // 1-10
  collaboration: number // 1-10
  factors: string[]
  lastUpdated: Date
}

export interface BiddingStrategy {
  baseStrategy: 'AGGRESSIVE' | 'CONSERVATIVE' | 'ADAPTIVE' | 'OPPORTUNITY_BASED'
  factorWeights: {
    technicalFeasibility: number
    marketPotential: number
    personalInterest: number
    collaborationPotential: number
  }
  bidThreshold: number
  maxBidAmount: number
}

export interface CreativeWorkshop {
  id: string
  title: string
  description: string
  hostAgentId: string
  hostAgent: CreativeAgent
  type: WorkshopType
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  duration: number // minutes
  maxParticipants: number
  currentParticipants: number
  schedule: Date
  exercises: WorkshopExercise[]
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
}

export type WorkshopType =
  | 'TECHNICAL_INNOVATION'
  | 'CREATIVE_STORYTELLING'
  | 'BUSINESS_MODELING'
  | 'CROSS_DOMAIN_THINKING'
  | 'PROBLEM_SOLVING'

export interface WorkshopExercise {
  id: string
  title: string
  description: string
  timeLimit: number
  exerciseType: 'IDEATION' | 'REFINEMENT' | 'EVALUATION' | 'PRESENTATION'
  instructions: string[]
  constraints?: string[]
  examples?: string[]
}

export interface CreativeChallenge {
  id: string
  title: string
  description: string
  creatorAgentId: string
  creatorAgent: CreativeAgent
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'
  timeLimit: number
  constraints: string[]
  evaluationCriteria: string[]
  rewards: ChallengeReward
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED'
  submissions: ChallengeSubmission[]
  createdAt: Date
  expiresAt: Date
}

export interface ChallengeReward {
  points: number
  badges: string[]
  unlockFeatures?: string[]
  description: string
}

export interface ChallengeSubmission {
  id: string
  challengeId: string
  userId: string
  user: User
  content: string
  attachments?: CreativeAttachment[]
  score?: number
  feedback?: string
  submittedAt: Date
  evaluatedAt?: Date
}

export interface UserCreativeProfile {
  userId: string
  user: User
  creativeDNA: CreativeDNA
  learningProgress: LearningProgress
  achievements: Achievement[]
  preferredAgents: string[]
  collaborationHistory: CollaborationHistory[]
  skillLevels: SkillLevel[]
  creativeMetrics: CreativeMetrics
}

export interface CreativeDNA {
  dominantThinkingStyle: 'LOGICAL' | 'INTUITIVE' | 'EXPERIMENTAL' | 'INTEGRATIVE'
  creativityType: 'BREAKTHROUGH' | 'IMPROVEMENT' | 'SYNTHESIS' | 'APPLICATION'
  collaborationStyle: 'LEADER' | 'COLLABORATOR' | 'SUPPORTER' | 'INDEPENDENT'
  innovationPreference: 'TECHNICAL' | 'ARTISTIC' | 'BUSINESS' | 'SOCIAL'
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH'
  complexityPreference: 'SIMPLE' | 'MODERATE' | 'COMPLEX'
  lastAssessed: Date
  confidence: number
}

export interface LearningProgress {
  totalSessions: number
  completedChallenges: number
  workshopsAttended: number
  skillsImproved: string[]
  currentLevel: 'NOVICE' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  nextMilestone: string
  progressPercentage: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  type: 'COLLABORATION' | 'CREATIVITY' | 'LEARNING' | 'INNOVATION' | 'SOCIAL'
  icon: string
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  unlockedAt: Date
  requirements: string[]
}

export interface CollaborationHistory {
  agentId: string
  agent: CreativeAgent
  sessionsCount: number
  totalDuration: number
  averageScore: number
  improvementRate: number
  lastCollaboration: Date
  relationshipStrength: number
}

export interface SkillLevel {
  skill: string
  level: number // 1-100
  experience: number
  lastImproved: Date
  improvementRate: number
}

export interface CreativeMetrics {
  totalIdeasSubmitted: number
  averageIdeaScore: number
  collaborationSuccessRate: number
  creativityGrowthRate: number
  preferredCreativeHours: string[]
  mostProductiveAgentType: string
  averageIterationsPerIdea: number
}

// ==================== 创意商店类型定义 ====================

export interface CreativeProduct {
  id: string
  title: string
  description: string
  shortDescription: string
  category: ProductCategory
  tags: string[]
  price: number
  originalPrice?: number
  discount?: number

  // 创作信息
  creatorId: string
  creator: {
    id: string
    username: string
    avatar?: string
    verified: boolean
    level: UserLevel
  }

  // AI协作信息
  collaboratedAgentId?: string
  collaboratedAgent?: {
    id: string
    name: string
    avatar: string
    specialties: string[]
  }

  // 产品文件
  files: ProductFile[]
  previewImages: string[]
  thumbnailImage: string

  // 销售统计
  salesCount: number
  revenue: number
  rating: number
  reviewCount: number

  // 状态信息
  status: ProductStatus
  featured: boolean
  trending: boolean

  // 时间信息
  createdAt: string
  updatedAt: string
  publishedAt?: string

  // 元数据
  metadata: {
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    timeToImplement: string
    requiredSkills: string[]
    compatibility: string[]
    license: ProductLicense
  }
}

export interface ProductFile {
  id: string
  filename: string
  originalName: string
  url: string
  size: number
  mimeType: string
  category: 'main' | 'documentation' | 'example' | 'asset'
  description?: string
  downloadCount: number
}

export interface ProductReview {
  id: string
  productId: string
  userId: string
  user: {
    id: string
    username: string
    avatar?: string
    level: UserLevel
  }
  rating: number
  title: string
  content: string
  helpful: number
  verified: boolean // 是否是已购买用户
  createdAt: string
  updatedAt: string
}

export interface ProductOrder {
  id: string
  orderNumber: string
  productId: string
  product: CreativeProduct
  buyerId: string
  buyer: {
    id: string
    username: string
    email: string
  }
  sellerId: string
  seller: {
    id: string
    username: string
  }
  amount: number
  credits: number
  status: OrderStatus
  paymentMethod: 'credits' | 'alipay' | 'wechat'

  // 下载信息
  downloadCount: number
  maxDownloads: number
  downloadUrls: string[]
  downloadExpiresAt: string

  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface ShoppingCart {
  id: string
  userId: string
  items: CartItem[]
  totalAmount: number
  totalCredits: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  productId: string
  product: CreativeProduct
  quantity: number
  addedAt: string
}

export type ProductCategory =
  | 'ai-prompts'
  | 'business-plans'
  | 'creative-writing'
  | 'design-templates'
  | 'code-snippets'
  | 'marketing-materials'
  | 'educational-content'
  | 'data-analysis'
  | 'automation-scripts'

export type ProductStatus =
  | 'draft'
  | 'pending-review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'suspended'
  | 'archived'

export type ProductLicense =
  | 'personal'
  | 'commercial'
  | 'open-source'
  | 'exclusive'

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled'

// 商店搜索和筛选
export interface ProductSearchFilters {
  category?: ProductCategory
  minPrice?: number
  maxPrice?: number
  rating?: number
  tags?: string[]
  sortBy?: 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating'
  featured?: boolean
  trending?: boolean
}

export interface ProductSearchResult {
  products: CreativeProduct[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  filters: ProductSearchFilters
}

