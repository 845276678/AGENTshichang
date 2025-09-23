/**
 * Global Type Definitions for AI Agent Marketplace
 * Fixes TypeScript strict mode errors by providing proper type definitions
 */

// ============= User Related Types =============

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'ADMIN' | 'AGENT_CREATOR';
  credits: number; // Add missing credits property
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  profile?: UserProfile;
  settings?: UserSettings;
}

export interface UserProfile {
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  expertise?: string[];
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
}

// ============= Authentication Types =============

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ============= Agent Types =============

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  rating: number;
  reviewCount: number;
  downloads: number;
  creatorId: string;
  creator: User;
  isActive: boolean;
  capabilities: string[];
  specialties: string[];
  personality?: {
    style: string;
    approach: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============= Submission Types =============

export interface UseSubmissionLimitReturn {
  canSubmit: boolean;
  remainingSubmissions: number;
  nextResetTime: Date | null;
  recordSubmission: () => Promise<void>; // Fix property name
}

// ============= Message Types =============

export type MessageType = 'user' | 'assistant' | 'system' | 'analysis' | 'suggestion';

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

// ============= Document Generation Types =============

export interface DocumentGenerationRequest {
  ideaId: string;
  agentId: string;
  templateIds: string[];
  customization?: {
    targetMarket?: string;
    priceRange?: {
      min: number;
      max: number;
    };
    complexity?: 'basic' | 'intermediate' | 'advanced';
  };
}

// ============= Payment Types =============

export interface PaymentConfig {
  appid: string;
  mchid: string;
  privateKey: string;
  certSerialNo: string;
  apiKey: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  orderId: string;
  userId: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  paymentUrl?: string;
  error?: string;
}

// ============= API Response Types =============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============= Form Types =============

export interface FormErrors {
  [key: string]: string[];
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    errors: FormErrors;
  };
}

// ============= Upload Types =============

export interface FileUploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  error?: string;
}

// ============= Statistics Types =============

export interface DashboardStats {
  totalUsers: number;
  totalAgents: number;
  totalRevenue: number;
  activeUsers: number;
  recentGrowth: {
    users: number;
    agents: number;
    revenue: number;
  };
}

// ============= Cart Types =============

export interface CartItem {
  id: string;
  agentId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

// ============= Review Types =============

export interface Review {
  id: string;
  agentId: string;
  userId: string;
  user: User;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
}

// ============= Notification Types =============

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// ============= Search Types =============

export interface SearchFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  tags?: string[];
  sortBy?: 'popular' | 'newest' | 'price' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  facets: {
    categories: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
    tags: { name: string; count: number }[];
  };
}

// ============= Error Types =============

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// ============= Global Extensions =============

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      JWT_SECRET: string;
      OPENAI_API_KEY: string;
      ALIYUN_ACCESS_KEY_ID: string;
      ALIYUN_ACCESS_KEY_SECRET: string;
      WECHAT_APP_ID: string;
      WECHAT_MCH_ID: string;
      ALIPAY_APP_ID: string;
    }
  }

  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
    dataLayer?: any[];
  }
}

// ============= Component Props =============

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface WithLoadingProps {
  isLoading?: boolean;
  loadingText?: string;
}

export interface WithErrorProps {
  error?: string | null;
  onRetry?: () => void;
}

// ============= Hook Return Types =============

export interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => Promise<void>;
  resetForm: () => void;
}

// Export all types
export * from './types';