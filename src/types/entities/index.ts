// Main index file that exports all entity types

// Base types
export * from './base'

// User and related entities
export * from './user'

// Bidding entities
export * from './bidding'

// Business entities
export * from './business'

// Re-export commonly used types at root level for convenience
export type {
  // Base
  BaseEntity,
  TimestampedEntity,
  SoftDeletableEntity,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,

  // User
  User,
  Idea,
  Payment,
  Notification,
  CreateUserInput,
  UpdateUserInput,
  CreateIdeaInput,
  UpdateIdeaInput,

  // Bidding
  BiddingSession,
  BiddingRound,
  BiddingMessage,
  AIBid,
  BiddingWebSocketEvent,
  CreateBiddingSessionInput,
  UpdateBiddingSessionInput,

  // Business
  BusinessPlan,
  ResearchReport,
  Discussion,
  CreateBusinessPlanInput,
  UpdateBusinessPlanInput,
  CreateResearchReportInput,
  UpdateResearchReportInput,
  CreateDiscussionInput,
  UpdateDiscussionInput
} from './index'

// Re-export commonly used enums
export {
  Status,
  UserRole,
  PaymentStatus,
  DocumentType,
  NotificationType,
  BiddingPhase,
  BiddingStatus,
  MessageType,
  BiddingEventType
} from './index'