import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';
import { checkToolAccessForUser } from '@/lib/access-control';

export const dynamic = 'force-dynamic';

// The 36 Questions to Fall in Love - organized in 3 sets
const QUESTION_SETS = {
  set1: {
    title: 'Set 1: Oppervlakkige Verkenning',
    questions: [
      'Als je iedereen ter wereld zou kunnen kiezen, wie zou je dan als diner gast willen hebben?',
      'Zou je beroemd willen zijn? Op welke manier?',
      'Voordat je een telefoontje pleegt, repeteer je soms wat je gaat zeggen? Waarom?',
      'Wat zou voor jou een "perfecte" dag zijn?',
      'Wanneer heb je voor het laatst voor jezelf gezongen? En voor iemand anders?',
      'Als je 90 zou worden en je kon vanaf je 30e het lichaam of de geest van een 30-jarige behouden, welke zou je kiezen?',
      'Heb je een geheim voorgevoel over hoe je zult sterven?',
      'Noem drie dingen die jij en je gesprekspartner gemeen lijken te hebben.',
      'Waar in je leven ben je het meest dankbaar voor?',
      'Als je iets zou kunnen veranderen aan hoe je bent opgevoed, wat zou dat zijn?',
      'Neem vier minuten en vertel je levensverhaal met zoveel mogelijk detail.',
      'Als je morgen wakker zou worden met één nieuwe kwaliteit of vaardigheid, welke zou je willen hebben?'
    ]
  },
  set2: {
    title: 'Set 2: Persoonlijke Verdieping',
    questions: [
      'Als een kristallen bol je de waarheid zou kunnen vertellen over jezelf, je leven, de toekomst, of wat dan ook, wat zou je willen weten?',
      'Is er iets wat je al lang wilt doen? Waarom heb je het nog niet gedaan?',
      'Wat is de grootste prestatie in je leven?',
      'Wat waardeer je het meest in een vriendschap?',
      'Wat is je meest gekoesterde herinnering?',
      'Wat is je meest vreselijke herinnering?',
      'Als je wist dat je over een jaar plotseling zou sterven, zou je dan iets veranderen aan de manier waarop je nu leeft? Waarom?',
      'Wat betekent vriendschap voor jou?',
      'Welke rol spelen liefde en genegenheid in je leven?',
      'Deel afwisselend iets wat je als een positieve eigenschap van je gesprekspartner beschouwt. Deel in totaal vijf dingen.',
      'Hoe hecht is je familie? Denk je dat je jeugd gelukkiger was dan die van anderen?',
      'Hoe voel je je over je relatie met je moeder?'
    ]
  },
  set3: {
    title: 'Set 3: Wederzijdse Kwetsbaarheid',
    questions: [
      'Maak drie "wij" uitspraken. Bijvoorbeeld: "Wij zijn allebei in deze kamer en voelen..."',
      'Maak de zin af: "Ik zou willen dat ik iemand had met wie ik ... kon delen."',
      'Als je een hechte vriend zou worden met je gesprekspartner, deel dan wat belangrijk voor hem/haar zou zijn om te weten.',
      'Vertel je gesprekspartner wat je leuk aan hem/haar vindt. Wees heel eerlijk en zeg dingen die je normaal niet zou zeggen tegen iemand die je net hebt ontmoet.',
      'Deel een gênant moment uit je leven met je gesprekspartner.',
      'Wanneer heb je voor het laatst gehuild in het bijzijn van een ander? En alleen?',
      'Vertel je gesprekspartner iets wat je nu al leuk aan hem/haar vindt.',
      'Wat, als er iets is, is te serieus om grappen over te maken?',
      'Als je vanavond zou sterven zonder de mogelijkheid om met iemand te communiceren, wat zou je het meest betreuren niet te hebben gezegd? Waarom heb je het nog niet gezegd?',
      'Je huis met alles wat je bezit vat vlam. Nadat je je geliefden en huisdieren hebt gered, heb je tijd om één ding veilig op te halen. Wat zou dat zijn? Waarom?',
      'Van alle mensen in je familie, wiens dood zou je het meest verontrustend vinden? Waarom?',
      'Deel een persoonlijk probleem en vraag je gesprekspartner om advies. Vraag hem/haar ook om te reflecteren op hoe je lijkt te voelen over het probleem.'
    ]
  }
};

