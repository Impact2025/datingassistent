import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const COACHING_SYSTEM_PROMPT = `Je bent een ervaren dating coach en psycholoog gespecialiseerd in zelfvertrouwen en sociale vaardigheden. Je geeft altijd empathische, praktische en wetenschappelijk onderbouwde adviezen.

BELANGRIJKE RICHTLIJNEN:
- Wees altijd bemoedigend en positief, maar realistisch
- Gebruik concrete, actionable stappen
- Baseer advies op psychologie (bijv. growth mindset, exposure therapy)
- Erken gevoelens zonder te bagatelliseren
- Stel vervolgvragen om dieper te gaan
- Gebruik Nederlandse taal voor Nederlandse gebruikers
- Houd antwoorden tussen 150-300 woorden
- Sluit altijd af met een actionable next step

Je coaching stijlen:
- MOTIVATIE: Focus op mindset shifts en encouragement
- FEEDBACK: Analyseer gedrag en geef constructieve feedback
- ADVIES: Geef specifieke, praktische tips
- CELEBRATIE: Vier successen en bouw momentum op

Analyseer de context van de gebruiker om gepersonaliseerd advies te geven.`;

// Enhanced coaching prompts based on user context
const getPersonalizedPrompt = (userInput: string, context: any) => {
  const { userProfile, currentModule, coachingType, recentHistory } = context;

  let personalizedContext = '';

  // Add user profile context
  if (userProfile) {
    personalizedContext += `\nGebruikersprofiel: ${userProfile.name || 'Gebruiker'}, ${userProfile.age || 'leeftijd onbekend'}. `;
    if (userProfile.interests?.length) {
      personalizedContext += `Interesses: ${userProfile.interests.join(', ')}. `;
    }
  }

  // Add module context
  const moduleContext = {
    0: 'pre-course assessment - focus op baseline meten',
    1: 'mindset reset - focus op interne overtuigingen',
    2: 'lichaamstaal - focus op non-verbale communicatie',
    3: 'sociale skills - focus op gesprekken voeren',
    4: 'resilience - focus op afwijzing verwerken',
    5: 'action planning - focus op concrete stappen',
    6: 'community - focus op ondersteuning'
  };

  personalizedContext += `\nHuidige module: ${moduleContext[currentModule as keyof typeof moduleContext] || 'algemeen'}. `;

  // Add coaching type specific instructions
  let typeInstructions = '';
  switch (coachingType) {
    case 'motivation':
      typeInstructions = 'Geef bemoediging en mindset advies. Focus op het omzetten van angst naar opwinding.';
      break;
    case 'feedback':
      typeInstructions = 'Geef eerlijke maar bemoedigende feedback. Benadruk sterke punten en geef concrete verbeterpunten.';
      break;
    case 'advice':
      typeInstructions = 'Geef praktische, stap-voor-stap tips die direct toepasbaar zijn.';
      break;
    default:
      typeInstructions = 'Geef algemeen maar persoonlijk coaching advies.';
  }

  // Add recent history context if available
  if (recentHistory?.length > 0) {
    personalizedContext += '\nRecente gesprekken: ';
    recentHistory.slice(0, 2).forEach((session: any, index: number) => {
      personalizedContext += `(${index + 1}) ${session.userInput.substring(0, 50)}... `;
    });
  }

  return `${COACHING_SYSTEM_PROMPT}

CONTEXT: ${personalizedContext}

TYPE: ${typeInstructions}

Gebruikersvraag: "${userInput}"

Geef een empathisch, praktisch en persoonlijk advies in het Nederlands.`;
};

export async function POST(request: NextRequest) {
  try {
    const { userInput, context } = await request.json();

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: 'User input is required' },
        { status: 400 }
      );
    }

    let aiResponse: string;

    // Check if OpenAI is available, otherwise use mock responses
    if (!openai) {
      // Mock responses for development/testing
      const mockResponses = {
        motivation: [
          "Geweldig dat je aan je zelfvertrouwen werkt! Elke stap die je zet, hoe klein ook, brengt je dichter bij het zelfverzekerde gevoel dat je verdient. Blijf doorgaan met oefeningen zoals het dagelijks herhalen van affirmaties en het vieren van kleine successen.",
          "Je bent al veel verder dan je denkt! Het feit dat je hier bent en werkt aan je dating zelfvertrouwen toont al je vastberadenheid. Focus op één kwaliteit tegelijk en bouw daar langzaam op voort.",
          "Vertrouwen is als een spier - het wordt sterker door regelmatig gebruik. Begin vandaag met één positieve actie richting jezelf, zoals een compliment geven in de spiegel of een hobby oppakken die je leuk vindt."
        ],
        feedback: [
          "Uitstekend werk! Je aanpak toont echte zelfreflectie. Probeer nu deze inzichten toe te passen in één concrete situatie deze week. Wat zou er gebeuren als je iets meer risico neemt?",
          "Heel goed dat je je gevoelens onder woorden brengt. Dit is een sterke basis voor groei. Volgende stap: schrijf op welke concrete acties je kunt nemen om deze inzichten om te zetten in gedrag.",
          "Prima zelfanalyse! Nu de brug naar actie: kies één situatie waarin je deze nieuwe inzichten kunt toepassen. Begin klein en bouw op naar grotere uitdagingen."
        ],
        advice: [
          "Voor meer zelfvertrouwen: begin elke dag met 5 minuten positieve affirmaties, oefen machtsposes voor de spiegel, en schrijf dagelijks één ding op waar je trots op bent. Consistentie is key!",
          "Probeer de 'als-dan' techniek: 'Als ik zenuwachtig word, dan haal ik diep adem en herinner ik mezelf aan mijn sterke kanten.' Dit helpt om automatische negatieve patronen te doorbreken.",
          "Stel jezelf een kleine uitdaging per dag: maak oogcontact met een vreemde, geef een compliment, of probeer iets nieuws. Elk succes bouwt je zelfvertrouwen op voor dating situaties."
        ]
      };

      const coachingType = context?.coachingType || 'advice';
      const responses = mockResponses[coachingType as keyof typeof mockResponses] || mockResponses.advice;
      aiResponse = responses[Math.floor(Math.random() * responses.length)];
    } else {
      const personalizedPrompt = getPersonalizedPrompt(userInput, context);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: personalizedPrompt
          },
          {
            role: 'user',
            content: userInput
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      aiResponse = completion.choices[0]?.message?.content || 'Sorry, ik kon geen advies genereren op dit moment.';

      if (!aiResponse) {
        throw new Error('No response from OpenAI');
      }
    }

    // Analyze sentiment for UI feedback
    const sentiment = analyzeSentiment(userInput);

    return NextResponse.json({
      response: aiResponse,
      sentiment,
      coachingType: context?.coachingType || 'general',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Confidence Coach API error:', error);

    return NextResponse.json(
      {
        error: 'Sorry, de AI coach is tijdelijk niet beschikbaar. Probeer het later opnieuw.',
        fallback: true
      },
      { status: 500 }
    );
  }
}

// Simple sentiment analysis for UI feedback
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'challenging' {
  const lowerText = text.toLowerCase();

  const positiveWords = ['goed', 'fijn', 'leuk', 'geweldig', 'top', 'succes', 'gelukt', 'beter', 'sterk'];
  const challengingWords = ['moeilijk', 'bang', 'onzeker', 'slecht', 'faal', 'angst', 'twijfel', 'probleem', 'zorgen'];

  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const challengingCount = challengingWords.filter(word => lowerText.includes(word)).length;

  if (positiveCount > challengingCount) return 'positive';
  if (challengingCount > positiveCount) return 'challenging';
  return 'neutral';
}