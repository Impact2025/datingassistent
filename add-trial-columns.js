#!/usr/bin/env node

/**
 * Add trial columns to users table
 * This script adds the missing trial management columns to the users table
 */

require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const fs = require('fs');

async function addTrialColumns() {
  try {
    console.log('🔧 Adding trial columns to users table...');

    // Read the SQL file
    const sqlContent = fs.readFileSync('add-trial-columns.sql', 'utf8');

    // Execute the SQL statements one by one
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        await sql.query(statement.trim());
      }
    }

    console.log('✅ Trial columns added successfully!');
    console.log('📊 Added columns: trial_status, trial_start_date, trial_end_date, trial_day');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding trial columns:', error);
    process.exit(1);
  }
}

addTrialColumns();