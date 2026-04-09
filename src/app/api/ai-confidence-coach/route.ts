import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';

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

    const personalizedPrompt = getPersonalizedPrompt(userInput, context);
    const openrouter = getOpenRouterClient();
    const aiResponse = await openrouter.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [
        { role: 'system', content: personalizedPrompt },
        { role: 'user', content: userInput },
      ],
      { max_tokens: 500, temperature: 0.7 }
    );

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