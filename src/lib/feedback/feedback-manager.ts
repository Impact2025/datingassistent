/**
 * Comprehensive User Feedback and Support System
 * Handles feedback collection, support tickets, and user satisfaction tracking
 */

import { sql } from '@vercel/postgres';

export interface FeedbackData {
  userId: number;
  type: 'bug' | 'feature' | 'improvement' | 'general' | 'satisfaction';
  rating?: number; // 1-5 scale
  title: string;
  description: string;
  category?: string;
  page?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface SupportTicket {
  id?: number;
  userId: number;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  tags?: string[];
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SurveyResponse {
  userId: number;
  surveyId: string;
  responses: Record<string, any>;
  completedAt: string;
  metadata?: Record<string, any>;
}

class FeedbackManager {
  private static readonly FEEDBACK_CATEGORIES = {
    bug: 'Bug Report',
    feature: 'Feature Request',
    improvement: 'Improvement Suggestion',
    general: 'General Feedback',
    satisfaction: 'User Satisfaction',
  };

  private static readonly SUPPORT_PRIORITIES = {
    low: { label: 'Low', color: 'green', sla: 7 }, // 7 days
    medium: { label: 'Medium', color: 'yellow', sla: 3 }, // 3 days
    high: { label: 'High', color: 'orange', sla: 1 }, // 1 day
    urgent: { label: 'Urgent', color: 'red', sla: 0.5 }, // 12 hours
  };

  /**
   * Submit user feedback
   */
  static async submitFeedback(feedback: FeedbackData): Promise<{ success: boolean; feedbackId?: number }> {
    try {
      const result = await sql`
        INSERT INTO user_feedback (
          user_id, type, rating, title, description, category,
          page_url, user_agent, metadata, created_at
        ) VALUES (
          ${feedback.userId},
          ${feedback.type},
          ${feedback.rating || null},
          ${feedback.title},
          ${feedback.description},
          ${feedback.category || null},
          ${feedback.page || null},
          ${feedback.userAgent || null},
          ${JSON.stringify(feedback.metadata || {})},
          NOW()
        )
        RETURNING id
      `;

      const feedbackId = (result as any)[0]?.id;

      // Trigger notifications for high-priority feedback
      if (feedback.type === 'bug' || (feedback.rating && feedback.rating <= 2)) {
        await this.notifyAdminOfUrgentFeedback(feedback, feedbackId);
      }

      return { success: true, feedbackId };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return { success: false };
    }
  }

  /**
   * Create a support ticket
   */
  static async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; ticketId?: number }> {
    try {
      const result = await sql`
        INSERT INTO support_tickets (
          user_id, subject, description, priority, status, category,
          tags, attachments, created_at, updated_at
        ) VALUES (
          ${ticket.userId},
          ${ticket.subject},
          ${ticket.description},
          ${ticket.priority},
          ${ticket.status},
          ${ticket.category},
          ${JSON.stringify(ticket.tags || [])},
          ${JSON.stringify(ticket.attachments || [])},
          NOW(),
          NOW()
        )
        RETURNING id
      `;

      const ticketId = (result as any)[0]?.id;

      // Notify admin of new ticket
      await this.notifyAdminOfNewTicket(ticket, ticketId);

      return { success: true, ticketId };
    } catch (error) {
      console.error('Error creating support ticket:', error);
      return { success: false };
    }
  }

  /**
   * Submit survey response
   */
  static async submitSurveyResponse(response: SurveyResponse): Promise<{ success: boolean }> {
    try {
      await sql`
        INSERT INTO survey_responses (
          user_id, survey_id, responses, completed_at, metadata
        ) VALUES (
          ${response.userId},
          ${response.surveyId},
          ${JSON.stringify(response.responses)},
          ${response.completedAt},
          ${JSON.stringify(response.metadata || {})}
        )
      `;

      return { success: true };
    } catch (error) {
      console.error('Error submitting survey response:', error);
      return { success: false };
    }
  }

  /**
   * Get user's feedback history
   */
  static async getUserFeedback(userId: number, limit = 10): Promise<any[]> {
    try {
      const result = await sql`
        SELECT id, type, rating, title, description, category, status, created_at, admin_response
        FROM user_feedback
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      return (result as any).rows || [];
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      return [];
    }
  }

  /**
   * Get user's support tickets
   */
  static async getUserSupportTickets(userId: number): Promise<SupportTicket[]> {
    try {
      const result = await sql`
        SELECT * FROM support_tickets
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;

      return (result as any).rows || [];
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      return [];
    }
  }

  /**
   * Get feedback analytics
   */
  static async getFeedbackAnalytics(timeframe = '30 days'): Promise<any> {
    try {
      const result = await sql`
        SELECT
          COUNT(*) as total_feedback,
          AVG(rating) as average_rating,
          COUNT(CASE WHEN type = 'bug' THEN 1 END) as bug_reports,
          COUNT(CASE WHEN type = 'feature' THEN 1 END) as feature_requests,
          COUNT(CASE WHEN rating <= 2 THEN 1 END) as low_ratings,
          COUNT(CASE WHEN rating >= 4 THEN 1 END) as high_ratings
        FROM user_feedback
        WHERE created_at >= NOW() - INTERVAL '${timeframe}'
      `;

      return (result as any)[0] || {};
    } catch (error) {
      console.error('Error fetching feedback analytics:', error);
      return {};
    }
  }

  /**
   * Update support ticket status (simplified implementation)
   */
  static async updateSupportTicket(ticketId: number, updates: Partial<SupportTicket>): Promise<boolean> {
    try {
      // For now, just update status - can be extended later
      if (updates.status) {
        await sql`
          UPDATE support_tickets
          SET status = ${updates.status}, updated_at = NOW()
          WHERE id = ${ticketId}
        `;
      }

      return true;
    } catch (error) {
      console.error('Error updating support ticket:', error);
      return false;
    }
  }

  /**
   * Get predefined feedback categories
   */
  static getFeedbackCategories() {
    return this.FEEDBACK_CATEGORIES;
  }

  /**
   * Get support priorities with metadata
   */
  static getSupportPriorities() {
    return this.SUPPORT_PRIORITIES;
  }

  /**
   * Generate satisfaction survey questions
   */
  static generateSatisfactionSurvey(toolName: string) {
    return {
      id: `satisfaction-${toolName.toLowerCase().replace(/\s+/g, '-')}`,
      title: `Hoe tevreden ben je met ${toolName}?`,
      questions: [
        {
          id: 'overall_rating',
          type: 'rating',
          question: `Hoe zou je je algehele ervaring met ${toolName} beoordelen?`,
          scale: 5,
          labels: { 1: 'Zeer ontevreden', 5: 'Zeer tevreden' }
        },
        {
          id: 'usefulness',
          type: 'rating',
          question: `Hoe nuttig vond je ${toolName} voor je dating doelen?`,
          scale: 5,
          labels: { 1: 'Helemaal niet nuttig', 5: 'Zeer nuttig' }
        },
        {
          id: 'ease_of_use',
          type: 'rating',
          question: 'Hoe gemakkelijk was het om de tool te gebruiken?',
          scale: 5,
          labels: { 1: 'Zeer moeilijk', 5: 'Zeer gemakkelijk' }
        },
        {
          id: 'recommendation',
          type: 'rating',
          question: `Hoe waarschijnlijk is het dat je ${toolName} zou aanbevelen aan een vriend?`,
          scale: 5,
          labels: { 1: 'Zeer onwaarschijnlijk', 5: 'Zeer waarschijnlijk' }
        },
        {
          id: 'improvements',
          type: 'textarea',
          question: 'Welke verbeteringen zou je willen zien?',
          placeholder: 'Deel je suggesties voor verbetering...'
        }
      ]
    };
  }

  /**
   * Calculate Net Promoter Score (NPS)
   */
  static calculateNPS(responses: number[]): number {
    const promoters = responses.filter(r => r >= 9).length;
    const detractors = responses.filter(r => r <= 6).length;
    const total = responses.length;

    if (total === 0) return 0;

    return Math.round(((promoters - detractors) / total) * 100);
  }

  /**
   * Send notification to admin about urgent feedback
   */
  private static async notifyAdminOfUrgentFeedback(feedback: FeedbackData, feedbackId?: number): Promise<void> {
    // In a real implementation, this would send an email or notification
    console.log('🚨 URGENT FEEDBACK RECEIVED:', {
      id: feedbackId,
      type: feedback.type,
      rating: feedback.rating,
      title: feedback.title,
      userId: feedback.userId,
    });

    // TODO: Implement actual notification system (email, Slack, etc.)
  }

  /**
   * Send notification to admin about new support ticket
   */
  private static async notifyAdminOfNewTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>, ticketId?: number): Promise<void> {
    console.log('🎫 NEW SUPPORT TICKET CREATED:', {
      id: ticketId,
      priority: ticket.priority,
      subject: ticket.subject,
      userId: ticket.userId,
    });

    // TODO: Implement actual notification system
  }

  /**
   * Generate feedback summary report
   */
  static async generateFeedbackReport(timeframe = '30 days'): Promise<any> {
    try {
      const analytics = await this.getFeedbackAnalytics(timeframe);

      // Get top issues
      const topIssues = await sql`
        SELECT category, COUNT(*) as count
        FROM user_feedback
        WHERE created_at >= NOW() - INTERVAL '${timeframe}'
        AND category IS NOT NULL
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10
      `;

      // Get rating distribution
      const ratingDistribution = await sql`
        SELECT rating, COUNT(*) as count
        FROM user_feedback
        WHERE created_at >= NOW() - INTERVAL '${timeframe}'
        AND rating IS NOT NULL
        GROUP BY rating
        ORDER BY rating
      `;

      return {
        analytics,
        topIssues: (topIssues as any).rows || [],
        ratingDistribution: (ratingDistribution as any).rows || [],
        timeframe,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating feedback report:', error);
      return null;
    }
  }
}

export default FeedbackManager;