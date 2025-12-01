/**
 * Comprehensive input validation and sanitization for DatingAssistent
 * Protects against XSS, SQL injection, and other common attacks
 */

import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

export interface ValidationResult {
  isValid: boolean;
  sanitized?: any;
  errors: string[];
}

export interface ValidationRule {
  type: 'string' | 'email' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedValues?: any[];
  customValidator?: (value: any) => boolean | string;
  sanitize?: boolean;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

/**
 * Input validation and sanitization class
 */
export class InputValidator {
  private static readonly MAX_STRING_LENGTH = 10000;
  private static readonly MAX_ARRAY_LENGTH = 100;

  /**
   * Validate and sanitize input data against a schema
   */
  static validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: string[] = [];
    const sanitized: any = {};

    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field];
      const fieldErrors = this.validateField(field, value, rule);

      if (fieldErrors.length > 0) {
        errors.push(...fieldErrors);
        continue;
      }

      // Sanitize the value if validation passed
      if (value !== undefined) {
        sanitized[field] = this.sanitizeValue(value, rule);
      }
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  /**
   * Validate a single field
   */
  private static validateField(field: string, value: any, rule: ValidationRule): string[] {
    const errors: string[] = [];

    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is verplicht`);
      return errors; // Don't continue validation for required fields that are missing
    }

    // Skip further validation if value is not provided and not required
    if (value === undefined || value === null) {
      return errors;
    }

    // Type validation
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${field} moet een tekst zijn`);
        } else {
          // Length validation
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(`${field} moet minimaal ${rule.minLength} karakters bevatten`);
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${field} mag maximaal ${rule.maxLength} karakters bevatten`);
          }
          if (rule.maxLength && value.length > this.MAX_STRING_LENGTH) {
            errors.push(`${field} is te lang (maximum ${this.MAX_STRING_LENGTH} karakters)`);
          }

          // Pattern validation
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${field} heeft een ongeldig formaat`);
          }
        }
        break;

      case 'email':
        if (typeof value !== 'string' || !validator.isEmail(value)) {
          errors.push(`${field} moet een geldig e-mailadres zijn`);
        }
        break;

      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          errors.push(`${field} moet een nummer zijn`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          errors.push(`${field} moet een boolean waarde zijn`);
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`${field} moet een array zijn`);
        } else if (value.length > this.MAX_ARRAY_LENGTH) {
          errors.push(`${field} array is te groot (maximum ${this.MAX_ARRAY_LENGTH} items)`);
        }
        break;

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors.push(`${field} moet een object zijn`);
        }
        break;
    }

    // Allowed values validation
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      errors.push(`${field} heeft een ongeldige waarde`);
    }

    // Custom validation
    if (rule.customValidator) {
      const customResult = rule.customValidator(value);
      if (customResult !== true) {
        const errorMsg = typeof customResult === 'string' ? customResult : `${field} validatie mislukt`;
        errors.push(errorMsg);
      }
    }

    return errors;
  }

  /**
   * Sanitize a value based on its rule
   */
  private static sanitizeValue(value: any, rule: ValidationRule): any {
    if (!rule.sanitize) {
      return value;
    }

    switch (rule.type) {
      case 'string':
        // HTML sanitization to prevent XSS
        return DOMPurify.sanitize(value, {
          ALLOWED_TAGS: [], // No HTML tags allowed
          ALLOWED_ATTR: []
        }).trim();

      case 'email':
        return validator.normalizeEmail(value) || value;

      case 'array':
        return Array.isArray(value)
          ? value.map(item => typeof item === 'string' ? DOMPurify.sanitize(item, { ALLOWED_TAGS: [] }) : item)
          : value;

      default:
        return value;
    }
  }

  /**
   * Predefined validation schemas for common use cases
   */
  static readonly schemas = {
    userRegistration: {
      name: { type: 'string', required: true, minLength: 2, maxLength: 50, sanitize: true },
      email: { type: 'email', required: true, sanitize: true },
      password: {
        type: 'string',
        required: true,
        minLength: 8,
        maxLength: 128,
        customValidator: (value: string) => {
          // Check for password strength
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasNumbers = /\d/.test(value);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

          if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            return 'Wachtwoord moet minimaal 8 karakters bevatten met hoofdletters, kleine letters, cijfers en speciale karakters';
          }
          return true;
        }
      }
    } as ValidationSchema,

    assessmentSubmission: {
      assessmentId: { type: 'string', required: true, pattern: /^[a-zA-Z0-9-_]+$/ },
      responses: {
        type: 'array',
        required: true,
        customValidator: (value: any[]) => {
          if (!Array.isArray(value)) return false;
          return value.every(item =>
            typeof item === 'object' &&
            typeof item.questionId === 'number' &&
            typeof item.value === 'number' &&
            item.value >= 1 && item.value <= 5
          );
        }
      },
      microIntake: {
        type: 'object',
        required: true,
        customValidator: (value: any) => {
          return typeof value === 'object' &&
                 typeof value.laatsteRelatie === 'string' &&
                 typeof value.emotioneelHerstel === 'number' &&
                 typeof value.stressNiveau === 'number';
        }
      }
    } as ValidationSchema,

    profileUpdate: {
      name: { type: 'string', minLength: 2, maxLength: 50, sanitize: true },
      bio: { type: 'string', maxLength: 500, sanitize: true },
      age: { type: 'number', min: 18, max: 100 },
      location: { type: 'string', maxLength: 100, sanitize: true },
      interests: {
        type: 'array',
        maxLength: 20,
        customValidator: (value: string[]) => {
          return Array.isArray(value) && value.every(item => typeof item === 'string' && item.length <= 50);
        }
      }
    } as ValidationSchema,

    messageSend: {
      recipientId: { type: 'string', required: true, pattern: /^[a-zA-Z0-9-_]+$/ },
      content: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 1000,
        sanitize: true,
        customValidator: (value: string) => {
          // Check for spam patterns
          const spamPatterns = [
            /(.)\1{10,}/, // Repeated characters
            /https?:\/\//gi, // URLs (might be allowed in some cases)
            /<script/i, // Script tags
          ];

          for (const pattern of spamPatterns) {
            if (pattern.test(value)) {
              return 'Bericht bevat ongeldige inhoud';
            }
          }
          return true;
        }
      }
    } as ValidationSchema,

    feedbackSubmission: {
      type: { type: 'string', required: true, allowedValues: ['bug', 'feature', 'improvement', 'other'] },
      title: { type: 'string', required: true, minLength: 5, maxLength: 100, sanitize: true },
      description: { type: 'string', required: true, minLength: 10, maxLength: 1000, sanitize: true },
      severity: { type: 'string', allowedValues: ['low', 'medium', 'high', 'critical'] },
      userAgent: { type: 'string', maxLength: 500 },
      url: { type: 'string', maxLength: 500 }
    } as ValidationSchema
  };
}

