import { BaseEntity, Status } from './base'
import { User, Idea } from './user'

// Bidding phases
export enum BiddingPhase {
  WARMUP = 'WARMUP',
  DISCUSSION = 'DISCUSSION',
  DEBATE = 'DEBATE',
  BIDDING = 'BIDDING',
  FINAL = 'FINAL',
  COMPLETED = 'COMPLETED'
}

// Bidding status
export enum BiddingStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// AI Persona bid
export interface AIBid {
  personaId: string
  personaName: string
  amount: number
  reasoning: string
  confidence: number
  timestamp: Date
}

// Bidding round
export interface BiddingRound {
  roundNumber: number
  phase: BiddingPhase
  startTime: Date
  endTime?: Date
  bids: AIBid[]
  winningBid?: AIBid
  userFeedback?: string
}

// Bidding Session
export interface BiddingSession extends BaseEntity {
  ideaId: string
  userId: string
  status: BiddingStatus
  phase: BiddingPhase
  currentRound: number
  totalRounds: number
  rounds: BiddingRound[]

  // Bidding results
  winningPersona?: string
  winningBid?: number
  finalScore?: number

  // Timing
  startedAt?: Date
  completedAt?: Date
  pausedAt?: Date

  // Configuration
  config?: {
    minBid?: number
    maxBid?: number
    timePerRound?: number
    autoAdvance?: boolean
  }

  // Metadata
  metadata?: {
    userInteractions?: number
    totalBidsReceived?: number
    averageBid?: number
    creativityScore?: number
  }

  // Relations
  idea?: Idea
  user?: User
  messages?: BiddingMessage[]
  businessPlan?: BusinessPlan
}

// Bidding Message (WebSocket)
export interface BiddingMessage {
  id: string
  sessionId: string
  personaId: string
  personaName: string
  content: string
  type: MessageType
  timestamp: Date
  metadata?: {
    bid?: number
    confidence?: number
    emotion?: string
  }
}

export enum MessageType {
  INTRO = 'INTRO',
  ANALYSIS = 'ANALYSIS',
  QUESTION = 'QUESTION',
  RESPONSE = 'RESPONSE',
  DEBATE = 'DEBATE',
  BID = 'BID',
  SYSTEM = 'SYSTEM',
  USER = 'USER'
}

// WebSocket events
export interface BiddingWebSocketEvent {
  type: BiddingEventType
  sessionId: string
  data: any
  timestamp: Date
}

export enum BiddingEventType {
  SESSION_START = 'SESSION_START',
  PHASE_CHANGE = 'PHASE_CHANGE',
  ROUND_START = 'ROUND_START',
  ROUND_END = 'ROUND_END',
  MESSAGE = 'MESSAGE',
  BID_PLACED = 'BID_PLACED',
  USER_FEEDBACK = 'USER_FEEDBACK',
  SESSION_COMPLETE = 'SESSION_COMPLETE',
  ERROR = 'ERROR'
}

// Helper types
export type CreateBiddingSessionInput = {
  ideaId: string
  userId: string
  config?: BiddingSession['config']
}

export type UpdateBiddingSessionInput = Partial<Omit<BiddingSession, 'id' | 'createdAt' | 'updatedAt' | 'idea' | 'user' | 'messages' | 'businessPlan'>>

export interface BiddingAnalytics {
  totalSessions: number
  completionRate: number
  averageWinningBid: number
  topPersonas: Array<{
    personaId: string
    wins: number
    averageBid: number
  }>
  userEngagement: {
    averageInteractions: number
    averageSessionDuration: number
  }
}