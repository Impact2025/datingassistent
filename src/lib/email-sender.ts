/**
 * Email Sender - Enhanced version with template rendering
 * Integrates with email-templates.tsx for React Email rendering
 */

import { sql } from '@vercel/postgres';
import { sendEmail as sendBasicEmail } from './email-service';
import { renderEmailTemplate } from './email-templates';
import type { EmailType, EmailCategory, EmailTemplateData } from './email-engagement';

/**
 * Send email with template rendering
 */
export async function sendTemplatedEmail(
  userId: number,
  emailType: EmailType,
  emailCategory: EmailCategory,
  templateData: EmailTemplateData,
  variant: string = 'A'
): Promise<boolean> {
  try {
    // Check if user can receive this email
    const canSend = await canUserReceiveEmail(userId, emailType, emailCategory);
    if (!canSend) {
      console.log(`📧 Email ${emailType} blocked by preferences for user ${userId}`);
      return false;
    }

    // Get user email
    const userResult = await sql`
      SELECT email FROM users WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      console.error(`❌ User ${userId} not found`);
      return false;
    }

    const userEmail = userResult.rows[0].email;

    // Render email template
    const emailContent = await renderEmailTemplate(emailType, templateData);

    // Send via SendGrid
    const sent = await sendBasicEmail({
      to: userEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (!sent) {
      await trackEmailSent(userId, emailType, emailCategory, emailContent.subject, variant, 'failed');
      return false;
    }

    // Track in database
    await trackEmailSent(userId, emailType, emailCategory, emailContent.subject, variant, 'sent');

    // Update user preferences
    await updateEmailPreferences(userId);

    console.log(`✅ Email ${emailType} sent to user ${userId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email ${emailType}:`, error);
    return false;
  }
}

/**
 * Check if user can receive email
 */
async function canUserReceiveEmail(
  userId: number,
  emailType: EmailType,
  emailCategory: EmailCategory
): Promise<boolean> {
  try {
    const result = await sql`
      SELECT
        ep.*,
        COALESCE(ep.emails_sent_this_week, 0) as emails_sent_this_week,
        COALESCE(ep.max_emails_per_week, 5) as max_emails_per_week
      FROM email_preferences ep
      WHERE ep.user_id = ${userId}
    `;

    if (result.rows.length === 0) {
      // No preferences set, allow by default
      return true;
    }

    const prefs = result.rows[0];

    // Check global unsubscribe
    if (prefs.unsubscribed_all) {
      return false;
    }

    // Check category opt-out
    const categoryMap: Record<EmailCategory, string> = {
      onboarding: 'onboarding_emails',
      engagement: 'engagement_emails',
      retention: 'engagement_emails',
      milestone: 'milestone_emails',
      churn_prevention: 'engagement_emails',
      upsell: 'marketing_emails',
    };

    const prefColumn = categoryMap[emailCategory];
    if (prefColumn && !prefs[prefColumn]) {
      return false;
    }

    // Check if specific email type is disabled
    if (prefs.disabled_email_types && prefs.disabled_email_types.includes(emailType)) {
      return false;
    }

    // Check weekly limit
    if (prefs.emails_sent_this_week >= prefs.max_emails_per_week) {
      // Exception for critical emails
      const criticalEmails: EmailType[] = ['payment_failed', 'subscription_renewal', 'cancellation_intent'];
      if (!criticalEmails.includes(emailType)) {
        return false;
      }
    }

    // Check minimum time between emails (24 hours for non-critical)
    if (prefs.last_email_sent_at) {
      const hoursSinceLastEmail =
        (Date.now() - new Date(prefs.last_email_sent_at).getTime()) / (1000 * 60 * 60);

      const criticalEmails: EmailType[] = ['payment_failed', 'subscription_renewal', 'welcome'];
      const minHours = criticalEmails.includes(emailType) ? 1 : 24;

      if (hoursSinceLastEmail < minHours) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking email preferences:', error);
    // On error, allow email to prevent blocking
    return true;
  }
}

/**
 * Track email in database
 */
async function trackEmailSent(
  userId: number,
  emailType: EmailType,
  emailCategory: EmailCategory,
  subject: string,
  variant: string,
  status: 'sent' | 'failed'
): Promise<void> {
  try {
    // Get user's subscription type for tracking
    const userResult = await sql`
      SELECT subscription_type FROM users WHERE id = ${userId}
    `;

    const userTier = userResult.rows[0]?.subscription_type || 'unknown';

    await sql`
      INSERT INTO email_tracking (
        user_id,
        email_type,
        email_category,
        subject_line,
        variant,
        delivery_status,
        user_tier,
        sent_at
      )
      VALUES (
        ${userId},
        ${emailType},
        ${emailCategory},
        ${subject},
        ${variant},
        ${status},
        ${userTier},
        NOW()
      )
    `;
  } catch (error) {
    console.error('Error tracking email:', error);
  }
}

/**
 * Update user email preferences after sending
 */
async function updateEmailPreferences(userId: number): Promise<void> {
  try {
    await sql`
      INSERT INTO email_preferences (user_id, last_email_sent_at, emails_sent_this_week, week_start)
      VALUES (${userId}, NOW(), 1, CURRENT_DATE)
      ON CONFLICT (user_id)
      DO UPDATE SET
        last_email_sent_at = NOW(),
        emails_sent_this_week = CASE
          WHEN email_preferences.week_start < CURRENT_DATE - INTERVAL '7 days'
          THEN 1
          ELSE email_preferences.emails_sent_this_week + 1
        END,
        week_start = CASE
          WHEN email_preferences.week_start < CURRENT_DATE - INTERVAL '7 days'
          THEN CURRENT_DATE
          ELSE email_preferences.week_start
        END
    `;
  } catch (error) {
    console.error('Error updating email preferences:', error);
  }
}

/**
 * Process email queue (called by cron job)
 */
export async function processEmailQueue(): Promise<void> {
  console.log('📬 Processing email queue...');

  try {
    // Get pending emails that are due
    const result = await sql`
      SELECT *
      FROM email_queue
      WHERE status = 'pending'
        AND scheduled_for <= NOW()
        AND attempts < max_attempts
      ORDER BY priority ASC, scheduled_for ASC
      LIMIT 100
    `;

    console.log(`📨 Found ${result.rows.length} emails to process`);

    for (const queueItem of result.rows) {
      try {
        // Mark as processing
        await sql`
          UPDATE email_queue
          SET status = 'processing', last_attempt_at = NOW(), attempts = attempts + 1
          WHERE id = ${queueItem.id}
        `;

        // Get user data
        const userResult = await sql`
          SELECT id, email, name, subscription_type
          FROM users
          WHERE id = ${queueItem.user_id}
        `;

        if (userResult.rows.length === 0) {
          throw new Error('User not found');
        }

        const user = userResult.rows[0];

        // Prepare template data
        const templateData: EmailTemplateData = {
          ...queueItem.email_data,
          firstName: user.name,
          email: user.email,
          userId: user.id,
          subscriptionType: user.subscription_type,
        };

        // Send email
        const sent = await sendTemplatedEmail(
          user.id,
          queueItem.email_type,
          queueItem.email_category,
          templateData
        );

        // Update queue status
        await sql`
          UPDATE email_queue
          SET
            status = ${sent ? 'sent' : 'failed'},
            processed_at = NOW(),
            error_message = ${sent ? null : 'Send failed'},
            error_count = CASE WHEN ${sent} THEN 0 ELSE error_count + 1 END
          WHERE id = ${queueItem.id}
        `;

        console.log(`${sent ? '✅' : '❌'} Processed email ${queueItem.email_type} for user ${user.id}`);
      } catch (error) {
        console.error(`❌ Error processing queue item ${queueItem.id}:`, error);

        // Update with error
        await sql`
          UPDATE email_queue
          SET
            status = 'failed',
            error_message = ${error instanceof Error ? error.message : 'Unknown error'},
            error_count = error_count + 1
          WHERE id = ${queueItem.id}
        `;
      }
    }

    console.log('✅ Email queue processing complete');
  } catch (error) {
    console.error('❌ Error processing email queue:', error);
  }
}

/**
 * Track email open (called via tracking pixel)
 */
export async function trackEmailOpen(trackingId: number): Promise<void> {
  try {
    await sql`
      UPDATE email_tracking
      SET opened_at = NOW()
      WHERE id = ${trackingId} AND opened_at IS NULL
    `;
  } catch (error) {
    console.error('Error tracking email open:', error);
  }
}

/**
 * Track email click (called via tracked links)
 */
export async function trackEmailClick(trackingId: number, ctaClicked: string): Promise<void> {
  try {
    await sql`
      UPDATE email_tracking
      SET
        clicked_at = NOW(),
        cta_clicked = ${ctaClicked}
      WHERE id = ${trackingId} AND clicked_at IS NULL
    `;
  } catch (error) {
    console.error('Error tracking email click:', error);
  }
}

/**
 * Track email conversion
 */
export async function trackEmailConversion(
  trackingId: number,
  conversionType: string,
  conversionValue?: number
): Promise<void> {
  try {
    await sql`
      UPDATE email_tracking
      SET
        converted_at = NOW(),
        conversion_type = ${conversionType},
        conversion_value = ${conversionValue || 0}
      WHERE id = ${trackingId} AND converted_at IS NULL
    `;
  } catch (error) {
    console.error('Error tracking email conversion:', error);
  }
}
