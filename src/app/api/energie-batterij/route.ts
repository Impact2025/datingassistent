import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';
import { checkToolAccessForUser } from '@/lib/access-control';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';

// Energy thresholds
const ENERGY_THRESHOLDS = {
  red: 40,
  yellow: 70,
  green: 100
};

// Introvert mode adjusted thresholds
const INTROVERT_THRESHOLDS = {
  red: 50,
  yellow: 75
};

// Swipe recommendations based on energy level
const SWIPE_RECOMMENDATIONS = {
  red: {
    maxMinutes: 0,
    message: 'Je batterij is te laag. Even opladen eerst.',
    action: 'breathing_exercise',
    color: '#EF4444'
  },
  yellow: {
    maxMinutes: 10,
    message: 'Je hebt beperkte energie. Max 10 minuten swipen.',
    action: 'timer_with_reminder',
    color: '#F59E0B'
  },
  green: {
    maxMinutes: 20,
    message: 'Je energie is goed! Vergeet niet pauzes te nemen.',
    action: 'optional_timer',
    color: '#10B981'
  }
};

// 4-7-8 Breathing exercise
const BREATHING_EXERCISE = {
  name: '4-7-8 Ademhaling',
  description: 'Vagale regulatie voor energieherstel',
  steps: [
    { action: 'inhale', duration: 4, instruction: 'Adem in door je neus' },
    { action: 'hold', duration: 7, instruction: 'Houd je adem vast' },
    { action: 'exhale', duration: 8, instruction: 'Adem langzaam uit door je mond' }
  ],
  cycles: 3
};

