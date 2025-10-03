// Test fixture types
import type { User, Idea, Payment, Notification } from '@/types/entities'

// Mock user type
export interface MockUser {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

// Mock agent type
export interface MockAgent {
  id: string
  name: string
  description: string
  longDescription: string
  price: number
  category: string
  tags: string[]
  rating: number
  downloads: number
  author: string
  authorId: string
  imageUrl: string
  features: string[]
  requirements: string[]
  changelog: ChangelogEntry[]
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

// Changelog entry type
export interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

// Mock category type
export interface MockCategory {
  id: string
  name: string
  description: string
  count: number
  imageUrl: string
}

// Mock order type
export interface MockOrder {
  id: string
  userId: string
  total: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  items: MockOrderItem[]
  paymentMethod: 'CARD' | 'PAYPAL' | 'BANK_TRANSFER'
  createdAt: string
  updatedAt: string
}

// Mock order item type
export interface MockOrderItem {
  id: string
  agentId: string
  agentName: string
  price: number
  quantity: number
}

// Mock review type
export interface MockReview {
  id: string
  userId: string
  userName: string
  agentId: string
  rating: number
  comment: string
  createdAt: string
}

// Mock payment type
export interface MockPayment {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed'
  paymentMethod: string
  orderId?: string
  error?: string
  createdAt: string
}

// Factory function types
export type MockDataOverrides<T> = Partial<T>

export type MockUserFactory = (overrides?: MockDataOverrides<MockUser>) => MockUser
export type MockAgentFactory = (overrides?: MockDataOverrides<MockAgent>) => MockAgent
export type MockOrderFactory = (overrides?: MockDataOverrides<MockOrder>) => MockOrder
export type MockReviewFactory = (overrides?: MockDataOverrides<MockReview>) => MockReview