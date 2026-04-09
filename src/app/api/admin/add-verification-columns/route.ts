import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    logger.log('🔧 Adding verification columns to database...');

    // Add verification code columns
    try {
      await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6)');
      logger.log('✅ Added verification_code');
    } catch (error) {
      logger.log('⚠️ verification_code error:', error);
    }

    try {
      await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP');
      logger.log('✅ Added code_expires_at');
    } catch (error) {
      logger.log('⚠️ code_expires_at error:', error);
    }

    try {
      await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS code_attempts INTEGER DEFAULT 0');
      logger.log('✅ Added code_attempts');
    } catch (error) {
      logger.log('⚠️ code_attempts error:', error);
    }

    // Add trial columns
    try {
      await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_status VARCHAR(20) DEFAULT \'not_started\'');
      logger.log('✅ Added trial_status');
    } catch (error) {
      logger.log('⚠️ trial_status error:', error);
    }

    try {
      await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP');
      logger.log('✅ Added trial_start_date');
    } catch (error) {
      logger.log('⚠️ trial_start_date error:', error);
    }

    try {
      await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP');
      logger.log('✅ Added trial_end_date');
    } catch (error) {
      logger.log('⚠️ trial_end_date error:', error);
    }

    try {
      await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_day INTEGER DEFAULT 0');
      logger.log('✅ Added trial_day');
    } catch (error) {
      logger.log('⚠️ trial_day error:', error);
    }

    // Create indexes
    try {
      await sql.query('CREATE INDEX IF NOT EXISTS idx_verification_code ON users(verification_code)');
      logger.log('✅ Created verification_code index');
    } catch (error) {
      logger.log('⚠️ index error:', error);
    }

    try {
      await sql.query('CREATE INDEX IF NOT EXISTS idx_code_expires_at ON users(code_expires_at)');
      logger.log('✅ Created code_expires_at index');
    } catch (error) {
      logger.log('⚠️ index error:', error);
    }

    logger.log('✅ Database migration completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Verification columns added successfully'
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error },
      { status: 500 }
    );
  }
}