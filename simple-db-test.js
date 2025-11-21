const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing database connection...');
  
  if (!process.env.POSTGRES_URL || process.env.POSTGRES_URL.includes('YOUR_')) {
    console.error('❌ Database URL not configured!');
    console.error('Please update your .env.local file with real database credentials.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT version()');
    console.log('📊 Database version:', result.rows[0].version);
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    await client.end();
    process.exit(1);
  }
}

testConnection();