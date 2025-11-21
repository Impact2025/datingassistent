/**
 * 2FA (Two-Factor Authentication) utilities for admin users
 * Uses TOTP (Time-based One-Time Password) with otplib
 */

import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Configure TOTP settings
authenticator.options = {
  window: 1, // Allow 1 step before/after for clock skew
  step: 30,  // 30 second windows
};

/**
 * Generate a new TOTP secret for a user
 */
export function generateTOTPSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate a TOTP token from a secret (for testing)
 */
export function generateTOTPToken(secret: string): string {
  return authenticator.generate(secret);
}

/**
 * Verify a TOTP token against a secret
 */
export function verifyTOTPToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

/**
 * Generate QR code data URL for authenticator apps
 */
export async function generateQRCodeDataURL(secret: string, email: string, serviceName: string = 'DatingAssistent Admin'): Promise<string> {
  const otpauth = authenticator.keyuri(email, serviceName, secret);

  try {
    const dataURL = await QRCode.toDataURL(otpauth);
    return dataURL;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Validate TOTP token format (6 digits)
 */
export function isValidTOTPToken(token: string): boolean {
  return /^\d{6}$/.test(token);
}