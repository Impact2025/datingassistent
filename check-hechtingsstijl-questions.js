import { sql } from '@vercel/postgres';

async function checkQuestions() {
  try {
    console.log('🔍 Checking Hechtingsstijl QuickScan questions...\n');

    // Check all questions
    const questions = await sql`
      SELECT id, question_type, question_text, category, order_position
      FROM hechtingsstijl_questions
      ORDER BY order_position
    `;

    console.log(`📝 Total questions: ${questions.rows.length}\n`);

    for (const q of questions.rows) {
      console.log(`[${q.order_position}] Q${q.id} (${q.question_type})`);
      console.log(`   Category: ${q.category}`);
      console.log(`   Text: ${q.question_text.substring(0, 60)}...`);

      if (q.question_type === 'scenario') {
        // Check scenarios for this question
        const scenarios = await sql`
          SELECT id, option_text, order_position
          FROM hechtingsstijl_scenarios
          WHERE question_id = ${q.id}
          ORDER BY order_position
        `;

        console.log(`   ⚠️  Scenarios: ${scenarios.rows.length} opties`);
        scenarios.rows.forEach((s, idx) => {
          console.log(`      ${idx + 1}. ${s.option_text.substring(0, 50)}...`);
        });

        if (scenarios.rows.length > 3) {
          console.log(`   ❌ PROBLEEM: Deze scenario vraag heeft ${scenarios.rows.length} opties maar validatie verwacht max 3!`);
        }
      }
      console.log('');
    }

    console.log('\n📊 SAMENVATTING:');
    const scenarioQuestions = questions.rows.filter(q => q.question_type === 'scenario');
    console.log(`   Statement vragen: ${questions.rows.filter(q => q.question_type === 'statement').length}`);
    console.log(`   Scenario vragen: ${scenarioQuestions.length}`);

    // Check each scenario question
    for (const sq of scenarioQuestions) {
      const scenarios = await sql`
        SELECT COUNT(*) as count
        FROM hechtingsstijl_scenarios
        WHERE question_id = ${sq.id}
      `;
      const count = parseInt(scenarios.rows[0].count);
      console.log(`   - Q${sq.id}: ${count} scenario opties ${count > 3 ? '❌ TE VEEL!' : '✅'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkQuestions();
