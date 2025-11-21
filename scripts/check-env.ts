#!/usr/bin/env tsx

/**
 * Environment Variables Checker
 *
 * This script validates that all required environment variables are set
 * and properly configured before deployment.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface EnvCheck {
  name: string;
  required: boolean;
  validate?: (value: string) => { valid: boolean; message?: string };
  description: string;
}

const envChecks: EnvCheck[] = [
  {
    name: 'POSTGRES_URL',
    required: true,
    validate: (value) => ({
      valid: value.startsWith('postgresql://'),
      message: 'Must be a PostgreSQL connection string',
    }),
    description: 'PostgreSQL database connection (pooled)',
  },
  {
    name: 'POSTGRES_PRISMA_URL',
    required: true,
    validate: (value) => ({
      valid: value.startsWith('postgresql://'),
      message: 'Must be a PostgreSQL connection string',
    }),
    description: 'PostgreSQL database connection for Prisma',
  },
  {
    name: 'POSTGRES_URL_NON_POOLING',
    required: true,
    validate: (value) => ({
      valid: value.startsWith('postgresql://'),
      message: 'Must be a PostgreSQL connection string',
    }),
    description: 'PostgreSQL database connection (non-pooled)',
  },
  {
    name: 'JWT_SECRET',
    required: true,
    validate: (value) => {
      if (value === 'your-secret-key-change-in-production' ||
          value === 'CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_MIN_32_CHARS') {
        return { valid: false, message: 'Using default/placeholder value - MUST BE CHANGED!' };
      }
      if (value.length < 32) {
        return { valid: false, message: 'Must be at least 32 characters long' };
      }
      return { valid: true };
    },
    description: 'JWT secret for authentication',
  },
  {
    name: 'SENDGRID_API_KEY',
    required: true,
    validate: (value) => {
      if (value === 'your_sendgrid_api_key') {
        return { valid: false, message: 'Using placeholder value' };
      }
      if (!value.startsWith('SG.')) {
        return { valid: false, message: 'Must start with "SG."' };
      }
      return { valid: true };
    },
    description: 'SendGrid API key for sending emails',
  },
  {
    name: 'OPENROUTER_API_KEY',
    required: false,
    validate: (value) => {
      if (value === 'your_openrouter_api_key') {
        return { valid: false, message: 'Using placeholder value' };
      }
      return { valid: true };
    },
    description: 'OpenRouter API key for AI services (optional)',
  },
  {
    name: 'MULTISAFEPAY_API_KEY',
    required: true,
    validate: (value) => {
      if (value === 'your_multisafepay_api_key' ||
          value === 'jouw_echte_multisafepay_api_sleutel_hier') {
        return { valid: false, message: 'Using placeholder value - MUST BE CHANGED!' };
      }
      return { valid: true };
    },
    description: 'MultiSafePay API key for payment processing',
  },
  {
    name: 'NEXT_PUBLIC_MSP_TEST_MODE',
    required: true,
    validate: (value) => ({
      valid: value === 'true' || value === 'false',
      message: 'Must be "true" or "false"',
    }),
    description: 'MultiSafePay test mode flag',
  },
  {
    name: 'NEXT_PUBLIC_BASE_URL',
    required: true,
    validate: (value) => ({
      valid: value.startsWith('http://') || value.startsWith('https://'),
      message: 'Must be a valid URL starting with http:// or https://',
    }),
    description: 'Application base URL',
  },
];

console.log('🔍 Checking environment variables...\n');

let hasErrors = false;
let hasWarnings = false;
const results: Array<{
  status: 'ok' | 'warning' | 'error';
  name: string;
  message: string;
}> = [];

for (const check of envChecks) {
  const value = process.env[check.name];

  if (!value) {
    if (check.required) {
      results.push({
        status: 'error',
        name: check.name,
        message: `❌ MISSING (Required): ${check.description}`,
      });
      hasErrors = true;
    } else {
      results.push({
        status: 'warning',
        name: check.name,
        message: `⚠️  NOT SET (Optional): ${check.description}`,
      });
      hasWarnings = true;
    }
    continue;
  }

  if (check.validate) {
    const validation = check.validate(value);
    if (!validation.valid) {
      results.push({
        status: 'error',
        name: check.name,
        message: `❌ INVALID: ${validation.message || 'Failed validation'}`,
      });
      hasErrors = true;
      continue;
    }
  }

  results.push({
    status: 'ok',
    name: check.name,
    message: `✅ OK`,
  });
}

// Print results
for (const result of results) {
  console.log(`${result.message}`);
  console.log(`   Variable: ${result.name}\n`);
}

// Production-specific checks
if (process.env.NODE_ENV === 'production') {
  console.log('\n🔒 Production Environment Checks:\n');

  if (process.env.NEXT_PUBLIC_MSP_TEST_MODE === 'true') {
    console.log('❌ CRITICAL: MultiSafePay is in TEST mode in production!');
    console.log('   Set NEXT_PUBLIC_MSP_TEST_MODE=false for production\n');
    hasErrors = true;
  } else {
    console.log('✅ MultiSafePay test mode is disabled (production ready)\n');
  }

  if (process.env.NEXT_PUBLIC_BASE_URL?.includes('localhost')) {
    console.log('❌ CRITICAL: Base URL is set to localhost in production!');
    console.log('   Update NEXT_PUBLIC_BASE_URL to your production domain\n');
    hasErrors = true;
  } else {
    console.log('✅ Base URL is set to production domain\n');
  }

  const jwtSecret = process.env.JWT_SECRET || '';
  if (jwtSecret.length < 64) {
    console.log('⚠️  WARNING: JWT_SECRET is shorter than 64 characters');
    console.log('   Recommended to use at least 64 characters in production\n');
    hasWarnings = true;
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60) + '\n');

const okCount = results.filter(r => r.status === 'ok').length;
const warningCount = results.filter(r => r.status === 'warning').length;
const errorCount = results.filter(r => r.status === 'error').length;

console.log(`✅ OK: ${okCount}`);
console.log(`⚠️  Warnings: ${warningCount}`);
console.log(`❌ Errors: ${errorCount}\n`);

if (hasErrors) {
  console.log('❌ ENVIRONMENT CONFIGURATION FAILED');
  console.log('Fix the errors above before proceeding.\n');
  console.log('See ENV_SETUP.md for detailed setup instructions.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  ENVIRONMENT CONFIGURATION HAS WARNINGS');
  console.log('Review the warnings above.\n');
  process.exit(0);
} else {
  console.log('✅ ENVIRONMENT CONFIGURATION VALID');
  console.log('All required environment variables are properly configured!\n');
  process.exit(0);
}
