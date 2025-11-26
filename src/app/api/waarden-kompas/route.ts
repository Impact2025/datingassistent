import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// GET /api/waarden-kompas - Get user's current session
export async function GET(request: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token using jose
    let decoded;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      decoded = payload;
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get userId from token
    let userId: number;
    if (decoded.user && typeof decoded.user === 'object' && 'id' in decoded.user) {
      userId = decoded.user.id as number;
    } else if (decoded.userId) {
      userId = decoded.userId as number;
    } else {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

    // Get current session
    const sessionResult = await sql`
      SELECT id, current_phase, intake_goal, intake_values_importance, intake_dating_style,
             started_at, completed_at
      FROM waarden_kompas_sessions
      WHERE user_id = ${userId}
      ORDER BY started_at DESC
      LIMIT 1
    `;

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({
        hasSession: false,
        session: null
      });
    }

    const session = sessionResult.rows[0];

    // Get responses if in onderzoek phase or later
    let responses = [];
    if (['onderzoek', 'synthese', 'integratie', 'completed'].includes(session.current_phase)) {
      const responsesResult = await sql`
        SELECT category, value_key, value_name, importance_rating
        FROM waarden_kompas_responses
        WHERE session_id = ${session.id}
        ORDER BY category, value_key
      `;
      responses = responsesResult.rows;
    }

    // Get results if completed
    let results = null;
    if (session.current_phase === 'completed') {
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

    return NextResponse.json({
      hasSession: true,
      session: {
        id: session.id,
        currentPhase: session.current_phase,
        intake: {
          goal: session.intake_goal,
          valuesImportance: session.intake_values_importance,
          datingStyle: session.intake_dating_style
        },
        startedAt: session.started_at,
        completedAt: session.completed_at
      },
      responses,
      results
    });

  } catch (error) {
    console.error('Error fetching Waarden Kompas session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/waarden-kompas - Create or update session
export async function POST(request: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token using jose
    let decoded;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      decoded = payload;
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get userId from token
    let userId: number;
    if (decoded.user && typeof decoded.user === 'object' && 'id' in decoded.user) {
      userId = decoded.user.id as number;
    } else if (decoded.userId) {
      userId = decoded.userId as number;
    } else {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

    const { action, data } = await request.json();

    if (action === 'start_session') {
      // Create new session
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
          startedAt: result.rows[0].started_at
        }
      });
    }

    if (action === 'update_intake') {
      // Update intake data
      const { goal, valuesImportance, datingStyle } = data;

      const result = await sql`
        UPDATE waarden_kompas_sessions
        SET intake_goal = ${goal},
            intake_values_importance = ${valuesImportance},
            intake_dating_style = ${datingStyle},
            current_phase = 'onderzoek',
            updated_at = NOW()
        WHERE user_id = ${userId}
        RETURNING id, current_phase
      `;

      return NextResponse.json({
        success: true,
        session: {
          id: result.rows[0].id,
          currentPhase: result.rows[0].current_phase
        }
      });
    }

    if (action === 'save_responses') {
      // Get current session
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

      // Save responses
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

      // Update phase to synthese
      await sql`
        UPDATE waarden_kompas_sessions
        SET current_phase = 'synthese', updated_at = NOW()
        WHERE id = ${sessionId}
      `;

      return NextResponse.json({
        success: true,
        message: 'Responses saved successfully'
      });
    }

    if (action === 'generate_results') {
      // Get current session and responses
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

      // Get all responses
      const responsesResult = await sql`
        SELECT category, value_key, value_name, importance_rating
        FROM waarden_kompas_responses
        WHERE session_id = ${sessionId}
        ORDER BY importance_rating DESC, category
      `;

      // Generate AI synthesis (mock for now)
      const synthesis = generateAISynthesis(responsesResult.rows);

      // Save results
      await sql`
        INSERT INTO waarden_kompas_results
        (session_id, user_id, core_values, values_meaning, red_flags, green_flags, dating_strategies)
        VALUES (${sessionId}, ${userId}, ${JSON.stringify(synthesis.coreValues)},
                ${JSON.stringify(synthesis.valuesMeaning)}, ${JSON.stringify(synthesis.redFlags)},
                ${JSON.stringify(synthesis.greenFlags)}, ${JSON.stringify(synthesis.datingStrategies)})
      `;

      // Update phase to integratie
      await sql`
        UPDATE waarden_kompas_sessions
        SET current_phase = 'integratie', updated_at = NOW()
        WHERE id = ${sessionId}
      `;

      return NextResponse.json({
        success: true,
        results: synthesis
      });
    }

    if (action === 'complete_session') {
      // Mark session as completed
      const result = await sql`
        UPDATE waarden_kompas_sessions
        SET current_phase = 'completed', completed_at = NOW(), updated_at = NOW()
        WHERE user_id = ${userId}
        RETURNING id, completed_at
      `;

      return NextResponse.json({
        success: true,
        session: {
          id: result.rows[0].id,
          completedAt: result.rows[0].completed_at
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error updating Waarden Kompas session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate AI synthesis
function generateAISynthesis(responses: any[]): any {
  // Group responses by importance
  const highPriority = responses.filter(r => r.importance_rating >= 3);
  const mediumPriority = responses.filter(r => r.importance_rating === 2);

  // Extract core values (top 5-7)
  const coreValues = highPriority.slice(0, 7).map(r => ({
    key: r.value_key,
    name: r.value_name,
    description: getValueDescription(r.value_key)
  }));

  // Generate values meaning in dating context
  const valuesMeaning = {};
  coreValues.forEach(value => {
    valuesMeaning[value.key] = getValueMeaningInDating(value.key);
  });

  // Generate red flags
  const redFlags = generateRedFlags(coreValues);

  // Generate green flags
  const greenFlags = generateGreenFlags(coreValues);

  // Generate dating strategies
  const datingStrategies = generateDatingStrategies(coreValues);

  return {
    coreValues,
    valuesMeaning,
    redFlags,
    greenFlags,
    datingStrategies
  };
}

// Helper functions for AI synthesis
function getValueDescription(key: string): string {
  const descriptions: Record<string, string> = {
    'emotionele_verbinding': 'Diepe emotionele band en intimiteit',
    'loyaliteit': 'Betrouwbaarheid en trouw in relaties',
    'humor': 'Lichtheid en plezier in dagelijks leven',
    'groei': 'Continu leren en ontwikkelen',
    'autonomie': 'Persoonlijke ruimte en onafhankelijkheid',
    'stabiliteit': 'Financiële en emotionele zekerheid'
  };
  return descriptions[key] || 'Belangrijke persoonlijke waarde';
}

function getValueMeaningInDating(key: string): string {
  const meanings: Record<string, string> = {
    'emotionele_verbinding': 'Voor jou betekent dit diepgaande gesprekken, kwetsbaarheid delen, en iemand die echt luistert naar je gevoelens.',
    'loyaliteit': 'Dit betekent betrouwbaarheid - iemand die afspraken nakomt, consistent is in gedrag, en je kunt vertrouwen.',
    'humor': 'Dit betekent iemand die het leven niet te serieus neemt, met wie je kunt lachen om dagelijkse dingen.',
    'groei': 'Dit betekent iemand die geïnteresseerd is in zelfontwikkeling, boeken leest, cursussen volgt, of ambities heeft.',
    'autonomie': 'Dit betekent respect voor persoonlijke ruimte, hobby\'s, vrienden, en onafhankelijkheid binnen de relatie.',
    'stabiliteit': 'Dit betekent financiële verantwoordelijkheid, plannen maken, en emotionele volwassenheid.'
  };
  return meanings[key] || 'Deze waarde is cruciaal in hoe je relaties benadert.';
}

function generateRedFlags(coreValues: any[]): string[] {
  const flags: string[] = [];

  if (coreValues.some(v => v.key === 'emotionele_verbinding')) {
    flags.push('Iemand die oppervlakkige gesprekken vermijdt of niet over gevoelens praat');
    flags.push('Voortdurende afwezigheid tijdens belangrijke momenten');
  }

  if (coreValues.some(v => v.key === 'loyaliteit')) {
    flags.push('Onbetrouwbaar gedrag zoals vergeten afspraken');
    flags.push('Flirten met anderen of grensoverschrijdend gedrag');
  }

  if (coreValues.some(v => v.key === 'humor')) {
    flags.push('Te serieus nemen van kleine dingen');
    flags.push('Geen waardering voor ironie of zelfspot');
  }

  if (coreValues.some(v => v.key === 'groei')) {
    flags.push('Geen interesse in persoonlijke ontwikkeling');
    flags.push('Vermijden van nieuwe ervaringen of leren');
  }

  if (coreValues.some(v => v.key === 'autonomie')) {
    flags.push('Claimend gedrag of jaloezie over vrienden/hobby\'s');
    flags.push('Constant controleren waar je bent');
  }

  return flags.slice(0, 5); // Return top 5
}

function generateGreenFlags(coreValues: any[]): string[] {
  const flags: string[] = [];

  if (coreValues.some(v => v.key === 'emotionele_verbinding')) {
    flags.push('Diepgaande gesprekken over gevoelens en ervaringen');
    flags.push('Actief luisteren en empathie tonen');
  }

  if (coreValues.some(v => v.key === 'loyaliteit')) {
    flags.push('Betrouwbaar en consistent in afspraken');
    flags.push('Respect voor grenzen en afspraken');
  }

  if (coreValues.some(v => v.key === 'humor')) {
    flags.push('Kan lachen om zichzelf en dagelijkse situaties');
    flags.push('Lichtvoetige benadering van tegenslagen');
  }

  if (coreValues.some(v => v.key === 'groei')) {
    flags.push('Leest boeken, volgt cursussen, heeft ambities');
    flags.push('Open voor feedback en zelfreflectie');
  }

  if (coreValues.some(v => v.key === 'autonomie')) {
    flags.push('Respecteert persoonlijke ruimte en hobby\'s');
    flags.push('Moedigt onafhankelijkheid aan');
  }

  return flags.slice(0, 5); // Return top 5
}

function generateDatingStrategies(coreValues: any[]): string[] {
  const strategies: string[] = [];

  if (coreValues.some(v => v.key === 'emotionele_verbinding')) {
    strategies.push('Stel tijdens eerste dates vragen over wat iemand drijft en motiveert');
    strategies.push('Deel zelf ook kwetsbare verhalen om diepgang te creëren');
  }

  if (coreValues.some(v => v.key === 'loyaliteit')) {
    strategies.push('Let op consistent gedrag - iemand die zegt wat hij doet');
    strategies.push('Vraag naar hoe ze omgaan met conflicten in vorige relaties');
  }

  if (coreValues.some(v => v.key === 'humor')) {
    strategies.push('Kies dates waar spontaniteit en plezier centraal staan');
    strategies.push('Vermijd te formele settings - ga voor ontspannen ontmoetingen');
  }

  if (coreValues.some(v => v.key === 'groei')) {
    strategies.push('Vraag naar boeken, cursussen of doelen die ze hebben');
    strategies.push('Zoek iemand die nieuwsgierig is naar de wereld');
  }

  if (coreValues.some(v => v.key === 'autonomie')) {
    strategies.push('Maak duidelijk dat je waarde hecht aan persoonlijke ruimte');
    strategies.push('Kijk of iemand respecteert dat je eigen leven hebt');
  }

  return strategies.slice(0, 5); // Return top 5
}