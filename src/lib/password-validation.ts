/**
 * Password Validation Utilities
 *
 * SECURITY: Strong password requirements to protect user accounts
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate password strength with comprehensive requirements
 *
 * Requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 * - No common patterns (e.g., "password", "123456")
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Minimum length check
  if (password.length < 12) {
    errors.push('Wachtwoord moet minimaal 12 karakters lang zijn');
  }

  // Maximum length check (prevent DoS via bcrypt)
  if (password.length > 128) {
    errors.push('Wachtwoord mag maximaal 128 karakters lang zijn');
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één hoofdletter bevatten');
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één kleine letter bevatten');
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één cijfer bevatten');
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één speciaal teken bevatten (!@#$%^&* etc.)');
  }

  // Common password patterns (case-insensitive)
  const commonPatterns = [
    'password',
    'wachtwoord',
    '12345678',
    'qwertyui',
    'abcdefgh',
    'letmein',
    'welcome',
    'admin123',
    'password123',
  ];

  const passwordLower = password.toLowerCase();
  for (const pattern of commonPatterns) {
    if (passwordLower.includes(pattern)) {
      errors.push('Wachtwoord bevat een veelgebruikt patroon en is niet veilig');
      break;
    }
  }

  // Sequential characters check (e.g., "abc", "123")
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    errors.push('Wachtwoord bevat opeenvolgende karakters (abc, 123) en is niet veilig');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get a user-friendly error message from validation result
 */
export function getPasswordErrorMessage(result: PasswordValidationResult): string {
  if (result.isValid) {
    return '';
  }

  if (result.errors.length === 1) {
    return result.errors[0];
  }

  return `Wachtwoord voldoet niet aan de eisen:\n- ${result.errors.join('\n- ')}`;
}

/**
 * Calculate password strength score (0-100)
 * Used for UI feedback
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0;

  // Length scoring (0-40 points)
  if (password.length >= 12) score += 20;
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;

  // Character variety (0-40 points)
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 10;

  // Complexity bonus (0-20 points)
  const charSets = [
    /[a-z]/,
    /[A-Z]/,
    /[0-9]/,
    /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/,
  ].filter(regex => regex.test(password)).length;

  if (charSets === 4) score += 20;
  else if (charSets === 3) score += 10;

  return Math.min(score, 100);
}

/**
 * Get password strength label for UI
 */
export function getPasswordStrengthLabel(score: number): string {
  if (score < 40) return 'Zwak';
  if (score < 60) return 'Redelijk';
  if (score < 80) return 'Sterk';
  return 'Zeer sterk';
}
