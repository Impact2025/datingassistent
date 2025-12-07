/**
 * Admin Notifications Service
 *
 * Sends real-time notifications to admins for important events:
 * - New user registrations
 * - High-value conversions
 * - System alerts
 */

import { render } from '@react-email/components';
import { sendEmail } from './email-service';
import AdminNewLeadEmail from '@/emails/admin-new-lead-email';

// Admin email configuration
const ADMIN_EMAIL = 'admin@datingassistent.nl';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@datingassistent.nl';

interface LeadIntakeData {
  lookingFor?: string;
  datingStatus?: string;
  mainObstacle?: string;
}

interface NewLeadNotificationData {
  userId: number;
  name: string;
  email: string;
  registrationSource: 'lead_wizard' | 'legacy' | 'api';
  photoScore?: number | null;
  intakeData?: LeadIntakeData | null;
  otoShown?: boolean;
  otoAccepted?: boolean;
}

/**
 * Send notification to admin when a new user registers
 */
export async function notifyAdminNewLead(data: NewLeadNotificationData): Promise<boolean> {
  try {
    const registeredAt = new Date().toLocaleString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Amsterdam',
    });

    // Render the email template
    const html = await render(
      AdminNewLeadEmail({
        leadName: data.name,
        leadEmail: data.email,
        leadId: data.userId,
        registrationSource: data.registrationSource,
        photoScore: data.photoScore,
        intakeData: data.intakeData,
        otoShown: data.otoShown,
        otoAccepted: data.otoAccepted,
        registeredAt,
      }),
      { pretty: true }
    );

    // Create text fallback
    const textContent = createTextFallback(data, registeredAt);

    // Determine subject based on lead quality
    const subject = createSubjectLine(data);

    // Send the email
    const sent = await sendEmail({
      to: ADMIN_EMAIL,
      from: FROM_EMAIL,
      subject,
      html,
      text: textContent,
    });

    if (sent) {
      console.log(`📧 Admin notified of new lead: ${data.email}`);
    } else {
      console.error(`❌ Failed to notify admin of new lead: ${data.email}`);
    }

    return sent;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return false;
  }
}

/**
 * Create subject line based on lead quality
 */
function createSubjectLine(data: NewLeadNotificationData): string {
  const emoji = getLeadEmoji(data);
  const quality = getLeadQualityLabel(data);

  if (data.otoAccepted) {
    return `🎉 CONVERSIE! ${data.name} heeft Kickstart gekocht`;
  }

  return `${emoji} Nieuwe Lead (${quality}): ${data.name}`;
}

/**
 * Get emoji based on lead quality
 */
function getLeadEmoji(data: NewLeadNotificationData): string {
  let points = 0;
  if (data.intakeData?.mainObstacle) points += 2;
  if (data.photoScore !== null && data.photoScore !== undefined) points += 1;
  if (data.photoScore && data.photoScore < 7) points += 1;
  if (data.otoShown) points += 1;
  if (data.otoAccepted) points += 3;

  if (points >= 6) return '🔥';
  if (points >= 3) return '🌡️';
  return '❄️';
}

/**
 * Get lead quality label
 */
function getLeadQualityLabel(data: NewLeadNotificationData): string {
  let points = 0;
  if (data.intakeData?.mainObstacle) points += 2;
  if (data.photoScore !== null && data.photoScore !== undefined) points += 1;
  if (data.photoScore && data.photoScore < 7) points += 1;
  if (data.otoShown) points += 1;
  if (data.otoAccepted) points += 3;

  if (points >= 6) return 'HOT';
  if (points >= 3) return 'Warm';
  return 'Cold';
}

/**
 * Create text fallback for email clients that don't support HTML
 */
function createTextFallback(data: NewLeadNotificationData, registeredAt: string): string {
  const quality = getLeadQualityLabel(data);
  const emoji = getLeadEmoji(data);

  let text = `
${emoji} NIEUWE LEAD - ${quality}

Naam: ${data.name}
Email: ${data.email}
User ID: #${data.userId}
Registratie: ${registeredAt}
Bron: ${data.registrationSource === 'lead_wizard' ? 'Lead Activation Wizard' : data.registrationSource === 'legacy' ? 'Standaard Registratie' : 'API'}
`;

  if (data.photoScore !== null && data.photoScore !== undefined) {
    text += `\nFoto Score: ${data.photoScore.toFixed(1)}/10`;
  }

  if (data.intakeData) {
    text += '\n\nIntake Antwoorden:';
    if (data.intakeData.lookingFor) {
      text += `\n- Zoekt naar: ${data.intakeData.lookingFor}`;
    }
    if (data.intakeData.datingStatus) {
      text += `\n- Status: ${data.intakeData.datingStatus}`;
    }
    if (data.intakeData.mainObstacle) {
      text += `\n- Grootste obstakel: ${data.intakeData.mainObstacle}`;
    }
  }

  if (data.otoShown !== undefined) {
    text += '\n\nOTO Status: ';
    if (data.otoAccepted) {
      text += '✅ GEACCEPTEERD - Conversie!';
    } else if (data.otoShown) {
      text += '❌ Afgewezen - Follow-up nodig';
    } else {
      text += '⏸️ Nog niet getoond';
    }
  }

  text += `

---
Bekijk in admin: https://datingassistent.nl/admin/users?search=${encodeURIComponent(data.email)}

Dit is een automatische notificatie van DatingAssistent.
`;

  return text.trim();
}

/**
 * Send daily summary email to admin
 * (Can be called via cron job)
 */
export async function sendDailyLeadSummary(): Promise<boolean> {
  // TODO: Implement daily summary with stats
  // - Total new leads today
  // - Conversion rate
  // - Top obstacles
  // - Revenue generated
  console.log('📊 Daily lead summary not yet implemented');
  return true;
}
