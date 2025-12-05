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
 * Send email verification email using React Email template
 */
export async function sendEmailVerificationEmail(
  userEmail: string,
  userName: string,
  verificationUrl: string
): Promise<boolean> {
  // Dynamic imports to avoid client-side issues
  const { sendEmail } = await import('./email-service');
  const { render } = await import('@react-email/components');
  const { default: VerificationEmail } = await import('@/emails/verification-email');

  try {
    const html = await render(
      VerificationEmail({
        firstName: userName,
        verificationCode: '', // Not used for link-based verification
        verificationUrl,
        expiresIn: '24 uur',
      }),
      { pretty: true }
    );

    const textContent = `
Verificeer je emailadres - DatingAssistent

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
    `.trim();

    return sendEmail({
      to: userEmail,
      from: 'noreply@datingassistent.nl',
      subject: 'Verifieer je emailadres - DatingAssistent',
      html,
      text: textContent
    });
  } catch (error) {
    console.error('Error rendering verification email:', error);
    return false;
  }
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
 * Send verification code email using React Email template
 */
export async function sendVerificationCodeEmail(
  userEmail: string,
  userName: string,
  verificationCode: string
): Promise<boolean> {
  // Dynamic imports to avoid client-side issues
  const { sendEmail } = await import('./email-service');
  const { render } = await import('@react-email/components');
  const { default: VerificationEmail } = await import('@/emails/verification-email');

  try {
    const html = await render(
      VerificationEmail({
        firstName: userName,
        verificationCode,
        expiresIn: '60 minuten',
      }),
      { pretty: true }
    );

    const textContent = `
Verificatie Code - DatingAssistent

Hallo ${userName}!

Welkom bij DatingAssistent! Om je account te activeren, voer deze verificatie code in:

Je verificatie code is: ${verificationCode}

Deze code verloopt over 60 minuten. Deel deze code niet met anderen.

Niet aangevraagd? Negeer deze email.

Heb je vragen? support@datingassistent.nl

---
DatingAssistent - De dating coach die altijd beschikbaar is
    `.trim();

    return sendEmail({
      to: userEmail,
      from: 'noreply@datingassistent.nl',
      subject: `Je verificatie code: ${verificationCode}`,
      html,
      text: textContent
    });
  } catch (error) {
    console.error('Error rendering verification email:', error);
    return false;
  }
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