/**
 * Email Service - World-Class Email System for DatingAssistent
 * Uses React Email templates for beautiful, responsive emails
 */

import sgMail from '@sendgrid/mail';
import { render } from '@react-email/components';
import WelcomeEmail from '@/emails/welcome-email';
import VerificationEmail from '@/emails/verification-email';
import PasswordResetEmail from '@/emails/password-reset-email';
import PaymentConfirmationEmail from '@/emails/payment-confirmation-email';
import PaymentFailedEmail from '@/emails/payment-failed-email';
import SubscriptionRenewalEmail from '@/emails/subscription-renewal-email';
import SubscriptionCancelledEmail from '@/emails/subscription-cancelled-email';
import ProgramEnrollmentEmail from '@/emails/program-enrollment-email';
import PatternQuizResultEmail from '@/emails/pattern-quiz-result-email';
import type { AttachmentPattern } from '@/lib/quiz/pattern/pattern-types';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://datingassistent.nl';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@datingassistent.nl';
const SUPPORT_EMAIL = 'support@datingassistent.nl';
const BILLING_EMAIL = 'billing@datingassistent.nl';

interface EmailData {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_actual_sendgrid_api_key_here') {
      console.warn('SendGrid API key not configured. Email not sent.');
      console.log('📧 EMAIL NOT SENT (SendGrid not configured) - Email content:');
      console.log('To:', emailData.to);
      console.log('Subject:', emailData.subject);
      console.log('Text:', emailData.text?.substring(0, 200) + '...');
      console.log('---');
      return true; // Return true to indicate "success" for testing purposes
    }

    const mailData = {
      to: emailData.to,
      from: emailData.from || FROM_EMAIL,
      subject: emailData.subject,
      ...(emailData.text && { text: emailData.text }),
      ...(emailData.html && { html: emailData.html }),
    };

    await sgMail.send(mailData);

    console.log(`✅ Email sent successfully to ${emailData.to}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

/**
 * Send welcome email to new user using React Email template
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  loginUrl: string,
  subscriptionType: 'sociaal' | 'core' | 'pro' | 'premium' = 'core'
): Promise<boolean> {
  try {
    const html = await render(
      WelcomeEmail({
        firstName: userName,
        subscriptionType,
        dashboardUrl: loginUrl || `${BASE_URL}/dashboard`,
      }),
      { pretty: true }
    );

    const textContent = `
Welkom bij DatingAssistent!

Hoi ${userName}!

Wat geweldig dat je er bent! Je hebt zojuist de eerste stap gezet naar succesvol en zelfverzekerd daten.

Je eerste 3 stappen:
1. Profiel completeren - Vul je profiel aan voor persoonlijk advies
2. Eerste AI chat starten - Stel je eerste vraag aan de Chat Coach
3. Ontdek de tools - Probeer de profielanalyzer of openingszinnen generator

Ga naar je dashboard: ${loginUrl || `${BASE_URL}/dashboard`}

Wat je kunt verwachten:
• 24/7 AI Dating Coach
• 8+ Expert Cursussen
• 20+ Slimme Tools
• 89% Meer Matches

Heb je vragen? Reply op deze email of mail naar ${SUPPORT_EMAIL}

Succes met je dating journey!
Vincent & het DatingAssistent team
    `.trim();

    return sendEmail({
      to: userEmail,
      from: FROM_EMAIL,
      subject: `Welkom ${userName}! Je dating journey begint nu`,
      html,
      text: textContent
    });
  } catch (error) {
    console.error('Error rendering welcome email:', error);
    return false;
  }
}

/**
 * Send email verification code
 */
export async function sendVerificationEmail(
  userEmail: string,
  userName: string,
  verificationCode: string
): Promise<boolean> {
  try {
    const html = await render(
      VerificationEmail({
        firstName: userName,
        verificationCode,
      }),
      { pretty: true }
    );

    const textContent = `
Email Verificatie - DatingAssistent

Hoi ${userName}!

Je verificatiecode is: ${verificationCode}

Voer deze code in op de verificatiepagina om je email te bevestigen.

Deze code verloopt over 30 minuten.

Als je geen verificatie hebt aangevraagd, kun je deze email veilig negeren.

Met vriendelijke groet,
Het DatingAssistent Team
    `.trim();

    return sendEmail({
      to: userEmail,
      from: FROM_EMAIL,
      subject: `Je verificatiecode: ${verificationCode}`,
      html,
      text: textContent
    });
  } catch (error) {
    console.error('Error rendering verification email:', error);
    return false;
  }
}

/**
 * Send password reset email using React Email template
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetUrl: string
): Promise<boolean> {
  try {
    const html = await render(
      PasswordResetEmail({
        firstName: userName,
        resetUrl,
        expirationHours: 1,
      }),
      { pretty: true }
    );

    const textContent = `
Wachtwoord Reset - DatingAssistent

Hallo ${userName}!

We hebben een verzoek ontvangen om je wachtwoord te resetten.

Klik op deze link om een nieuw wachtwoord in te stellen:
${resetUrl}

Deze link verloopt over 1 uur.

Als je geen wachtwoord reset hebt aangevraagd, negeer dan deze email.

Tips voor een sterk wachtwoord:
- Gebruik minimaal 8 tekens
- Combineer letters, cijfers en speciale tekens
- Gebruik geen voor de hand liggende woorden

Met vriendelijke groet,
Het DatingAssistent Team
    `.trim();

    return sendEmail({
      to: userEmail,
      from: SUPPORT_EMAIL,
      subject: 'Wachtwoord Resetten - DatingAssistent',
      html,
      text: textContent
    });
  } catch (error) {
    console.error('Error rendering password reset email:', error);
    return false;
  }
}

/**
 * Send payment confirmation email using React Email template
 */
export async function sendPaymentConfirmationEmail(
  userEmail: string,
  userName: string,
  amount: number,
  currency: string,
  orderId: string,
  subscriptionType: string = 'Core'
): Promise<boolean> {
  try {
    const html = await render(
      PaymentConfirmationEmail({
        firstName: userName,
        amount,
        currency,
        orderId,
        subscriptionType,
        dashboardUrl: `${BASE_URL}/dashboard`,
      }),
      { pretty: true }
    );

    const formattedAmount = (amount / 100).toFixed(2);

    const textContent = `
Betaling Bevestigd - DatingAssistent

Hallo ${userName}!

Geweldig nieuws! Je betaling van €${formattedAmount} ${currency} is succesvol ontvangen.

Ordernummer: ${orderId}
Abonnement: ${subscriptionType}
Status: Betaald

Je abonnement is nu actief en je hebt volledige toegang tot alle DatingAssistent features.

Ga naar je dashboard: ${BASE_URL}/dashboard

Dit is je digitale betalingsbewijs. Bewaar deze email voor je administratie.

Met vriendelijke groet,
Het DatingAssistent Team
    `.trim();

    return sendEmail({
      to: userEmail,
      from: BILLING_EMAIL,
      subject: 'Betaling Bevestigd - Je DatingAssistent abonnement is actief!',
      html,
      text: textContent
    });
  } catch (error) {
    console.error('Error rendering payment confirmation email:', error);
    return false;
  }
}

/**
 * Send payment failed email using React Email template
 */
export async function sendPaymentFailedEmail(
  userEmail: string,
  userName: string,
  amount: number,
  currency: string,
  failureReason?: string,
  retryDate?: string
): Promise<boolean> {
  try {
    const html = await render(
      PaymentFailedEmail({
        firstName: userName,
        amount: amount / 100,
        failureReason,
        retryDate,
        daysUntilSuspension: 3,
        dashboardUrl: `${BASE_URL}/dashboard`,
      }),
      { pretty: true }
    );

    const formattedAmount = (amount / 100).toFixed(2);

    const textContent = `
Actie Vereist: Betaling Mislukt - DatingAssistent

Hallo ${userName}!

We konden je betaling van €${formattedAmount} ${currency} niet verwerken.

${failureReason ? `Reden: ${failureReason}` : ''}

Om te voorkomen dat je toegang verliest, update je betaalmethode binnen 3 dagen.

Update je betaalmethode: ${BASE_URL}/dashboard/settings/billing

${retryDate ? `We proberen de betaling automatisch opnieuw op ${retryDate}.` : ''}

Heb je hulp nodig? Neem contact op met ${BILLING_EMAIL}

Met vriendelijke groet,
Het DatingAssistent Team
    `.trim();

    return sendEmail({
      to: userEmail,
      from: BILLING_EMAIL,
      subject: 'Actie vereist: Probleem met je betaling',
      html,
      text: textContent
    });
  } catch (error) {
    console.error('Error rendering payment failed email:', error);
    return false;
  }
}

/**
 * Send subscription renewal email using React Email template
 */
export async function sendSubscriptionRenewalEmail(
  userEmail: string,
  userName: string,
  amount: number,
  currency: string,
  renewalDate: string,
  subscriptionType: string = 'Core'
): Promise<boolean> {
  try {
    const html = await render(
      SubscriptionRenewalEmail({
        firstName: userName,
        subscriptionType,
        amount: amount / 100,
        renewalDate,
        dashboardUrl: `${BASE_URL}/dashboard`,
      }),
      { pretty: true }
    );

    const formattedAmount = (amount / 100).toFixed(2);

    const textContent = `
Abonnement Vernieuwd - DatingAssistent

Hallo ${userName}!

Je ${subscriptionType} abonnement is succesvol vernieuwd.

Bedrag: €${formattedAmount} ${currency}
Volgende verlengdatum: ${renewalDate}

Je hebt nog steeds volledige toegang tot alle DatingAssistent features.

Ga naar je dashboard: ${BASE_URL}/dashboard

Heb je vragen? Neem contact op met ${BILLING_EMAIL}

Met vriendelijke groet,
Het DatingAssistent Team
    `.trim();

    return sendEmail({
      to: userEmail,
      from: BILLING_EMAIL,
      subject: 'Je abonnement is vernieuwd',
      html,
      text: textContent
    });
  } catch (error) {
    console.error('Error rendering subscription renewal email:', error);
    return false;
  }
}

/**
 * Send subscription cancelled email using React Email template
 */
export async function sendSubscriptionCancelledEmail(
  userEmail: string,
  userName: string,
  endDate: string,
  subscriptionType: string = 'Core',
  stats?: {
    totalSessions?: number;
    coursesCompleted?: number;
    daysActive?: number;
  }
): Promise<boolean> {
  try {
    const html = await render(
      SubscriptionCancelledEmail({
        firstName: userName,
        endDate,
        subscriptionType,
        totalSessions: stats?.totalSessions || 0,
        coursesCompleted: stats?.coursesCompleted || 0,
        daysActive: stats?.daysActive || 0,
        reactivateUrl: `${BASE_URL}/prijzen`,
        feedbackUrl: `${BASE_URL}/feedback`,
      }),
      { pretty: true }
    );

    const textContent = `
Abonnement Opgezegd - DatingAssistent

Hallo ${userName}!

We hebben je opzegging van het ${subscriptionType} abonnement verwerkt.
Het spijt ons dat je weggaat!

Je hebt nog toegang tot: ${endDate}
Daarna verlies je toegang tot alle premium features.

${stats ? `
Wat je hebt bereikt:
- ${stats.totalSessions || 0} chat sessies
- ${stats.coursesCompleted || 0} cursussen voltooid
- ${stats.daysActive || 0} actieve dagen
` : ''}

Van gedachten veranderd?
Je kunt op elk moment je abonnement weer activeren: ${BASE_URL}/prijzen

Heb je vragen? Neem contact op met ${SUPPORT_EMAIL}

Met vriendelijke groet,
Het DatingAssistent Team
    `.trim();

    return sendEmail({
      to: userEmail,
      from: BILLING_EMAIL,
      subject: 'Je abonnement is opgezegd - Tot snel!',
      html,
      text: textContent
    });
  } catch (error) {
    console.error('Error rendering subscription cancelled email:', error);
    return false;
  }
}

/**
 * Send program enrollment confirmation email using React Email template
 */
export async function sendProgramEnrollmentEmail(
  userEmail: string,
  userName: string,
  programName: string,
  programSlug: string,
  dayOneUrl: string
): Promise<boolean> {
  try {
    const html = await render(
      ProgramEnrollmentEmail({
        firstName: userName,
        programName,
        programSlug,
        dayOneUrl,
        durationDays: 21,
        dailyTimeMinutes: 15,
      }),
      { pretty: true }
    );

    const textContent = `
Welkom bij ${programName}!

Hallo ${userName}!

Gefeliciteerd! Je hebt zojuist ${programName} geactiveerd.

Je bent klaar om te starten! Je account is geactiveerd en dag 1 staat voor je klaar.

Start nu met Dag 1: ${dayOneUrl}

Wat kun je verwachten?
1. Elke dag nieuwe content en praktische oefeningen
2. Directe feedback en persoonlijke begeleiding
3. Meetbare resultaten en voortgang tracking

Pro tip: Zet een dagelijkse reminder in je agenda om elke dag 15-20 minuten aan je transformatie te werken. Consistentie is de sleutel tot succes!

Vragen? Mail ons op ${SUPPORT_EMAIL}

© ${new Date().getFullYear()} DatingAssistent
    `.trim();

    return sendEmail({
      to: userEmail,
      from: FROM_EMAIL,
      subject: `Welkom bij ${programName} - Start vandaag nog!`,
      html,
      text: textContent
    });
  } catch (error) {
    console.error('Error rendering program enrollment email:', error);
    return false;
  }
}

/**
 * Send pattern quiz result email
 */
export async function sendPatternQuizResultEmail(
  userEmail: string,
  firstName: string,
  attachmentPattern: AttachmentPattern,
  resultId: string
): Promise<boolean> {
  try {
    const resultUrl = `${BASE_URL}/quiz/dating-patroon/resultaat?id=${resultId}`;

    const html = await render(
      PatternQuizResultEmail({
        firstName,
        attachmentPattern,
        resultUrl,
      }),
      { pretty: true }
    );

    // Pattern titles for subject line
    const patternTitles: Record<AttachmentPattern, string> = {
      secure: 'De Stabiele Basis',
      anxious: 'De Toegewijde Zoeker',
      avoidant: 'De Onafhankelijke',
      fearful_avoidant: 'De Paradox',
    };

    const patternTitle = patternTitles[attachmentPattern];

    const textContent = `
Je Dating Patroon: ${patternTitle}

Hoi ${firstName}!

Je hebt de quiz gedaan. Je bent ${patternTitle}.

Bekijk je volledige resultaat hier: ${resultUrl}

Een patroon herkennen is stap 1. Het veranderen is stap 2.

De meeste mensen blijven hangen bij stap 1. Ze lezen hun resultaat, knikken, en gaan door met wat ze altijd deden.

Ik wil je helpen naar stap 2. De komende dagen stuur ik je specifieke inzichten voor jouw type.

Maar als je nu al klaar bent voor actie, bekijk dan het Transformatie Programma:
${BASE_URL}/transformatie

Tot morgen,
Vincent
DatingAssistent

P.S. Reply op deze mail met je grootste dating frustratie. Ik lees alles persoonlijk.
    `.trim();

    return sendEmail({
      to: userEmail,
      from: FROM_EMAIL,
      subject: `${firstName}, je Dating Patroon is: ${patternTitle}`,
      html,
      text: textContent,
    });
  } catch (error) {
    console.error('Error rendering pattern quiz result email:', error);
    return false;
  }
}

/**
 * Send a simple text email (fallback)
 */
export async function sendTextEmail(
  to: string,
  subject: string,
  text: string
): Promise<boolean> {
  // If SendGrid is not configured, log the email content instead of sending
  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_actual_sendgrid_api_key_here') {
    console.log('📧 EMAIL NOT SENT (SendGrid not configured) - Email content:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text.substring(0, 200) + '...');
    console.log('---');
    return true; // Return true to indicate "success" for testing purposes
  }

  return sendEmail({
    to,
    subject,
    text
  });
}
