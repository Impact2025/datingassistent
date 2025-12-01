const { sql } = require('@vercel/postgres');

async function checkData() {
  console.log('🔍 Checking cursus data in database...\n');

  try {
    // Check cursussen
    const cursussen = await sql`SELECT id, slug, titel, cursus_type, status FROM cursussen`;
    console.log(`✅ Found ${cursussen.rows.length} cursus(sen):`);
    cursussen.rows.forEach(c => {
      console.log(`   - ${c.titel} (${c.slug}) [${c.cursus_type}] - ${c.status}`);
    });

    // Check lessen
    const lessen = await sql`SELECT COUNT(*) as count FROM cursus_lessen`;
    console.log(`\n✅ Found ${lessen.rows[0].count} lessen`);

    // Check secties
    const secties = await sql`SELECT COUNT(*) as count FROM cursus_secties`;
    console.log(`✅ Found ${secties.rows[0].count} secties`);

    // Check quiz vragen
    const quizVragen = await sql`SELECT COUNT(*) as count FROM cursus_quiz_vragen`;
    console.log(`✅ Found ${quizVragen.rows[0].count} quiz vragen`);

    console.log('\n🎉 Database is volledig opgezet en gevuld!');
    console.log('🌐 Ga naar: http://localhost:9000/cursussen\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkData();
