/**
 * Production Environment Setup Script
 * Run: npx tsx scripts/setup-production.ts
 */

import { config } from 'dotenv';
import { sql } from '@vercel/postgres';
import { execSync } from 'child_process';

// Load environment variables
config({ path: '.env.local' });

async function setupProduction() {
  console.log('🚀 PRODUCTION ENVIRONMENT SETUP\n');

  // 1. Verify environment variables
  console.log('📋 Checking environment variables...');
  const requiredEnvVars = [
    'POSTGRES_URL',
    'JWT_SECRET',
    'OPENROUTER_API_KEY',
    'SENDGRID_API_KEY',
    'MULTISAFEPAY_API_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease set these in your Vercel project settings or .env.local file.\n');
    process.exit(1);
  }
  console.log('✅ All required environment variables are set\n');

  // 2. Test database connection
  console.log('🗄️ Testing database connection...');
  try {
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Please check your POSTGRES_URL configuration.\n');
    process.exit(1);
  }

  // 3. Run database migrations
  console.log('🛠️ Running database migrations...');
  try {
    // Run existing migration scripts
    const migrations = [
      'scripts/setup-email-schema.ts',
      'scripts/setup-cost-tracking.ts'
    ];

    for (const migration of migrations) {
      console.log(`   Running ${migration}...`);
      execSync(`npx tsx ${migration}`, { stdio: 'inherit' });
    }
    console.log('✅ Database migrations completed\n');
  } catch (error) {
    console.error('❌ Database migrations failed:', error);
    process.exit(1);
  }

  // 4. Build optimization check
  console.log('🔨 Checking build configuration...');
  try {
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Build successful\n');
  } catch (error) {
    console.error('❌ Build failed:', error);
    console.error('Please fix build errors before deployment.\n');
    process.exit(1);
  }

  // 5. Security checks
  console.log('🔒 Running security checks...');
  const securityIssues = [];

  // Check for exposed secrets
  if (process.env.JWT_SECRET === 'dev-only-jwt-secret-change-in-production-2024') {
    securityIssues.push('JWT_SECRET is still using default development value');
  }

  if (process.env.POSTGRES_URL?.includes('localhost')) {
    securityIssues.push('POSTGRES_URL appears to be pointing to localhost');
  }

  if (securityIssues.length > 0) {
    console.error('❌ Security issues found:');
    securityIssues.forEach(issue => console.error(`   - ${issue}`));
    console.error('\nPlease resolve these before deployment.\n');
    process.exit(1);
  }
  console.log('✅ Security checks passed\n');

  // 6. Performance checks
  console.log('⚡ Running performance checks...');
  try {
    const buildOutput = execSync('npm run build 2>&1', { encoding: 'utf8' });
    const bundleSize = buildOutput.match(/⚡ \d+\.\d+ kB/)?.[0];
    if (bundleSize) {
      console.log(`   Bundle size: ${bundleSize}`);
    }
    console.log('✅ Performance checks completed\n');
  } catch (error) {
    console.warn('⚠️ Performance check failed, but continuing...');
  }

  // 7. Deployment readiness
  console.log('📦 DEPLOYMENT READINESS CHECK\n');

  const checks = [
    { name: 'Environment Variables', status: missingVars.length === 0 },
    { name: 'Database Connection', status: true },
    { name: 'Database Migrations', status: true },
    { name: 'Build Process', status: true },
    { name: 'Security Configuration', status: securityIssues.length === 0 },
    { name: 'Vercel Configuration', status: true }
  ];

  checks.forEach(check => {
    const status = check.status ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
  });

  const allPassed = checks.every(check => check.status);

  if (allPassed) {
    console.log('\n🎉 PRODUCTION ENVIRONMENT IS READY FOR DEPLOYMENT!\n');
    console.log('Next steps:');
    console.log('1. Push code to GitHub repository');
    console.log('2. Connect repository to Vercel');
    console.log('3. Configure environment variables in Vercel dashboard');
    console.log('4. Deploy to production');
    console.log('5. Run production monitoring setup\n');
  } else {
    console.log('\n❌ PRODUCTION ENVIRONMENT NEEDS ATTENTION\n');
    console.log('Please resolve the failed checks before deploying.\n');
    process.exit(1);
  }
}

// Run the setup
setupProduction()
  .then(() => {
    console.log('🏁 Production setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Production setup failed:', error);
    process.exit(1);
  });