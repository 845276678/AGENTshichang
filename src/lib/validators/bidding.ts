import { z } from 'zod'
import { uuidValidator, positiveNumberValidator, dateStringValidator } from './user'

// Bidding phase and status enums
export const BiddingPhaseEnum = z.enum(['WARMUP', 'DISCUSSION', 'DEBATE', 'BIDDING', 'FINAL', 'COMPLETED'])
export const BiddingStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'])
export const MessageTypeEnum = z.enum(['INTRO', 'ANALYSIS', 'QUESTION', 'RESPONSE', 'DEBATE', 'BID', 'SYSTEM', 'USER'])

// AI Bid schema
export const AIBidSchema = z.object({
  personaId: z.string(),
  personaName: z.string(),
  amount: positiveNumberValidator,
  reasoning: z.string().min(10, 'Reasoning must be at least 10 characters'),
  confidence: z.number().min(0).max(1),
  timestamp: z.date().or(dateStringValidator)
})

// Bidding configuration schema
export const BiddingConfigSchema = z.object({
  minBid: positiveNumberValidator.default(80),
  maxBid: positiveNumberValidator.default(500),
  timePerRound: positiveNumberValidator.default(60), // seconds
  autoAdvance: z.boolean().default(true)
})

// Create bidding session schema
export const CreateBiddingSessionSchema = z.object({
  ideaId: uuidValidator,
  ideaContent: z.string().min(10, 'Idea content must be at least 10 characters').max(1000),
  userId: uuidValidator.optional(),
  config: BiddingConfigSchema.optional()
})

// Update bidding session schema
export const UpdateBiddingSessionSchema = z.object({
  sessionId: uuidValidator,
  status: BiddingStatusEnum.optional(),
  phase: BiddingPhaseEnum.optional(),
  userFeedback: z.string().max(500).optional()
})

// Bidding message schema
export const BiddingMessageSchema = z.object({
  sessionId: uuidValidator,
  personaId: z.string(),
  personaName: z.string(),
  content: z.string().min(1).max(2000),
  type: MessageTypeEnum,
  metadata: z.object({
    bid: positiveNumberValidator.optional(),
    confidence: z.number().min(0).max(1).optional(),
    emotion: z.string().optional()
  }).optional()
})

// WebSocket event schema
export const BiddingWebSocketEventSchema = z.object({
  type: z.enum(['SESSION_START', 'PHASE_CHANGE', 'ROUND_START', 'ROUND_END', 'MESSAGE', 'BID_PLACED', 'USER_FEEDBACK', 'SESSION_COMPLETE', 'ERROR']),
  sessionId: uuidValidator,
  data: z.any(), // This will be validated based on event type
  timestamp: z.date().or(dateStringValidator)
})

// User feedback schema
export const UserFeedbackSchema = z.object({
  sessionId: uuidValidator,
  feedback: z.string().min(1, 'Feedback cannot be empty').max(500, 'Feedback must be less than 500 characters'),
  rating: z.number().min(1).max(5).optional()
})

// Bidding request schema (for API route)
export const BiddingRequestSchema = z.object({
  ideaContent: z.string().min(10, 'Idea must be at least 10 characters').max(1000, 'Idea must be less than 1000 characters'),
  sessionId: uuidValidator.optional(),
  action: z.enum(['start', 'continue', 'feedback', 'complete']).optional(),
  userFeedback: z.string().max(500).optional(),
  config: BiddingConfigSchema.optional()
})

// Type exports
export type AIBid = z.infer<typeof AIBidSchema>
export type BiddingConfig = z.infer<typeof BiddingConfigSchema>
export type CreateBiddingSessionInput = z.infer<typeof CreateBiddingSessionSchema>
export type UpdateBiddingSessionInput = z.infer<typeof UpdateBiddingSessionSchema>
export type BiddingMessage = z.infer<typeof BiddingMessageSchema>
export type BiddingWebSocketEvent = z.infer<typeof BiddingWebSocketEventSchema>
export type UserFeedback = z.infer<typeof UserFeedbackSchema>
export type BiddingRequest = z.infer<typeof BiddingRequestSchema>