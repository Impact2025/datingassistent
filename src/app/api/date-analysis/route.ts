import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-service';
import { verifyToken } from '@/lib/auth';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';
import { trackFeatureUsage } from '@/lib/neon-usage-tracking';
import { checkAndEnforceLimit } from '@/lib/api-helpers';
import { AIContextManager } from '@/lib/ai-context-manager';

// Helper functions for extracting insights from date analysis
function extractKeyThemes(goodParts: string, differentParts: string, aiResponse: string): string[] {
  const themes: string[] = [];

  // Extract themes from user input
  const input = `${goodParts} ${differentParts}`.toLowerCase();

  if (input.includes('gesprek') || input.includes('praten')) themes.push('conversation');
  if (input.includes('humor') || input.includes('grappig')) themes.push('humor');
  if (input.includes('interesse') || input.includes('hobby')) themes.push('shared interests');
  if (input.includes('lichamelijk') || input.includes('aanraking')) themes.push('physical connection');
  if (input.includes('respect') || input.includes('beleefd')) themes.push('respect');
  if (input.includes('luisteren') || input.includes('aandacht')) themes.push('active listening');

  return [...new Set(themes)]; // Remove duplicates
}

function updateCommonThemes(existingThemes: string[], newThemes: string[]): string[] {
  const allThemes = [...existingThemes, ...newThemes];
  // Keep only themes that appear multiple times (common patterns)
  const themeCount: { [key: string]: number } = {};
  allThemes.forEach(theme => {
    themeCount[theme] = (themeCount[theme] || 0) + 1;
  });

  return Object.keys(themeCount).filter(theme => themeCount[theme] >= 2);
}

function extractImprovementAreas(aiResponse: string): string[] {
  const areas: string[] = [];
  const response = aiResponse.toLowerCase();

  if (response.includes('meer vragen') || response.includes('dieper ingaan')) areas.push('ask more questions');
  if (response.includes('luisteren') || response.includes('aandacht')) areas.push('active listening');
  if (response.includes('humor') || response.includes('grappig')) areas.push('develop humor');
  if (response.includes('zelfvertrouwen') || response.includes('zekerheid')) areas.push('build confidence');
  if (response.includes('grens') || response.includes('respect')) areas.push('set boundaries');

  return areas;
}

function extractStrengths(aiResponse: string): string[] {
  const strengths: string[] = [];
  const response = aiResponse.toLowerCase();

  if (response.includes('goed gesprek') || response.includes('communicatie')) strengths.push('good communication');
  if (response.includes('echt') || response.includes('authentiek')) strengths.push('authentic');
  if (response.includes('luister') || response.includes('aandacht')) strengths.push('good listener');
  if (response.includes('humor') || response.includes('grappig')) strengths.push('sense of humor');
  if (response.includes('respect') || response.includes('beleefd')) strengths.push('respectful');

  return strengths;
}

function extractSuccessfulElements(goodParts: string): string[] {
  const elements: string[] = [];
  const input = goodParts.toLowerCase();

  if (input.includes('gesprek')) elements.push('good conversation');
  if (input.includes('humor')) elements.push('shared humor');
  if (input.includes('interesse')) elements.push('shared interests');
  if (input.includes('comfortabel')) elements.push('comfortable atmosphere');
  if (input.includes('connectie')) elements.push('emotional connection');

  return elements;
}

function extractChallenges(differentParts: string): string[] {
  const challenges: string[] = [];
  const input = differentParts.toLowerCase();

  if (input.includes('stil') || input.includes('lastig gesprek')) challenges.push('conversation flow');
  if (input.includes('zenuw') || input.includes('oncomfortabel')) challenges.push('comfort level');
  if (input.includes('verschil') || input.includes('mening')) challenges.push('different opinions');
  if (input.includes('timing') || input.includes('tijd')) challenges.push('timing issues');

  return challenges;
}

function extractPreferences(aiResponse: string): string[] {
  const preferences: string[] = [];
  const response = aiResponse.toLowerCase();

  if (response.includes('meer humor')) preferences.push('more humor');
  if (response.includes('diepere gesprek')) preferences.push('deeper conversations');
  if (response.includes('avontuur')) preferences.push('adventurous activities');
  if (response.includes('rustig')) preferences.push('calm settings');
  if (response.includes('actief')) preferences.push('active dates');

  return preferences;
}

