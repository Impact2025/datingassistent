/**
 * Reset user journey to start from beginning
 * Usage: node scripts/reset-user-journey.js <userId>
 */

require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function resetJourney() {
  try {
    const args = process.argv.slice(2);

    if (args.length < 1) {
      console.log('❌ Usage: node reset-user-journey.js <userId>');
      process.exit(1);
    }

    const userId = parseInt(args[0]);

    console.log(`\n🔄 Resetting journey for user ${userId}...\n`);

    // Delete existing journey progress
    await sql`
      DELETE FROM user_journey_progress WHERE user_id = ${userId}
    `;

    console.log('✅ Journey progress cleared!');
    console.log('   User will now start onboarding from the beginning.\n');

    // Also initialize engagement if needed
    await sql`
      INSERT INTO user_engagement (
        user_id, journey_day, last_activity_date, current_streak, longest_streak, total_logins
      ) VALUES (
        ${userId}, 1, CURRENT_DATE, 1, 1, 1
      )
      ON CONFLICT (user_id) DO UPDATE SET
        journey_day = 1,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    `;

    console.log('✅ Engagement tracking initialized!');
    console.log('   Journey day: 1');
    console.log('   Streak: 1\n');

    console.log('🎯 Next step: Login en je wordt naar /onboarding gestuurd!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetJourney();
