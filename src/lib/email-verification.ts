import { sql } from '@vercel/postgres';
import { randomBytes } from 'crypto';
// Note: sendEmail import removed to avoid client-side issues
// Import only when needed in server-side code

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Store verification token for user
 */
export async function storeVerificationToken(userId: number, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

  await sql`
    UPDATE users
    SET verification_token = ${token},
        verification_expires_at = ${expiresAt.toISOString()}
    WHERE id = ${userId}
  `;
}

/**
 * Verify email with token
 */
export async function verifyEmailWithToken(token: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // Find user with this token
    const result = await sql`
      SELECT id, name, email, verification_expires_at, email_verified
      FROM users
      WHERE verification_token = ${token}
    `;

    if (result.rows.length === 0) {
      return { success: false, error: 'Invalid verification token' };
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.email_verified) {
      return { success: false, error: 'Email already verified' };
    }

    // Check if token expired
    const expiresAt = new Date(user.verification_expires_at);
    if (expiresAt < new Date()) {
      return { success: false, error: 'Verification token has expired' };
    }

    // Mark email as verified
    await sql`
      UPDATE users
      SET email_verified = true,
          verification_token = NULL,
          verification_expires_at = NULL
      WHERE id = ${user.id}
    `;

    return { success: true, user };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Send email verification email
 */
export async function sendEmailVerificationEmail(
  userEmail: string,
  userName: string,
  verificationUrl: string
): Promise<boolean> {
  // Dynamic import to avoid client-side issues
  const { sendEmail } = await import('./email-service');

  const subject = 'Verifieer je emailadres - DatingAssistent';
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verificatie - DatingAssistent</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
          .content { padding: 20px !important; }
          .button { padding: 12px 24px !important; font-size: 14px !important; }
        }
      </style>
    </head>
    <body style="font-family: 'PT Sans', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f8f9fa">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <!-- Main Container -->
            <table class="container" width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <!-- Logo -->
                        <img src="https://datingassistent.nl/images/LogoDatingAssistent.png" alt="DatingAssistent Logo" width="48" height="48" style="vertical-align: middle; margin-right: 12px;">
                        <span style="font-size: 28px; font-weight: 700; color: #E14874;">Dating</span>
                        <span style="font-size: 28px; font-weight: 700; color: #1f2937;">Assistent</span>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 8px;">
                        <span style="font-size: 16px; color: #6b7280; font-weight: 400;">datingassistent.nl</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <!-- Welcome Message -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding-bottom: 30px;">
                        <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #1f2937; text-align: center;">
                          Welkom bij DatingAssistent!
                        </h1>
                        <p style="margin: 10px 0 0 0; font-size: 18px; color: #6b7280; text-align: center;">
                          Verificeer je emailadres om te beginnen
                        </p>
                      </td>
                    </tr>

                    <!-- Personal Greeting -->
                    <tr>
                      <td style="padding-bottom: 30px;">
                        <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #1f2937;">
                          Hallo ${userName}!
                        </h2>
                        <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                          Bedankt voor je registratie! Om je account te activeren en te zorgen voor een veilige dating community, klik op de onderstaande knop om je emailadres te verifiëren.
                        </p>
                      </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                      <td align="center" style="padding: 30px 0;">
                        <table border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); box-shadow: 0 4px 14px 0 rgba(236, 72, 153, 0.39);">
                              <a href="${verificationUrl}" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                                ✅ Verificeer Emailadres
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Instructions -->
                    <tr>
                      <td style="padding-bottom: 30px;">
                        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="center">
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #92400e;">
                                  ⏰ Deze verificatie link verloopt over 24 uur
                                </p>
                                <p style="margin: 8px 0 0 0; font-size: 14px; color: #92400e;">
                                  Klik op de bovenstaande knop om je account direct te activeren. Als je geen account hebt aangemaakt bij DatingAssistent, negeer dan deze email.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                          Vragen of hulp nodig?
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <a href="mailto:support@datingassistent.nl" style="color: #E14874; text-decoration: none; font-weight: 500;">support@datingassistent.nl</a>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                        <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.4;">
                          Je ontvangt deze email omdat je je hebt geregistreerd bij DatingAssistent.<br>
                          <a href="https://datingassistent.nl/privacy" style="color: #9ca3af; text-decoration: underline;">Privacy Policy</a> |
                          <a href="https://datingassistent.nl/algemene-voorwaarden" style="color: #9ca3af; text-decoration: underline;">Algemene Voorwaarden</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
    Welkom bij DatingAssistent!

    Hallo ${userName}!

    Bedankt voor je registratie! Om je account te activeren, klik op deze link:
    ${verificationUrl}

    Deze link verloopt over 24 uur.

    Als je geen account hebt aangemaakt bij DatingAssistent, negeer dan deze email.

    Met vriendelijke groet,
    Het DatingAssistent Team

    ---
    Vragen? support@datingassistent.nl
    Privacy: https://datingassistent.nl/privacy
    Voorwaarden: https://datingassistent.nl/algemene-voorwaarden
  `;

  return sendEmail({
    to: userEmail,
    from: 'noreply@datingassistent.nl',
    subject,
    html: htmlContent,
    text: textContent
  });
}

/**
 * Resend verification email by user ID
 */
export async function resendVerificationEmailById(userId: number): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user data
    const userResult = await sql`
      SELECT name, email, email_verified, verification_token, verification_expires_at
      FROM users
      WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const user = userResult.rows[0];

    if (user.email_verified) {
      return { success: false, error: 'Email already verified' };
    }

    // Check if existing token is still valid (not expired)
    const now = new Date();
    const expiresAt = user.verification_expires_at ? new Date(user.verification_expires_at) : null;
    let token = user.verification_token;

    // Generate new token if none exists or expired
    if (!token || !expiresAt || expiresAt <= now) {
      token = generateVerificationToken();
      await storeVerificationToken(userId, token);
    }

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9000';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    const emailSent = await sendEmailVerificationEmail(user.email, user.name, verificationUrl);

    if (emailSent) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to send email' };
    }
  } catch (error) {
    console.error('Resend verification email error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Resend verification email by email address
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user data by email
    const userResult = await sql`
      SELECT id, name, email, email_verified
      FROM users
      WHERE email = ${email}
    `;

    if (userResult.rows.length === 0) {
      return { success: false, error: 'No account found with this email address' };
    }

    const user = userResult.rows[0];

    if (user.email_verified) {
      return { success: false, error: 'Email already verified' };
    }

    // Use the existing function to resend
    return await resendVerificationEmailById(user.id);
  } catch (error) {
    console.error('Resend verification email by email error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// ============================================
// CODE-BASED VERIFICATION FUNCTIONS
// ============================================

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store verification code for user
 */
export async function storeVerificationCode(userId: number, code: string): Promise<void> {
  console.log(`⏰ Setting verification code expiry for user ${userId}`);

  // First ensure columns exist
  await ensureVerificationColumns();

  // Use database time for consistency - set expiry to 60 minutes from NOW()
  await sql`
    UPDATE users
    SET verification_code = ${code},
        code_expires_at = NOW() + INTERVAL '60 minutes',
        code_attempts = 0
    WHERE id = ${userId}
  `;

  // Get the actual expiry time for logging
  const expiryCheck = await sql`
    SELECT code_expires_at FROM users WHERE id = ${userId}
  `;
  const expiryTime = expiryCheck.rows[0]?.code_expires_at;

  console.log(`✅ Verification code stored for user ${userId}, expires at ${expiryTime}`);
}

/**
 * Ensure verification columns exist in database
 */
async function ensureVerificationColumns(): Promise<void> {
  try {
    // Check if columns exist
    const result = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'users' AND column_name IN ('verification_code', 'code_expires_at', 'code_attempts')
    `;

    const existingColumns = result.rows.map(r => r.column_name);

    // Add missing columns
    if (!existingColumns.includes('verification_code')) {
      await sql.query('ALTER TABLE users ADD COLUMN verification_code VARCHAR(6)');
      console.log('✅ Added verification_code column');
    }

    if (!existingColumns.includes('code_expires_at')) {
      await sql.query('ALTER TABLE users ADD COLUMN code_expires_at TIMESTAMP');
      console.log('✅ Added code_expires_at column');
    }

    if (!existingColumns.includes('code_attempts')) {
      await sql.query('ALTER TABLE users ADD COLUMN code_attempts INTEGER DEFAULT 0');
      console.log('✅ Added code_attempts column');
    }

  } catch (error) {
    console.error('Error ensuring verification columns:', error);
    // Continue anyway - the query might still work
  }
}

/**
 * Verify email with code
 */
export async function verifyEmailWithCode(userId: number, code: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    console.log(`🔍 Verifying code for user ${userId}: ${code}`);

    // Get user data
    const result = await sql`
      SELECT id, name, email, verification_code, code_expires_at, code_attempts, email_verified
      FROM users
      WHERE id = ${userId}
    `;

    if (result.rows.length === 0) {
      console.log(`❌ User ${userId} not found`);
      return { success: false, error: 'User not found' };
    }

    const user = result.rows[0];
    console.log(`📋 User data:`, {
      id: user.id,
      email: user.email,
      email_verified: user.email_verified,
      verification_code: user.verification_code,
      code_expires_at: user.code_expires_at,
      code_attempts: user.code_attempts
    });

    // Check if already verified
    if (user.email_verified) {
      console.log(`❌ Email already verified for user ${userId}`);
      return { success: false, error: 'Email already verified' };
    }

    // Check attempts (max 5)
    if (user.code_attempts >= 5) {
      console.log(`❌ Too many failed attempts for user ${userId}: ${user.code_attempts}`);
      return { success: false, error: 'Too many failed attempts. Request a new code.' };
    }

    // Check if code expired - use database time to avoid timezone issues
    const expiredCheck = await sql`
      SELECT code_expires_at < NOW() as is_expired
      FROM users
      WHERE id = ${userId}
    `;
    const isExpired = expiredCheck.rows[0].is_expired;

    console.log(`⏰ Code expires at: ${user.code_expires_at}, is expired: ${isExpired}`);

    if (isExpired) {
      console.log(`❌ Code expired for user ${userId}`);
      return { success: false, error: 'Verification code has expired' };
    }

    // Check code match
    console.log(`🔍 Comparing codes: input "${code}" vs stored "${user.verification_code}"`);
    if (user.verification_code !== code) {
      console.log(`❌ Code mismatch for user ${userId}`);
      // Increment attempts
      await sql`
        UPDATE users
        SET code_attempts = code_attempts + 1
        WHERE id = ${userId}
      `;
      return { success: false, error: 'Invalid verification code' };
    }

    console.log(`✅ Code verified successfully for user ${userId}`);

    // Mark email as verified and clear code
    await sql`
      UPDATE users
      SET email_verified = true,
          verification_code = NULL,
          code_expires_at = NULL,
          code_attempts = 0
      WHERE id = ${userId}
    `;

    console.log(`✅ Email marked as verified for user ${userId}`);

    return { success: true, user };
  } catch (error) {
    console.error('Code verification error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Send verification code email
 */
export async function sendVerificationCodeEmail(
  userEmail: string,
  userName: string,
  verificationCode: string
): Promise<boolean> {
  // Dynamic import to avoid client-side issues
  const { sendEmail } = await import('./email-service');

  const subject = 'Je verificatie code - DatingAssistent';
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verificatie Code - DatingAssistent</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
          .content { padding: 20px !important; }
          .code-box { font-size: 28px !important; padding: 20px 24px !important; letter-spacing: 4px !important; }
        }
      </style>
    </head>
    <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 20px 0; background-color: #F2F2F2;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F2F2F2">
        <tr>
          <td align="center" style="padding: 20px;">
            <!-- Main Container -->
            <table class="container" width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFFFFF" style="border-radius: 8px; overflow: hidden; border: 1px solid #E5E5E5;">
              <!-- Header -->
              <tr>
                <td style="padding: 30px; text-align: center; border-bottom: 1px solid #E5E5E5;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <!-- Logo -->
                        <table border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="vertical-align: middle; padding-right: 12px;">
                              <svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 180C100 180 20 120 20 70C20 50 30 30 50 30C70 30 85 45 100 60C115 45 130 30 150 30C170 30 180 50 180 70C180 120 100 180 100 180Z" fill="#E14874" stroke="#E14874" strokeWidth="8" strokeLinejoin="round"/>
                                <g transform="translate(60, 60) rotate(-45 50 50)">
                                  <line x1="30" y1="50" x2="120" y2="50" stroke="#E14874" strokeWidth="12" strokeLinecap="round"/>
                                  <path d="M115 35 L135 50 L115 65" fill="none" stroke="#E14874" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M35 40 L25 50 L35 60" fill="none" stroke="#E14874" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                                </g>
                              </svg>
                            </td>
                            <td style="vertical-align: middle;">
                              <span style="font-size: 24px; font-weight: 700; color: #E14874;">Dating</span>
                              <span style="font-size: 24px; font-weight: 700; color: #1a1a1a;">Assistent</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-bottom: 16px;">
                        <span style="font-size: 16px; color: #6b7280;">Verificatie Code</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <!-- Greeting -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="padding-bottom: 16px;">
                        <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #1a1a1a; line-height: 1.4;">
                          Hallo ${userName}!
                        </h2>
                      </td>
                    </tr>

                    <!-- Message -->
                    <tr>
                      <td style="padding-bottom: 32px;">
                        <p style="margin: 0; font-size: 16px; line-height: 24px; color: #374151;">
                          Welkom bij DatingAssistent! Om je account te activeren en te zorgen voor een veilige community, voer deze verificatie code in:
                        </p>
                      </td>
                    </tr>

                    <!-- Code Container -->
                    <tr>
                      <td align="center" style="padding: 40px 0;">
                        <table border="0" cellspacing="0" cellpadding="0" bgcolor="#FAFAFA" style="border-radius: 12px; border: 1px solid #F3F4F6;">
                          <tr>
                            <td style="padding: 32px;">
                              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                  <td align="center" style="padding-bottom: 24px;">
                                    <span style="font-size: 16px; color: #6b7280; font-weight: 500;">Je verificatie code is:</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td align="center">
                                    <div style="display: inline-block; background-color: #ef4444; color: #ffffff; padding: 24px 32px; border-radius: 12px; font-size: 36px; font-weight: 700; letter-spacing: 8px; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);">
                                      ${verificationCode}
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Warning -->
                    <tr>
                      <td style="padding: 32px 0;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FEF2F2" style="border-radius: 12px; border: 1px solid #ef4444;">
                          <tr>
                            <td style="padding: 20px;">
                              <span style="color: #dc2626; font-size: 14px; font-weight: 500; line-height: 1.5;">
                                ⏰ Deze code verloopt over 60 minuten. Deel deze code niet met anderen.
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 30px; background-color: #F9FAFB; border-top: 1px solid #F3F4F6; text-align: center;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="padding-bottom: 10px;">
                        <span style="font-size: 12px; color: #6b7280; line-height: 1.4;">
                          Niet aangevraagd? Negeer deze email.
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 10px;">
                        <a href="mailto:support@datingassistent.nl" style="color: #ef4444; text-decoration: none; font-weight: 500;">
                          support@datingassistent.nl
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 10px; border-top: 1px solid #F3F4F6;">
                      <span style="font-size: 12px; color: #9ca3af;">
                        © 2025 DatingAssistent. Alle rechten voorbehouden.
                      </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
    Verificatie Code - DatingAssistent

    Hallo ${userName}!

    Welkom bij DatingAssistent! Om je account te activeren, voer deze verificatie code in:

    Je verificatie code is: ${verificationCode}

    Deze code verloopt over 60 minuten. Deel deze code niet met anderen.

    Niet aangevraagd? Negeer deze email.

    Heb je vragen? support@datingassistent.nl

    ---
    DatingAssistent - Dé dating coach die altijd beschikbaar is
    Dashboard: https://datingassistent.nl/dashboard
    Privacy: https://datingassistent.nl/privacy
  `;

  return sendEmail({
    to: userEmail,
    from: 'noreply@datingassistent.nl',
    subject,
    html: htmlContent,
    text: textContent
  });
}

/**
 * Resend verification code
 */
export async function resendVerificationCode(userId: number): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user data
    const userResult = await sql`
      SELECT name, email, email_verified
      FROM users
      WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const user = userResult.rows[0];

    if (user.email_verified) {
      return { success: false, error: 'Email already verified' };
    }

    // Generate new code
    const newCode = generateVerificationCode();
    await storeVerificationCode(userId, newCode);

    // Send email
    const emailSent = await sendVerificationCodeEmail(user.email, user.name, newCode);

    if (emailSent) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to send email' };
    }
  } catch (error) {
    console.error('Resend verification code error:', error);
    return { success: false, error: 'Internal server error' };
  }
}