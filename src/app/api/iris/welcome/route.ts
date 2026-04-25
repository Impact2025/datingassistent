import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';

/**
 * GET /api/iris/welcome
 * Genereert een gepersonaliseerd welkomstbericht bij terugkeer.
 * Returned { welcome: string | null }.
 * null = geen welkomst nodig (eerste keer ooit, of actieve sessie < 4 uur).
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const userId = user.id;

    // Haal laatste 3 gesprekken op
    const memoryResult = await sql`
      SELECT user_message, iris_response, created_at
      FROM iris_conversation_memory
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 3
    `;

    // Eerste keer ooit — geen welkomstbericht (onboarding doet dat)
    if (memoryResult.rows.length === 0) {
      return NextResponse.json({ welcome: null });
    }

    const lastConversation = memoryResult.rows[0];
    const lastChatAt = new Date(lastConversation.created_at);
    const hoursAgo = (Date.now() - lastChatAt.getTime()) / (1000 * 60 * 60);

    // Actieve sessie — geen welkomst nodig
    if (hoursAgo < 4) {
      return NextResponse.json({ welcome: null });
    }

    // Naam ophalen: kickstart → transformatie → users.name → fallback
    const nameResult = await sql`
      SELECT COALESCE(k.preferred_name, t.preferred_name, u.name, 'je') as naam
      FROM users u
      LEFT JOIN kickstart_onboarding k ON k.user_id = u.id
      LEFT JOIN transformatie_onboarding t ON t.user_id = u.id
      WHERE u.id = ${userId}
      LIMIT 1
    `;
    const naam = nameResult.rows[0]?.naam ?? 'je';

    // Bepaal welke case van toepassing is
    const daysAgo = Math.floor(hoursAgo / 24);
    let caseInstructie: string;

    if (daysAgo < 1) {
      caseInstructie = `De gebruiker was een paar uur geleden actief. Houd het luchtig en verwijs direct naar het vorige gespreksonderwerp.`;
    } else if (daysAgo <= 3) {
      caseInstructie = `De gebruiker was ${daysAgo} dag(en) geleden actief. Verwijs SPECIFIEK naar het onderwerp van het vorige gesprek en vraag hoe het daarmee staat.`;
    } else if (daysAgo <= 7) {
      caseInstructie = `De gebruiker was ${daysAgo} dagen geleden actief. Vraag een update over het vorige gespreksonderwerp en koppel aan hun doelen als je dat weet.`;
    } else {
      caseInstructie = `De gebruiker was ${daysAgo} dagen weg. Wees energiek en nieuwsgierig — vraag open wat er in die tijd is gebeurd op datinggebied.`;
    }

    // Snippet van het laatste gesprek (veilig afkappen)
    const lastSnippet = lastConversation.user_message?.substring(0, 80) ?? '';

    const welcomePrompt = `Je bent Iris, een directe en warme dating coach.
Schrijf een PERSOONLIJK welkomstbericht van MAXIMAAL 2 zinnen.

REGELS:
- Begin NOOIT met "Hoi!", "Hey!", "Welkom terug!" of vergelijkbare openingen
- Gebruik de voornaam: ${naam}
- Verwijs naar het vorige gesprek: "${lastSnippet}"
- Toon: warm, direct, nieuwsgierig — als een goede vriendin
- Geen emoji tenzij het heel natuurlijk aanvoelt (max 1)

SITUATIE: ${caseInstructie}

Schrijf alleen het welkomstbericht, niks anders.`;

    const openrouter = getOpenRouterClient();
    const welcome = await openrouter.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_3_HAIKU,
      [{ role: 'user', content: welcomePrompt }],
      { max_tokens: 120, temperature: 0.8 }
    );

    return NextResponse.json({ welcome: welcome.trim() });

  } catch (error) {
    console.error('Welcome endpoint error:', error);
    // Stil falen — frontend toont standaard welkomstbericht
    return NextResponse.json({ welcome: null });
  }
}
