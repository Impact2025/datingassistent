import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';
import { checkToolAccessForUser } from '@/lib/access-control';

export const dynamic = 'force-dynamic';

// System prompt for the Ghosting Reframer
const SYSTEM_PROMPT = `Je bent een empathische en therapeutisch geschoolde dating coach. Je helpt mensen verwerken wanneer ze worden geghost of afgewezen in de dating wereld.

Je aanpak:
1. VALIDEER de emotie eerst - niet direct naar oplossingen
2. NORMALISEER de ervaring - dit overkomt iedereen
3. REFRAME het narratief - van "wat is er mis met mij" naar "dit past niet"
4. EMPOWERMENT - focus op wat de persoon wel kan controleren
5. GROWTH MINDSET - elke ervaring is data, geen falen

Je gebruikt technieken uit:
- Cognitieve gedragstherapie (CGT)
- Acceptance and Commitment Therapy (ACT)
- Self-compassion work

Je toon: Warm, begrijpend, maar ook eerlijk en grounded. Je verzacht de waarheid niet, maar verpakt het in compassie.

Belangrijk:
- Nooit zeggen "je moet gewoon verder"
- Nooit bagatelliseren ("er zijn genoeg vissen in de zee")
- Wel: de pijn erkennen EN perspectief bieden
- Focus op het hier en nu, niet op de persoon die ghostte

Taal: Nederlands
Lengte: Gemiddeld 150-250 woorden per response`;

