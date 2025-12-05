/**
 * Support System Types
 * Wereldklasse Helpdesk - DatingAssistent.nl
 */

// User segments for personalized support
export type UserSegment =
  | 'new_user'        // < 7 dagen
  | 'active_dater'    // Actief, regelmatig gebruik
  | 'struggling'      // < 10% tool usage
  | 'premium'         // Premium/Pro abonnement
  | 'churning'        // Inactief 14+ dagen
  | 'anonymous';      // Niet ingelogd

// Support ticket categories
export type TicketCategory =
  | 'billing'
  | 'technical'
  | 'feature_question'
  | 'bug_report'
  | 'feature_request'
  | 'account'
  | 'general';

// Ticket priority levels
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

// Ticket status
export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_customer'
  | 'waiting_internal'
  | 'resolved'
  | 'closed';

// Support channel types
export type SupportChannel =
  | 'live_chat'
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'video_call';

// Knowledge base article
export interface KBArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  helpfulCount: number;
  viewCount: number;
  relatedArticles?: string[];
  videoUrl?: string;
  lastUpdated: string;
}

// Search result from AI
export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  relevanceScore: number;
  category: string;
  type: 'article' | 'faq' | 'tutorial';
  url: string;
}

// Quick action for user segment
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: 'link' | 'modal' | 'chat' | 'call';
  target: string;
  priority: number;
  segments: UserSegment[];
}

// Support channel configuration
export interface SupportChannelConfig {
  channel: SupportChannel;
  title: string;
  description: string;
  availability: string;
  responseTime: string;
  isAvailable: boolean;
  queueLength?: number;
  estimatedWait?: string;
  premiumOnly?: boolean;
}

// Chat message in support context
export interface SupportMessage {
  id: string;
  type: 'user' | 'iris' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    sentiment?: string;
    category?: TicketCategory;
    suggestedActions?: string[];
    escalationNeeded?: boolean;
  };
}

// Handover request to human agent
export interface HandoverRequest {
  conversationId: string;
  userId?: number;
  reason: string;
  priority: TicketPriority;
  summary: string;
  messages: SupportMessage[];
  userContext?: {
    name?: string;
    email?: string;
    plan?: string;
    accountAge?: number;
  };
}

// CSAT survey response
export interface CSATResponse {
  ticketId: string;
  score: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  wouldRecommend?: boolean;
  timestamp: Date;
}

// Support analytics metrics
export interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  avgResponseTime: number; // minutes
  avgResolutionTime: number; // hours
  csatScore: number; // 1-5
  aiResolutionRate: number; // percentage
  ticketsByCategory: Record<TicketCategory, number>;
  ticketsByChannel: Record<SupportChannel, number>;
}
