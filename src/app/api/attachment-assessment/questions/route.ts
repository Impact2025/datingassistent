import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET - Get all assessment questions
export async function GET() {
  try {
    console.log('🔍 Fetching attachment questions...');

    const result = await sql`
      SELECT id, question_text, order_position
      FROM attachment_questions
      ORDER BY order_position ASC
    `;

    console.log(`📊 Found ${result.rows.length} questions in database`);

    if (result.rows.length === 0) {
      console.log('⚠️ No questions found, inserting default questions...');

      // Insert questions if none exist
      await sql`
        INSERT INTO attachment_questions (question_text, category, is_reverse_scored, weight, order_position) VALUES
        ('Ik voel me vaak onzeker of mijn partner mij wel echt leuk vindt.', 'anxious', false, 1.0, 1),
        ('Als iemand afstand neemt, denk ik vaak dat het aan mij ligt.', 'anxious', false, 1.0, 2),
        ('Ik hou ervan om veel tijd alleen te hebben en voel me opgesloten in een relatie.', 'avoidant', false, 1.0, 3),
        ('Ik vind het moeilijk om emoties te tonen, ook als ik diep voel.', 'avoidant', false, 1.0, 4),
        ('Ik geef snel veel van mezelf weg om connectie te krijgen.', 'anxious', false, 1.0, 5),
        ('Ik merk dat ik signalen van partners vaak verkeerd interpreteer.', 'anxious', false, 1.0, 6),
        ('Ik stel grenzen duidelijk, zelfs als dat ongemakkelijk voelt.', 'secure', false, 1.0, 7),
        ('Ik maak me snel zorgen dat mijn partner weg zal gaan.', 'anxious', false, 1.0, 8),
        ('Soms weet ik zelf niet wat ik wil in een relatie.', 'fearful_avoidant', false, 1.0, 9),
        ('Ik voel me opgelucht wanneer iemand mij meer ruimte geeft.', 'avoidant', false, 1.0, 10),
        ('In stressvolle momenten trek ik me terug of beëindig ik contact.', 'avoidant', false, 1.0, 11),
        ('Ik zoek veel bevestiging in gesprekken en appjes.', 'anxious', false, 1.0, 12),
        ('Ik heb moeite om hulp of steun te vragen.', 'avoidant', false, 1.0, 13),
        ('Ik wissel tussen sterk afhankelijk gedrag en meteen afstand nemen.', 'fearful_avoidant', false, 1.0, 14),
        ('Ik kan eerlijk zeggen wat ik nodig heb zonder me schuldig te voelen.', 'secure', false, 1.0, 15),
        ('Ik leg sneller dan anderen de schuld bij mezelf in conflicten.', 'anxious', false, 1.0, 16)
        ON CONFLICT (order_position) DO NOTHING
      `;

      // Re-fetch after insertion
      const newResult = await sql`
        SELECT id, question_text, order_position
        FROM attachment_questions
        ORDER BY order_position ASC
      `;

      console.log(`✅ Inserted and found ${newResult.rows.length} questions`);

      return NextResponse.json({
        questions: newResult.rows.map(row => ({
          id: row.id,
          text: row.question_text,
          order: row.order_position
        }))
      });
    }

    return NextResponse.json({
      questions: result.rows.map(row => ({
        id: row.id,
        text: row.question_text,
        order: row.order_position
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching attachment questions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}