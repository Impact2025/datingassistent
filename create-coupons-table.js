#!/usr/bin/env node

/**
 * Create coupons table
 * This script creates the coupons table and adds some sample data
 */

require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const fs = require('fs');

async function createCouponsTable() {
  try {
    console.log('🔧 Creating coupons table...');

    // Read the SQL file
    const sqlContent = fs.readFileSync('create-coupons-table.sql', 'utf8');

    // Execute the SQL statements one by one
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        await sql.query(statement.trim());
      }
    }

    console.log('✅ Coupons table created successfully!');
    console.log('📊 Table includes: id, code, package_type, discount_type, discount_value, max_uses, used_count, valid_from, valid_until, is_active');
    console.log('🎁 Sample coupons added: WELCOME10, PREMIUM20, SOCIAAL5');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating coupons table:', error);
    process.exit(1);
  }
}

createCouponsTable();