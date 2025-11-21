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
  console.log('🚀 Setting up database...');
  
  // Check if POSTGRES_URL is configured
  if (!process.env.POSTGRES_URL || process.env.POSTGRES_URL.includes('your_')) {
    console.error('❌ Database URL not configured!');
    console.error('Please update your .env.local file with real database credentials.');
    console.error('Look for the POSTGRES_URL variable and replace the placeholder values.');
    process.exit(1);
  }

  try {
    console.log('🔧 Initializing database schema...');
    const result = await initializeDatabase();
    console.log('✅ Database schema initialized successfully!');
    console.log('📋 Tables created:');
    console.log('   - users');
    console.log('   - user_profiles');
    console.log('   - conversations');
    console.log('   - messages');
    console.log('   - photo_analyses');
    console.log('   - usage_tracking');
    console.log('   - subscription_history');
    console.log('   - blog_posts');
    console.log('   - reviews');
    console.log('   - orders');
    console.log('   - password_reset_tokens');
    console.log('   - coupons');
    console.log('   - podcasts');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();