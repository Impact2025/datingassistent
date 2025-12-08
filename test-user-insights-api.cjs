const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testQueries() {
  try {
    console.log('Testing SQL queries...\n');

    // Test 1: Overall metrics (this one works)
    console.log('1. Testing metrics query (no params)...');
    const metricsQuery = await pool.query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users
      FROM users
    `);
    console.log('✅ Metrics query works!');
    console.log('   Total users:', metricsQuery.rows[0].total_users);
    console.log('   Verified:', metricsQuery.rows[0].verified_users);
    console.log();

    // Test 2: Funnel with INTERVAL parameter
    console.log('2. Testing funnel query with INTERVAL parameter...');
    const days = 7;
    const intervalStr = `${days} days`;

    try {
      const funnelQuery = await pool.query(
        `SELECT
          COUNT(*) as registered
        FROM users
        WHERE created_at >= NOW() - INTERVAL $1`,
        [intervalStr]
      );
      console.log('✅ Funnel query works!');
      console.log('   Registered (last 7 days):', funnelQuery.rows[0].registered);
    } catch (error) {
      console.error('❌ Funnel query failed:', error.message);
      console.error('   Error detail:', error);
    }
    console.log();

    // Test 3: Alternative approach - cast interval
    console.log('3. Testing alternative with CAST...');
    try {
      const altQuery = await pool.query(
        `SELECT
          COUNT(*) as registered
        FROM users
        WHERE created_at >= NOW() - CAST($1 AS INTERVAL)`,
        [intervalStr]
      );
      console.log('✅ CAST approach works!');
      console.log('   Registered:', altQuery.rows[0].registered);
    } catch (error) {
      console.error('❌ CAST approach failed:', error.message);
    }
    console.log();

    // Test 4: Another alternative - make_interval
    console.log('4. Testing with make_interval...');
    try {
      const makeIntervalQuery = await pool.query(
        `SELECT
          COUNT(*) as registered
        FROM users
        WHERE created_at >= NOW() - make_interval(days => $1)`,
        [days]
      );
      console.log('✅ make_interval works!');
      console.log('   Registered:', makeIntervalQuery.rows[0].registered);
    } catch (error) {
      console.error('❌ make_interval failed:', error.message);
    }

    await pool.end();
    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

testQueries();
