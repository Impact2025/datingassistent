/**
 * ENVIRONMENT VALIDATION UTILITY
 * Validates required environment variables at runtime
 * Created: 2025-11-22
 */

interface EnvVarConfig {
  key: string;
  required: boolean;
  category: 'database' | 'auth' | 'payment' | 'email' | 'ai' | 'security' | 'other';
  description: string;
}

const ENV_VARS: EnvVarConfig[] = [
  // Database
  {
    key: 'DATABASE_URL',
    required: true,
    category: 'database',
    description: 'Neon PostgreSQL connection string'
  },
  {
    key: 'POSTGRES_URL',
    required: true,
    category: 'database',
    description: 'Neon PostgreSQL pooled connection'
  },

  // Authentication & Security
  {
    key: 'JWT_SECRET',
    required: true,
    category: 'auth',
    description: 'JWT token signing secret'
  },
  {
    key: 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
    required: false,
    category: 'security',
    description: 'Google reCAPTCHA site key'
  },
  {
    key: 'RECAPTCHA_SECRET_KEY',
    required: false,
    category: 'security',
    description: 'Google reCAPTCHA secret key'
  },

  // Payment
  {
    key: 'MULTISAFEPAY_API_KEY',
    required: true,
    category: 'payment',
    description: 'MultiSafePay API key'
  },
  {
    key: 'NEXT_PUBLIC_BASE_URL',
    required: true,
    category: 'other',
    description: 'Base URL for callbacks'
  },

  // Email
  {
    key: 'SENDGRID_API_KEY',
    required: true,
    category: 'email',
    description: 'SendGrid API key'
  },
  {
    key: 'SENDGRID_FROM_EMAIL',
    required: true,
    category: 'email',
    description: 'SendGrid from email address'
  },

  // AI Services
  {
    key: 'OPENROUTER_API_KEY',
    required: true,
    category: 'ai',
    description: 'OpenRouter API key for AI features'
  },
];

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    total: number;
    required: number;
    missing: number;
    configured: number;
  };
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let missingRequired = 0;
  let totalRequired = 0;
  let configured = 0;

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.key];

    if (envVar.required) {
      totalRequired++;
    }

    if (!value || value.trim() === '') {
      if (envVar.required) {
        missingRequired++;
        const category = envVar.category.toUpperCase();
        errors.push(
          "❌ [" + category + "] Missing required env var: " + envVar.key + " - " + envVar.description
        );
      } else {
        const category = envVar.category.toUpperCase();
        warnings.push(
          "⚠️  [" + category + "] Optional env var not set: " + envVar.key + " - " + envVar.description
        );
      }
    } else {
      configured++;

      const placeholders = [
        'your_',
        'CHANGE-THIS',
        'your-secret-key-change-in-production',
        'INSECURE',
      ];

      const hasPlaceholder = placeholders.some(p => value.includes(p));

      if (hasPlaceholder) {
        const category = envVar.category.toUpperCase();
        if (envVar.required) {
          errors.push(
            "❌ [" + category + "] " + envVar.key + " contains placeholder value - update in production!"
          );
        } else {
          warnings.push(
            "⚠️  [" + category + "] " + envVar.key + " contains placeholder value"
          );
        }
      }
    }
  }

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    summary: {
      total: ENV_VARS.length,
      required: totalRequired,
      missing: missingRequired,
      configured,
    },
  };
}

export function printValidationResults(result: ValidationResult): void {
  console.log('\n🔍 ENVIRONMENT VALIDATION REPORT');
  console.log('='.repeat(60));

  console.log('\n📊 Summary:');
  console.log('   Total variables: ' + result.summary.total);
  console.log('   Required: ' + result.summary.required);
  console.log('   Configured: ' + result.summary.configured);
  console.log('   Missing: ' + result.summary.missing);

  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS (' + result.errors.length + '):');
    result.errors.forEach(error => console.log('   ' + error));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (' + result.warnings.length + '):');
    result.warnings.forEach(warning => console.log('   ' + warning));
  }

  if (result.valid) {
    console.log('\n✅ Environment validation passed!\n');
  } else {
    console.log('\n❌ Environment validation FAILED!\n');
    console.log('   Please check .env.local and compare with .env.example\n');
  }

  console.log('='.repeat(60) + '\n');
}

export function validateEnvironmentOrThrow(): void {
  const result = validateEnvironment();
  printValidationResults(result);

  if (!result.valid) {
    throw new Error(
      'Environment validation failed with ' + result.errors.length + ' errors. Check console for details.'
    );
  }
}

export function isEnvVarValid(key: string): boolean {
  const value = process.env[key];
  if (!value || value.trim() === '') return false;

  const placeholders = ['your_', 'CHANGE-THIS', 'your-secret-key'];
  return !placeholders.some(p => value.includes(p));
}

export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];

  if (!value || value.trim() === '') {
    if (fallback !== undefined) {
      console.warn('⚠️  Using fallback for ' + key);
      return fallback;
    }
    throw new Error('Required environment variable ' + key + ' is not set');
  }

  return value;
}