const SYSTEM_PROMPT = `Je bent een zorgzame energie-coach die focust op burnout preventie bij dating. Je begrijpt dat:

1. Introverts anders omgaan met sociale energie dan extraverts
2. Dating apps ontworpen zijn om verslavend te zijn (dopamine loops)
3. Choice overload leidt tot beslissingsmoeheid
4. 78% van dating app gebruikers ervaart burnout

Je bent beschermend maar niet betuttelend. Je helpt mensen bewuste keuzes maken over hun energie.

Als iemand onder 40% energie zit:
- Adviseer NIET te swipen
- Bied de ademhalingsoefening aan
- Valideer dat rust nemen kracht is, geen zwakte

Als iemand introvert-modus aan heeft:
- Wees extra alert op energieverlies
- Vraag naar alleen-tijd
- Pas drempels aan

Antwoord ALTIJD in het Nederlands en wees warm maar direct.`;

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
    const accessCheck = await checkToolAccessForUser(userId, 'energie-batterij');
    if (!accessCheck.hasAccess) {
      return NextResponse.json({
        error: 'Geen toegang tot deze tool',
        reason: accessCheck.reason,
        requiredTier: 'transformatie'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      fysiekScore,       // 1-10 physical feeling
      socialeInteracties, // number of social interactions today
      alleenTijd,        // 'ja', 'nee', 'een beetje'
      slaapScore,        // 1-10 sleep quality
      stressScore,       // 1-10 stress level (10 = very stressed)
      introvertMode,     // boolean
      urenAlleenTijd,    // optional: hours of alone time (introvert mode)
      videoCalls         // optional: had video calls today (introvert mode)
    } = body;

    // Validate required fields
    if (fysiekScore === undefined || socialeInteracties === undefined ||
        !alleenTijd || slaapScore === undefined || stressScore === undefined) {
      return NextResponse.json({
        error: 'Ontbrekende velden',
        required: ['fysiekScore', 'socialeInteracties', 'alleenTijd', 'slaapScore', 'stressScore']
      }, { status: 400 });
    }

    // Calculate energy level
    const energyLevel = calculateEnergyLevel({
      fysiekScore,
      socialeInteracties,
      alleenTijd,
      slaapScore,
      stressScore,
      introvertMode,
      urenAlleenTijd,
      videoCalls
    });

    // Determine zone
    const thresholds = introvertMode ? INTROVERT_THRESHOLDS : ENERGY_THRESHOLDS;
    let zone: 'red' | 'yellow' | 'green';
    if (energyLevel < thresholds.red) {
      zone = 'red';
    } else if (energyLevel < thresholds.yellow) {
      zone = 'yellow';
    } else {
      zone = 'green';
    }

    const recommendation = SWIPE_RECOMMENDATIONS[zone];

    // Generate personalized advice using AI
    let personalizedAdvice = '';
    try {
      const client = getOpenRouterClient();
      const prompt = `
Een gebruiker heeft deze scores ingevuld:
- Fysieke energie: ${fysiekScore}/10
- Sociale interacties vandaag: ${socialeInteracties}
- Alleen-tijd gehad: ${alleenTijd}
- Slaapkwaliteit: ${slaapScore}/10
- Stress niveau: ${stressScore}/10 (10=zeer gestrest)
${introvertMode ? `- Introvert modus: AAN` : ''}
${urenAlleenTijd !== undefined ? `- Uren alleen-tijd: ${urenAlleenTijd}` : ''}
${videoCalls ? `- Heeft vandaag video calls gehad` : ''}

Berekend energieniveau: ${energyLevel}%
Zone: ${zone.toUpperCase()}

Geef een persoonlijk, warm advies in 2-3 zinnen. Focus op:
- ${zone === 'red' ? 'Waarom rust nu belangrijk is en dat het geen zwakte is' : ''}
- ${zone === 'yellow' ? 'Bewust omgaan met beperkte energie' : ''}
- ${zone === 'green' ? 'Het momentum benutten zonder te overdrijven' : ''}
`;

      personalizedAdvice = await client.createChatCompletion(
        OPENROUTER_MODELS.CLAUDE_35_HAIKU,
        [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        { temperature: 0.7, max_tokens: 200 }
      );
    } catch (error) {
      console.error('AI advice generation failed:', error);
      personalizedAdvice = getDefaultAdvice(zone, energyLevel);
    }

    // Store in database
    await sql`
      INSERT INTO energie_batterij_logs (
        user_id,
        energy_level,
        answers,
        recommendation,
        swipe_allowed
      ) VALUES (
        ${userId},
        ${energyLevel},
        ${JSON.stringify({
          fysiekScore,
          socialeInteracties,
          alleenTijd,
          slaapScore,
          stressScore,
          introvertMode,
          urenAlleenTijd,
          videoCalls
        })},
        ${personalizedAdvice},
        ${zone !== 'red'}
      )
    `;

    return NextResponse.json({
      success: true,
      energyLevel,
      zone,
      recommendation: {
        ...recommendation,
        personalizedAdvice
      },
      swipeAllowed: zone !== 'red',
      breathingExercise: zone === 'red' ? BREATHING_EXERCISE : null,
      tips: getZoneTips(zone, introvertMode)
    });

  } catch (error: any) {
    console.error('Energie Batterij error:', error);
    return NextResponse.json({
      error: 'Berekening mislukt',
      message: error.message
    }, { status: 500 });
  }
}

// GET: Get user's energy history
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const decoded = token ? await verifyToken(token) : null;
    const userId = decoded?.id || null;

    if (!userId) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    const results = await sql`
      SELECT * FROM energie_batterij_logs
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 14
    `;

    // Calculate average and trend
    const logs = results.rows;
    const avgEnergy = logs.length > 0
      ? Math.round(logs.reduce((sum, log) => sum + (log.energy_level || 0), 0) / logs.length)
      : null;

    // Calculate trend (comparing last 7 days to previous 7 days)
    let trend = 'stable';
    if (logs.length >= 7) {
      const recent = logs.slice(0, 7);
      const previous = logs.slice(7, 14);
      if (previous.length > 0) {
        const recentAvg = recent.reduce((s, l) => s + l.energy_level, 0) / recent.length;
        const previousAvg = previous.reduce((s, l) => s + l.energy_level, 0) / previous.length;
        trend = recentAvg > previousAvg + 5 ? 'improving' : recentAvg < previousAvg - 5 ? 'declining' : 'stable';
      }
    }

    return NextResponse.json({
      success: true,
      history: logs,
      stats: {
        averageEnergy: avgEnergy,
        trend,
        totalChecks: logs.length
      }
    });

  } catch (error: any) {
    console.error('Energie Batterij history error:', error);
    return NextResponse.json({
      error: 'Ophalen mislukt',
      message: error.message
    }, { status: 500 });
  }
}

