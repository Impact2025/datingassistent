/**
 * API: Generate Dating Profiles with AI
 * Uses OpenAI to create personalized dating profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import { openRouter, OPENROUTER_MODELS } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileData, style, variation = 1 } = body;

    if (!profileData || !style) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Build the prompt based on the style and variation
    const prompt = buildPrompt(profileData, style, variation);

    // Generate profile using OpenRouter
    const generatedProfile = await openRouter.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [
        {
          role: "system",
          content: `Je bent een expert dating profile schrijver. Je schrijft pakkende, authentieke dating profielen die opvallen. Gebruik altijd Nederlands. Focus op 'show, don't tell' - toon persoonlijkheid door verhalen en specifieke details. Vermijd clichés. Eindig altijd met een vraag om gesprekken te starten. Houd het tussen 400-500 karakters voor optimale dating app lengte.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      {
        max_tokens: 300,
        temperature: 0.8, // Higher temperature for more variation
      }
    );

    if (!generatedProfile) {
      throw new Error('Failed to generate profile');
    }

    return NextResponse.json({
      profile: generatedProfile,
      characterCount: generatedProfile.length,
      style: style,
      variation: variation
    });

  } catch (error: any) {
    console.error('Error generating profile:', error);
    return NextResponse.json({
      error: 'Failed to generate profile',
      message: error.message
    }, { status: 500 });
  }
}

function buildPrompt(profileData: any, style: string, variation: number): string {
  const { datingApp, goal, personalDetails, partnerPreferences } = profileData;

  let styleInstructions = '';
  let variationFocus = '';

  switch (style) {
    case 'humorous':
      styleInstructions = `Schrijf een VLOT & HUMORISTISCH profiel. Gebruik geestige zinnen, lichte humor en een speelse toon. Perfect voor ${datingApp}.`;
      variationFocus = variation === 1 ? 'Focus op dagelijkse humor en leuke anekdotes.' :
                      variation === 2 ? 'Focus op absurde situaties en zelfspot.' :
                      'Focus op woordspelingen en gevatte opmerkingen.';
      break;
    case 'authentic':
      styleInstructions = `Schrijf een DIEPGAAND & AUTHENTIEK profiel. Focus op emotionele diepgang, waarden en echte verhalen. Perfect voor ${datingApp}.`;
      variationFocus = variation === 1 ? 'Focus op levenslessen en persoonlijke groei.' :
                      variation === 2 ? 'Focus op relaties en menselijke connectie.' :
                      'Focus op toekomstvisie en gedeelde dromen.';
      break;
    case 'minimalist':
      styleInstructions = `Schrijf een MINIMALISTISCH & INTRIGEREND profiel. Gebruik korte, krachtige zinnen die nieuwsgierigheid opwekken. Perfect voor ${datingApp}.`;
      variationFocus = variation === 1 ? 'Focus op mysteries en subtiliteit.' :
                      variation === 2 ? 'Focus op paradoxen en diepzinnigheid.' :
                      'Focus op schoonheid in eenvoud.';
      break;
  }

  const goalText = goal === 'serious' ? 'serieuze relatie' :
                   goal === 'casual' ? 'casual daten' :
                   goal === 'friendship' ? 'vriendschap' : 'alles';

  return `${styleInstructions}

${variationFocus}

GEBRUIKER INFO:
- Dating app: ${datingApp}
- Doel: ${goalText}
- Persoonlijke details: ${personalDetails.join(', ')}
- Zoekt in partner: ${partnerPreferences.join(', ')}

Schrijf een uniek profiel dat deze informatie gebruikt. Wees specifiek, vermijd clichés, toon persoonlijkheid door verhalen. Eindig met een vraag. Maak deze variatie anders dan andere mogelijke versies.`;
}