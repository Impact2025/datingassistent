import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { hasActiveSubscription } from '@/lib/subscription';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';
import { trackFeatureUsage } from '@/lib/usage-tracking';
import { sql } from '@vercel/postgres';
import { OPENROUTER_MODELS } from '@/lib/openrouter';

export const dynamic = 'force-dynamic';

interface PhotoAnalysisResult {
  overall_score: number;
  analysis: {
    lighting: { score: number; feedback: string };
    composition: { score: number; feedback: string };
    authenticity: { score: number; feedback: string };
    facial_expression: { score: number; feedback: string };
  };
  tips: string[];
  suggestions: {
    alternative_angles: string[];
    background: string[];
    overall: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 🔒 SECURITY: Require authentication
    const user = await requireAuth(request);

    // 🔒 SECURITY: Check if user has active subscription OR program enrollment
    // Photo analysis is available for Kickstart, Transformatie, and VIP users
    const hasSubscription = await hasActiveSubscription(user.id);

    // Also check for program enrollments (Kickstart, Transformatie, VIP)
    const programCheck = await sql`
      SELECT COUNT(*) as count
      FROM program_enrollments pe
      JOIN programs p ON pe.program_id = p.id
      WHERE pe.user_id = ${user.id}
      AND p.slug IN ('kickstart', 'transformatie', 'vip')
      AND pe.status = 'active'
    `;

    const hasProgram = parseInt(programCheck.rows[0]?.count || '0') > 0;

    if (!hasSubscription && !hasProgram) {
      return NextResponse.json(
        {
          error: 'Abonnement vereist',
          message: 'Foto analyse is alleen beschikbaar voor gebruikers met een actief abonnement. Upgrade naar een betaald abonnement om foto\'s te laten analyseren.'
        },
        { status: 403 }
      );
    }

    // 🔒 SECURITY: Rate limiting to prevent API cost abuse
    const identifier = getClientIdentifier(request);
    const rateLimit = await rateLimitExpensiveAI(identifier);

    if (!rateLimit.success) {
      const headers = createRateLimitHeaders(rateLimit);
      const resetDate = new Date(rateLimit.resetAt);
      return NextResponse.json(
        {
          error: 'rate_limit_exceeded',
          message: `Te veel foto analyses. Probeer opnieuw na ${resetDate.toLocaleTimeString('nl-NL')}.`,
          resetAt: resetDate.toISOString(),
        },
        { status: 429, headers }
      );
    }

    // Get the photo from form data
    const formData = await request.formData();
    const photo = formData.get('photo') as File;
    const context = formData.get('context') as string || 'profile_photo';

    if (!photo) {
      return NextResponse.json(
        { error: 'No photo provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!photo.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (photo.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    logger.log('📸 Analyzing photo:', photo.name, photo.type, `${(photo.size / 1024).toFixed(2)}KB`);

    // Convert image to base64
    const buffer = await photo.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = photo.type;

    // Call OpenRouter API with vision model
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `Je bent een STRIKTE dating foto expert. Analyseer deze ${context === 'profile_photo' ? 'EERSTE PROFIELFOTO' : 'date foto'} voor dating apps met hoge STANDARDS.

BELANGRIJK: Wees HONEST en STRIKT - alleen PERFECTE foto's krijgen hoge scores. De meeste foto's voldoen NIET aan professionele dating criteria.

Geef ALLEEN een JSON object terug.

JSON Structuur:
{
  "overall_score": 6.5,
  "analysis": {
    "lighting": {
      "score": 7,
      "feedback": "Acceptabele natuurlijke belichting, maar gezicht zou helderder kunnen zijn"
    },
    "composition": {
      "score": 6,
      "feedback": "Close-up compositie maar gezicht vult slechts 50% van frame - te ver weg"
    },
    "authenticity": {
      "score": 8,
      "feedback": "Natuurlijke uitstraling maar enigszins stijf - meer ontspanning nodig"
    },
    "facial_expression": {
      "score": 5,
      "feedback": "Glimlach aanwezig maar tanden niet zichtbaar, oogcontact matig"
    }
  },
  "tips": [
    "❌ NIET perfect voor eerste profielfoto - verbeterpunten nodig",
    "💡 Neem een dichtere close-up (hoofd/schouders)",
    "🎯 Lach breder met tanden zichtbaar voor benaderbaarheid",
    "🌟 Verbeter oogcontact - kijk direct in camera"
  ],
  "suggestions": {
    "alternative_angles": [
      "Close-up portret: alleen hoofd, nek en schouders zichtbaar",
      "Half-body shot: tot aan middel, gezicht centraal"
    ],
    "background": [
      "Volledig neutrale achtergrond - geen afleiding",
      "Rustige setting binnenshuis of buiten"
    ],
    "overall": "Deze foto heeft potentieel maar voldoet nog niet aan criteria voor perfecte eerste profielfoto. Verbeteringen nodig voor optimaal dating succes."
  }
}

STRIKTE PERFECTE EERSTE FOTO CRITERIA - SCOOR SLECHTS HOOG ALS ALLE Punten Voldaan:
1. 📸 CLOSE-UP COMPOSITIE: Hoofd, nek, schouders OF tot middel. Gezicht 60-70% van frame
2. 😊 PERFECTE GLIMLACH: Oprecht, spontaan, MET TANDEN ZICHTBAAR, ogen lachen mee
3. 👁️ DIRECT OOGCONTACT: Recht in camera kijken, geen afgewende blik
4. 🎨 RUSTIGE ACHTERGROND: 100% neutraal, geen afleidende elementen
5. 💡 NATUURLIJK LICHT: Professionele kwaliteit belichting
6. 🎭 100% AUTHENTIEK: Geen filters, geen zware bewerking, jezelf zijn
7. 📱 HOOG RESOLUTIE: Scherpe details, geen korreligheid
8. 🕒 RECENT: Toont huidige uiterlijk

Wees STRIKT - gemiddelde dating foto's krijgen 5-6/10. Alleen EXCEPTIONELE foto's krijgen 8+/10.`;

    logger.log('🤖 Calling OpenRouter Vision API...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9001',
        'X-Title': 'DatingAssistent Photo Analysis'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64}`
                }
              }
            ]
          }
        ],
        temperature: 0.8, // Higher temperature for more varied responses
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenRouter API error:', response.status, errorData);
      let userMessage = 'Foto analyse mislukt. Probeer het opnieuw.';
      try {
        const parsed = JSON.parse(errorData);
        if (parsed?.error?.message) userMessage = parsed.error.message;
      } catch { /* keep default */ }
      return NextResponse.json(
        { error: userMessage, details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    logger.log('✅ OpenRouter response received');

    // Parse the AI response
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      console.error('❌ No content in AI response');
      return NextResponse.json(
        { error: 'No analysis generated' },
        { status: 500 }
      );
    }

    logger.log('📝 AI Response:', aiResponse);

    // Try to parse JSON from the response
    let analysis: PhotoAnalysisResult;

    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      analysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError);
      console.error('Raw response:', aiResponse);

      // Fallback: return a basic analysis
      analysis = {
        overall_score: 7.0,
        analysis: {
          lighting: { score: 7.0, feedback: 'Kon de foto niet volledig analyseren, probeer opnieuw' },
          composition: { score: 7.0, feedback: 'Analyse mislukt' },
          authenticity: { score: 7.0, feedback: 'Analyse mislukt' },
          facial_expression: { score: 7.0, feedback: 'Analyse mislukt' }
        },
        tips: [
          '⚠️ Er ging iets mis bij de analyse',
          '🔄 Probeer het opnieuw met een andere foto',
          '💡 Zorg dat de foto duidelijk en goed belicht is'
        ],
        suggestions: {
          alternative_angles: ['Probeer een andere hoek'],
          background: ['Kies een neutrale achtergrond'],
          overall: 'Probeer het opnieuw met een duidelijkere foto'
        }
      };
    }

    logger.log('✅ Photo analysis complete');

    // Track usage
    await trackFeatureUsage(user.id, 'photo_check');

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('❌ Photo analysis error:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized: Please login' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to analyze photo', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