// System prompt for AI guidance
const SYSTEM_PROMPT = `Je bent een empathische gesprekscoach die mensen helpt de "36 vragen om verliefd te worden" te bespreken.

Je rol:
- Geef context bij elke vraag
- Help bij het verdiepen van antwoorden
- Moedig oprechtheid en kwetsbaarheid aan
- Geef reflectie tips na het antwoorden

Toon: Warm, ondersteunend, nieuwsgierig
Taal: Nederlands

Belangrijk: Dit gaat niet over "verliefd worden" maar over diepere verbinding opbouwen. De vragen werken voor elke relatie die je wilt verdiepen.`;

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

    // Check tool access (toolId: 36-vragen-oefen-bot in access-control.ts)
    const accessCheck = await checkToolAccessForUser(userId, '36-vragen-oefen-bot');
    if (!accessCheck.hasAccess) {
      return NextResponse.json({
        error: 'Geen toegang tot deze tool',
        reason: accessCheck.reason,
        requiredTier: 'transformatie'
      }, { status: 403 });
    }

    const body = await request.json();
    const { action, sessionId, questionNumber, answer, partnerName } = body;

    // Handle different actions
    switch (action) {
      case 'start_session': {
        // Create new session
        const result = await sql`
          INSERT INTO vragen_36_sessions (
            user_id,
            partner_name,
            current_set,
            current_question,
            status
          ) VALUES (
            ${userId},
            ${partnerName || 'Partner'},
            1,
            1,
            'active'
          )
          RETURNING id, partner_name, current_set, current_question, created_at
        `;

        const session = result.rows[0];
        const firstQuestion = QUESTION_SETS.set1.questions[0];

        return NextResponse.json({
          success: true,
          session: {
            id: session.id,
            partnerName: session.partner_name,
            currentSet: session.current_set,
            currentQuestion: session.current_question,
            createdAt: session.created_at
          },
          question: {
            number: 1,
            text: firstQuestion,
            set: QUESTION_SETS.set1.title,
            totalInSet: 12,
            tip: 'Neem de tijd voor deze vraag. Luister echt naar het antwoord van de ander voordat je zelf antwoordt.'
          }
        });
      }

      case 'get_question': {
        // Get current question from session
        const sessionResult = await sql`
          SELECT * FROM vragen_36_sessions
          WHERE id = ${sessionId} AND user_id = ${userId}
        `;

        if (sessionResult.rows.length === 0) {
          return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 });
        }

        const session = sessionResult.rows[0];
        const setKey = `set${session.current_set}` as keyof typeof QUESTION_SETS;
        const questionSet = QUESTION_SETS[setKey];
        const question = questionSet.questions[session.current_question - 1];

        return NextResponse.json({
          success: true,
          question: {
            number: (session.current_set - 1) * 12 + session.current_question,
            text: question,
            set: questionSet.title,
            setNumber: session.current_set,
            questionInSet: session.current_question,
            totalInSet: 12,
            isLastInSet: session.current_question === 12,
            isComplete: session.current_set === 3 && session.current_question === 12
          }
        });
      }

      case 'answer_question': {
        if (!sessionId || !answer) {
          return NextResponse.json({ error: 'Session ID en antwoord zijn verplicht' }, { status: 400 });
        }

        // Get session
        const sessionResult = await sql`
          SELECT * FROM vragen_36_sessions
          WHERE id = ${sessionId} AND user_id = ${userId}
        `;

        if (sessionResult.rows.length === 0) {
          return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 });
        }

        const session = sessionResult.rows[0];

        // Store answer
        const globalQuestionNumber = (session.current_set - 1) * 12 + session.current_question;
        await sql`
          INSERT INTO vragen_36_answers (
            session_id,
            question_number,
            user_answer,
            answered_at
          ) VALUES (
            ${sessionId},
            ${globalQuestionNumber},
            ${answer},
            NOW()
          )
        `;

        // Calculate next question
        let nextSet = session.current_set;
        let nextQuestion = session.current_question + 1;
        let isComplete = false;

        if (nextQuestion > 12) {
          if (nextSet < 3) {
            nextSet += 1;
            nextQuestion = 1;
          } else {
            isComplete = true;
          }
        }

        // Update session
        if (isComplete) {
          await sql`
            UPDATE vragen_36_sessions
            SET status = 'completed', completed_at = NOW()
            WHERE id = ${sessionId}
          `;
        } else {
          await sql`
            UPDATE vragen_36_sessions
            SET current_set = ${nextSet}, current_question = ${nextQuestion}
            WHERE id = ${sessionId}
          `;
        }

        // Get next question if not complete
        let nextQuestionData = null;
        if (!isComplete) {
          const setKey = `set${nextSet}` as keyof typeof QUESTION_SETS;
          const questionSet = QUESTION_SETS[setKey];
          nextQuestionData = {
            number: (nextSet - 1) * 12 + nextQuestion,
            text: questionSet.questions[nextQuestion - 1],
            set: questionSet.title,
            setNumber: nextSet,
            questionInSet: nextQuestion,
            totalInSet: 12
          };
        }

        return NextResponse.json({
          success: true,
          isComplete,
          progress: {
            currentQuestion: globalQuestionNumber,
            totalQuestions: 36,
            percentage: Math.round((globalQuestionNumber / 36) * 100)
          },
          nextQuestion: nextQuestionData,
          tip: isComplete
            ? 'Gefeliciteerd! Jullie hebben alle 36 vragen doorlopen. Neem nu 4 minuten om in elkaars ogen te kijken zonder te praten.'
            : generateTip(nextSet, nextQuestion)
        });
      }

      case 'get_progress': {
        // Get session progress
        const sessionResult = await sql`
          SELECT s.*, COUNT(a.id) as answered_count
          FROM vragen_36_sessions s
          LEFT JOIN vragen_36_answers a ON s.id = a.session_id
          WHERE s.id = ${sessionId} AND s.user_id = ${userId}
          GROUP BY s.id
        `;

        if (sessionResult.rows.length === 0) {
          return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 });
        }

        const session = sessionResult.rows[0];

        return NextResponse.json({
          success: true,
          session: {
            id: session.id,
            partnerName: session.partner_name,
            status: session.status,
            currentSet: session.current_set,
            currentQuestion: session.current_question,
            answeredCount: parseInt(session.answered_count),
            createdAt: session.created_at,
            completedAt: session.completed_at
          }
        });
      }

      case 'get_sessions': {
        // Get all sessions for user
        const result = await sql`
          SELECT s.*, COUNT(a.id) as answered_count
          FROM vragen_36_sessions s
          LEFT JOIN vragen_36_answers a ON s.id = a.session_id
          WHERE s.user_id = ${userId}
          GROUP BY s.id
          ORDER BY s.created_at DESC
          LIMIT 10
        `;

        return NextResponse.json({
          success: true,
          sessions: result.rows.map(s => ({
            id: s.id,
            partnerName: s.partner_name,
            status: s.status,
            progress: {
              currentQuestion: (s.current_set - 1) * 12 + s.current_question,
              totalQuestions: 36,
              percentage: Math.round(((s.current_set - 1) * 12 + s.current_question) / 36 * 100)
            },
            createdAt: s.created_at,
            completedAt: s.completed_at
          }))
        });
      }

      default:
        return NextResponse.json({ error: 'Ongeldige actie' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('36 Vragen error:', error);
    return NextResponse.json({
      error: 'Er is iets misgegaan',
      message: error.message
    }, { status: 500 });
  }
}

