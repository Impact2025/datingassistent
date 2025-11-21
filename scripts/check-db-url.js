require('dotenv').config({ path: '.env' });

console.log('\n🔍 Database URLs in environment:\n');
console.log('POSTGRES_URL:', process.env.POSTGRES_URL?.substring(0, 60) + '...');
console.log('POSTGRES_PRISMA_URL:', process.env.POSTGRES_PRISMA_URL?.substring(0, 60) + '...');
console.log('POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING?.substring(0, 60) + '...');
console.log('\n');

const { sql } = require('@vercel/postgres');

async function checkConnection() {
  try {
    const result = await sql`SELECT current_database(), current_user`;
    console.log('✅ Connected to database:');
    console.log('   Database:', result.rows[0].current_database);
    console.log('   User:', result.rows[0].current_user);
    console.log('\n');

    const userCount = await sql`SELECT COUNT(*) FROM users`;
    console.log('📊 User count:', userCount.rows[0].count);
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Connection error:', error);
    process.exit(1);
  }
}

checkConnection();
