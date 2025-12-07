import { NextRequest, NextResponse } from 'next/server';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';
import { trackFeatureUsage } from '@/lib/usage-tracking';

export const dynamic = 'force-dynamic';

/**
 * Lead Photo Analysis API
 *
 * Special endpoint for the lead activation onboarding flow.
 * Does NOT require authentication since users just registered.
 * Rate limited by IP to prevent abuse.
 */

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
    // Rate limiting by IP to prevent abuse
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
    const userId = formData.get('userId') as string;
    const context = formData.get('context') as string || 'profile_photo';

    if (!photo) {
      return NextResponse.json(
        { error: 'No photo provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'No userId provided' },
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

    console.log('📸 [Lead] Analyzing photo for user:', userId, photo.name, photo.type, `${(photo.size / 1024).toFixed(2)}KB`);

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

    console.log('🤖 [Lead] Calling OpenRouter Vision API...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9001',
        'X-Title': 'DatingAssistent Lead Photo Analysis'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku:beta',
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
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ [Lead] OpenRouter API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to analyze photo', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('✅ [Lead] OpenRouter response received');

    // Parse the AI response
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      console.error('❌ [Lead] No content in AI response');
      return NextResponse.json(
        { error: 'No analysis generated' },
        { status: 500 }
      );
    }

    console.log('📝 [Lead] AI Response:', aiResponse);

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
      console.error('❌ [Lead] Failed to parse AI response as JSON:', parseError);
      console.error('Raw response:', aiResponse);

      // Fallback: return a basic analysis
      analysis = {
        overall_score: 6.5,
        analysis: {
          lighting: { score: 6.5, feedback: 'De belichting is acceptabel maar kan verbeterd worden met meer natuurlijk licht' },
          composition: { score: 6.0, feedback: 'Probeer dichterbij te komen voor een betere close-up' },
          authenticity: { score: 7.0, feedback: 'Je komt authentiek over, dat is goed!' },
          facial_expression: { score: 6.0, feedback: 'Probeer meer te glimlachen met je ogen' }
        },
        tips: [
          '💡 Gebruik meer natuurlijk daglicht',
          '📸 Maak een dichtere close-up foto',
          '😊 Lach meer met je ogen voor warmte'
        ],
        suggestions: {
          alternative_angles: ['Probeer een 3/4 hoek voor meer diepte'],
          background: ['Kies een rustige, neutrale achtergrond'],
          overall: 'Goede basis, met kleine aanpassingen kun je flink verbeteren!'
        }
      };
    }

    console.log('✅ [Lead] Photo analysis complete for user:', userId);

    // Track usage (if possible)
    try {
      await trackFeatureUsage(parseInt(userId), 'lead_photo_check');
    } catch (trackError) {
      console.warn('⚠️ [Lead] Could not track usage:', trackError);
    }

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('❌ [Lead] Photo analysis error:', error);

    return NextResponse.json(
      { error: 'Failed to analyze photo', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
