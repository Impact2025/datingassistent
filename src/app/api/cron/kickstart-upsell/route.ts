/**
 * Cron Job: Kickstart Upsell Email Sequence
 *
 * Runs daily at 10:00. Sends upgrade emails to Kickstart users:
 * - Day 7:  Soft upsell — "Week 1 compleet, wat nu?"
 * - Day 14: Harder upsell — "Halverwege. Dit is wat je mist."
 *
 * Prevents duplicates via email_tracking table.
 *
 * Vercel Cron schedule: "0 10 * * *" (daily at 10:00 UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import KickstartUpgradeEmail from '@/emails/kickstart-upgrade-email';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'vincent@datingassistent.nl';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.datingassistent.nl';

// Vercel cron secret verification
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // No secret configured — allow (dev mode)
  return authHeader === `Bearer ${cronSecret}`;
}

interface EnrollmentRow {
  user_id: number;
  email: string;
  name: string;
  enrolled_at: Date;
  days_since_enrollment: number;
  progress_percentage: number;
}

async function findUsersForDay(dayOffset: number): Promise<EnrollmentRow[]> {
  const result = await sql<EnrollmentRow>`
    SELECT
      pe.user_id,
      u.email,
      u.name,
      pe.enrolled_at,
      EXTRACT(DAY FROM NOW() - pe.enrolled_at)::int AS days_since_enrollment,
      COALESCE(pe.progress_percentage, 0) AS progress_percentage
    FROM program_enrollments pe
    JOIN users u ON u.id = pe.user_id
    JOIN programs p ON p.id = pe.program_id
    WHERE
      p.slug = 'kickstart-programma'
      AND pe.status = 'active'
      AND EXTRACT(DAY FROM NOW() - pe.enrolled_at)::int = ${dayOffset}
      -- Exclude users who already received this specific email
      AND NOT EXISTS (
        SELECT 1 FROM email_tracking et
        WHERE et.user_id = pe.user_id
          AND et.email_type = ${`kickstart_upsell_day${dayOffset}`}
      )
  `;
  return result.rows;
}

async function markEmailSent(userId: number, emailType: string): Promise<void> {
  await sql`
    INSERT INTO email_tracking (user_id, email_type, sent_at)
    VALUES (${userId}, ${emailType}, NOW())
    ON CONFLICT (user_id, email_type) DO NOTHING
  `;
}

async function sendUpsellEmail(
  user: EnrollmentRow,
  variant: 'day7' | 'day14'
): Promise<boolean> {
  if (!resend) {
    console.warn('Resend not configured — skipping email for user', user.user_id);
    return false;
  }

  const upgradeUrl = `${BASE_URL}/checkout/transformatie-programma?userId=${user.user_id}&source=kickstart_upsell_${variant}&discount=true`;
  const firstName = user.name?.split(' ')[0] || 'er';

  const html = await render(
    KickstartUpgradeEmail({
      firstName,
      daysCompleted: user.days_since_enrollment,
      upgradeUrl,
      currentScore: user.progress_percentage > 0 ? user.progress_percentage : undefined,
      variant,
    })
  );

  const subjects: Record<string, string> = {
    day7:  `${firstName}, week 1 voltooid — dit is wat nu mogelijk is`,
    day14: `${firstName}, 14 dagen. Tijd voor eerlijkheid.`,
  };

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: user.email,
    subject: subjects[variant],
    html,
  });

  if (error) {
    console.error(`Failed to send ${variant} upsell to ${user.email}:`, error);
    return false;
  }

  return true;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    day7:  { found: 0, sent: 0, failed: 0 },
    day14: { found: 0, sent: 0, failed: 0 },
  };

  try {
    // Day 7 sequence
    const day7Users = await findUsersForDay(7);
    results.day7.found = day7Users.length;

    for (const user of day7Users) {
      const sent = await sendUpsellEmail(user, 'day7');
      if (sent) {
        await markEmailSent(user.user_id, 'kickstart_upsell_day7');
        results.day7.sent++;
      } else {
        results.day7.failed++;
      }
    }

    // Day 14 sequence
    const day14Users = await findUsersForDay(14);
    results.day14.found = day14Users.length;

    for (const user of day14Users) {
      const sent = await sendUpsellEmail(user, 'day14');
      if (sent) {
        await markEmailSent(user.user_id, 'kickstart_upsell_day14');
        results.day14.sent++;
      } else {
        results.day14.failed++;
      }
    }

    const totalSent = results.day7.sent + results.day14.sent;
    const totalFailed = results.day7.failed + results.day14.failed;

    logger.log(`Kickstart upsell cron: ${totalSent} sent, ${totalFailed} failed`);

    return NextResponse.json({
      success: true,
      results,
      summary: { totalSent, totalFailed },
    });
  } catch (error) {
    console.error('Kickstart upsell cron error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
