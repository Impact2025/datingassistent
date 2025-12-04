import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email templates
const EMAIL_TEMPLATES = {
  WELCOME: {
    subject: 'Welkom bij DatingAssistent!',
    templateId: process.env.SENDGRID_WELCOME_TEMPLATE_ID || 'd-welcome-email-template-id'
  },
  PASSWORD_RESET: {
    subject: 'Wachtwoord resetten - DatingAssistent',
    templateId: process.env.SENDGRID_PASSWORD_RESET_TEMPLATE_ID || 'd-password-reset-template-id'
  },
  PAYMENT_CONFIRMATION: {
    subject: 'Betaling ontvangen - DatingAssistent',
    templateId: process.env.SENDGRID_PAYMENT_CONFIRMATION_TEMPLATE_ID || 'd-payment-confirmation-template-id'
  },
  PAYMENT_FAILED: {
    subject: 'Probleem met betaling - DatingAssistent',
    templateId: process.env.SENDGRID_PAYMENT_FAILED_TEMPLATE_ID || 'd-payment-failed-template-id'
  },
  SUBSCRIPTION_RENEWAL: {
    subject: 'Je abonnement wordt verlengd - DatingAssistent',
    templateId: process.env.SENDGRID_SUBSCRIPTION_RENEWAL_TEMPLATE_ID || 'd-subscription-renewal-template-id'
  },
  SUBSCRIPTION_CANCELLED: {
    subject: 'Abonnement geannuleerd - DatingAssistent',
    templateId: process.env.SENDGRID_SUBSCRIPTION_CANCELLED_TEMPLATE_ID || 'd-subscription-cancelled-template-id'
  }
};

