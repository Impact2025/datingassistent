/**
 * DATABASE DATA VALIDATION
 * Validate data before inserting/updating in database
 * Prevent SQL injection, data corruption, and invalid data
 * Created: 2025-11-22
 */

import { logSecurityEvent } from '../error-logging';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: any;
}

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'date' | 'json';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  sanitize?: boolean;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate data against rules
 */
export function validate(data: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];
  const sanitized: any = { ...data };

  for (const rule of rules) {
    const value = data[rule.field];

    // Check required
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${rule.field} is required`);
      continue;
    }

    // Skip validation if optional and empty
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type validation
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${rule.field} must be a string`);
        } else {
          // Length validation
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${rule.field} must be at most ${rule.maxLength} characters`);
          }

          // Pattern validation
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${rule.field} format is invalid`);
          }

          // Sanitize if needed
          if (rule.sanitize) {
            sanitized[rule.field] = sanitizeString(value);
          }
        }
        break;

      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          errors.push(`${rule.field} must be a number`);
        } else {
          if (rule.min !== undefined && num < rule.min) {
            errors.push(`${rule.field} must be at least ${rule.min}`);
          }
          if (rule.max !== undefined && num > rule.max) {
            errors.push(`${rule.field} must be at most ${rule.max}`);
          }
          sanitized[rule.field] = num;
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false' && value !== 0 && value !== 1) {
          errors.push(`${rule.field} must be a boolean`);
        } else {
          sanitized[rule.field] = Boolean(value);
        }
        break;

      case 'email':
        if (typeof value !== 'string' || !isValidEmail(value)) {
          errors.push(`${rule.field} must be a valid email`);
        } else if (rule.sanitize) {
          sanitized[rule.field] = value.toLowerCase().trim();
        }
        break;

      case 'url':
        if (typeof value !== 'string' || !isValidURL(value)) {
          errors.push(`${rule.field} must be a valid URL`);
        }
        break;

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`${rule.field} must be a valid date`);
        } else {
          sanitized[rule.field] = date.toISOString();
        }
        break;

      case 'json':
        if (typeof value === 'string') {
          try {
            sanitized[rule.field] = JSON.parse(value);
          } catch {
            errors.push(`${rule.field} must be valid JSON`);
          }
        } else if (typeof value === 'object') {
          // Already an object, that's fine
          sanitized[rule.field] = value;
        } else {
          errors.push(`${rule.field} must be valid JSON`);
        }
        break;
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      errors.push(`${rule.field} validation failed`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitize string (prevent XSS, SQL injection)
 */
export function sanitizeString(value: string): string {
  if (typeof value !== 'string') return value;

  return value
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters (except newline and tab)
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Limit consecutive whitespace
    .replace(/\s+/g, ' ');
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Sanitize HTML (basic - use a library for complex HTML)
 */
export function sanitizeHTML(html: string): string {
  // Basic HTML sanitization - replace dangerous tags
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize SQL (prevent SQL injection)
 */
export function sanitizeSQL(value: string): string {
  // For parameterized queries, this is less critical
  // But still remove obviously dangerous patterns
  return value
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comment starts
    .replace(/\*\//g, '') // Remove multi-line comment ends
    .trim();
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if string is valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if string is valid URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Check if string is valid JSON
 */
export function isValidJSON(json: string): boolean {
  try {
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// SECURITY CHECKS
// ============================================================================

/**
 * Check for SQL injection patterns
 */
export function hasSQLInjection(value: string): boolean {
  const sqlPatterns = [
    /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|HAVING)(\s|$)/i,
    /(\s|^)(OR|AND)(\s+\d+\s*=\s*\d+)/i,
    /'(\s|^)(OR|AND)\s+/i,
    /;(\s*)DROP/i,
    /UNION(\s+ALL)?\s+SELECT/i,
  ];

  const hasSQLPattern = sqlPatterns.some(pattern => pattern.test(value));

  if (hasSQLPattern) {
    logSecurityEvent('sql-injection-attempt', 'warning', { value });
  }

  return hasSQLPattern;
}

/**
 * Check for XSS patterns
 */
export function hasXSS(value: string): boolean {
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
  ];

  const hasXSSPattern = xssPatterns.some(pattern => pattern.test(value));

  if (hasXSSPattern) {
    logSecurityEvent('xss-attempt', 'warning', { value });
  }

  return hasXSSPattern;
}

/**
 * Check for path traversal patterns
 */
export function hasPathTraversal(value: string): boolean {
  const pathTraversalPatterns = [
    /\.\.\//g,
    /\.\.\\/g,
    /%2e%2e%2f/gi,
    /%2e%2e\//gi,
  ];

  const hasPathPattern = pathTraversalPatterns.some(pattern => pattern.test(value));

  if (hasPathPattern) {
    logSecurityEvent('path-traversal-attempt', 'warning', { value });
  }

  return hasPathPattern;
}

// ============================================================================
// PRESET VALIDATION RULES
// ============================================================================

/**
 * Common validation rules for user input
 */
export const UserValidation: Record<string, ValidationRule> = {
  email: {
    field: 'email',
    type: 'email',
    required: true,
    sanitize: true,
    maxLength: 255,
  },
  password: {
    field: 'password',
    type: 'string',
    required: true,
    minLength: 8,
    maxLength: 128,
  },
  name: {
    field: 'name',
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    sanitize: true,
  },
  username: {
    field: 'username',
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
    sanitize: true,
  },
};

/**
 * Common validation rules for admin audit logs
 */
export const AuditLogValidation: Record<string, ValidationRule> = {
  userId: {
    field: 'userId',
    type: 'number',
    required: true,
    min: 1,
  },
  action: {
    field: 'action',
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    sanitize: true,
  },
  resource: {
    field: 'resource',
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 200,
    sanitize: true,
  },
  success: {
    field: 'success',
    type: 'boolean',
    required: true,
  },
};