// Prompt templates for different scenarios
const SCENARIO_PROMPTS: Record<string, string> = {
  'ghosted_after_date': `De gebruiker is geghost na een date. Help hen dit te verwerken.

Context van de gebruiker: {{context}}

Geef een response die:
1. De teleurstelling erkent
2. Herinnert dat ghosting meer zegt over de ghoster dan over hen
3. Een concrete reframe biedt
4. Eindigt met een vraag die hen helpt reflecteren`,

  'ghosted_while_texting': `De gebruiker werd geghost tijdens een gesprek dat goed leek te gaan.

Context van de gebruiker: {{context}}

Geef een response die:
1. Valideert hoe verwarrend dit is
2. Uitlegt waarom mensen soms midden in gesprekken verdwijnen
3. Helpt het niet persoonlijk te nemen
4. Biedt een actiegericht perspectief`,

  'rejected_directly': `De gebruiker heeft een directe afwijzing ontvangen.

Context van de gebruiker: {{context}}

Geef een response die:
1. Waardeert dat de ander eerlijk was (beter dan ghosting)
2. De emotie valideert
3. Helpt onderscheid maken tussen "afgewezen worden" en "niet compatible zijn"
4. Biedt een compassievol perspectief`,

  'pattern_rejection': `De gebruiker ervaart herhaaldelijke afwijzingen en voelt zich ontmoedigd.

Context van de gebruiker: {{context}}

Geef een response die:
1. De frustratie erkent zonder te bagatelliseren
2. Helpt onderscheid te maken tussen wat ze kunnen veranderen en wat niet
3. Spreekt over kwaliteit vs kwantiteit in dating
4. Moedigt zelfcompassie aan`,

  'general': `De gebruiker worstelt met afwijzing in dating.

Context van de gebruiker: {{context}}

Geef een warme, therapeutische response die hen helpt dit te verwerken.`
};

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Verify user
    const decoded = token ? await verifyToken(token) : null;
    const userId = decoded?.id || null;

    if (!userId) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    // Check tool access
    const accessCheck = await checkToolAccessForUser(userId, 'ghosting-reframer');
    if (!accessCheck.hasAccess) {
      return NextResponse.json({
        error: 'Geen toegang tot deze tool',
        reason: accessCheck.reason,
        requiredTier: 'transformatie'
      }, { status: 403 });
    }

    const body = await request.json();
    const { action, sessionId, message, scenario } = body;

    switch (action) {
      case 'start_session': {
        // Create new session
        const result = await sql`
          INSERT INTO ghosting_reframe_sessions (
            user_id,
            scenario,
            status
          ) VALUES (
            ${userId},
            ${scenario || 'general'},
            'active'
          )
          RETURNING id, scenario, created_at
        `;

        const session = result.rows[0];

        return NextResponse.json({
          success: true,
          session: {
            id: session.id,
            scenario: session.scenario,
            createdAt: session.created_at
          },
          welcomeMessage: getWelcomeMessage(scenario || 'general')
        });
      }

      case 'send_message': {
        if (!sessionId || !message) {
          return NextResponse.json({ error: 'Session ID en bericht zijn verplicht' }, { status: 400 });
        }

        // Get session
        const sessionResult = await sql`
          SELECT * FROM ghosting_reframe_sessions
          WHERE id = ${sessionId} AND user_id = ${userId}
        `;

        if (sessionResult.rows.length === 0) {
          return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 });
        }

        const session = sessionResult.rows[0];

        // Get conversation history
        const historyResult = await sql`
          SELECT role, content FROM ghosting_reframe_messages
          WHERE session_id = ${sessionId}
          ORDER BY created_at ASC
          LIMIT 20
        `;

        // Store user message
        await sql`
          INSERT INTO ghosting_reframe_messages (
            session_id,
            role,
            content
          ) VALUES (
            ${sessionId},
            'user',
            ${message}
          )
        `;

        // Build messages array for AI
        const messages = [
          { role: 'system', content: SYSTEM_PROMPT }
        ];

        // Add history
        for (const msg of historyResult.rows) {
          messages.push({ role: msg.role, content: msg.content });
        }

        // Add current message with scenario context
        const scenarioPrompt = SCENARIO_PROMPTS[session.scenario] || SCENARIO_PROMPTS.general;
        messages.push({
          role: 'user',
          content: scenarioPrompt.replace('{{context}}', message)
        });

        // Call OpenRouter
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
          // Return mock response in development
          if (process.env.NODE_ENV === 'development') {
            const mockResponse = getMockResponse(session.scenario, message);

            await sql`
              INSERT INTO ghosting_reframe_messages (
                session_id,
                role,
                content
              ) VALUES (
                ${sessionId},
                'assistant',
                ${mockResponse}
              )
            `;

            return NextResponse.json({
              success: true,
              response: mockResponse,
              message: 'Development mode - mock response'
            });
          }
          throw new Error('OPENROUTER_API_KEY niet geconfigureerd');
        }

        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'https://datingassistent.nl',
            'X-Title': 'DatingAssistent - Ghosting Reframer',
          },
          body: JSON.stringify({
            model: 'anthropic/claude-3.5-sonnet',
            messages,
            max_tokens: 500,
            temperature: 0.8
          })
        });

        if (!openRouterResponse.ok) {
          const errorText = await openRouterResponse.text();
          console.error('OpenRouter error:', errorText);
          throw new Error(`AI response mislukt: ${openRouterResponse.status}`);
        }

        const aiResponse = await openRouterResponse.json();
        const content = aiResponse.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('Geen response van AI model');
        }

        // Store assistant response
        await sql`
          INSERT INTO ghosting_reframe_messages (
            session_id,
            role,
            content
          ) VALUES (
            ${sessionId},
            'assistant',
            ${content}
          )
        `;

        // Update session message count
        await sql`
          UPDATE ghosting_reframe_sessions
          SET message_count = message_count + 2
          WHERE id = ${sessionId}
        `;

        return NextResponse.json({
          success: true,
          response: content
        });
      }

      case 'get_history': {
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID is verplicht' }, { status: 400 });
        }

        const messagesResult = await sql`
          SELECT role, content, created_at
          FROM ghosting_reframe_messages
          WHERE session_id = ${sessionId}
          ORDER BY created_at ASC
        `;

        return NextResponse.json({
          success: true,
          messages: messagesResult.rows
        });
      }

      case 'end_session': {
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID is verplicht' }, { status: 400 });
        }

        await sql`
          UPDATE ghosting_reframe_sessions
          SET status = 'completed', completed_at = NOW()
          WHERE id = ${sessionId} AND user_id = ${userId}
        `;

        return NextResponse.json({
          success: true,
          message: 'Sessie afgesloten'
        });
      }

      case 'get_sessions': {
        const result = await sql`
          SELECT id, scenario, status, message_count, created_at, completed_at
          FROM ghosting_reframe_sessions
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
          LIMIT 10
        `;

        return NextResponse.json({
          success: true,
          sessions: result.rows
        });
      }

      default:
        return NextResponse.json({ error: 'Ongeldige actie' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Ghosting Reframer error:', error);
    return NextResponse.json({
      error: 'Er is iets misgegaan',
      message: error.message
    }, { status: 500 });
  }
}