function calculateEnergyLevel(data: {
  fysiekScore: number;
  socialeInteracties: number;
  alleenTijd: string;
  slaapScore: number;
  stressScore: number;
  introvertMode?: boolean;
  urenAlleenTijd?: number;
  videoCalls?: boolean;
}): number {
  let energy = 0;

  // Physical energy (weight: 25%)
  energy += (data.fysiekScore / 10) * 25;

  // Sleep quality (weight: 25%)
  energy += (data.slaapScore / 10) * 25;

  // Stress impact (weight: 20%) - inverted since high stress = low energy
  energy += ((10 - data.stressScore) / 10) * 20;

  // Alone time (weight: 15%)
  const alleenTijdScore = data.alleenTijd === 'ja' ? 15 : data.alleenTijd === 'een beetje' ? 10 : 5;
  energy += alleenTijdScore;

  // Social interactions impact (weight: 15%)
  // Optimal is 2-4 interactions, more or less reduces energy
  const sociaalOptimum = data.introvertMode ? 2 : 4;
  const sociaalDiff = Math.abs(data.socialeInteracties - sociaalOptimum);
  const sociaalScore = Math.max(0, 15 - (sociaalDiff * 3));
  energy += sociaalScore;

  // Introvert mode adjustments
  if (data.introvertMode) {
    // Video calls drain more energy for introverts
    if (data.videoCalls) {
      energy -= 10;
    }

    // Bonus for sufficient alone time
    if (data.urenAlleenTijd !== undefined && data.urenAlleenTijd >= 2) {
      energy += 5;
    } else if (data.urenAlleenTijd !== undefined && data.urenAlleenTijd < 1) {
      energy -= 5;
    }
  }

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(energy)));
}

function getDefaultAdvice(zone: string, energyLevel: number): string {
  switch (zone) {
    case 'red':
      return `Je energie is op ${energyLevel}%. Dit is het moment om even voor jezelf te zorgen. Rust nemen is geen zwakte - het is zelfkennis in actie. Je hoeft niet altijd 'aan' te staan.`;
    case 'yellow':
      return `Je energie staat op ${energyLevel}%. Je kunt wel swipen, maar houd het kort. Stel een timer van 10 minuten en stop wanneer die afgaat, ook als het goed voelt.`;
    case 'green':
      return `Je energie staat op ${energyLevel}%. Je bent in een goede flow! Geniet ervan, maar vergeet niet af en toe een pauze te nemen. Kwaliteit boven kwantiteit.`;
    default:
      return 'Blijf bewust van je energie.';
  }
}

function getZoneTips(zone: string, introvertMode?: boolean): string[] {
  const baseTips: Record<string, string[]> = {
    red: [
      'Doe de 4-7-8 ademhalingsoefening',
      'Leg je telefoon weg voor minimaal 30 minuten',
      'Drink een glas water en neem een korte wandeling',
      'Luister naar rustgevende muziek'
    ],
    yellow: [
      'Stel een timer van maximaal 10 minuten',
      'Focus op kwaliteit, niet kwantiteit van gesprekken',
      'Neem na elke swipe-sessie minimaal 5 minuten pauze',
      'Bewaar uitgebreide gesprekken voor wanneer je meer energie hebt'
    ],
    green: [
      'Dit is een goed moment voor gesprekken die meer aandacht vragen',
      'Overweeg om een date te plannen als je iemand leuk vindt',
      'Vergeet niet tussendoor pauzes te nemen',
      'Let op signalen dat je energie daalt'
    ]
  };

  const tips = baseTips[zone] || [];

  if (introvertMode) {
    tips.push('Zorg dat je vandaag nog minimaal 1 uur alleen-tijd plant');
  }

  return tips;
}
