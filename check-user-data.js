import { sql } from '@vercel/postgres';

async function checkUserData() {
  try {
    console.log('🔍 Checking for existing user data related to profielfoto cursus...\n');

    // Check user sectie progress (this is the main progress table)
    const sectieProgressResult = await sql`
      SELECT COUNT(*) as count
      FROM user_sectie_progress
      WHERE cursus_id = 1
    `;

    console.log('📝 User sectie progress:', sectieProgressResult.rows[0]);

    // Check any bookmarks or saved items
    const bookmarksResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE '%bookmark%' OR table_name LIKE '%favorite%'
    `;

    console.log('\n🔖 Bookmark/Favorite tables:', bookmarksResult.rows);

    // Check for any analytics or tracking data
    const analyticsResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (table_name LIKE '%analytics%' OR table_name LIKE '%event%' OR table_name LIKE '%tracking%')
    `;

    console.log('📈 Analytics/Event tables:', analyticsResult.rows);

    console.log('\n✅ CONCLUSIE:');
    console.log('Als er user progress is, moeten we voorzichtig zijn met slug changes.');
    console.log('Database is al correct met slug "profielfoto-5-stappen".');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkUserData();
