import { logger } from '@/lib/logger';
#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script initializes the database schema for the Dating Assistant application.
 * Run this script after setting up your PostgreSQL database and configuring the
 * POSTGRES_URL in your .env.local file.
 */

import { initializeDatabase } from '../lib/db-schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function setupDatabase() {
  logger.log('🚀 Setting up database...');
  
  // Check if POSTGRES_URL is configured
  if (!process.env.POSTGRES_URL || process.env.POSTGRES_URL.includes('your_')) {
    console.error('❌ Database URL not configured!');
    console.error('Please update your .env.local file with real database credentials.');
    console.error('Look for the POSTGRES_URL variable and replace the placeholder values.');
    process.exit(1);
  }

  try {
    logger.log('🔧 Initializing database schema...');
    const result = await initializeDatabase();
    logger.log('✅ Database schema initialized successfully!');
    logger.log('📋 Tables created:');
    logger.log('   - users');
    logger.log('   - user_profiles');
    logger.log('   - conversations');
    logger.log('   - messages');
    logger.log('   - photo_analyses');
    logger.log('   - usage_tracking');
    logger.log('   - subscription_history');
    logger.log('   - blog_posts');
    logger.log('   - reviews');
    logger.log('   - orders');
    logger.log('   - password_reset_tokens');
    logger.log('   - coupons');
    logger.log('   - podcasts');
    logger.log('   - waarden_kompas_sessions');
    logger.log('   - waarden_kompas_responses');
    logger.log('   - waarden_kompas_results');
    logger.log('   - waarden_kompas_integrations');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();