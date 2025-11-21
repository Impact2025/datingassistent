/**
 * SMS Service - Twilio Integration for Client Communications
 */

import twilio from 'twilio';
import { sql } from '@vercel/postgres';

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export interface SMSMessage {
  to: string;
  from?: string;
  body: string;
  statusCallback?: string;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
}

/**
 * Send SMS via Twilio
 */
export async function sendSMS(message: SMSMessage): Promise<SMSResponse> {
  try {
    // Check if Twilio is configured
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn('Twilio not configured. SMS not sent.');
      console.log('📱 SMS NOT SENT (Twilio not configured) - SMS content:');
      console.log('To:', message.to);
      console.log('Body:', message.body);
      console.log('---');
      return { success: true }; // Return success for testing purposes
    }

    // Send SMS
    const twilioMessage = await twilioClient.messages.create({
      body: message.body,
      from: message.from || process.env.TWILIO_PHONE_NUMBER,
      to: message.to,
      statusCallback: message.statusCallback || `${process.env.NEXT_PUBLIC_APP_URL}/api/sms/webhook`
    });

    console.log(`✅ SMS sent successfully to ${message.to}, SID: ${twilioMessage.sid}`);

    return {
      success: true,
      messageId: twilioMessage.sid,
      cost: parseFloat(twilioMessage.price || '0')
    };
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send SMS to a user by their user ID
 */
export async function sendSMSToUser(
  userId: number,
  body: string,
  from?: string
): Promise<SMSResponse> {
  try {
    // Get user's phone number
    const userResult = await sql`
      SELECT phone FROM users WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const phoneNumber = userResult.rows[0].phone;
    if (!phoneNumber) {
      return { success: false, error: 'User has no phone number' };
    }

    return await sendSMS({
      to: phoneNumber,
      from,
      body
    });
  } catch (error) {
    console.error('Error sending SMS to user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if a phone number is valid for SMS
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation - should start with + and have at least 10 digits
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Format phone number for SMS (ensure it starts with +)
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // If it doesn't start with country code, assume Netherlands (+31)
  if (digitsOnly.length === 10 && digitsOnly.startsWith('6')) {
    return `+31${digitsOnly}`;
  }

  // If it doesn't start with +, add it
  if (!phoneNumber.startsWith('+')) {
    return `+${digitsOnly}`;
  }

  return phoneNumber;
}

/**
 * Get SMS delivery status from Twilio
 */
export async function getSMSDeliveryStatus(messageSid: string): Promise<string | null> {
  try {
    if (!twilioClient) {
      return null;
    }

    const message = await twilioClient.messages(messageSid).fetch();
    return message.status;
  } catch (error) {
    console.error('Error getting SMS status:', error);
    return null;
  }
}

/**
 * Handle incoming SMS (webhook)
 */
export async function handleIncomingSMS(from: string, body: string): Promise<void> {
  try {
    console.log(`📱 Incoming SMS from ${from}: ${body}`);

    // Find user by phone number
    const userResult = await sql`
      SELECT id, name FROM users WHERE phone = ${from}
    `;

    if (userResult.rows.length === 0) {
      console.log('User not found for incoming SMS');
      return;
    }

    const user = userResult.rows[0];

    // Store the incoming message (you might want to create a separate table for this)
    // For now, we'll log it and potentially trigger automated responses

    // Check if this is a response to a coach message
    // This could trigger notifications to coaches, etc.

    console.log(`Incoming SMS from user ${user.name} (${user.id}): ${body}`);

    // TODO: Implement auto-responses, coach notifications, etc.

  } catch (error) {
    console.error('Error handling incoming SMS:', error);
  }
}

/**
 * Send bulk SMS messages
 */
export async function sendBulkSMS(
  messages: Array<{ to: string; body: string; userId?: number }>
): Promise<SMSResponse[]> {
  const results: SMSResponse[] = [];

  for (const message of messages) {
    try {
      const result = await sendSMS({
        to: message.to,
        body: message.body
      });

      results.push(result);

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

/**
 * Get SMS usage statistics
 */
export async function getSMSUsageStats(userId?: number): Promise<{
  totalSent: number;
  totalCost: number;
  averageCost: number;
  deliveryRate: number;
}> {
  try {
    let query = sql`
      SELECT
        COUNT(*) as total_sent,
        COALESCE(SUM((metadata->>'cost')::decimal), 0) as total_cost,
        AVG((metadata->>'cost')::decimal) as avg_cost,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END)::decimal /
        NULLIF(COUNT(CASE WHEN status IN ('sent', 'delivered', 'failed') THEN 1 END), 0) * 100 as delivery_rate
      FROM coach_client_messages
      WHERE type = 'sms'
    `;

    if (userId) {
      query = sql`
        SELECT
          COUNT(*) as total_sent,
          COALESCE(SUM((metadata->>'cost')::decimal), 0) as total_cost,
          AVG((metadata->>'cost')::decimal) as avg_cost,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END)::decimal /
          NULLIF(COUNT(CASE WHEN status IN ('sent', 'delivered', 'failed') THEN 1 END), 0) * 100 as delivery_rate
        FROM coach_client_messages
        WHERE type = 'sms' AND client_id = ${userId}
      `;
    }

    const result = await query;

    return {
      totalSent: parseInt(result.rows[0].total_sent),
      totalCost: parseFloat(result.rows[0].total_cost),
      averageCost: parseFloat(result.rows[0].avg_cost) || 0,
      deliveryRate: parseFloat(result.rows[0].delivery_rate) || 0
    };
  } catch (error) {
    console.error('Error getting SMS usage stats:', error);
    return {
      totalSent: 0,
      totalCost: 0,
      averageCost: 0,
      deliveryRate: 0
    };
  }
}