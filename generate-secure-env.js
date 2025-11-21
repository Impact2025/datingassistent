#!/usr/bin/env node

/**
 * Generate secure environment variables for production deployment
 * Run with: node generate-secure-env.js
 */

const crypto = require('crypto');

// Generate a secure JWT secret (64 characters)
function generateJWTSecret() {
  return crypto.randomBytes(32).toString('hex');
}

// Generate a secure webhook secret
function generateWebhookSecret() {
  return crypto.randomBytes(32).toString('base64');
}

// Generate a secure API key rotation salt
function generateRotationSalt() {
  return crypto.randomBytes(16).toString('hex');
}

console.log('🔐 SECURE ENVIRONMENT VARIABLES GENERATOR');
console.log('==========================================\n');

console.log('# JWT Authentication');
console.log(`JWT_SECRET="${generateJWTSecret()}"\n`);

console.log('# Webhook Security');
console.log(`MULTISAFEPAY_WEBHOOK_SECRET="${generateWebhookSecret()}"\n`);

console.log('# API Key Rotation (for future use)');
console.log(`API_KEY_ROTATION_SALT="${generateRotationSalt()}"\n`);

console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('1. Never commit these values to version control');
console.log('2. Use different values for staging/production environments');
console.log('3. Rotate these secrets regularly (every 90 days)');
console.log('4. Store securely in your deployment platform (Vercel, Railway, etc.)');
console.log('5. Never share these values with unauthorized personnel\n');

console.log('✅ Copy these values to your production .env file');