// GET: Get scenarios and info
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const decoded = token ? await verifyToken(token) : null;
    const userId = decoded?.id || null;

    const info = {
      title: 'Ghosting Reframer',
      description: 'Een therapeutische gesprekspartner die je helpt omgaan met ghosting en afwijzing in de datingwereld.',
      scenarios: [
        {
          id: 'ghosted_after_date',
          title: 'Geghost na een date',
          description: 'Je had een goede date, maar hoorde daarna niets meer.'
        },
        {
          id: 'ghosted_while_texting',
          title: 'Geghost tijdens het chatten',
          description: 'Het gesprek liep goed, maar de ander verdween plotseling.'
        },
        {
          id: 'rejected_directly',
          title: 'Direct afgewezen',
          description: 'Je kreeg een duidelijke afwijzing en wilt dit verwerken.'
        },
        {
          id: 'pattern_rejection',
          title: 'Herhaaldelijke afwijzing',
          description: 'Je ervaart een patroon van afwijzingen en voelt je ontmoedigd.'
        },
        {
          id: 'general',
          title: 'Vrij gesprek',
          description: 'Praat vrijuit over je dating frustraties.'
        }
      ],
      approach: [
        'Emotie validatie - je gevoelens worden serieus genomen',
        'Normalisatie - dit overkomt iedereen',
        'Cognitieve herkadering - nieuwe perspectieven',
        'Zelfcompassie - vriendelijk zijn voor jezelf',
        'Actiegericht - focus op wat je kunt controleren'
      ]
    };

    // If logged in, include recent sessions
    if (userId) {
      const sessionsResult = await sql`
        SELECT id, scenario, status, message_count, created_at
        FROM ghosting_reframe_sessions
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 5
      `;

      return NextResponse.json({
        success: true,
        info,
        recentSessions: sessionsResult.rows
      });
    }

    return NextResponse.json({
      success: true,
      info
    });

  } catch (error: any) {
    console.error('Ghosting Reframer GET error:', error);
    return NextResponse.json({
      error: 'Ophalen mislukt',
      message: error.message
    }, { status: 500 });
  }
}

function getWelcomeMessage(scenario: string): string {
  const messages: Record<string, string> = {
    'ghosted_after_date': `Hey, fijn dat je hier bent. Het klinkt alsof je een date hebt gehad en daarna niets meer hoorde. Dat kan echt verwarrend en pijnlijk zijn.

Vertel me - wat is er gebeurd? Hoe ging de date en wanneer merkje je dat het contact stopte?`,

    'ghosted_while_texting': `Hey, ik hoor dat je midden in een gesprek bent verlaten. Dat kan zo verwarrend zijn, vooral als het goed leek te gaan.

Wil je me vertellen hoe het ging? Wat voor gesprekken hadden jullie, en wanneer stopte het?`,

    'rejected_directly': `Hey, bedankt dat je dit met me deelt. Directe afwijzing doet pijn, ook al is het eigenlijk heel moedig van de ander om eerlijk te zijn.

Wat zei de ander precies, en hoe voel je je nu?`,

    'pattern_rejection': `Hey, het klinkt alsof je een moeilijke tijd hebt in dating. Herhaaldelijke afwijzingen kunnen echt aan je zelfvertrouwen knagen.

Vertel me - wat gebeurt er steeds? Wanneer in het proces worden de dingen meestal moeilijk?`,

    'general': `Hey, fijn dat je hier bent. Ik ben hier om te luisteren en je te helpen je dating ervaringen te verwerken.

Wat speelt er bij je? Vertel me wat er is gebeurd.`
  };

  return messages[scenario] || messages.general;
}

function getMockResponse(scenario: string, message: string): string {
  const responses: Record<string, string[]> = {
    'ghosted_after_date': [
      `Ik hoor je. Het klinkt alsof de date goed ging vanuit jouw perspectief, en dan is het extra verwarrend wanneer iemand verdwijnt.

Hier is iets belangrijks om te onthouden: ghosting zegt bijna nooit iets over jou. Het zegt iets over waar de ander is in hun leven, hun communicatiestijl, of hun angsten.

Misschien was er iets in hun leven wat niets met jou te maken had. Misschien waren ze niet klaar voor iets echts. Misschien misten ze de moed om eerlijk te zijn.

Wat je nu voelt - die teleurstelling, misschien ook wel frustratie - is helemaal valid. Gun jezelf die emotie.

Eén ding dat me helpt: denk je dat je signalen hebt gemist, of voelde het echt goed?`,
    ],
    'general': [
      `Bedankt voor het delen. Ik hoor dat dit moeilijk voor je is.

Dating kan ongelooflijk kwetsbaar zijn. Elke keer dat je je hart opent, neem je een risico. En soms doet het pijn.

Maar hier is wat ik zie: je bent hier. Je reflecteert. Je probeert te groeien. Dat vraagt moed.

Laten we samen kijken naar wat er is gebeurd. Niet om te oordelen, maar om te begrijpen en vooruit te kunnen.

Wat voel je op dit moment het sterkst?`,
    ]
  };

  const scenarioResponses = responses[scenario] || responses.general;
  return scenarioResponses[Math.floor(Math.random() * scenarioResponses.length)];
}
