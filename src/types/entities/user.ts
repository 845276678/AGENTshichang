import { BaseEntity, UserRole, Status } from './base'

// User entity
export interface User extends BaseEntity {
  email: string
  username: string
  password?: string // Optional since we don't always return it
  role: UserRole
  status: Status
  credits: number
  avatar?: string | null
  bio?: string | null
  website?: string | null
  location?: string | null
  lastLoginAt?: Date | null
  emailVerified?: boolean
  emailVerifiedAt?: Date | null

  // Relations
  ideas?: Idea[]
  payments?: Payment[]
  notifications?: Notification[]
  sessions?: BiddingSession[]
  businessPlans?: BusinessPlan[]
}

// Idea entity
export interface Idea extends BaseEntity {
  title: string
  content: string
  description?: string | null
  category?: string | null
  tags?: string[]
  status: Status
  userId: string
  imageUrl?: string | null
  videoUrl?: string | null
  views: number
  likes: number
  shares: number
  creativityScore?: number | null
  marketPotential?: number | null

  // Relations
  user?: User
  biddingSessions?: BiddingSession[]
  discussions?: Discussion[]
  researchReports?: ResearchReport[]
}

// Payment entity
export interface Payment extends BaseEntity {
  userId: string
  amount: number
  currency: string
  status: PaymentStatus
  method: string
  transactionId?: string | null
  description?: string | null
  metadata?: Record<string, any>
  paidAt?: Date | null
  failedAt?: Date | null
  refundedAt?: Date | null

  // Relations
  user?: User
}

// Notification entity
export interface Notification extends BaseEntity {
  userId: string
  type: NotificationType
  title: string
  content: string
  read: boolean
  readAt?: Date | null
  actionUrl?: string | null
  metadata?: Record<string, any>

  // Relations
  user?: User
}

// Notification types
export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  BIDDING = 'BIDDING',
  PAYMENT = 'PAYMENT',
  SYSTEM = 'SYSTEM'
}

// Helper types for creating/updating
export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'ideas' | 'payments' | 'notifications'>
export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'ideas' | 'payments' | 'notifications'>>

export type CreateIdeaInput = Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'biddingSessions' | 'discussions' | 'researchReports'>
export type UpdateIdeaInput = Partial<Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'biddingSessions' | 'discussions' | 'researchReports'>>

export type CreatePaymentInput = Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'user'>
export type UpdatePaymentInput = Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'user'>>

export type CreateNotificationInput = Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'read' | 'readAt'>

export { PaymentStatus } from './base'