import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/jwt-config';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const user = await verifyToken(authHeader.substring(7));
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = user.id;

    const sessionResult = await sql`
      SELECT id, current_phase, intake_goal, intake_values_importance, intake_dating_style,
             started_at, completed_at
      FROM waarden_kompas_sessions
      WHERE user_id = ${userId}
      ORDER BY started_at DESC
      LIMIT 1
    `;

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ hasSession: false, session: null });
    }

    const session = sessionResult.rows[0];

    let responses: any[] = [];
    if (['onderzoek', 'synthese', 'integratie', 'completed'].includes(session.current_phase)) {
      const responsesResult = await sql`
        SELECT category, value_key, value_name, importance_rating
        FROM waarden_kompas_responses
        WHERE session_id = ${session.id}
        ORDER BY category, value_key
      `;
      responses = responsesResult.rows;
    }

    let results = null;
    if (['integratie', 'completed'].includes(session.current_phase)) {
      const resultsResult = await sql`
        SELECT core_values, values_meaning, red_flags, green_flags, dating_strategies
        FROM waarden_kompas_results
        WHERE session_id = ${session.id}
        ORDER BY generated_at DESC
        LIMIT 1
      `;
      if (resultsResult.rows.length > 0) {
        results = resultsResult.rows[0];
      }
    }

    // Load persisted integrations
    const integrationsResult = await sql`
      SELECT integration_type, applied_at
      FROM waarden_kompas_integrations
      WHERE user_id = ${userId} AND session_id = ${session.id}
    `;
    const integrations = integrationsResult.rows.map(r => r.integration_type);

    return NextResponse.json({
      hasSession: true,
      session: {
        id: session.id,
        currentPhase: session.current_phase,
        intake: {
          goal: session.intake_goal,
          valuesImportance: session.intake_values_importance,
          datingStyle: session.intake_dating_style,
        },
        startedAt: session.started_at,
        completedAt: session.completed_at,
      },
      responses,
      results,
      integrations,
    });
  } catch (error) {
    console.error('Error fetching Waarden Kompas session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const user = await verifyToken(authHeader.substring(7));
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = user.id;
    const { action, data } = await request.json();

    if (action === 'start_session') {
      const result = await sql`
        INSERT INTO waarden_kompas_sessions (user_id, current_phase)
        VALUES (${userId}, 'intake')
        RETURNING id, current_phase, started_at
      `;
      return NextResponse.json({
        success: true,
        session: {
          id: result.rows[0].id,
          currentPhase: result.rows[0].current_phase,
          startedAt: result.rows[0].started_at,
        },
      });
    }

    if (action === 'update_intake') {
      const { goal, valuesImportance, datingStyle } = data;
      const result = await sql`
        UPDATE waarden_kompas_sessions
        SET intake_goal = ${goal},
            intake_values_importance = ${valuesImportance},
            intake_dating_style = ${datingStyle},
            current_phase = 'onderzoek',
            updated_at = NOW()
        WHERE id = (
          SELECT id FROM waarden_kompas_sessions
          WHERE user_id = ${userId}
          ORDER BY started_at DESC
          LIMIT 1
        )
        RETURNING id, current_phase
      `;
      return NextResponse.json({
        success: true,
        session: { id: result.rows[0].id, currentPhase: result.rows[0].current_phase },
      });
    }

    if (action === 'save_responses') {
      const sessionResult = await sql`
        SELECT id FROM waarden_kompas_sessions
        WHERE user_id = ${userId}
        ORDER BY started_at DESC
        LIMIT 1
      `;
      if (sessionResult.rows.length === 0) {
        return NextResponse.json({ error: 'No active session found' }, { status: 404 });
      }

      const sessionId = sessionResult.rows[0].id;
      const { responses } = data;

      for (const response of responses) {
        await sql`
          INSERT INTO waarden_kompas_responses
          (session_id, user_id, category, value_key, value_name, importance_rating)
          VALUES (${sessionId}, ${userId}, ${response.category}, ${response.valueKey},
                  ${response.valueName}, ${response.rating})
          ON CONFLICT (session_id, value_key)
          DO UPDATE SET importance_rating = EXCLUDED.importance_rating
        `;
      }

      await sql`
        UPDATE waarden_kompas_sessions
        SET current_phase = 'synthese', updated_at = NOW()
        WHERE id = ${sessionId}
      `;

      return NextResponse.json({ success: true, message: 'Responses saved successfully' });
    }

    if (action === 'generate_results') {
      const sessionResult = await sql`
        SELECT id, intake_goal, intake_values_importance, intake_dating_style
        FROM waarden_kompas_sessions
        WHERE user_id = ${userId}
        ORDER BY started_at DESC
        LIMIT 1
      `;
      if (sessionResult.rows.length === 0) {
        return NextResponse.json({ error: 'No active session found' }, { status: 404 });
      }

      const session = sessionResult.rows[0];
      const sessionId = session.id;

      const responsesResult = await sql`
        SELECT category, value_key, value_name, importance_rating
        FROM waarden_kompas_responses
        WHERE session_id = ${sessionId}
        ORDER BY importance_rating DESC, category
      `;

      const intake = {
        goal: session.intake_goal,
        valuesImportance: session.intake_values_importance,
        datingStyle: session.intake_dating_style,
      };

      const synthesis = await generateAISynthesis(responsesResult.rows, intake);

      await sql`
        INSERT INTO waarden_kompas_results
        (session_id, user_id, core_values, values_meaning, red_flags, green_flags, dating_strategies)
        VALUES (${sessionId}, ${userId}, ${JSON.stringify(synthesis.coreValues)},
                ${JSON.stringify(synthesis.valuesMeaning)}, ${JSON.stringify(synthesis.redFlags)},
                ${JSON.stringify(synthesis.greenFlags)}, ${JSON.stringify(synthesis.datingStrategies)})
        ON CONFLICT DO NOTHING
      `;

      await sql`
        UPDATE waarden_kompas_sessions
        SET current_phase = 'integratie', updated_at = NOW()
        WHERE id = ${sessionId}
      `;

      return NextResponse.json({ success: true, results: synthesis });
    }

    if (action === 'save_integration') {
      const { integrationId } = data;

      const sessionResult = await sql`
        SELECT id FROM waarden_kompas_sessions
        WHERE user_id = ${userId}
        ORDER BY started_at DESC
        LIMIT 1
      `;
      if (sessionResult.rows.length === 0) {
        return NextResponse.json({ error: 'No active session found' }, { status: 404 });
      }

      const sessionId = sessionResult.rows[0].id;

      await sql`
        INSERT INTO waarden_kompas_integrations (session_id, user_id, integration_type)
        VALUES (${sessionId}, ${userId}, ${integrationId})
        ON CONFLICT (session_id, integration_type) DO NOTHING
      `;

      return NextResponse.json({ success: true });
    }

    if (action === 'complete_session') {
      const result = await sql`
        UPDATE waarden_kompas_sessions
        SET current_phase = 'completed', completed_at = NOW(), updated_at = NOW()
        WHERE id = (
          SELECT id FROM waarden_kompas_sessions
          WHERE user_id = ${userId}
          ORDER BY started_at DESC
          LIMIT 1
        )
        RETURNING id, completed_at
      `;
      return NextResponse.json({
        success: true,
        session: { id: result.rows[0].id, completedAt: result.rows[0].completed_at },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating Waarden Kompas session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateAISynthesis(responses: any[], intake: any): Promise<any> {
  const sortedByImportance = [...responses].sort((a, b) => b.importance_rating - a.importance_rating);
  const topValues = sortedByImportance.slice(0, 7);

  try {
    const client = getOpenRouterClient();

    const prompt = `Je bent een Nederlandse relatiecoach. Maak een VOLLEDIG GEPERSONALISEERD Waarden Kompas op basis van deze gebruiker.

GEBRUIKER INFO:
- Dating doel: ${intake.goal || 'niet opgegeven'}
- Wat zij/hij zoekt: ${intake.valuesImportance || 'niet opgegeven'}
- Dating stijl: ${intake.datingStyle || 'niet opgegeven'}

WAARDEN VAN DE GEBRUIKER (gesorteerd op belang, 1=laag, 4=essentieel):
${sortedByImportance.map(r => `• ${r.value_name} (categorie: ${r.category}): ${r.importance_rating}/4`).join('\n')}

Genereer een JSON object met deze structuur. Maak ALLES gepersonaliseerd op de exacte waarden van DEZE persoon:

{
  "coreValues": [
    ${topValues.map(r => `{"key": "${r.value_key}", "name": "${r.value_name}", "description": "GEPERSONALISEERDE beschrijving van max 20 woorden"}`).join(',\n    ')}
  ],
  "valuesMeaning": {
    ${topValues.slice(0, 5).map(r => `"${r.value_key}": "Wat ${r.value_name} concreet betekent voor JOUW dating leven (2 zinnen, specifiek en persoonlijk)"`).join(',\n    ')}
  },
  "redFlags": [
    "Rode vlag 1 specifiek voor jouw waarden",
    "Rode vlag 2",
    "Rode vlag 3",
    "Rode vlag 4",
    "Rode vlag 5"
  ],
  "greenFlags": [
    "Groene vlag 1 die perfect past bij jouw waarden",
    "Groene vlag 2",
    "Groene vlag 3",
    "Groene vlag 4",
    "Groene vlag 5"
  ],
  "datingStrategies": [
    "Concrete actie 1 gebaseerd op jouw waarden en dating stijl",
    "Concrete actie 2",
    "Concrete actie 3",
    "Concrete actie 4",
    "Concrete actie 5"
  ]
}

Geef ALLEEN het JSON object terug, geen uitleg erbuiten.`;

    const response = await client.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [{ role: 'user', content: prompt }],
      { temperature: 0.7, max_tokens: 2000 }
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in AI response');

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.coreValues || !parsed.valuesMeaning || !parsed.redFlags) {
      throw new Error('Missing required fields in AI response');
    }

    return parsed;
  } catch (error) {
    console.error('AI synthesis failed, using fallback:', error);
    return generateFallbackSynthesis(responses);
  }
}

function generateFallbackSynthesis(responses: any[]): any {
  const highPriority = responses.filter(r => r.importance_rating >= 3);
  const coreValues = highPriority.slice(0, 7).map(r => ({
    key: r.value_key,
    name: r.value_name,
    description: `Een fundamentele waarde in jouw relatieleven`,
  }));

  const valuesMeaning: Record<string, string> = {};
  coreValues.forEach(v => {
    valuesMeaning[v.key] = `${v.name} is voor jou essentieel in een relatie. Je zoekt iemand die dit ook serieus neemt.`;
  });

  return {
    coreValues,
    valuesMeaning,
    redFlags: [
      'Iemand die jouw kernwaarden niet respecteert',
      'Inconsistent gedrag in de eerste weken',
      'Gebrek aan communicatie over verwachtingen',
      'Geen interesse in persoonlijke groei',
      'Grensoverschrijdend gedrag negeren',
    ],
    greenFlags: [
      'Toont oprechte interesse in wie jij bent',
      'Consistent en betrouwbaar in woord en daad',
      'Respecteert jouw grenzen zonder discussie',
      'Heeft eigen doelen en passies',
      'Communiceert open over gevoelens en verwachtingen',
    ],
    datingStrategies: [
      'Wees vanaf het begin duidelijk over wat je belangrijk vindt',
      'Let op gedrag in de eerste 3 ontmoetingen als indicator',
      'Stel vragen die jouw kernwaarden raken',
      'Geef jezelf toestemming om nee te zeggen als iets niet klopt',
      'Zoek iemand die jouw waarden aanvult, niet dupliceert',
    ],
  };
}
