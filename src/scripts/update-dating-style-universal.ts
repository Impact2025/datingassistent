/**
 * DATING STIJL SCAN - UNIVERSELE VRAGEN UPDATE
 *
 * Dit script update de bestaande Dating Stijl vragen naar universele taal
 * die werkt voor zowel beginners als ervaren daters.
 *
 * Strategie:
 * - "Zou je..." → Conditional/hypothetical voor beginners
 * - "Als je..." → Inclusief voor alle niveaus
 * - Vermijd aannames over ervaring
 *
 * Run: npx tsx src/scripts/update-dating-style-universal.ts
 */

import { sql } from '@vercel/postgres';
import { logger } from '@/lib/logger';

async function updateDatingStyleQuestions() {
  logger.log('🚀 Updating Dating Style questions to universal language...\n');

  try {
    // Update existing questions with universal language
    const updates = [
      // COMMUNICATIE STIJL
      {
        position: 1,
        text: 'Als ik geïnteresseerd zou zijn in iemand, zou ik als eerste een bericht sturen.',
        notes: 'Was: "Ik stuur meestal het eerste bericht" → Nu hypothetisch voor beginners'
      },
      {
        position: 2,
        text: 'Als ik iemand aan het leren kennen ben, deel ik snel persoonlijke informatie.',
        notes: 'Was: "Ik deel snel veel persoonlijke info online" → Nu algemener'
      },
      {
        position: 3,
        text: 'Ik vind het moeilijk om mijn gevoelens onder woorden te brengen.',
        notes: 'Universeel - werkt al voor iedereen'
      },

      // DATE AANPAK
      {
        position: 4,
        text: 'Als ik een date zou plannen, zou ik graag van tevoren een duidelijk plan hebben.',
        notes: 'Was: "Ik plan dates altijd van tevoren" → Nu hypothetisch'
      },
      {
        position: 5,
        text: 'Ik ben het type persoon dat meegaat in spontane plannen en uitnodigingen.',
        notes: 'Was: "Ik ga graag mee in spontane date-uitnodigingen" → Nu karaktereigenschap'
      },
      {
        position: 6,
        text: 'Ik heb een duidelijk beeld van wat ik zoek in een potentiële partner.',
        notes: 'Was: "Ik heb een lijst met eisen waaraan dates moeten voldoen" → Nu zachter, universeel'
      },

      // RELATIE VERWACHTINGEN
      {
        position: 7,
        text: 'In relaties ben ik graag degene die initiatief neemt en de leiding heeft.',
        notes: 'Was: "Ik wil graag de leiding nemen" → Nu algemeen over relaties'
      },
      {
        position: 8,
        text: 'Ik pas me gemakkelijk aan aan wat anderen willen of nodig hebben.',
        notes: 'Universeel - werkt al'
      },
      {
        position: 9,
        text: 'Als ik aan het daten ben, houd ik liever wat afstand totdat ik zeker weet dat het serieus is.',
        notes: 'Was zonder "Als ik aan het daten ben" → Nu inclusief hypothetisch'
      },

      // CONFLICT AFHANDELING
      {
        position: 10,
        text: 'Bij meningsverschillen probeer ik dingen meteen uit te praten en op te lossen.',
        notes: 'Was: "Ik probeer conflicten meteen op te lossen" → Nu algemener (niet alleen dating)'
      },
      {
        position: 11,
        text: 'Ik vermijd confrontaties waar mogelijk en laat dingen liever rusten.',
        notes: 'Universeel - werkt al'
      },

      // ZELFVERTROUWEN
      {
        position: 12,
        text: 'Ik geef gemakkelijk complimenten aan anderen.',
        notes: 'Universeel - werkt al'
      },
      {
        position: 13,
        text: 'Ik twijfel vaak aan mijn eigen aantrekkelijkheid en waarde.',
        notes: 'Universeel - werkt al'
      },

      // GRENZEN
      {
        position: 14,
        text: 'Ik stel duidelijke grenzen als iets niet goed voelt voor mij.',
        notes: 'Universeel - werkt al'
      },
      {
        position: 15,
        text: 'Ik zeg soms ja tegen dingen die ik eigenlijk niet wil, om anderen niet teleur te stellen.',
        notes: 'Universeel - werkt al'
      },

      // MODERN DATING
      {
        position: 16,
        text: 'Ik zou (of ik gebruik al) dating apps regelmatig willen gebruiken om mensen te ontmoeten.',
        notes: 'Was: "Ik gebruik dating apps meerdere keren per week" → Nu inclusief voor beginners'
      }
    ];

    logger.log('📝 Updating statement questions...\n');
    for (const update of updates) {
      await sql`
        UPDATE dating_style_questions
        SET question_text = ${update.text}
        WHERE order_position = ${update.position}
      `;
      logger.log(`✅ Q${update.position}: ${update.notes}`);
    }

    // Update scenario questions
    logger.log('\n📝 Updating scenario questions...\n');

    await sql`
      UPDATE dating_style_questions
      SET question_text = 'Stel je voor: iemand die je leuk vindt, stelt een spontane date voor. Wat zou je doen?'
      WHERE order_position = 17
    `;
    logger.log('✅ Q17: Scenario 1 - Nu met "Stel je voor" en "iemand die je leuk vindt"');

    await sql`
      UPDATE dating_style_questions
      SET question_text = 'Stel je voor: tijdens een eerste ontmoeting loopt het gesprek wat stroef. Hoe zou je reageren?'
      WHERE order_position = 18
    `;
    logger.log('✅ Q18: Scenario 2 - Nu "eerste ontmoeting" ipv "date"');

    // Update scenario options to be more universal
    logger.log('\n📝 Updating scenario options...\n');

    // Scenario 1 options
    await sql`
      UPDATE dating_style_scenarios
      SET option_text = 'Ik zou meegaan — spontaniteit lijkt me leuk!'
      WHERE question_id = (SELECT id FROM dating_style_questions WHERE order_position = 17)
        AND order_position = 1
    `;

    await sql`
      UPDATE dating_style_scenarios
      SET option_text = 'Ik zou meer details vragen en dan een plan maken.'
      WHERE question_id = (SELECT id FROM dating_style_questions WHERE order_position = 17)
        AND order_position = 2
    `;

    await sql`
      UPDATE dating_style_scenarios
      SET option_text = 'Ik zou liever een andere keer afspreken met meer voorbereiding.'
      WHERE question_id = (SELECT id FROM dating_style_questions WHERE order_position = 17)
        AND order_position = 3
    `;

    // Scenario 2 options
    await sql`
      UPDATE dating_style_scenarios
      SET option_text = 'Ik zou veel vragen stellen om het gesprek op gang te krijgen.'
      WHERE question_id = (SELECT id FROM dating_style_questions WHERE order_position = 18)
        AND order_position = 1
    `;

    await sql`
      UPDATE dating_style_scenarios
      SET option_text = 'Ik zou proberen de ander op zijn/haar gemak te stellen en de sfeer luchtig houden.'
      WHERE question_id = (SELECT id FROM dating_style_questions WHERE order_position = 18)
        AND order_position = 2
    `;

    await sql`
      UPDATE dating_style_scenarios
      SET option_text = 'Ik zou me terugtrekken en de situatie laten voor wat het is.'
      WHERE question_id = (SELECT id FROM dating_style_questions WHERE order_position = 18)
        AND order_position = 3
    `;

    logger.log('✅ All scenario options updated to conditional/universal language');

    logger.log('\n✨ SUCCESS! Dating Style questions updated to universal language.');
    logger.log('\n📊 Summary:');
    logger.log('   • 16 statement questions updated');
    logger.log('   • 2 scenario questions updated');
    logger.log('   • 6 scenario options updated');
    logger.log('   • Strategy: Conditional tense + universal context');
    logger.log('   • Result: Works for beginners AND experienced daters! 🎯\n');

  } catch (error) {
    console.error('❌ Error updating questions:', error);
    throw error;
  }
}

// Auto-execute when run directly
updateDatingStyleQuestions()
  .then(() => {
    logger.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

export { updateDatingStyleQuestions };