// GET: Get question sets info and user's sessions
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const decoded = token ? await verifyToken(token) : null;
    const userId = decoded?.id || null;

    // Return question sets info (publicly available)
    const info = {
      title: '36 Vragen om Dieper te Verbinden',
      description: 'Gebaseerd op het psychologische onderzoek van Dr. Arthur Aron. Deze vragen zijn ontworpen om intimiteit en verbinding op te bouwen tussen twee mensen.',
      sets: [
        {
          number: 1,
          title: QUESTION_SETS.set1.title,
          questionCount: 12,
          focus: 'Kennismaken en oppervlakkige uitwisseling'
        },
        {
          number: 2,
          title: QUESTION_SETS.set2.title,
          questionCount: 12,
          focus: 'Persoonlijke waarden en ervaringen delen'
        },
        {
          number: 3,
          title: QUESTION_SETS.set3.title,
          questionCount: 12,
          focus: 'Diepe kwetsbaarheid en wederzijdse reflectie'
        }
      ],
      totalQuestions: 36,
      estimatedTime: '45-90 minuten'
    };

    // If logged in, include user's sessions
    if (userId) {
      const sessionsResult = await sql`
        SELECT s.*, COUNT(a.id) as answered_count
        FROM vragen_36_sessions s
        LEFT JOIN vragen_36_answers a ON s.id = a.session_id
        WHERE s.user_id = ${userId}
        GROUP BY s.id
        ORDER BY s.created_at DESC
        LIMIT 5
      `;

      return NextResponse.json({
        success: true,
        info,
        sessions: sessionsResult.rows.map(s => ({
          id: s.id,
          partnerName: s.partner_name,
          status: s.status,
          progress: ((s.current_set - 1) * 12 + s.current_question),
          createdAt: s.created_at
        }))
      });
    }

    return NextResponse.json({
      success: true,
      info
    });

  } catch (error: any) {
    console.error('36 Vragen GET error:', error);
    return NextResponse.json({
      error: 'Ophalen mislukt',
      message: error.message
    }, { status: 500 });
  }
}

function generateTip(set: number, question: number): string {
  const tips: Record<number, string[]> = {
    1: [
      'Begin rustig. Deze vragen helpen je de ander beter te leren kennen.',
      'Luister actief - stel vervolgvragen over het antwoord.',
      'Wees eerlijk, ook als het antwoord simpel lijkt.',
      'Neem de tijd om na te denken voordat je antwoordt.',
      'Kijk de ander aan tijdens het luisteren.',
      'Deel ook je eigen antwoord - dit is een tweerichtingsproces.',
    ],
    2: [
      'Nu wordt het persoonlijker. Wees open voor wat komt.',
      'Oordeel niet over de antwoorden van de ander.',
      'Het is OK om even stil te zijn en na te denken.',
      'Vraag door als iets je nieuwsgierig maakt.',
      'Deel je echte gevoelens, niet wat je denkt dat "goed" klinkt.',
      'Herinner je dat kwetsbaarheid verbinding creëert.',
    ],
    3: [
      'Dit is het diepste niveau. Neem alle tijd die je nodig hebt.',
      'Wees moedig - echte verbinding vraagt echte eerlijkheid.',
      'Het is normaal om je ongemakkelijk te voelen.',
      'Bedank de ander voor het delen.',
      'Houd oogcontact - het verdiept de connectie.',
      'Na vraag 36: kijk 4 minuten in stilte in elkaars ogen.',
    ]
  };

  const setTips = tips[set] || tips[1];
  return setTips[Math.floor(Math.random() * setTips.length)];
}
