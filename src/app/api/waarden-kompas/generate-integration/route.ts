import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/jwt-config';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';

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
    const { integrationId } = await request.json();

    const sessionResult = await sql`
      SELECT
        s.intake_goal,
        s.intake_values_importance,
        s.intake_dating_style,
        r.core_values,
        r.values_meaning,
        r.red_flags,
        r.green_flags,
        r.dating_strategies
      FROM waarden_kompas_sessions s
      LEFT JOIN waarden_kompas_results r ON r.session_id = s.id
      WHERE s.user_id = ${userId}
      ORDER BY s.started_at DESC
      LIMIT 1
    `;

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ error: 'No session found' }, { status: 404 });
    }

    const row = sessionResult.rows[0];

    const safeJson = (val: unknown) => {
      if (!val) return [];
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return []; }
      }
      return val;
    };

    const intake = {
      goal: row.intake_goal || 'niet opgegeven',
      valuesImportance: row.intake_values_importance || 'niet opgegeven',
      datingStyle: row.intake_dating_style || 'niet opgegeven',
    };

    const coreValues = safeJson(row.core_values) as Array<{ key: string; name: string; description: string }>;
    const redFlags = safeJson(row.red_flags) as string[];
    const greenFlags = safeJson(row.green_flags) as string[];
    const datingStrategies = safeJson(row.dating_strategies) as string[];

    const content = await generateContent(integrationId, {
      intake,
      coreValues,
      redFlags,
      greenFlags,
      datingStrategies,
    });

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Error generating integration content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateContent(
  integrationId: string,
  data: {
    intake: { goal: string; valuesImportance: string; datingStyle: string };
    coreValues: Array<{ key: string; name: string; description: string }>;
    redFlags: string[];
    greenFlags: string[];
    datingStrategies: string[];
  }
): Promise<unknown> {
  const { intake, coreValues, redFlags, greenFlags, datingStrategies } = data;

  const topValueNames = coreValues.slice(0, 5).map((v) => v.name).join(', ');
  const topValuesList = coreValues
    .slice(0, 5)
    .map((v) => `• ${v.name}: ${v.description}`)
    .join('\n');
  const redFlagsList = redFlags.slice(0, 4).map((f) => `• ${f}`).join('\n');
  const greenFlagsList = greenFlags.slice(0, 4).map((f) => `• ${f}`).join('\n');
  const strategiesList = datingStrategies.slice(0, 3).map((s) => `• ${s}`).join('\n');

  const baseContext = `GEBRUIKER PROFIEL:
- Dating doel: ${intake.goal}
- Waarden belang: ${intake.valuesImportance}
- Dating stijl: ${intake.datingStyle}
- Kernwaarden: ${topValueNames}

KERNWAARDEN DETAILS:
${topValuesList}

RODE VLAGGEN:
${redFlagsList}

GROENE VLAGGEN:
${greenFlagsList}`;

  let prompt = '';

  if (integrationId === 'profiel_coach') {
    prompt = `Je bent een Nederlandse dating profiel expert. Schrijf 3 unieke bio varianten voor deze persoon.

${baseContext}

Geef een JSON object terug:
{
  "bios": [
    "Bio 1 — casual en toegankelijk (60-80 woorden, eerste persoon, kernwaarden verweven — niet opgesomd)",
    "Bio 2 — authentiek en reflectief (60-80 woorden, iets persoonlijker en diepzinniger)",
    "Bio 3 — speels en energiek (60-80 woorden, luchtig maar met karakter)"
  ],
  "fotoTips": [
    "Concrete foto tip 1 die past bij de waarden van deze persoon",
    "Foto tip 2",
    "Foto tip 3"
  ],
  "highlights": [
    "Uniek profiel kenmerk 1 — concreet en persoonlijk",
    "Uniek kenmerk 2",
    "Uniek kenmerk 3"
  ]
}

REGELS: Bio's klinken als echte mensen, niet als een cv. Gebruik NOOIT de woorden 'kernwaarden', 'waarden' of 'authenticiteit' in de bio's — laat het zien, niet zeggen. Geef ALLEEN het JSON object terug.`;
  } else if (integrationId === 'chat_coach') {
    prompt = `Je bent een Nederlandse dating communicatie coach. Genereer gepersonaliseerde chat content.

${baseContext}

Geef een JSON object terug:
{
  "openers": [
    "Opener 1 — volledig klaar om te versturen, stijl: nieuwsgierig",
    "Opener 2 — volledig klaar om te versturen, stijl: speels",
    "Opener 3 — volledig klaar om te versturen, stijl: diepzinnig",
    "Opener 4 — volledig klaar om te versturen, stijl: humoristisch",
    "Opener 5 — volledig klaar om te versturen, stijl: direct en oprecht"
  ],
  "gespreksTips": [
    "Tip 1 om gesprekken te verdiepen gebaseerd op de waarden en datingstijl",
    "Tip 2",
    "Tip 3"
  ],
  "rodEvlagSignalen": [
    "Concreet gespreks-signaal dat past bij de rode vlaggen van deze persoon",
    "Signaal 2",
    "Signaal 3"
  ]
}

REGELS: Openers zijn 100% klaar om te kopiëren — echte zinnen, GEEN templates met [haaknamen]. Geef ALLEEN het JSON object terug.`;
  } else if (integrationId === 'match_analyse') {
    prompt = `Je bent een Nederlandse dating coach gespecialiseerd in compatibiliteit.

${baseContext}

Geef een JSON object terug:
{
  "mustHaves": [
    "Must-have 1 — concreet gedrag of eigenschap direct verbonden aan kernwaarden",
    "Must-have 2",
    "Must-have 3",
    "Must-have 4",
    "Must-have 5"
  ],
  "dealBreakers": [
    "Deal-breaker 1 — concreet gedrag, geen abstracte begrippen",
    "Deal-breaker 2",
    "Deal-breaker 3",
    "Deal-breaker 4"
  ],
  "testVragen": [
    "Vraag 1 die je vroeg kunt stellen om compatibiliteit te peilen — open vraag, klaar om te sturen",
    "Vraag 2",
    "Vraag 3",
    "Vraag 4",
    "Vraag 5"
  ]
}

REGELS: Alles moet concreet gedrag beschrijven. Geen vage begrippen. Testvragen zijn klaar om letterlijk te stellen. Geef ALLEEN het JSON object terug.`;
  } else if (integrationId === 'date_planner') {
    prompt = `Je bent een Nederlandse dating coach. Genereer 5 perfecte date ideeën voor deze persoon.

${baseContext}
DATING STRATEGIEËN:
${strategiesList}

Geef een JSON object terug:
{
  "dates": [
    {
      "naam": "Korte naam (max 4 woorden)",
      "omschrijving": "Wat je concreet gaat doen (2-3 zinnen, uitvoerbaar in Nederland)",
      "waarom": "Waarom dit past bij jouw specifieke waarden (1-2 zinnen, expliciet gelinkt)",
      "tip": "Praktische tip om het nóg beter te maken"
    }
  ]
}

REGELS: Mix indoor/outdoor en actief/rustig. Koppel elk idee expliciet aan de kernwaarden. Uitvoerbaar in Nederlandse context. Geef ALLEEN het JSON object terug (met 5 dates).`;
  } else if (integrationId === 'opener_lab') {
    prompt = `Je bent een Nederlandse dating bericht specialist. Genereer 5 unieke openingszinnen.

${baseContext}
DATING STRATEGIEËN:
${strategiesList}

Geef een JSON object terug:
{
  "openers": [
    {
      "tekst": "Volledige openingszin, klaar om te kopiëren (max 2 zinnen, GEEN haaknamen)",
      "stijl": "Nieuwsgierig",
      "wanneer": "Specifieke situatie wanneer je dit gebruikt"
    },
    {
      "tekst": "Openingszin 2",
      "stijl": "Speels",
      "wanneer": "..."
    },
    {
      "tekst": "Openingszin 3",
      "stijl": "Oprecht",
      "wanneer": "..."
    },
    {
      "tekst": "Openingszin 4",
      "stijl": "Diepzinnig",
      "wanneer": "..."
    },
    {
      "tekst": "Openingszin 5",
      "stijl": "Gewaagd",
      "wanneer": "..."
    }
  ]
}

REGELS: Elke opener is 100% klaar om te versturen. Gebaseerd op de authentieke dating stijl van deze persoon. Geen generieke zinnen. Geef ALLEEN het JSON object terug.`;
  }

  if (!prompt) {
    return getFallbackContent(integrationId, data);
  }

  try {
    const client = getOpenRouterClient();
    const response = await client.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [{ role: 'user', content: prompt }],
      { temperature: 0.8, max_tokens: 1800 }
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`AI generation failed for ${integrationId}, using fallback:`, error);
    return getFallbackContent(integrationId, data);
  }
}

