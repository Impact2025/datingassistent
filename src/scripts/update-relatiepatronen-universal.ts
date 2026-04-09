/**
 * RELATIEPATRONEN SCAN - UNIVERSELE VRAGEN UPDATE
 *
 * Dit script update de Relatiepatronen vragen naar universele taal
 * die werkt voor zowel beginners als mensen met relatie-ervaring.
 *
 * Strategie:
 * - Hypothetisch/toekomstig framing ("Zou ik...", "Als ik...")
 * - Breder relationeel kader (niet alleen romantische relaties)
 * - Scenario's met "Stel je voor..." (werkt voor iedereen)
 * - Verwijder aannames over "vaak" → maak het voorwaardelijk
 *
 * Run: npx tsx src/scripts/update-relatiepatronen-universal.ts
 */

import { sql } from '@vercel/postgres';
import { logger } from '@/lib/logger';

async function updateRelatiepatronenQuestions() {
  logger.log('🚀 Updating Relatiepatronen questions to universal language...\n');

  try {
    // Update statement questions with universal language
    const updates = [
      // PATTERN RECOGNITION (was: assuming multiple experiences)
      {
        position: 1,
        text: 'Als ik terugkijk op mijn connecties, merk ik dat ik naar een bepaald type persoon neig.',
        notes: 'Was: "Ik merk dat ik vaak dezelfde soort partner aantrek" → Nu algemener en hypothetisch'
      },
      {
        position: 2,
        text: 'In het begin van een connectie idealiseer ik mensen soms sneller dan gezond is.',
        notes: 'Was: "Na een paar dates idealiseer ik iemand sneller..." → Nu algemener'
      },

      // CONFLICT HANDLING
      {
        position: 3,
        text: 'In moeilijke gesprekken of spanningen heb ik de neiging om conflicten te vermijden.',
        notes: 'Was: "Ik vermijd conflicten tot het te laat is" → Nu breder (niet alleen relaties)'
      },

      // VALIDATION SEEKING
      {
        position: 4,
        text: 'Ik zou in moeilijke periodes geneigd zijn om bevestiging te zoeken via verbinding met anderen.',
        notes: 'Was: "Ik zoek vaak bevestiging via relaties..." → Nu hypothetisch en algemener'
      },

      // SABOTAGE PATTERNS
      {
        position: 5,
        text: 'Als iemand emotioneel te dichtbij komt, zou ik de neiging hebben om me terug te trekken.',
        notes: 'Was: "Ik saboteer relaties wanneer het te dichtbij wordt" → Nu hypothetisch'
      },

      // IDEALIZATION
      {
        position: 6,
        text: 'Ik zou geneigd zijn om bij iemand te blijven in de hoop dat ze veranderen.',
        notes: 'Was: "Ik blijf bij iemand hopen dat die verandert" → Nu voorwaardelijk'
      },

      // VALIDATION (self-blame)
      {
        position: 7,
        text: 'Als er iets misgaat in een relatie, denk ik snel dat het aan mij ligt.',
        notes: 'Was: "Ik roep snel het is aan mij..." → Nu algemener geformuleerd'
      },

      // AVOIDANCE
      {
        position: 8,
        text: 'In lastige situaties heb ik de neiging om mezelf af te leiden met werk of hobby\'s.',
        notes: 'Was: "emotioneel te vluchten..." → Nu breder toepasbaar'
      },

      // REBOUND PATTERNS
      {
        position: 9,
        text: 'Ik zou waarschijnlijk snel na het einde van een connectie weer iets nieuws beginnen.',
        notes: 'Was: "Ik start vaak relaties snel na een vorige relatie" → Nu hypothetisch'
      },

      // RED FLAGS
      {
        position: 10,
        text: 'In het begin van een connectie zou ik rode vlaggen kunnen negeren omdat ik iets wil vasthouden.',
        notes: 'Was: "Ik negeer rode vlaggen..." → Nu voorwaardelijk'
      },

      // UNAVAILABLE PREFERENCE
      {
        position: 11,
        text: 'Ik voel me aangetrokken tot mensen die emotioneel onafhankelijk of wat afstandelijk zijn.',
        notes: 'Was: "Ik kies partners die..." → Nu algemener (aantrekking ipv keuze)'
      },

      // BOUNDARIES
      {
        position: 12,
        text: 'Het valt me moeilijk om uit te spreken wat ik nodig heb in een relatie.',
        notes: 'Was: "Ik benoem zelden..." → Nu algemener geformuleerd'
      }
    ];

    logger.log('📝 Updating statement questions...\n');
    for (const update of updates) {
      await sql`
        UPDATE relationship_patterns_questions
        SET question_text = ${update.text}
        WHERE order_position = ${update.position}
      `;
      logger.log(`✅ Q${update.position}: ${update.notes}`);
    }

    // Update scenario questions to hypothetical
    logger.log('\n📝 Updating scenario questions...\n');

    await sql`
      UPDATE relationship_patterns_questions
      SET question_text = 'Stel je voor: iemand waar je interesse in hebt, reageert drie dagen niet op een belangrijk gesprek. Wat zou je doen?'
      WHERE order_position = 13
    `;
    logger.log('✅ Q13: Scenario A - Nu "Stel je voor" en "iemand waar je interesse in hebt"');

    await sql`
      UPDATE relationship_patterns_questions
      SET question_text = 'Stel je voor: na een meningsverschil met iemand die je belangrijk vindt. Wat is jouw natuurlijke reactie?'
      WHERE order_position = 14
    `;
    logger.log('✅ Q14: Scenario B - Nu algemener: "meningsverschil" ipv "ruzie"');

    // Update scenario options to be more universal
    logger.log('\n📝 Updating scenario options...\n');

    // Scenario A options (non-response pattern)
    await sql`
      UPDATE relationship_patterns_scenarios
      SET option_text = 'Ik zou meerdere keren contact opnemen om duidelijkheid te krijgen.'
      WHERE question_id = (SELECT id FROM relationship_patterns_questions WHERE order_position = 13)
        AND order_position = 1
    `;

    await sql`
      UPDATE relationship_patterns_scenarios
      SET option_text = 'Ik zou wachten en ondertussen nadenken over waarom dit gebeurt.'
      WHERE question_id = (SELECT id FROM relationship_patterns_questions WHERE order_position = 13)
        AND order_position = 2
    `;

    await sql`
      UPDATE relationship_patterns_scenarios
      SET option_text = 'Ik zou me terugtrekken en doen alsof alles oké is.'
      WHERE question_id = (SELECT id FROM relationship_patterns_questions WHERE order_position = 13)
        AND order_position = 3
    `;

    // Scenario B options (conflict handling)
    await sql`
      UPDATE relationship_patterns_scenarios
      SET option_text = 'Ik zou het direct willen bespreken en oplossen.'
      WHERE question_id = (SELECT id FROM relationship_patterns_questions WHERE order_position = 14)
        AND order_position = 1
    `;

    await sql`
      UPDATE relationship_patterns_scenarios
      SET option_text = 'Ik zou afstand nemen en ruimte en tijd geven.'
      WHERE question_id = (SELECT id FROM relationship_patterns_questions WHERE order_position = 14)
        AND order_position = 2
    `;

    await sql`
      UPDATE relationship_patterns_scenarios
      SET option_text = 'Ik zou eerst nadenken en later handelen.'
      WHERE question_id = (SELECT id FROM relationship_patterns_questions WHERE order_position = 14)
        AND order_position = 3
    `;

    logger.log('✅ All scenario options updated to conditional/universal language');

    logger.log('\n✨ SUCCESS! Relatiepatronen questions updated to universal language.');
    logger.log('\n📊 Summary:');
    logger.log('   • 12 statement questions updated');
    logger.log('   • 2 scenario questions updated');
    logger.log('   • 6 scenario options updated');
    logger.log('   • Strategy: Hypothetical framing + broader context');
    logger.log('   • Result: Works for everyone - even without relationship experience! 🎯\n');

  } catch (error) {
    console.error('❌ Error updating questions:', error);
    throw error;
  }
}

// Auto-execute when run directly
updateRelatiepatronenQuestions()
  .then(() => {
    logger.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

export { updateRelatiepatronenQuestions };
