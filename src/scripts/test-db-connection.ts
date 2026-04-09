import { logger } from '@/lib/logger';
#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * This script tests the database connection using the POSTGRES_URL from your .env.local file.
 * Run this script to verify your database configuration is correct.
 */

import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testDatabaseConnection() {
  logger.log('🔍 Testing database connection...');
  
  // Check if POSTGRES_URL is configured
  if (!process.env.POSTGRES_URL || process.env.POSTGRES_URL.includes('your_')) {
    console.error('❌ Database URL not configured!');
    console.error('Please update your .env.local file with real database credentials.');
    console.error('Look for the POSTGRES_URL variable and replace the placeholder values.');
    process.exit(1);
  }

  try {
    logger.log('🔗 Connecting to database...');
    // Test the connection with a simple query
    const result = await sql`SELECT version()`;
    logger.log('✅ Database connection successful!');
    logger.log('📊 Database version:', result.rows[0].version);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();