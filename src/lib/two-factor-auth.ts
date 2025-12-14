/**
 * TWO-FACTOR AUTHENTICATION (2FA)
 * TOTP-based 2FA using speakeasy
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export interface TwoFactorSecret {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export async function generateTwoFactorSecret(
  userEmail: string,
  issuer: string = 'DatingAssistent'
): Promise<TwoFactorSecret> {
  const secret = speakeasy.generateSecret({
    name: `${issuer} (${userEmail})`,
    issuer: issuer,
    length: 32,
  });

  if (!secret.otpauth_url) {
    throw new Error('Failed to generate OTP auth URL');
  }

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  const backupCodes = generateBackupCodes();

  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes,
  };
}

export function verifyTwoFactorToken(
  secret: string,
  token: string,
  window: number = 1
): { isValid: boolean; message?: string } {
  const normalizedToken = token.replace(/\s/g, '');

  if (!/^\d{6}$/.test(normalizedToken)) {
    return {
      isValid: false,
      message: 'Token moet 6 cijfers zijn',
    };
  }

  const isValid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: normalizedToken,
    window,
  });

  return {
    isValid,
    message: isValid ? 'Token is geldig' : 'Token is ongeldig of verlopen',
  };
}

function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = Array.from({ length: 8 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 32))
    ).join('');
    codes.push(code.slice(0, 4) + '-' + code.slice(4));
  }
  return codes;
}

export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  const bcrypt = await import('bcryptjs');
  return Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
}
