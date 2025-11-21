import { sql } from '@vercel/postgres';
import { sendEmail } from './email-service';
import { sendSMSToUser } from './sms-service';
import { createCoachMessageNotification } from './in-app-notification-service';

export interface CommunicationMessage {
  id: number;
  coachId: number;
  clientId: number;
  type: 'email' | 'sms' | 'in_app' | 'scheduled';
  subject?: string;
  content: string;
  status: 'draft' | 'sent' | 'scheduled' | 'failed' | 'delivered' | 'read';
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface CommunicationTemplate {
  id: number;
  coachId: number;
  name: string;
  category: 'motivation' | 'feedback' | 'reminder' | 'celebration' | 'follow_up';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientCommunicationHistory {
  clientId: number;
  clientName: string;
  lastContact: Date;
  totalMessages: number;
  responseRate: number;
  preferredChannel: 'email' | 'sms' | 'in_app';
  upcomingScheduled: CommunicationMessage[];
  recentMessages: CommunicationMessage[];
  communicationPreferences: ClientCommunicationPreferences;
}

export interface ClientCommunicationPreferences {
  clientId: number;
  preferredChannel: 'email' | 'sms' | 'in_app';
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  frequencyLimit: number;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
  unsubscribed: boolean;
}

export interface CommunicationAnalytics {
  totalMessages: number;
  messagesByChannel: Record<string, number>;
  deliveryRate: number;
  openRate: number;
  responseRate: number;
  averageResponseTime: number;
  costBreakdown: Record<string, number>;
}

export class ClientCommunicationService {
  /**
   * Get all available communication templates for a coach
   */
  static async getTemplates(coachId: number): Promise<CommunicationTemplate[]> {
    try {
      const result = await sql`
        SELECT * FROM communication_templates
        WHERE coach_id = ${coachId} AND is_active = true
        ORDER BY usage_count DESC, created_at DESC
      `;

      return result.rows.map(row => ({
        id: row.id,
        coachId: row.coach_id,
        name: row.name,
        category: row.category,
        subject: row.subject,
        content: row.content,
        variables: row.variables || [],
        isActive: row.is_active,
        usageCount: row.usage_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  /**
   * Get templates by category
   */
  static async getTemplatesByCategory(
    coachId: number,
    category: CommunicationTemplate['category']
  ): Promise<CommunicationTemplate[]> {
    try {
      const result = await sql`
        SELECT * FROM communication_templates
        WHERE coach_id = ${coachId} AND category = ${category} AND is_active = true
        ORDER BY usage_count DESC
      `;

      return result.rows.map(row => ({
        id: row.id,
        coachId: row.coach_id,
        name: row.name,
        category: row.category,
        subject: row.subject,
        content: row.content,
        variables: row.variables || [],
        isActive: row.is_active,
        usageCount: row.usage_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('Error getting templates by category:', error);
      return [];
    }
  }

  /**
   * Create a new communication template
   */
  static async createTemplate(
    coachId: number,
    templateData: Omit<CommunicationTemplate, 'id' | 'coachId' | 'isActive' | 'usageCount' | 'createdAt' | 'updatedAt'>
  ): Promise<CommunicationTemplate | null> {
    try {
      const result = await sql`
        INSERT INTO communication_templates (
          coach_id, name, category, subject, content, variables, is_active
        )
        VALUES (
          ${coachId}, ${templateData.name}, ${templateData.category},
          ${templateData.subject}, ${templateData.content}, ${JSON.stringify(templateData.variables)}, true
        )
        RETURNING *
      `;

      const row = result.rows[0];
      return {
        id: row.id,
        coachId: row.coach_id,
        name: row.name,
        category: row.category,
        subject: row.subject,
        content: row.content,
        variables: row.variables || [],
        isActive: row.is_active,
        usageCount: row.usage_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error('Error creating template:', error);
      return null;
    }
  }

  /**
   * Update a communication template
   */
  static async updateTemplate(
    templateId: number,
    coachId: number,
    updates: Partial<Pick<CommunicationTemplate, 'name' | 'category' | 'subject' | 'content' | 'variables' | 'isActive'>>
  ): Promise<boolean> {
    try {
      // For simplicity, update each field individually
      // In a production system, you might want a more sophisticated approach
      const updatePromises: Promise<any>[] = [];

      if (updates.name !== undefined) {
        updatePromises.push(sql`
          UPDATE communication_templates SET name = ${updates.name}, updated_at = NOW()
          WHERE id = ${templateId} AND coach_id = ${coachId}
        `);
      }
      if (updates.category !== undefined) {
        updatePromises.push(sql`
          UPDATE communication_templates SET category = ${updates.category}, updated_at = NOW()
          WHERE id = ${templateId} AND coach_id = ${coachId}
        `);
      }
      if (updates.subject !== undefined) {
        updatePromises.push(sql`
          UPDATE communication_templates SET subject = ${updates.subject}, updated_at = NOW()
          WHERE id = ${templateId} AND coach_id = ${coachId}
        `);
      }
      if (updates.content !== undefined) {
        updatePromises.push(sql`
          UPDATE communication_templates SET content = ${updates.content}, updated_at = NOW()
          WHERE id = ${templateId} AND coach_id = ${coachId}
        `);
      }
      if (updates.variables !== undefined) {
        updatePromises.push(sql`
          UPDATE communication_templates SET variables = ${JSON.stringify(updates.variables)}, updated_at = NOW()
          WHERE id = ${templateId} AND coach_id = ${coachId}
        `);
      }
      if (updates.isActive !== undefined) {
        updatePromises.push(sql`
          UPDATE communication_templates SET is_active = ${updates.isActive}, updated_at = NOW()
          WHERE id = ${templateId} AND coach_id = ${coachId}
        `);
      }

      if (updatePromises.length === 0) return true;

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error('Error updating template:', error);
      return false;
    }
  }

  /**
   * Delete a communication template
   */
  static async deleteTemplate(templateId: number, coachId: number): Promise<boolean> {
    try {
      const result = await sql`
        DELETE FROM communication_templates
        WHERE id = ${templateId} AND coach_id = ${coachId}
      `;

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  }

  /**
   * Create a personalized message from a template
   */
  static createMessageFromTemplate(
    template: CommunicationTemplate,
    variables: Record<string, string>,
    coachId: number,
    clientId: number,
    scheduledFor?: Date
  ): Omit<CommunicationMessage, 'id' | 'createdAt' | 'updatedAt'> {
    let subject = template.subject || '';
    let content = template.content;

    // Replace variables in subject and content
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      content = content.replace(new RegExp(placeholder, 'g'), value);
    }

    return {
      coachId,
      clientId,
      type: scheduledFor ? 'scheduled' : 'email',
      subject,
      content,
      status: scheduledFor ? 'scheduled' : 'draft',
      scheduledFor
    };
  }

  /**
   * Get client communication preferences
   */
  static async getClientCommunicationPreferences(clientId: number): Promise<ClientCommunicationPreferences | null> {
    try {
      const result = await sql`
        SELECT * FROM client_communication_preferences WHERE client_id = ${clientId}
      `;

      if (result.rows.length === 0) {
        // Return default preferences
        return {
          clientId,
          preferredChannel: 'email',
          emailEnabled: true,
          smsEnabled: false,
          inAppEnabled: true,
          frequencyLimit: 5,
          timezone: 'Europe/Amsterdam',
          unsubscribed: false
        };
      }

      const row = result.rows[0];
      return {
        clientId: row.client_id,
        preferredChannel: row.preferred_channel,
        emailEnabled: row.email_enabled,
        smsEnabled: row.sms_enabled,
        inAppEnabled: row.in_app_enabled,
        frequencyLimit: row.frequency_limit,
        quietHoursStart: row.quiet_hours_start,
        quietHoursEnd: row.quiet_hours_end,
        timezone: row.timezone,
        unsubscribed: row.unsubscribed
      };
    } catch (error) {
      console.error('Error getting client communication preferences:', error);
      return null;
    }
  }

  /**
   * Update client communication preferences
   */
  static async updateClientCommunicationPreferences(
    clientId: number,
    preferences: Partial<Omit<ClientCommunicationPreferences, 'clientId'>>
  ): Promise<boolean> {
    try {
      const result = await sql`
        INSERT INTO client_communication_preferences (
          client_id, preferred_channel, email_enabled, sms_enabled, in_app_enabled,
          frequency_limit, quiet_hours_start, quiet_hours_end, timezone, unsubscribed
        )
        VALUES (
          ${clientId},
          ${preferences.preferredChannel || 'email'},
          ${preferences.emailEnabled ?? true},
          ${preferences.smsEnabled ?? false},
          ${preferences.inAppEnabled ?? true},
          ${preferences.frequencyLimit || 5},
          ${preferences.quietHoursStart},
          ${preferences.quietHoursEnd},
          ${preferences.timezone || 'Europe/Amsterdam'},
          ${preferences.unsubscribed ?? false}
        )
        ON CONFLICT (client_id)
        DO UPDATE SET
          preferred_channel = EXCLUDED.preferred_channel,
          email_enabled = EXCLUDED.email_enabled,
          sms_enabled = EXCLUDED.sms_enabled,
          in_app_enabled = EXCLUDED.in_app_enabled,
          frequency_limit = EXCLUDED.frequency_limit,
          quiet_hours_start = EXCLUDED.quiet_hours_start,
          quiet_hours_end = EXCLUDED.quiet_hours_end,
          timezone = EXCLUDED.timezone,
          unsubscribed = EXCLUDED.unsubscribed,
          updated_at = NOW()
      `;

      return true;
    } catch (error) {
      console.error('Error updating client communication preferences:', error);
      return false;
    }
  }

  /**
   * Save a communication message
   */
  static async saveMessage(message: Omit<CommunicationMessage, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommunicationMessage | null> {
    try {
      const result = await sql`
        INSERT INTO coach_client_messages (
          coach_id, client_id, type, subject, content, status, scheduled_for, metadata
        )
        VALUES (
          ${message.coachId}, ${message.clientId}, ${message.type},
          ${message.subject}, ${message.content}, ${message.status},
          ${message.scheduledFor ? message.scheduledFor.toISOString() : null}, ${message.metadata ? JSON.stringify(message.metadata) : null}
        )
        RETURNING *
      `;

      const row = result.rows[0];
      return {
        id: row.id,
        coachId: row.coach_id,
        clientId: row.client_id,
        type: row.type,
        subject: row.subject,
        content: row.content,
        status: row.status,
        scheduledFor: row.scheduled_for,
        sentAt: row.sent_at,
        deliveredAt: row.delivered_at,
        readAt: row.read_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        metadata: row.metadata
      };
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  }

  /**
   * Send a message immediately
   */
  static async sendMessage(messageId: number): Promise<boolean> {
    try {
      // Get the message
      const messageResult = await sql`
        SELECT * FROM coach_client_messages WHERE id = ${messageId}
      `;

      if (messageResult.rows.length === 0) {
        throw new Error('Message not found');
      }

      const message = messageResult.rows[0];

      // Get client info and preferences
      const clientResult = await sql`
        SELECT u.email, u.phone, u.name
        FROM users u
        WHERE u.id = ${message.client_id}
      `;

      if (clientResult.rows.length === 0) {
        throw new Error('Client not found');
      }

      const client = clientResult.rows[0];
      const preferences = await this.getClientCommunicationPreferences(message.client_id);

      if (!preferences || preferences.unsubscribed) {
        console.log('Client has unsubscribed from communications');
        return false;
      }

      let success = false;

      // Send based on message type
      if (message.type === 'email' && preferences.emailEnabled) {
        success = await sendEmail({
          to: client.email,
          subject: message.subject || 'Bericht van je Dating Coach',
          html: message.content,
          text: message.content.replace(/<[^>]*>/g, '') // Strip HTML for text version
        });
      } else if (message.type === 'sms' && preferences.smsEnabled && client.phone) {
        const smsResult = await sendSMSToUser(message.client_id, message.content);
        success = smsResult.success;

        // Store SMS cost in metadata
        if (smsResult.cost) {
          await sql`
            UPDATE coach_client_messages
            SET metadata = metadata || ${JSON.stringify({ cost: smsResult.cost })}
            WHERE id = ${messageId}
          `;
        }
      } else if (message.type === 'in_app' && preferences.inAppEnabled) {
        // Create in-app notification
        await createCoachMessageNotification(
          message.client_id,
          'Je Dating Coach',
          message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '')
        );
        success = true;
      }

      // Update message status
      const newStatus = success ? 'sent' : 'failed';
      await sql`
        UPDATE coach_client_messages
        SET status = ${newStatus}, sent_at = NOW(), updated_at = NOW()
        WHERE id = ${messageId}
      `;

      // Track analytics
      await this.trackMessageEvent(messageId, 'sent');

      // Increment template usage if it was from a template
      if (message.metadata?.templateId) {
        await sql`
          UPDATE communication_templates
          SET usage_count = usage_count + 1, updated_at = NOW()
          WHERE id = ${message.metadata.templateId}
        `;
      }

      return success;
    } catch (error) {
      console.error('Error sending message:', error);

      // Mark as failed
      await sql`
        UPDATE coach_client_messages
        SET status = 'failed', updated_at = NOW()
        WHERE id = ${messageId}
      `;

      return false;
    }
  }

  /**
   * Schedule a message for later
   */
  static async scheduleMessage(messageId: number, scheduledFor: Date): Promise<boolean> {
    try {
      const result = await sql`
        UPDATE coach_client_messages
        SET status = 'scheduled', scheduled_for = ${scheduledFor.toISOString()}, updated_at = NOW()
        WHERE id = ${messageId}
      `;

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error scheduling message:', error);
      return false;
    }
  }

  /**
   * Track message analytics event
   */
  static async trackMessageEvent(
    messageId: number,
    eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied',
    eventData?: Record<string, any>
  ): Promise<void> {
    try {
      await sql`
        INSERT INTO message_analytics (message_id, event_type, event_data)
        VALUES (${messageId}, ${eventType}, ${eventData ? JSON.stringify(eventData) : null})
      `;
    } catch (error) {
      console.error('Error tracking message event:', error);
    }
  }

  /**
   * Get communication history for a client
   */
  static async getClientCommunicationHistory(
    coachId: number,
    clientId: number
  ): Promise<ClientCommunicationHistory | null> {
    try {
      // Get client info
      const clientResult = await sql`
        SELECT name FROM users WHERE id = ${clientId} LIMIT 1
      `;

      if (clientResult.rows.length === 0) {
        throw new Error('Client not found');
      }

      // Get communication history
      const messagesResult = await sql`
        SELECT * FROM coach_client_messages
        WHERE coach_id = ${coachId} AND client_id = ${clientId}
        ORDER BY created_at DESC
        LIMIT 20
      `;

      const messages = messagesResult.rows.map(row => ({
        id: row.id,
        coachId: row.coach_id,
        clientId: row.client_id,
        type: row.type,
        subject: row.subject,
        content: row.content,
        status: row.status,
        scheduledFor: row.scheduled_for,
        sentAt: row.sent_at,
        deliveredAt: row.delivered_at,
        readAt: row.read_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        metadata: row.metadata
      }));

      // Calculate metrics
      const sentMessages = messages.filter(m => m.status === 'sent');
      const totalMessages = messages.length;
      const lastContact = sentMessages.length > 0 ? sentMessages[0].sentAt || sentMessages[0].createdAt : new Date();

      // Mock response rate (would need actual response tracking)
      const responseRate = Math.random() * 0.4 + 0.3; // 30-70%

      // Get preferences
      const preferences = await this.getClientCommunicationPreferences(clientId);

      // Get upcoming scheduled messages
      const upcomingScheduled = messages.filter(m =>
        m.status === 'scheduled' && m.scheduledFor && m.scheduledFor > new Date()
      );

      // Get recent messages (last 5)
      const recentMessages = messages.slice(0, 5);

      return {
        clientId,
        clientName: clientResult.rows[0].name,
        lastContact,
        totalMessages,
        responseRate,
        preferredChannel: preferences?.preferredChannel || 'email',
        upcomingScheduled,
        recentMessages,
        communicationPreferences: preferences || {
          clientId,
          preferredChannel: 'email',
          emailEnabled: true,
          smsEnabled: false,
          inAppEnabled: true,
          frequencyLimit: 5,
          timezone: 'Europe/Amsterdam',
          unsubscribed: false
        }
      };
    } catch (error) {
      console.error('Error getting communication history:', error);
      return null;
    }
  }

  /**
   * Get scheduled messages for a coach
   */
  static async getScheduledMessages(coachId: number): Promise<CommunicationMessage[]> {
    try {
      const result = await sql`
        SELECT * FROM coach_client_messages
        WHERE coach_id = ${coachId} AND status = 'scheduled'
        AND scheduled_for > NOW()
        ORDER BY scheduled_for ASC
      `;

      return result.rows.map(row => ({
        id: row.id,
        coachId: row.coach_id,
        clientId: row.client_id,
        type: row.type,
        subject: row.subject,
        content: row.content,
        status: row.status,
        scheduledFor: row.scheduled_for,
        sentAt: row.sent_at,
        deliveredAt: row.delivered_at,
        readAt: row.read_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        metadata: row.metadata
      }));
    } catch (error) {
      console.error('Error getting scheduled messages:', error);
      return [];
    }
  }

  /**
   * Get communication analytics for a coach
   */
  static async getCommunicationAnalytics(coachId: number, days: number = 30): Promise<CommunicationAnalytics> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get message stats
      const messagesResult = await sql`
        SELECT
          COUNT(*) as total_messages,
          type,
          status,
          (metadata->>'cost')::decimal as cost
        FROM coach_client_messages
        WHERE coach_id = ${coachId} AND created_at >= ${startDate.toISOString()}
        GROUP BY type, status, metadata->>'cost'
      `;

      // Get analytics events
      const analyticsResult = await sql`
        SELECT event_type, COUNT(*) as count
        FROM message_analytics ma
        JOIN coach_client_messages ccm ON ma.message_id = ccm.id
        WHERE ccm.coach_id = ${coachId} AND ma.occurred_at >= ${startDate.toISOString()}
        GROUP BY event_type
      `;

      // Calculate metrics
      const messagesByChannel: Record<string, number> = {};
      let totalCost = 0;
      let deliveredCount = 0;
      let sentCount = 0;

      messagesResult.rows.forEach(row => {
        messagesByChannel[row.type] = (messagesByChannel[row.type] || 0) + parseInt(row.total_messages);
        if (row.cost) totalCost += parseFloat(row.cost);
        if (row.status === 'delivered') deliveredCount += parseInt(row.total_messages);
        if (['sent', 'delivered'].includes(row.status)) sentCount += parseInt(row.total_messages);
      });

      const deliveryRate = sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0;

      // Mock rates (would need real tracking)
      const openRate = Math.random() * 0.3 + 0.4; // 40-70%
      const responseRate = Math.random() * 0.2 + 0.1; // 10-30%
      const averageResponseTime = Math.random() * 24 + 12; // 12-36 hours

      return {
        totalMessages: messagesResult.rows.reduce((sum, row) => sum + parseInt(row.total_messages), 0),
        messagesByChannel,
        deliveryRate,
        openRate,
        responseRate,
        averageResponseTime,
        costBreakdown: { sms: totalCost, email: 0, in_app: 0 }
      };
    } catch (error) {
      console.error('Error getting communication analytics:', error);
      return {
        totalMessages: 0,
        messagesByChannel: {},
        deliveryRate: 0,
        openRate: 0,
        responseRate: 0,
        averageResponseTime: 0,
        costBreakdown: { sms: 0, email: 0, in_app: 0 }
      };
    }
  }

  /**
   * Create a bulk communication campaign
   */
  static async createBulkCampaign(
    coachId: number,
    clientIds: number[],
    templateId: number,
    variables: Record<string, string>,
    scheduledFor?: Date
  ): Promise<CommunicationMessage[]> {
    try {
      // Get template
      const templateResult = await sql`
        SELECT * FROM communication_templates WHERE id = ${templateId} AND coach_id = ${coachId}
      `;

      if (templateResult.rows.length === 0) {
        throw new Error('Template not found');
      }

      const template = templateResult.rows[0];
      const messages: CommunicationMessage[] = [];

      for (const clientId of clientIds) {
        try {
          const messageData = this.createMessageFromTemplate(
            {
              id: template.id,
              coachId: template.coach_id,
              name: template.name,
              category: template.category,
              subject: template.subject,
              content: template.content,
              variables: template.variables,
              isActive: template.is_active,
              usageCount: template.usage_count,
              createdAt: template.created_at,
              updatedAt: template.updated_at
            },
            variables,
            coachId,
            clientId,
            scheduledFor
          );

          const savedMessage = await this.saveMessage(messageData);
          if (savedMessage) {
            messages.push(savedMessage);
          }
        } catch (error) {
          console.error(`Error creating message for client ${clientId}:`, error);
        }
      }

      return messages;
    } catch (error) {
      console.error('Error creating bulk campaign:', error);
      return [];
    }
  }

  /**
   * Process scheduled messages (should be called by cron job)
   */
  static async processScheduledMessages(): Promise<number> {
    try {
      // Get messages that are due
      const result = await sql`
        SELECT * FROM coach_client_messages
        WHERE status = 'scheduled' AND scheduled_for <= NOW()
        ORDER BY scheduled_for ASC
        LIMIT 50
      `;

      let processed = 0;

      for (const message of result.rows) {
        try {
          const success = await this.sendMessage(message.id);
          if (success) processed++;
        } catch (error) {
          console.error(`Error processing scheduled message ${message.id}:`, error);
        }
      }

      console.log(`Processed ${processed} scheduled messages`);
      return processed;
    } catch (error) {
      console.error('Error processing scheduled messages:', error);
      return 0;
    }
  }

  /**
   * Get communication overview for all clients
   */
  static async getCommunicationOverview(coachId: number): Promise<{
    totalClients: number;
    activeConversations: number;
    scheduledMessages: number;
    averageResponseRate: number;
    clientsNeedingAttention: number;
  }> {
    try {
      // Get all clients for this coach
      const clientsResult = await sql`
        SELECT u.id, u.name
        FROM coach_client_assignments cca
        JOIN users u ON cca.client_user_id = u.id
        WHERE cca.coach_user_id = ${coachId}
        AND cca.status = 'active'
      `;

      const totalClients = clientsResult.rows.length;

      // Get scheduled messages count
      const scheduledResult = await sql`
        SELECT COUNT(*) as count FROM coach_client_messages
        WHERE coach_id = ${coachId} AND status = 'scheduled'
      `;

      const scheduledMessages = parseInt(scheduledResult.rows[0].count);

      // Mock some metrics (would be calculated from real data)
      const activeConversations = Math.floor(totalClients * 0.7);
      const averageResponseRate = 0.45;
      const clientsNeedingAttention = Math.floor(totalClients * 0.2);

      return {
        totalClients,
        activeConversations,
        scheduledMessages,
        averageResponseRate,
        clientsNeedingAttention
      };
    } catch (error) {
      console.error('Error getting communication overview:', error);
      return {
        totalClients: 0,
        activeConversations: 0,
        scheduledMessages: 0,
        averageResponseRate: 0,
        clientsNeedingAttention: 0
      };
    }
  }
}