interface EmailData {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
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
      console.log('Text:', emailData.text);
      console.log('HTML:', emailData.html);
      console.log('Template ID:', emailData.templateId);
      console.log('Dynamic Template Data:', emailData.dynamicTemplateData);
      console.log('---');
      return true; // Return true to indicate "success" for testing purposes
    }

    const mailData: any = {
      to: emailData.to,
      from: emailData.from || 'noreply@datingassistent.nl',
      subject: emailData.subject,
      ...(emailData.text && { text: emailData.text }),
      ...(emailData.html && { html: emailData.html }),
      ...(emailData.templateId && { templateId: emailData.templateId }),
      ...(emailData.dynamicTemplateData && { dynamicTemplateData: emailData.dynamicTemplateData })
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
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  loginUrl: string
): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welkom bij DatingAssistent!</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background: linear-gradient(135deg, #fef7f7 0%, #fef3f3 100%); }
        .container { max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .header { background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); padding: 40px 30px; text-align: center; }
        .logo { width: 60px; height: 60px; margin-bottom: 20px; }
        .tagline { color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; margin-bottom: 10px; }
        .title { color: white; font-size: 28px; font-weight: 700; margin: 0; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 24px; font-weight: 600; color: #ec4899; margin-bottom: 20px; }
        .message { font-size: 16px; color: #6b7280; margin-bottom: 30px; line-height: 1.7; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.3); margin: 30px 0; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 15px 20px -3px rgba(236, 72, 153, 0.4); }
        .features { background: #f9fafb; border-radius: 12px; padding: 30px; margin: 30px 0; }
        .feature-item { display: flex; align-items: center; margin-bottom: 16px; }
        .feature-icon { width: 24px; height: 24px; background: #ec4899; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; margin-right: 16px; flex-shrink: 0; }
        .feature-text { font-size: 14px; color: #374151; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer-text { color: #6b7280; font-size: 14px; margin-bottom: 10px; }
        .footer-link { color: #ec4899; text-decoration: none; font-weight: 500; }
        .footer-link:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header with Logo and Branding -->
        <div class="header">
          <img src="https://datingassistent.nl/images/LogoDatingAssistent.png" alt="DatingAssistent Logo" class="logo">
          <div class="tagline">💕 Durf te daten, durf jezelf te zijn</div>
          <h1 class="title">Welkom bij DatingAssistent!</h1>
        </div>

        <!-- Main Content -->
        <div class="content">
          <h2 class="greeting">Hallo ${userName}!</h2>
          <p class="message">Gefeliciteerd! Je account is succesvol aangemaakt. Je bent nu lid van de DatingAssistent community waar je 24/7 toegang hebt tot professionele dating coaching.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" class="cta-button">🚀 Start je dating avontuur</a>
          </div>

          <div class="features">
            <h3 style="color: #374151; margin-bottom: 20px; font-size: 18px;">Wat kun je verwachten?</h3>
            <div class="feature-item">
              <div class="feature-icon">💬</div>
              <div class="feature-text"><strong>24/7 AI Coach:</strong> Stel al je dating vragen, dag en nacht</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📚</div>
              <div class="feature-text"><strong>8 Professionele Cursussen:</strong> Van profiel optimalisatie tot date gesprekken</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🛠️</div>
              <div class="feature-text"><strong>20+ Dating Tools:</strong> Profiel analyzer, openingszinnen generator, en meer</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📊</div>
              <div class="feature-text"><strong>Persoonlijke Voortgang:</strong> Track je dating success en groei</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p class="footer-text">Dit is een automatische welkomstmail. Bewaar deze voor je administratie.</p>
          <p class="footer-text">Heb je vragen? <a href="mailto:support@datingassistent.nl" class="footer-link">support@datingassistent.nl</a></p>
          <p class="footer-text" style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            © 2024 DatingAssistent - Dé dating coach die altijd beschikbaar is voor iedereen
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Welkom bij DatingAssistent!

    Hallo ${userName}!

    Gefeliciteerd! Je account is succesvol aangemaakt. Je bent nu lid van de DatingAssistent community.

    Wat kun je verwachten?
    • 24/7 AI Coach: Stel al je dating vragen, dag en nacht
    • 8 Professionele Cursussen: Van profiel optimalisatie tot date gesprekken
    • 20+ Dating Tools: Profiel analyzer, openingszinnen generator, en meer
    • Persoonlijke Voortgang: Track je dating success en groei

    Start je dating avontuur: ${loginUrl}

    Met vriendelijke groet,
    Het DatingAssistent Team
  `;

  return sendEmail({
    to: userEmail,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@datingassistent.nl',
    subject: EMAIL_TEMPLATES.WELCOME.subject,
    html: htmlContent,
    text: textContent
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetUrl: string
): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Wachtwoord Reset - DatingAssistent</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background: linear-gradient(135deg, #fef7f7 0%, #fef3f3 100%); }
        .container { max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .header { background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); padding: 40px 30px; text-align: center; }
        .logo { width: 60px; height: 60px; margin-bottom: 20px; }
        .tagline { color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; margin-bottom: 10px; }
        .title { color: white; font-size: 28px; font-weight: 700; margin: 0; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 24px; font-weight: 600; color: #ec4899; margin-bottom: 20px; }
        .message { font-size: 16px; color: #6b7280; margin-bottom: 30px; line-height: 1.7; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.3); margin: 30px 0; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 15px 20px -3px rgba(236, 72, 153, 0.4); }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 30px 0; }
        .warning-text { color: #92400e; font-size: 14px; margin: 0; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer-text { color: #6b7280; font-size: 14px; margin-bottom: 10px; }
        .footer-link { color: #ec4899; text-decoration: none; font-weight: 500; }
        .footer-link:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header with Logo and Branding -->
        <div class="header">
          <img src="https://datingassistent.nl/images/LogoDatingAssistent.png" alt="DatingAssistent Logo" class="logo">
          <div class="tagline">🔐 Wachtwoord Reset</div>
          <h1 class="title">Wachtwoord Reset</h1>
        </div>

        <!-- Main Content -->
        <div class="content">
          <h2 class="greeting">Hallo ${userName}!</h2>
          <p class="message">We hebben een verzoek ontvangen om je wachtwoord te resetten. Klik op de onderstaande knop om een nieuw wachtwoord in te stellen.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="cta-button">🔑 Wachtwoord Resetten</a>
          </div>

          <div class="warning">
            <p class="warning-text">⏰ Deze link verloopt over 1 uur. Als je geen wachtwoord reset hebt aangevraagd, negeer dan deze email.</p>
          </div>

          <p class="message" style="font-size: 14px; color: #9ca3af;">
            Voor je veiligheid: Deel deze link niet met anderen en gebruik altijd een sterk wachtwoord.
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p class="footer-text">Dit is een automatische email. Bewaar deze niet voor je administratie.</p>
          <p class="footer-text">Heb je vragen? <a href="mailto:support@datingassistent.nl" class="footer-link">support@datingassistent.nl</a></p>
          <p class="footer-text" style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            © 2024 DatingAssistent - Dé dating coach die altijd beschikbaar is
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Wachtwoord Reset - DatingAssistent

    Hallo ${userName}!

    We hebben een verzoek ontvangen om je wachtwoord te resetten.

    Klik op deze link om een nieuw wachtwoord in te stellen:
    ${resetUrl}

    Deze link verloopt over 1 uur.

    Als je geen wachtwoord reset hebt aangevraagd, negeer dan deze email.

    Met vriendelijke groet,
    Het DatingAssistent Team
  `;

  return sendEmail({
    to: userEmail,
    from: 'support@datingassistent.nl',
    subject: EMAIL_TEMPLATES.PASSWORD_RESET.subject,
    html: htmlContent,
    text: textContent
  });
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  userEmail: string,
  userName: string,
  amount: number,
  currency: string,
  orderId: string
): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Betaling Ontvangen - DatingAssistent</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background: linear-gradient(135deg, #fef7f7 0%, #fef3f3 100%); }
        .container { max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
        .logo { width: 60px; height: 60px; margin-bottom: 20px; }
        .tagline { color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; margin-bottom: 10px; }
        .title { color: white; font-size: 28px; font-weight: 700; margin: 0; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 24px; font-weight: 600; color: #10b981; margin-bottom: 20px; }
        .message { font-size: 16px; color: #6b7280; margin-bottom: 30px; line-height: 1.7; }
        .receipt { background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 30px; margin: 30px 0; }
        .receipt-title { color: #065f46; font-size: 18px; font-weight: 600; margin-bottom: 20px; text-align: center; }
        .receipt-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #d1fae5; }
        .receipt-label { color: #374151; font-weight: 500; }
        .receipt-value { color: #065f46; font-weight: 600; }
        .receipt-total { background: #10b981; color: white; padding: 16px; border-radius: 8px; text-align: center; margin-top: 20px; }
        .receipt-total-label { font-size: 14px; opacity: 0.9; }
        .receipt-total-value { font-size: 24px; font-weight: 700; }
        .success-icon { font-size: 48px; margin-bottom: 20px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.3); margin: 30px 0; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 15px 20px -3px rgba(236, 72, 153, 0.4); }
        .footer { background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer-text { color: #6b7280; font-size: 14px; margin-bottom: 10px; }
        .footer-link { color: #ec4899; text-decoration: none; font-weight: 500; }
        .footer-link:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header with Logo and Branding -->
        <div class="header">
          <img src="https://datingassistent.nl/images/LogoDatingAssistent.png" alt="DatingAssistent Logo" class="logo">
          <div class="tagline">✅ Betaling Ontvangen</div>
          <h1 class="title">Betaling Bevestigd!</h1>
        </div>

        <!-- Main Content -->
        <div class="content">
          <h2 class="greeting">Hallo ${userName}!</h2>
          <p class="message">Geweldig nieuws! Je betaling is succesvol ontvangen en verwerkt. Je abonnement is nu actief en je hebt volledige toegang tot alle DatingAssistent features.</p>

          <!-- Receipt -->
          <div class="receipt">
            <div class="success-icon">🎉</div>
            <h3 class="receipt-title">Betalingsoverzicht</h3>
            <div class="receipt-row">
              <span class="receipt-label">Ordernummer:</span>
              <span class="receipt-value">${orderId}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Betaalmethode:</span>
              <span class="receipt-value">MultiSafePay</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Status:</span>
              <span class="receipt-value">Betaald</span>
            </div>
            <div class="receipt-total">
              <div class="receipt-total-label">Totaal Bedrag</div>
              <div class="receipt-total-value">€${(amount / 100).toFixed(2)} ${currency}</div>
            </div>
          </div>

          <p class="message">Je kunt nu direct beginnen met het gebruiken van alle tools en cursussen. Klik op de knop hieronder om naar je dashboard te gaan.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://datingassistent.nl/dashboard" class="cta-button">🚀 Start je dating avontuur</a>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p class="footer-text">Dit is je digitale betalingsbewijs. Bewaar deze email voor je administratie.</p>
          <p class="footer-text">Heb je vragen over je abonnement? <a href="mailto:support@datingassistent.nl" class="footer-link">support@datingassistent.nl</a></p>
          <p class="footer-text" style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            © 2024 DatingAssistent - Dé dating coach die altijd beschikbaar is
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Betaling Bevestigd - DatingAssistent

    Hallo ${userName}!

    Geweldig nieuws! Je betaling van €${(amount / 100).toFixed(2)} ${currency} is succesvol ontvangen.

    Ordernummer: ${orderId}
    Status: Betaald

    Je abonnement is nu actief en je hebt volledige toegang tot alle DatingAssistent features.

    Ga naar je dashboard: https://datingassistent.nl/dashboard

    Met vriendelijke groet,
    Het DatingAssistent Team
  `;

  return sendEmail({
    to: userEmail,
    from: 'billing@datingassistent.nl',
    subject: EMAIL_TEMPLATES.PAYMENT_CONFIRMATION.subject,
    html: htmlContent,
    text: textContent
  });
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(
  userEmail: string,
  userName: string,
  amount: number,
  currency: string
): Promise<boolean> {
  return sendEmail({
    to: userEmail,
    from: 'billing@datingassistent.nl',
    subject: EMAIL_TEMPLATES.PAYMENT_FAILED.subject,
    templateId: EMAIL_TEMPLATES.PAYMENT_FAILED.templateId,
    dynamicTemplateData: {
      name: userName,
      amount: amount,
      currency: currency
    }
  });
}

/**
 * Send subscription renewal email
 */
export async function sendSubscriptionRenewalEmail(
  userEmail: string,
  userName: string,
  amount: number,
  currency: string,
  renewalDate: string
): Promise<boolean> {
  return sendEmail({
    to: userEmail,
    from: 'billing@datingassistent.nl',
    subject: EMAIL_TEMPLATES.SUBSCRIPTION_RENEWAL.subject,
    templateId: EMAIL_TEMPLATES.SUBSCRIPTION_RENEWAL.templateId,
    dynamicTemplateData: {
      name: userName,
      amount: amount,
      currency: currency,
      renewal_date: renewalDate
    }
  });
}

/**
 * Send subscription cancelled email
 */
export async function sendSubscriptionCancelledEmail(
  userEmail: string,
  userName: string
): Promise<boolean> {
  return sendEmail({
    to: userEmail,
    from: 'billing@datingassistent.nl',
    subject: EMAIL_TEMPLATES.SUBSCRIPTION_CANCELLED.subject,
    templateId: EMAIL_TEMPLATES.SUBSCRIPTION_CANCELLED.templateId,
    dynamicTemplateData: {
      name: userName
    }
  });
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
    console.log('Text:', text);
    console.log('---');
    return true; // Return true to indicate "success" for testing purposes
  }

  return sendEmail({
    to,
    subject,
    text
  });
}

/**
 * Send program enrollment confirmation email
 */
export async function sendProgramEnrollmentEmail(
  userEmail: string,
  userName: string,
  programName: string,
  programSlug: string,
  dayOneUrl: string
): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welkom bij ${programName}!</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background: linear-gradient(135deg, #fef7f7 0%, #fef3f3 100%); }
        .container { max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .header { background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); padding: 40px 30px; text-align: center; }
        .logo { width: 60px; height: 60px; margin-bottom: 20px; }
        .tagline { color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; margin-bottom: 10px; }
        .title { color: white; font-size: 28px; font-weight: 700; margin: 0; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 24px; font-weight: 600; color: #ec4899; margin-bottom: 20px; }
        .message { font-size: 16px; color: #6b7280; margin-bottom: 30px; line-height: 1.7; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.3); margin: 30px 0; transition: all 0.3s; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 15px 20px -3px rgba(236, 72, 153, 0.4); }
        .highlight-box { background: linear-gradient(135deg, #fef3f3 0%, #fef7f7 100%); border-left: 4px solid #ec4899; border-radius: 8px; padding: 20px; margin: 30px 0; }
        .highlight-title { color: #ec4899; font-weight: 600; font-size: 18px; margin-bottom: 10px; }
        .steps { list-style: none; padding: 0; margin: 20px 0; }
        .step-item { display: flex; align-items: start; gap: 12px; margin-bottom: 16px; }
        .step-number { background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0; }
        .step-text { color: #6b7280; font-size: 15px; line-height: 1.6; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer-text { color: #6b7280; font-size: 14px; margin-bottom: 10px; }
        .footer-link { color: #ec4899; text-decoration: none; font-weight: 500; }
        .footer-link:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <img src="https://datingassistent.nl/images/LogoDatingAssistent.png" alt="DatingAssistent Logo" class="logo">
          <div class="tagline">🚀 Laten we beginnen!</div>
          <h1 class="title">Welkom bij ${programName}</h1>
        </div>

        <!-- Main Content -->
        <div class="content">
          <h2 class="greeting">Hallo ${userName}! 🎉</h2>

          <p class="message">
            Gefeliciteerd! Je hebt zojuist ${programName} geactiveerd. Je staat op het punt om een geweldige transformatie door te maken.
          </p>

          <div class="highlight-box">
            <div class="highlight-title">✅ Je bent klaar om te starten!</div>
            <p style="color: #6b7280; margin: 0; font-size: 15px;">
              Je account is geactiveerd en dag 1 staat voor je klaar. Het enige wat je nog hoeft te doen is op de knop hieronder klikken.
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${dayOneUrl}" class="cta-button">
              🚀 Start met Dag 1
            </a>
          </div>

          <div class="highlight-box">
            <div class="highlight-title">📋 Wat kun je verwachten?</div>
            <ul class="steps">
              <li class="step-item">
                <span class="step-number">1</span>
                <span class="step-text">Elke dag nieuwe content en praktische oefeningen</span>
              </li>
              <li class="step-item">
                <span class="step-number">2</span>
                <span class="step-text">Directe feedback en persoonlijke begeleiding</span>
              </li>
              <li class="step-item">
                <span class="step-number">3</span>
                <span class="step-text">Meetbare resultaten en voortgang tracking</span>
              </li>
            </ul>
          </div>

          <p class="message">
            <strong>💡 Pro tip:</strong> Zet een dagelijkse reminder in je agenda om elke dag 15-20 minuten aan je transformatie te werken. Consistentie is de sleutel tot succes!
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p class="footer-text">
            Vragen? We staan voor je klaar!<br>
            Mail ons op <a href="mailto:support@datingassistent.nl" class="footer-link">support@datingassistent.nl</a>
          </p>
          <p class="footer-text" style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
            © 2024 DatingAssistent. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

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

Vragen? Mail ons op support@datingassistent.nl

© 2024 DatingAssistent
  `;

  return sendEmail({
    to: userEmail,
    subject: `🚀 Welkom bij ${programName} - Start vandaag nog!`,
    html: htmlContent,
    text: textContent
  });
}