/**
 * API endpoint voor AI-date analyse en reflectie
 * Gebruik: POST http://localhost:9001/api/date-analysis
 * 🔒 SECURITY: Authenticated + Rate limited
 */
export async function POST(request: Request) {
  try {
    // 🔒 SECURITY: Rate limiting to prevent API cost abuse
    const identifier = getClientIdentifier(request);
    const rateLimit = await rateLimitExpensiveAI(identifier);

    if (!rateLimit.success) {
      const headers = createRateLimitHeaders(rateLimit);
      const resetDate = new Date(rateLimit.resetAt);
      return NextResponse.json(
        {
          error: 'rate_limit_exceeded',
          message: `Te veel verzoeken. Probeer opnieuw na ${resetDate.toLocaleTimeString('nl-NL')}.`,
          resetAt: resetDate.toISOString(),
        },
        { status: 429, headers }
      );
    }

    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // 🔒 SUBSCRIPTION: Check feature limit before processing (skip in development)
    if (process.env.NODE_ENV !== 'development') {
      const limitCheck = await checkAndEnforceLimit(user.id, 'date_analysis');
      if (limitCheck) {
        return limitCheck;
      }
    }

    const { goodParts, differentParts } = await request.json();

    if ((!goodParts || goodParts.trim().length === 0) && (!differentParts || differentParts.trim().length === 0)) {
      return NextResponse.json(
        { error: 'At least one field must be filled' },
        { status: 400 }
      );
    }

    const systemPrompt = `Je bent een empathische en constructieve dating coach uit Nederland. Een gebruiker reflecteert op een date die ze hebben gehad.

Je taak is om:
1. De positieve aspecten te valideren en versterken
2. Constructieve feedback te geven op verbeterpunten zonder te oordelen
3. Concrete, praktische tips te geven voor volgende dates
4. De gebruiker te helpen leren wat ze wel en niet zoeken in een partner

Gebruik markdown voor formattering:
- **Vetgedrukte tekst** voor belangrijke punten
- Korte alinea's voor leesbaarheid
- Bullet points of genummerde lijsten voor tips

Houd je antwoord warm, ondersteunend en tussen de 150-250 woorden.`;

    let userMessage = 'Ik wil graag reflecteren op mijn date:\n\n';

    if (goodParts && goodParts.trim().length > 0) {
      userMessage += `**Wat voelde goed:**\n${goodParts}\n\n`;
    }

    if (differentParts && differentParts.trim().length > 0) {
      userMessage += `**Wat zou ik anders willen:**\n${differentParts}`;
    }

    // Get response from AI service
    const response = await chatCompletion(
      [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      {
        provider: 'openrouter',
        maxTokens: 1000, // Verhoogd voor diepgaande reflectie en concrete tips
        temperature: 0.7
      }
    );

    // Track usage (skip in development)
    if (process.env.NODE_ENV !== 'development') {
      await trackFeatureUsage(user.id, 'date_analysis');
    }

    // Save insights to AI context for future personalization
    try {
      const existingContext = await AIContextManager.getUserContext(user.id);

      // Extract key insights from user input and AI response
      const insights = {
        goodParts: goodParts || '',
        differentParts: differentParts || '',
        analysisDate: new Date(),
        keyThemes: extractKeyThemes(goodParts, differentParts, response)
      };

      // Update date analysis history in AI context
      const updatedContext = {
        ...existingContext,
        dateAnalysisHistory: {
          totalAnalyses: (existingContext?.dateAnalysisHistory?.totalAnalyses || 0) + 1,
          lastAnalysisDate: new Date(),
          commonThemes: updateCommonThemes(existingContext?.dateAnalysisHistory?.commonThemes || [], insights.keyThemes),
          improvementAreas: extractImprovementAreas(response),
          strengths: extractStrengths(response),
          datePatterns: {
            successfulElements: extractSuccessfulElements(goodParts),
            challenges: extractChallenges(differentParts),
            preferences: extractPreferences(response)
          }
        }
      };

      await AIContextManager.saveUserContext(user.id, updatedContext);
      console.log(`✅ Date analysis insights saved to AI context for user ${user.id}`);
    } catch (contextError) {
      console.error('Error saving date analysis to AI context:', contextError);
      // Don't fail the request if context saving fails
    }

    return NextResponse.json({ analysis: response }, { status: 200 });
  } catch (error) {
    console.error('❌ Date analysis error:', error);
    return NextResponse.json(
      {
        error: 'Date analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
