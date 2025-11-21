require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkJourney() {
  try {
    const userId = process.argv[2] || 69;

    console.log(`\n🔍 Checking journey for user ${userId}...\n`);

    const result = await sql`
      SELECT * FROM user_journey_progress WHERE user_id = ${userId}
    `;

    if (result.rows.length === 0) {
      console.log('❌ No journey record found!');
      console.log('   This should trigger redirect to /onboarding\n');
    } else {
      console.log('✅ Journey record found:');
      console.log('   Current step:', result.rows[0].current_step);
      console.log('   Completed steps:', result.rows[0].completed_steps);
      console.log('   Started at:', result.rows[0].journey_started_at);
      console.log('   Completed at:', result.rows[0].journey_completed_at);
      console.log('\n   Full record:', result.rows[0]);
      console.log('\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkJourney();
