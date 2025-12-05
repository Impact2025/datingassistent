/**
 * Cron Job: Email Queue Processor
 * Runs every 10 minutes to process and send queued emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { render } from '@react-email/components';
import { sendEmail } from '@/lib/email-service';

// Import all email templates
import WelcomeEmail from '@/emails/welcome-email';
import ProfileOptimizationEmail from '@/emails/profile-optimization-email';
import WeeklyCheckinEmail from '@/emails/weekly-checkin-email';
import InactivityAlert3DaysEmail from '@/emails/inactivity-alert-3days-email';
import WeeklyDigestEmail from '@/emails/weekly-digest-email';
import MilestoneAchievementEmail from '@/emails/milestone-achievement-email';
import SubscriptionRenewalEmail from '@/emails/subscription-renewal-email';
import PaymentFailedEmail from '@/emails/payment-failed-email';
import FeatureLimitReachedEmail from '@/emails/feature-limit-reached-email';
import MonthlyProgressReportEmail from '@/emails/monthly-progress-report-email';
import FeatureDeepDiveChatEmail from '@/emails/feature-deepdive-chat-email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BATCH_SIZE = 50;

// Map email types to React Email components and subjects
const EMAIL_TEMPLATES: Record<string, {
  component: any;
  subject: (data: any) => string;
}> = {
  welcome: {
    component: WelcomeEmail,
    subject: (data) => `Welkom ${data.firstName}! Je dating journey begint nu`
  },
  profile_optimization_reminder: {
    component: ProfileOptimizationEmail,
    subject: () => 'Je profiel is nog niet af - Verhoog je matches!'
  },
  weekly_checkin: {
    component: WeeklyCheckinEmail,
    subject: () => 'Jouw week bij DatingAssistent'
  },
  inactivity_3days: {
    component: InactivityAlert3DaysEmail,
    subject: () => 'We missen je bij DatingAssistent'
  },
  weekly_digest: {
    component: WeeklyDigestEmail,
    subject: () => 'Jouw wekelijkse DatingAssistent update'
  },
  milestone_achievement: {
    component: MilestoneAchievementEmail,
    subject: (data) => `Gefeliciteerd! Je hebt een nieuwe milestone bereikt`
  },
  subscription_renewal: {
    component: SubscriptionRenewalEmail,
    subject: () => 'Je abonnement wordt binnenkort vernieuwd'
  },
  payment_failed: {
    component: PaymentFailedEmail,
    subject: () => 'Actie vereist: Probleem met je betaling'
  },
  feature_limit_reached: {
    component: FeatureLimitReachedEmail,
    subject: (data) => `Je hebt je ${data.feature} limiet bereikt`
  },
  monthly_progress: {
    component: MonthlyProgressReportEmail,
    subject: () => 'Jouw maandelijkse voortgangsrapport'
  },
  feature_deepdive_chat: {
    component: FeatureDeepDiveChatEmail,
    subject: () => 'Ontdek de kracht van de AI Chat Coach'
  }
};

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('[CRON] Starting email queue processing...');
    const startTime = Date.now();

    // Get pending emails from queue
    const pendingEmails = await sql`
      SELECT
        eq.id,
        eq.user_id,
        eq.email_type,
        eq.email_category,
        eq.email_data,
        eq.priority,
        u.email as user_email,
        u.name as user_name
      FROM email_queue eq
      JOIN users u ON eq.user_id = u.id
      LEFT JOIN email_preferences ep ON u.id = ep.user_id
      WHERE
        eq.status = 'pending'
        AND eq.scheduled_for <= NOW()
        AND (ep.unsubscribed_all IS NULL OR ep.unsubscribed_all = false)
      ORDER BY eq.priority ASC, eq.scheduled_for ASC
      LIMIT ${BATCH_SIZE}
    `;

    let processed = 0;
    let failed = 0;

    for (const email of pendingEmails.rows) {
      try {
        // Mark as processing
        await sql`
          UPDATE email_queue
          SET status = 'processing', attempts = attempts + 1
          WHERE id = ${email.id}
        `;

        // Get template config
        const templateConfig = EMAIL_TEMPLATES[email.email_type];

        if (!templateConfig) {
          console.warn(`[CRON] Unknown email type: ${email.email_type}`);
          await markEmailFailed(email.id, 'Unknown email type');
          failed++;
          continue;
        }

        // Parse email data
        const emailData = typeof email.email_data === 'string'
          ? JSON.parse(email.email_data)
          : email.email_data;

        // Render email using React Email
        const html = await render(
          templateConfig.component({
            firstName: email.user_name || emailData.firstName,
            ...emailData
          }),
          { pretty: true }
        );

        // Generate subject
        const subject = templateConfig.subject(emailData);

        // Send email
        const sent = await sendEmail({
          to: email.user_email,
          subject,
          html,
          text: `View this email in your browser for the best experience.`
        });

        if (sent) {
          // Mark as sent
          await sql`
            UPDATE email_queue
            SET status = 'sent', sent_at = NOW()
            WHERE id = ${email.id}
          `;

          // Track in email_tracking table
          await sql`
            INSERT INTO email_tracking (
              user_id,
              email_type,
              email_category,
              sent_at
            ) VALUES (
              ${email.user_id},
              ${email.email_type},
              ${email.email_category},
              NOW()
            )
          `;

          processed++;
        } else {
          await markEmailFailed(email.id, 'Send failed');
          failed++;
        }
      } catch (emailError) {
        console.error(`[CRON] Failed to process email ${email.id}:`, emailError);
        await markEmailFailed(email.id, String(emailError));
        failed++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[CRON] Email queue processing completed: ${processed} sent, ${failed} failed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      processed,
      failed,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CRON] Email queue processor error:', error);
    return NextResponse.json(
      { error: 'Email queue processing failed', details: String(error) },
      { status: 500 }
    );
  }
}

async function markEmailFailed(emailId: number, reason: string) {
  try {
    // Check if max attempts reached
    const result = await sql`
      SELECT attempts FROM email_queue WHERE id = ${emailId}
    `;

    const attempts = result.rows[0]?.attempts || 0;

    if (attempts >= 3) {
      await sql`
        UPDATE email_queue
        SET status = 'failed', error_message = ${reason}
        WHERE id = ${emailId}
      `;
    } else {
      // Reschedule for retry (exponential backoff)
      const nextRetry = new Date(Date.now() + Math.pow(2, attempts) * 60000);
      await sql`
        UPDATE email_queue
        SET status = 'pending', scheduled_for = ${nextRetry.toISOString()}, error_message = ${reason}
        WHERE id = ${emailId}
      `;
    }
  } catch (error) {
    console.error(`[CRON] Failed to mark email ${emailId} as failed:`, error);
  }
}