function getFallbackContent(
  integrationId: string,
  data: {
    intake: { goal: string; valuesImportance: string; datingStyle: string };
    coreValues: Array<{ key: string; name: string; description: string }>;
    redFlags: string[];
    greenFlags: string[];
    datingStrategies: string[];
  }
): unknown {
  const top = data.coreValues.slice(0, 3).map((v) => v.name);
  const v0 = top[0] || 'oprechtheid';
  const v1 = top[1] || 'verbinding';
  const v2 = top[2] || 'groei';

  if (integrationId === 'profiel_coach') {
    return {
      bios: [
        `Ik geloof dat de beste gesprekken spontaan ontstaan. ${v0} en ${v1} zijn voor mij geen mooie woorden — het zijn dingen die ik dagelijks leef. Op zoek naar iemand die dat snapt zonder dat ik het hoef uit te leggen.`,
        `Er zijn mensen die je ontmoet en mensen die je raken. Ik hoop tot de tweede categorie te behoren. ${v0} staat centraal in mijn leven. Als jij ook gelooft dat eerlijkheid de basis is van alles, dan praten we goed.`,
        `Goed eten, echte gesprekken en mensen die weten wat ze willen. Dat is mijn wereld in een zin. ${v1} en ${v2} zijn voor mij geen bijzaak — als jij dat deelt, zijn we al een heel eind.`,
      ],
      fotoTips: [
        `Kies een foto die jouw energie toont — iets wat past bij je waarde van ${v0}`,
        'Een foto in een voor jou betekenisvolle omgeving vertelt meer dan woorden',
        'Zorg dat je hoofdfoto een echte glimlach toont, geen pose voor de camera',
      ],
      highlights: [
        `Jouw kernwaarde ${v0} maakt je uniek — benoem dit indirect in je bio`,
        `Je interesse in ${v2} is een gespreksstarter — verwijs ernaar`,
        'Wees concreet over wat je zoekt — dat trekt de juiste mensen aan',
      ],
    };
  }

  if (integrationId === 'chat_coach') {
    return {
      openers: [
        `Ik zag je profiel en was meteen nieuwsgierig — wat is het laatste dat je echt verrast heeft?`,
        `Eerlijk zijn: jouw profiel heeft iets wat de meeste niet hebben. Wat drijft jou echt?`,
        `Als je één ding kon veranderen aan hoe mensen daten, wat zou dat zijn?`,
        `Je ziet er uit als iemand met een goed verhaal. Vertel eens het eerste hoofdstuk?`,
        `Kleine talk sla ik liever over. Wat wil je dat iemand weet over wie jij écht bent?`,
      ],
      gespreksTips: [
        `Stel vragen die je zelf ook interessant vindt — echte nieuwsgierigheid klinkt anders`,
        `Koppel gesprekken terug aan ${v0} en ${v1} — dat is wat voor jou telt`,
        'Als het gesprek na 10 berichten nog steeds oppervlakkig is, zet het een niveau dieper',
      ],
      rodEvlagSignalen: [
        'Antwoorden die alleen over henzelf gaan zonder interesse in jou',
        'Inconsistentie tussen wat ze zeggen en hoe ze reageren over tijd',
        'Vermijding van concrete plannen ondanks meerdere positieve gesprekken',
      ],
    };
  }

  if (integrationId === 'match_analyse') {
    return {
      mustHaves: [
        `Deelt of respecteert oprecht jouw waarde van ${v0}`,
        'Communiceert open en eerlijk, ook als het ongemakkelijk is',
        'Heeft eigen passies en een leven naast de relatie',
        'Is consistent in woord en daad vanaf het begin',
        'Toont oprechte interesse in wie jij bent, niet alleen wat je doet',
      ],
      dealBreakers: [
        `Negeert of minimaliseert jouw waarden — specifiek rond ${v0}`,
        'Gedrag verandert significant na de eerste date',
        'Communiceert inconsistent of verdwijnt zonder uitleg',
        'Heeft geen eigen doelen of drijfveren buiten de relatie',
      ],
      testVragen: [
        'Wat is voor jou het allerbelangrijkste in een relatie?',
        'Hoe ga jij om met conflicten of meningsverschillen?',
        'Wat doe je als je je niet goed voelt — trek je je terug of zoek je verbinding?',
        'Wat zijn jouw dealbreakers — en hoe weet je wanneer die overschreden zijn?',
        'Hoe ziet jouw ideale weekend eruit — realistisch gezien?',
      ],
    };
  }

  if (integrationId === 'date_planner') {
    return {
      dates: [
        {
          naam: 'Wandeling + koffie',
          omschrijving: 'Een rustige wandeling gevolgd door koffie. Geen reservering nodig, geen druk, wel ruimte voor een echt gesprek.',
          waarom: `Past bij je waarde van ${v0} — het is makkelijk om jezelf te zijn in een informele setting`,
          tip: 'Kies een plek die jou echt wat zegt, dan heb je meteen een verhaal',
        },
        {
          naam: 'Museum of galerie',
          omschrijving: 'Samen rondlopen in een museum of galerie. Veel gespreksonderwerpen, zonder verplicht te praten.',
          waarom: `Toont ${v2} — je bent nieuwsgierig en wil iets leren`,
          tip: 'Kies iets waar jij oprecht geïnteresseerd in bent, niet wat je "zou moeten" leuk vinden',
        },
        {
          naam: 'Kookcursus',
          omschrijving: 'Samen iets nieuws leren koken in een kleine groep. Laagdrempelig, leuk en verrassend onthullend over iemands karakter.',
          waarom: `Laat ${v1} zien in actie — samenwerken en genieten`,
          tip: 'Boek iets met een lichte keuken: Aziatisch of Mediterraans werkt goed',
        },
        {
          naam: 'Boerenmarkt + picknick',
          omschrijving: 'Samen shoppen op een lokale markt en dan buiten eten wat je gekocht hebt. Casual en ongedwongen.',
          waarom: `Past perfect bij je datingstijl — geen toneelstuk, gewoon jezelf zijn`,
          tip: 'Spreek af dat jullie elk iets meenemen wat de ander nog nooit gegeten heeft',
        },
        {
          naam: 'Pubquiz of bordspellen',
          omschrijving: 'Samen naar een pubquiz of spelletjesavond. Competitie en humor combineren — je leert veel over iemand.',
          waarom: 'Legt verborgen persoonlijkheidslagen bloot in een veilige, luchtige setting',
          tip: 'Ga als duo, niet met een grote groep — zo blijf je gefocust op elkaar',
        },
      ],
    };
  }

  if (integrationId === 'opener_lab') {
    return {
      openers: [
        {
          tekst: `Ik zag je profiel en was meteen nieuwsgierig — wat is het laatste avontuur dat je écht bijgebleven is?`,
          stijl: 'Nieuwsgierig',
          wanneer: 'Als het profiel avontuurlijk is of reisfoto\'s heeft',
        },
        {
          tekst: `Eerlijk zijn: jouw profiel heeft iets wat de meeste niet hebben. Wat is het eerste dat mensen over jou zeggen die je goed kennen?`,
          stijl: 'Oprecht',
          wanneer: 'Als je direct een echte connectie wilt maken',
        },
        {
          tekst: `Top drie: zon, regen of grijze hemel? (Ik beloof dat er een goede reden achter zit)`,
          stijl: 'Speels',
          wanneer: 'Als het profiel luchtig en vrolijk overkomt',
        },
        {
          tekst: `Je ziet er uit als iemand met een goed verhaal. Deel het eerste hoofdstuk?`,
          stijl: 'Creatief',
          wanneer: 'Universeel inzetbaar — licht mysterieus maar uitnodigend',
        },
        {
          tekst: `Ik skip de small talk. Wat was het laatste dat je echt verrast heeft?`,
          stijl: 'Direct',
          wanneer: 'Als je de toon wilt zetten voor een dieper gesprek',
        },
      ],
    };
  }

  return {};
}
