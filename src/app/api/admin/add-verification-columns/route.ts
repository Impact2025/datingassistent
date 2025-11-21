import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Adding verification columns to database...');

    // Add verification code columns
    try {
      await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6)');
      console.log('✅ Added verification_code');
    } catch (error) {
      console.log('⚠️ verification_code error:', error);
    }

    try {
      await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP');
      console.log('✅ Added code_expires_at');
    } catch (error) {
      console.log('⚠️ code_expires_at error:', error);
    }

    try {
      await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS code_attempts INTEGER DEFAULT 0');
      console.log('✅ Added code_attempts');
    } catch (error) {
      console.log('⚠️ code_attempts error:', error);
    }

    // Add trial columns
    try {
      await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_status VARCHAR(20) DEFAULT \'not_started\'');
      console.log('✅ Added trial_status');
    } catch (error) {
      console.log('⚠️ trial_status error:', error);
    }

    try {
      await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP');
      console.log('✅ Added trial_start_date');
    } catch (error) {
      console.log('⚠️ trial_start_date error:', error);
    }

    try {
      await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP');
      console.log('✅ Added trial_end_date');
    } catch (error) {
      console.log('⚠️ trial_end_date error:', error);
    }

    try {
      await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_day INTEGER DEFAULT 0');
      console.log('✅ Added trial_day');
    } catch (error) {
      console.log('⚠️ trial_day error:', error);
    }

    // Create indexes
    try {
      await sql.query('CREATE INDEX IF NOT EXISTS idx_verification_code ON users(verification_code)');
      console.log('✅ Created verification_code index');
    } catch (error) {
      console.log('⚠️ index error:', error);
    }

    try {
      await sql.query('CREATE INDEX IF NOT EXISTS idx_code_expires_at ON users(code_expires_at)');
      console.log('✅ Created code_expires_at index');
    } catch (error) {
      console.log('⚠️ index error:', error);
    }

    console.log('✅ Database migration completed successfully!');

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