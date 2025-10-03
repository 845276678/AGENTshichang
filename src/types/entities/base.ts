// Base entity types that all other entities extend from
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface TimestampedEntity {
  createdAt: Date
  updatedAt: Date
}

export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: Date | null
  isDeleted?: boolean
}

// Common enums used across entities
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  PREMIUM_USER = 'PREMIUM_USER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum DocumentType {
  BUSINESS_PLAN = 'BUSINESS_PLAN',
  RESEARCH_REPORT = 'RESEARCH_REPORT',
  LANDING_GUIDE = 'LANDING_GUIDE',
  MARKET_ANALYSIS = 'MARKET_ANALYSIS'
}

// Common value objects
export interface Money {
  amount: number
  currency: string
}

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface ContactInfo {
  email?: string
  phone?: string
  address?: string
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: number
}

// Type guards
export function isBaseEntity(obj: any): obj is BaseEntity {
  return obj && typeof obj.id === 'string' && obj.createdAt instanceof Date && obj.updatedAt instanceof Date
}

export function isSoftDeletableEntity(obj: any): obj is SoftDeletableEntity {
  return isBaseEntity(obj) && ('deletedAt' in obj || 'isDeleted' in obj)
}