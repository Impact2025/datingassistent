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

// =============================================================================
// BACKUP CODES
// =============================================================================

/**
 * Generate 10 backup codes for account recovery
 * Format: XXXX-XXXX (8 chars, easy to read/type)
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion

  for (let i = 0; i < count; i++) {
    let code = '';
    for (let j = 0; j < 8; j++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
      if (j === 3) code += '-'; // Add dash in middle
    }
    codes.push(code);
  }

  return codes;
}

/**
 * Hash a backup code for secure storage
 */
export async function hashBackupCode(code: string): Promise<string> {
  const normalizedCode = code.toUpperCase().replace(/-/g, '');
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedCode);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a backup code against stored hashes
 */
export async function verifyBackupCode(
  inputCode: string,
  hashedCodes: string[]
): Promise<{ valid: boolean; usedIndex: number }> {
  const inputHash = await hashBackupCode(inputCode);

  for (let i = 0; i < hashedCodes.length; i++) {
    if (hashedCodes[i] === inputHash) {
      return { valid: true, usedIndex: i };
    }
  }

  return { valid: false, usedIndex: -1 };
}

/**
 * Validate backup code format (XXXX-XXXX or XXXXXXXX)
 */
export function isValidBackupCode(code: string): boolean {
  const normalized = code.toUpperCase().replace(/-/g, '');
  return /^[A-Z2-9]{8}$/.test(normalized);
}