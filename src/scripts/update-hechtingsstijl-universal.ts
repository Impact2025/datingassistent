/**
 * HECHTINGSSTIJL SCAN - UNIVERSELE VRAGEN UPDATE
 *
 * Dit script update de Hechtingsstijl vragen naar universele taal
 * die werkt voor vriendschappen, familie én dating.
 *
 * Strategie:
 * - Breder relationeel kader (niet alleen dating)
 * - "Mensen om me heen" ipv "iemand" (specifiek dating)
 * - Scenario's met "iemand die je leuk vindt" (universeel)
 *
 * Run: npx tsx src/scripts/update-hechtingsstijl-universal.ts
 */

import { sql } from '@vercel/postgres';

async function updateHechtingsstijlQuestions() {
  console.log('🚀 Updating Hechtingsstijl questions to universal language...\n');

  try {
    // Update statement questions with universal language
    const updates = [
      // A. NABIJHEID & AFSTAND
      {
        position: 1,
        text: 'In mijn relaties met anderen voel ik me snel overweldigd als iemand te dichtbij komt.',
        notes: 'Nu breder: "relaties met anderen" ipv alleen dating context'
      },
      {
        position: 2,
        text: 'Ik hecht me pas echt aan mensen als ik zeker weet dat ze blijven.',
        notes: 'Was specifiek "iemand" → nu "mensen" (algemener)'
      },
      {
        position: 3,
        text: 'Ik heb regelmatig tijd alleen nodig om me weer kalm en mezelf te voelen.',
        notes: 'Universeel - werkt al voor iedereen'
      },

      // B. COMMUNICATIE & TRIGGERS
      {
        position: 4,
        text: 'Als iemand waar ik om geef traag reageert op mijn berichten, denk ik snel dat ik iets verkeerd heb gedaan.',
        notes: 'Was: "Als iemand traag reageert" → nu "waar ik om geef" (vrienden/familie/dating)'
      },
      {
        position: 5,
        text: 'Ik vind het moeilijk om te zeggen wat ik nodig heb in mijn relaties.',
        notes: 'Nu "in mijn relaties" → breder dan alleen dating'
      },
      {
        position: 6,
        text: 'In conflicten of spanningen trek ik me terug of sluit ik me mentaal af.',
        notes: 'Universeel - werkt voor alle typen relaties'
      },

      // C. INTIMITEIT & VEILIGHEID
      {
        position: 7,
        text: 'Ik voel me veilig wanneer mensen om me heen voorspelbaar en consistent zijn.',
        notes: 'Was: "wanneer iemand" → nu "mensen om me heen" (algemeen relationeel)'
      },
      {
        position: 8,
        text: 'Ik raak gespannen als iemand te afhankelijk van mij wordt of te veel vraagt.',
        notes: 'Toegevoegd "of te veel vraagt" voor bredere context'
      },

      // D. MODERNE DATING-DYNAMIEKEN
      {
        position: 9,
        text: 'Als ik met iemand aan het appen ben die ik leuk vind, raak ik snel emotioneel betrokken.',
        notes: 'Nu "iemand die ik leuk vind" ipv veronderstellen van actieve dating'
      },
      {
        position: 10,
        text: 'Ik verlies interesse als iemand té beschikbaar is of te snel te veel laat zien.',
        notes: 'Toegevoegd "of te snel te veel laat zien" voor nuance'
      }
    ];

    console.log('📝 Updating statement questions...\n');
    for (const update of updates) {
      await sql`
        UPDATE hechtingsstijl_questions
        SET question_text = ${update.text}
        WHERE order_position = ${update.position}
      `;
      console.log(`✅ Q${update.position}: ${update.notes}`);
    }

    // Update scenario questions
    console.log('\n📝 Updating scenario questions...\n');

    await sql`
      UPDATE hechtingsstijl_questions
      SET question_text = 'Stel je voor: iemand die je leuk vindt, reageert drie uur niet op een belangrijk appje. Wat gebeurt er van binnen?'
      WHERE order_position = 11
    `;
    console.log('✅ Q11: Scenario A - Nu "iemand die je leuk vindt" (werkt voor beginners EN ervaren)');

    await sql`
      UPDATE hechtingsstijl_questions
      SET question_text = 'Tijdens een beginnende connectie met iemand is er een kleine miscommunicatie. Ze zeggen: "Laat maar, maakt niet uit." Hoe voel jij je dan?'
      WHERE order_position = 12
    `;
    console.log('✅ Q12: Scenario B - Nu "beginnende connectie" ipv "date 2"');

    // Update scenario options to be more universal
    console.log('\n📝 Updating scenario options...\n');

    // Scenario A options - nu met hypothetisch "zou"
    await sql`
      UPDATE hechtingsstijl_scenarios
      SET option_text = 'Ik zou onrustig worden en proberen te analyseren wat er misgaat of wat ik verkeerd deed.'
      WHERE question_id = (SELECT id FROM hechtingsstijl_questions WHERE order_position = 11)
        AND order_position = 1
    `;

    await sql`
      UPDATE hechtingsstijl_scenarios
      SET option_text = 'Ik zou denken: "Prima, iedereen is weleens druk. Geen probleem."'
      WHERE question_id = (SELECT id FROM hechtingsstijl_questions WHERE order_position = 11)
        AND order_position = 2
    `;

    await sql`
      UPDATE hechtingsstijl_scenarios
      SET option_text = 'Ik zou me emotioneel terugtrekken en denken: "Dit is waarom ik niet te close moet worden."'
      WHERE question_id = (SELECT id FROM hechtingsstijl_questions WHERE order_position = 11)
        AND order_position = 3
    `;

    // Scenario B options
    await sql`
      UPDATE hechtingsstijl_scenarios
      SET option_text = 'Ik zou het meteen willen uitpraten en oplossen, want dit soort dingen laat ik niet hangen.'
      WHERE question_id = (SELECT id FROM hechtingsstijl_questions WHERE order_position = 12)
        AND order_position = 1
    `;

    await sql`
      UPDATE hechtingsstijl_scenarios
      SET option_text = 'Ik zou het laten rusten, maar me wel minder zeker en veilig voelen in de connectie.'
      WHERE question_id = (SELECT id FROM hechtingsstijl_questions WHERE order_position = 12)
        AND order_position = 2
    `;

    await sql`
      UPDATE hechtingsstijl_scenarios
      SET option_text = 'Ik zou me afsluiten en over iets anders praten. Geen zin in drama.'
      WHERE question_id = (SELECT id FROM hechtingsstijl_questions WHERE order_position = 12)
        AND order_position = 3
    `;

    console.log('✅ All scenario options updated to conditional/universal language');

    console.log('\n✨ SUCCESS! Hechtingsstijl questions updated to universal language.');
    console.log('\n📊 Summary:');
    console.log('   • 10 statement questions updated');
    console.log('   • 2 scenario questions updated');
    console.log('   • 6 scenario options updated');
    console.log('   • Strategy: Broader relational context (friends/family/dating)');
    console.log('   • Result: Works for everyone - even without dating experience! 🎯\n');

  } catch (error) {
    console.error('❌ Error updating questions:', error);
    throw error;
  }
}

// Auto-execute when run directly
updateHechtingsstijlQuestions()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

export { updateHechtingsstijlQuestions };
