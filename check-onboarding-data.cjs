const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkOnboardingData() {
  try {
    const userIds = [177, 178, 179];

    for (const userId of userIds) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`USER ${userId} - ONBOARDING DATA`);
      console.log('='.repeat(70));

      // Check onboarding_journeys
      try {
        const journeys = await pool.query(`
          SELECT * FROM onboarding_journeys WHERE user_id = $1
        `, [userId]);
        console.log(`\nOnboarding Journeys (${journeys.rows.length}):`);
        if (journeys.rows.length > 0) {
          journeys.rows.forEach(row => {
            console.log(`  - Current step: ${row.current_step}`);
            console.log(`  - Completed steps: ${JSON.stringify(row.completed_steps)}`);
            console.log(`  - Started: ${row.started_at}`);
            console.log(`  - Updated: ${row.updated_at}`);
          });
        } else {
          console.log('  ❌ Geen journey data - gebruiker is nooit begonnen');
        }
      } catch (e) {
        console.log('  Error:', e.message);
      }

      // Check user_onboarding
      try {
        const userOnboarding = await pool.query(`
          SELECT * FROM user_onboarding WHERE user_id = $1
        `, [userId]);
        console.log(`\nUser Onboarding (${userOnboarding.rows.length}):`);
        if (userOnboarding.rows.length > 0) {
          console.log(JSON.stringify(userOnboarding.rows, null, 2));
        } else {
          console.log('  ❌ Geen onboarding data');
        }
      } catch (e) {
        console.log('  Error:', e.message);
      }

      // Check photo_analyses
      try {
        const photoAnalyses = await pool.query(`
          SELECT * FROM photo_analyses WHERE user_id = $1
        `, [userId]);
        console.log(`\nPhoto Analyses (${photoAnalyses.rows.length}):`);
        if (photoAnalyses.rows.length > 0) {
          photoAnalyses.rows.forEach(row => {
            console.log(`  - Photo ID: ${row.id}`);
            console.log(`  - Score: ${row.overall_score}`);
            console.log(`  - Created: ${row.created_at}`);
          });
        } else {
          console.log('  ❌ Geen foto\'s geanalyseerd');
        }
      } catch (e) {
        console.log('  Error:', e.message);
      }

      // Check program_enrollments
      try {
        const enrollments = await pool.query(`
          SELECT * FROM program_enrollments WHERE user_id = $1
        `, [userId]);
        console.log(`\nProgram Enrollments (${enrollments.rows.length}):`);
        if (enrollments.rows.length > 0) {
          enrollments.rows.forEach(row => {
            console.log(`  - Program: ${row.program_name}`);
            console.log(`  - Status: ${row.status}`);
            console.log(`  - Enrolled: ${row.enrolled_at}`);
          });
        } else {
          console.log('  ❌ Geen programma enrollments');
        }
      } catch (e) {
        console.log('  Error:', e.message);
      }

      // Get user basic info
      const userInfo = await pool.query(`
        SELECT
          email,
          name,
          email_verified,
          created_at,
          last_login,
          lead_onboarding_completed,
          lead_oto_shown
        FROM users WHERE id = $1
      `, [userId]);

      if (userInfo.rows.length > 0) {
        const user = userInfo.rows[0];
        console.log(`\nUser Info:`);
        console.log(`  - Email: ${user.email}`);
        console.log(`  - Name: ${user.name}`);
        console.log(`  - Email verified: ${user.email_verified ? '✅ Ja' : '❌ Nee'}`);
        console.log(`  - Created: ${user.created_at}`);
        console.log(`  - Last login: ${user.last_login || '❌ Nooit ingelogd'}`);
        console.log(`  - Lead onboarding completed: ${user.lead_onboarding_completed}`);
        console.log(`  - Lead OTO shown: ${user.lead_oto_shown}`);
      }
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkOnboardingData();
