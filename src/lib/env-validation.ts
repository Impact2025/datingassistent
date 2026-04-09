import { logger } from '@/lib/logger';
/**
 * ENVIRONMENT VARIABLE VALIDATION
 *
 * SECURITY: Validates all required environment variables at application startup
 * Fails fast if critical secrets are missing to prevent runtime errors
 */

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  missingOptional: string[];
}

interface EnvVariable {
  name: string;
  required: boolean;
  description: string;
  validator?: (value: string | undefined) => boolean;
  securityLevel?: 'critical' | 'high' | 'medium' | 'low';
}

const ENV_VARIABLES: EnvVariable[] = [
  {
    name: 'JWT_SECRET',
    required: true,
    description: 'JWT secret key for authentication tokens',
    securityLevel: 'critical',
    validator: (val) => !!val && val.length >= 32,
  },
  {
    name: 'CSRF_SECRET',
    required: true,
    description: 'CSRF protection secret',
    securityLevel: 'critical',
    validator: (val) => !!val && val.length >= 32,
  },
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL database connection string',
    securityLevel: 'critical',
    validator: (val) => !!val && (val.startsWith('postgres://') || val.startsWith('postgresql://')),
  },
  {
    name: 'OPENROUTER_API_KEY',
    required: true,
    description: 'OpenRouter API key for all AI features',
    securityLevel: 'high',
    validator: (val) => !!val && val.length > 20,
  },
  {
    name: 'SENDGRID_API_KEY',
    required: true,
    description: 'SendGrid API key for email delivery',
    securityLevel: 'high',
    validator: (val) => !!val && val.startsWith('SG.'),
  },
  {
    name: 'SENDGRID_FROM_EMAIL',
    required: true,
    description: 'Verified sender email address',
    securityLevel: 'medium',
    validator: (val) => !!val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  },
  {
    name: 'NEXT_PUBLIC_BASE_URL',
    required: true,
    description: 'Base URL for the application',
    securityLevel: 'medium',
    validator: (val) => !!val && (val.startsWith('http://') || val.startsWith('https://')),
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    description: 'Stripe secret key for payment processing',
    securityLevel: 'high',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    description: 'Stripe webhook signing secret',
    securityLevel: 'high',
  },
];

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  const isProduction = process.env.NODE_ENV === 'production';

  for (const envVar of ENV_VARIABLES) {
    const value = process.env[envVar.name];
    const isMissing = !value || value === '';

    if (envVar.required && isMissing) {
      missingRequired.push(envVar.name);
      errors.push(`CRITICAL: ${envVar.name} is required but not set. ${envVar.description}`);
      continue;
    }

    if (value && envVar.validator && !envVar.validator(value)) {
      errors.push(`INVALID: ${envVar.name} has an invalid value. ${envVar.description}`);
    }
  }

  const isValid = errors.length === 0 && missingRequired.length === 0;

  return {
    isValid,
    errors,
    warnings,
    missingRequired,
    missingOptional,
  };
}

export function assertValidEnvironment(): void {
  const result = validateEnvironment();

  if (!result.isValid) {
    console.error('\nENVIRONMENT VALIDATION FAILED');
    console.error('================================\n');
    result.errors.forEach(e => console.error(e));
    console.error('\nAPPLICATION STARTUP BLOCKED');
    throw new Error(`Environment validation failed: ${result.missingRequired.length} required variables missing`);
  }

  logger.log('Environment validation passed');
}