/**
 * SQL injection prevention utilities
 */
export class SQLSanitizer {
  static escapeString(value: string): string {
    return value.replace(/'/g, "''").replace(/\\/g, "\\\\");
  }

  static isSafeIdentifier(identifier: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier);
  }

  static validateQueryParameters(params: any[]): boolean {
    return params.every(param => {
      if (typeof param === 'string') {
        // Check for SQL injection patterns
        const dangerousPatterns = [
          /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
          /(-{2}|\/\*|\*\/)/, // Comments
          /('|(\\x27)|(\\x2D))/i // Quotes and dashes
        ];

        return !dangerousPatterns.some(pattern => pattern.test(param));
      }
      return true;
    });
  }
}

/**
 * XSS protection utilities
 */
export class XSSProtector {
  static sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: []
    });
  }

  static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeHTML(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }
}

/**
 * File upload validation
 */
export class FileValidator {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  static validateImage(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push('Bestand is te groot (maximum 10MB)');
    }

    // Check file type
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.push('Bestandstype niet toegestaan. Gebruik JPEG, PNG, WebP of GIF');
    }

    // Check file extension matches type
    const extension = file.name.split('.').pop()?.toLowerCase();
    const typeToExt: Record<string, string> = {
      'image/jpeg': 'jpg,jpeg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif'
    };

    if (extension && typeToExt[file.type] && !typeToExt[file.type].includes(extension)) {
      errors.push('Bestandsextensie komt niet overeen met bestandstype');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async validateImageContent(file: File): Promise<{ isValid: boolean; errors: string[] }> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        // Check dimensions (prevent extremely large images)
        if (img.width > 5000 || img.height > 5000) {
          resolve({
            isValid: false,
            errors: ['Afbeelding is te groot (maximum 5000x5000 pixels)']
          });
          return;
        }

        resolve({ isValid: true, errors: [] });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          isValid: false,
          errors: ['Ongeldig afbeeldingsbestand']
        });
      };

      img.src = url;
    });
  }
}