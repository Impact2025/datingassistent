import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * EMOTIONELE READINESS SCAN - UNIVERSELE VRAGEN
 *
 * Strategie: Vragen die werken voor IEDEREEN
 * - Beginners: kunnen zich inbeelden (hypothetisch)
 * - Ervaren: herkennen de situatie (actueel)
 *
 * Gebruik van:
 * - "Stel je voor..." → Hypothetisch scenario
 * - "Zou je..." → Conditional tense
 * - "In je leven..." → Breed, niet specifiek dating
 * - "Iemand waar je interesse in hebt" → Inclusief voor alle niveaus
 */

export async function POST() {
  try {
    console.log('Seeding emotional readiness questions...');

    // Drop and recreate tables to ensure clean schema
    await sql`DROP TABLE IF EXISTS emotionele_readiness_scenarios CASCADE;`;
    await sql`DROP TABLE IF EXISTS emotionele_readiness_questions CASCADE;`;

    // Create the questions table
    await sql`
      CREATE TABLE emotionele_readiness_questions (
        id SERIAL PRIMARY KEY,
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('statement', 'scenario', 'slider')),
        question_text TEXT NOT NULL,
        category VARCHAR(50),
        is_reverse_scored BOOLEAN DEFAULT FALSE,
        weight DECIMAL(3,2) DEFAULT 1.0,
        order_position INTEGER NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE emotionele_readiness_scenarios (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES emotionele_readiness_questions(id) ON DELETE CASCADE,
        option_text TEXT NOT NULL,
        associated_readiness TEXT[], -- Array of readiness indicators
        weight DECIMAL(3,2) DEFAULT 1.0,
        order_position INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(question_id, order_position)
      );
    `;

    // Insert universele vragen
    await sql`
      INSERT INTO emotionele_readiness_questions (question_type, question_text, category, is_reverse_scored, weight, order_position) VALUES

      -- A. ZELFBEELD & EMOTIONELE BASIS (universeel - voor iedereen relevant)
      ('statement', 'Ik voel me op dit moment goed over wie ik ben als persoon.', 'zelfbeeld', false, 1.2, 1),
      ('statement', 'Ik heb voldoende energie en tijd voor nieuwe dingen in mijn leven.', 'emotionele_capaciteit', false, 1.0, 2),
      ('statement', 'Ik ben tevreden met mezelf, ook zonder een relatie.', 'zelfbeeld', false, 1.3, 3),

      -- B. OPENHEID & KWETSBAARHEID (universeel geformuleerd)
      ('statement', 'Als ik iemand nieuw zou ontmoeten, zou ik comfortabel zijn om mezelf te laten zien.', 'openheid', false, 1.0, 4),
      ('statement', 'Ik sta open voor nieuwe connecties in mijn leven.', 'openheid', false, 1.0, 5),
      ('statement', 'Ik kan goed omgaan met onzekerheid en nieuwe situaties.', 'emotionele_veerkracht', false, 1.0, 6),

      -- C. VERLEDEN & PROCESSING (inclusief voor mensen zonder relatie-verleden)
      ('statement', 'Als ik terugkijk op mijn verleden, voel ik me vreedzaam met hoe dingen zijn gelopen.', 'verwerking', false, 1.1, 7),
      ('statement', 'Ik draag geen zware emotionele bagage meer met me mee.', 'verwerking', false, 1.2, 8),

      -- D. TOEKOMST GERICHTHEID (universeel - intenties ipv ervaring)
      ('statement', 'Ik weet wat ik zoek in een potentiële partner.', 'intenties', false, 1.0, 9),
      ('statement', 'Ik zou klaar zijn om tijd en energie te investeren in iemand anders.', 'beschikbaarheid', false, 1.1, 10),

      -- E. EMOTIONELE STABILITEIT (algemeen, niet dating-specifiek)
      ('statement', 'Mijn dagelijkse stemming is over het algemeen stabiel en positief.', 'emotionele_stabiliteit', false, 1.0, 11),
      ('statement', 'Ik voel me niet eenzaam, maar zou wel graag een connectie willen.', 'motivatie', false, 1.0, 12),

      -- F. SELF-ESTEEM & BOUNDARIES (universeel toepasbaar)
      ('statement', 'Ik weet wat mijn grenzen zijn en kan deze communiceren.', 'grenzen', false, 1.0, 13),
      ('statement', 'Ik zoek geen relatie om een leeg gevoel op te vullen.', 'motivatie', true, 1.2, 14),

      -- SCENARIO VRAGEN (universele formuleringen)
      ('scenario', 'Stel je voor: iemand waar je interesse in hebt, reageert een dag niet op je bericht. Hoe zou je reageren?', 'emotionele_reactie', false, 1.0, 15),
      ('scenario', 'Iemand vraagt je op een date, maar je voelt je die dag niet helemaal jezelf. Wat doe je?', 'zelfzorg_vs_kansen', false, 1.0, 16)

      ON CONFLICT (order_position) DO UPDATE SET
        question_text = EXCLUDED.question_text,
        category = EXCLUDED.category,
        is_reverse_scored = EXCLUDED.is_reverse_scored,
        weight = EXCLUDED.weight;
    `;
    console.log('✅ Inserted 16 universal questions');

    // Insert scenario options
    await sql`
      INSERT INTO emotionele_readiness_scenarios (question_id, option_text, associated_readiness, weight, order_position) VALUES

      -- Scenario 1: Reactie op geen bericht (emotionele stabiliteit test)
      (
        (SELECT id FROM emotionele_readiness_questions WHERE order_position = 15),
        'Ik zou rustig blijven en ervan uitgaan dat ze gewoon druk zijn. Mensen hebben hun eigen leven.',
        ARRAY['hoog', 'veilig'],
        1.0,
        1
      ),
      (
        (SELECT id FROM emotionele_readiness_questions WHERE order_position = 15),
        'Ik zou me zorgen maken en mezelf afvragen of ik iets verkeerd heb gedaan.',
        ARRAY['gemiddeld', 'onzeker'],
        1.0,
        2
      ),
      (
        (SELECT id FROM emotionele_readiness_questions WHERE order_position = 15),
        'Ik zou me gekwetst voelen en waarschijnlijk meteen interesse verliezen.',
        ARRAY['laag', 'defensief'],
        1.0,
        3
      ),

      -- Scenario 2: Zelfzorg vs Kansen (grenzen en prioriteiten)
      (
        (SELECT id FROM emotionele_readiness_questions WHERE order_position = 16),
        'Ik ga toch, want je weet nooit wat eruit kan komen. Ik kan mezelf wel even verzetten.',
        ARRAY['gemiddeld', 'people_pleasing'],
        1.0,
        1
      ),
      (
        (SELECT id FROM emotionele_readiness_questions WHERE order_position = 16),
        'Ik zou eerlijk zijn en vragen of we het kunnen verzetten naar een moment dat ik me beter voel.',
        ARRAY['hoog', 'grenzen'],
        1.0,
        2
      ),
      (
        (SELECT id FROM emotionele_readiness_questions WHERE order_position = 16),
        'Ik zou afzeggen zonder veel uitleg. Als het moet zijn, komt het vanzelf wel goed.',
        ARRAY['laag', 'vermijdend'],
        1.0,
        3
      )

      ON CONFLICT (question_id, order_position) DO UPDATE SET
        option_text = EXCLUDED.option_text,
        associated_readiness = EXCLUDED.associated_readiness,
        weight = EXCLUDED.weight;
    `;
    console.log('✅ Inserted 6 scenario options');

    return NextResponse.json({
      success: true,
      message: 'Emotional readiness questions seeded successfully with universal language! 🌟',
      details: {
        timestamp: new Date().toISOString(),
        questionsInserted: 16,
        scenariosInserted: 6,
        strategy: 'Universal inclusive language - works for everyone from beginners to experienced daters',
        improvements: [
          '✅ Hypothetical phrasing (Stel je voor...)',
          '✅ Conditional tense (Zou je...)',
          '✅ Broad context (In je leven...)',
          '✅ Inclusive scenarios',
          '✅ No assumption of dating experience'
        ]
      }
    });

  } catch (error: any) {
    console.error('Error seeding emotional readiness questions:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to seed emotional readiness questions',
      error: error.message
    }, { status: 500 });
  }
}
