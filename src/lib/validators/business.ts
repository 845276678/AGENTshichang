import { z } from 'zod'
import { uuidValidator, positiveNumberValidator } from './user'

// Financial metric schema
const FinancialMetricSchema = z.object({
  period: z.string(),
  value: positiveNumberValidator,
  growth: z.number().optional()
})

// Unit economics schema
const UnitEconomicsSchema = z.object({
  cac: positiveNumberValidator, // Customer Acquisition Cost
  ltv: positiveNumberValidator, // Lifetime Value
  paybackPeriod: positiveNumberValidator, // months
  grossMargin: z.number().min(0).max(100) // percentage
})

// Revenue stream schema
const RevenueStreamSchema = z.object({
  source: z.string().min(1).max(100),
  model: z.enum(['subscription', 'one-time', 'usage-based', 'freemium', 'hybrid']),
  projection: positiveNumberValidator,
  percentage: z.number().min(0).max(100)
})

// Cost item schema
const CostItemSchema = z.object({
  category: z.string().min(1).max(100),
  description: z.string().max(500),
  amount: positiveNumberValidator,
  recurring: z.boolean()
})

// Business plan request schema
export const GenerateBusinessPlanSchema = z.object({
  ideaId: uuidValidator.optional(),
  ideaContent: z.string().min(20, 'Idea must be at least 20 characters').max(5000),
  sessionId: uuidValidator.optional(),
  winningBid: positiveNumberValidator.optional(),
  winner: z.string().optional(),
  options: z.object({
    includeFinancials: z.boolean().default(true),
    includeRiskAnalysis: z.boolean().default(true),
    format: z.enum(['json', 'markdown', 'pdf']).default('json'),
    language: z.enum(['en', 'zh']).default('zh')
  }).optional()
})

// Update business plan schema
export const UpdateBusinessPlanSchema = z.object({
  planId: uuidValidator,
  sections: z.object({
    executiveSummary: z.object({
      vision: z.string().optional(),
      mission: z.string().optional(),
      objectives: z.array(z.string()).optional(),
      keySuccessFactors: z.array(z.string()).optional()
    }).optional(),
    marketAnalysis: z.object({
      targetMarket: z.string().optional(),
      marketSize: positiveNumberValidator.optional(),
      growthRate: z.number().optional()
    }).optional(),
    financialProjection: z.object({
      revenue: z.array(FinancialMetricSchema).optional(),
      costs: z.array(FinancialMetricSchema).optional(),
      fundingNeeds: positiveNumberValidator.optional()
    }).optional()
  })
})

// Document export schema
export const DocumentExportSchema = z.object({
  documentId: uuidValidator,
  documentType: z.enum(['BUSINESS_PLAN', 'RESEARCH_REPORT', 'LANDING_GUIDE', 'MARKET_ANALYSIS']),
  format: z.enum(['pdf', 'docx', 'markdown', 'json']),
  options: z.object({
    includeMetadata: z.boolean().default(false),
    includeAnalytics: z.boolean().default(false),
    watermark: z.boolean().default(false),
    language: z.enum(['en', 'zh']).default('zh')
  }).optional()
})

// Research report request schema
export const GenerateResearchReportSchema = z.object({
  ideaId: uuidValidator,
  ideaContent: z.string().min(20).max(5000),
  reportType: z.enum(['BASIC', 'DETAILED', 'COMPREHENSIVE']).default('BASIC'),
  focusAreas: z.array(z.enum(['market', 'technology', 'competition', 'users', 'business_model'])).optional()
})

// Landing coach guide request schema
export const GenerateLandingGuideSchema = z.object({
  reportId: uuidValidator.optional(),
  ideaContent: z.string().min(20).max(5000),
  businessContext: z.object({
    targetMarket: z.string().optional(),
    budget: positiveNumberValidator.optional(),
    timeline: z.string().optional(),
    teamSize: z.number().positive().optional()
  }).optional()
})

// Type exports
export type GenerateBusinessPlanInput = z.infer<typeof GenerateBusinessPlanSchema>
export type UpdateBusinessPlanInput = z.infer<typeof UpdateBusinessPlanSchema>
export type DocumentExportInput = z.infer<typeof DocumentExportSchema>
export type GenerateResearchReportInput = z.infer<typeof GenerateResearchReportSchema>
export type GenerateLandingGuideInput = z.infer<typeof GenerateLandingGuideSchema>