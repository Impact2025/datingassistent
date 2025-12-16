import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';
import { checkToolAccessForUser } from '@/lib/access-control';

// System prompt for the Vibe Check Simulator
const SYSTEM_PROMPT = `Je bent een empathische dating coach die helpt bij het begrijpen van de emotionele impact van profielfoto's. Je simuleert de ervaring van een potentiële match die door een dating app scrollt.

Je geeft GEEN technische feedback over:
- Belichting
- Resolutie
- Compositie
- Kwaliteit

Je focust WEL op:
- Emotionele eerste indruk
- Vibe en energie die de foto uitstraalt
- Wat iemand zou kunnen denken bij het zien
- Uitnodigende vs afstotende elementen

Je toon is warm, eerlijk maar constructief. Je helpt mensen begrijpen hoe ze overkomen, niet hoe technisch perfect hun foto is.

Antwoord ALTIJD in het Nederlands.`;

// User prompt template
const USER_PROMPT = `Analyseer deze profielfoto vanuit het perspectief van een potentiële match die voor het eerst door een dating app scrollt.

Geef feedback in JSON format met deze velden:

{
  "eerste_emotie": "De primaire emotie die de foto oproept (warmte, avontuur, mysterie, betrouwbaarheid, humor, etc.)",
  "eerste_gedachte": "Simuleer wat iemand zou denken in 1 zin, beginnend met 'Deze persoon lijkt...'",
  "vibe_scores": {
    "toegankelijk_mysterieus": 0-100 (0=zeer toegankelijk, 100=zeer mysterieus),
    "serieus_speels": 0-100 (0=zeer serieus, 100=zeer speels),
    "rustig_avontuurlijk": 0-100 (0=zeer rustig, 100=zeer avontuurlijk)
  },
  "nieuwsgierigheid_factor": "Wat maakt nieuwsgierig? Wat roept vragen op?",
  "suggestie": "Eén concrete tip om de emotionele impact te versterken",
  "overall_vibe": "Een samenvatting van de totale vibe in 2-3 zinnen"
}

Geef ALLEEN de JSON terug, geen andere tekst.`;

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
    const accessCheck = await checkToolAccessForUser(userId, 'vibe-check-simulator');
    if (!accessCheck.hasAccess) {
      return NextResponse.json({
        error: 'Geen toegang tot deze tool',
        reason: accessCheck.reason,
        requiredTier: 'transformatie'
      }, { status: 403 });
    }

    const body = await request.json();
    const { imageUrl, imageBase64 } = body;

    if (!imageUrl && !imageBase64) {
      return NextResponse.json({ error: 'Geen afbeelding opgegeven' }, { status: 400 });
    }

    // Prepare image content for vision model
    let imageContent: any;
    if (imageBase64) {
      imageContent = {
        type: 'image_url',
        image_url: {
          url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
        }
      };
    } else {
      imageContent = {
        type: 'image_url',
        image_url: {
          url: imageUrl
        }
      };
    }

    // Call OpenRouter with vision model
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // Return mock response in development
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          analysis: getMockAnalysis(),
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
        'X-Title': 'DatingAssistent - Vibe Check',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: USER_PROMPT },
              imageContent
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter error:', errorText);
      throw new Error(`AI analyse mislukt: ${openRouterResponse.status}`);
    }

    const aiResponse = await openRouterResponse.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Geen response van AI model');
    }

    // Parse the JSON response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(content);
      }
    } catch {
      // If parsing fails, create structured response from text
      analysis = {
        eerste_emotie: 'warmte',
        eerste_gedachte: 'Deze persoon lijkt vriendelijk en benaderbaar.',
        vibe_scores: {
          toegankelijk_mysterieus: 30,
          serieus_speels: 60,
          rustig_avontuurlijk: 50
        },
        nieuwsgierigheid_factor: content.substring(0, 200),
        suggestie: 'Probeer meer expressie te tonen in je foto.',
        overall_vibe: content.substring(0, 300),
        raw_response: content
      };
    }

    // Store result in database
    await sql`
      INSERT INTO vibe_check_results (
        user_id,
        image_url,
        emotional_analysis,
        vibe_scores,
        suggestions
      ) VALUES (
        ${userId},
        ${imageUrl || 'base64_upload'},
        ${JSON.stringify({
          eerste_emotie: analysis.eerste_emotie,
          eerste_gedachte: analysis.eerste_gedachte,
          nieuwsgierigheid_factor: analysis.nieuwsgierigheid_factor,
          overall_vibe: analysis.overall_vibe
        })},
        ${JSON.stringify(analysis.vibe_scores)},
        ${JSON.stringify([analysis.suggestie])}
      )
    `;

    return NextResponse.json({
      success: true,
      analysis: {
        eersteEmotie: analysis.eerste_emotie,
        eersteGedachte: analysis.eerste_gedachte,
        vibeScores: {
          toegankelijkMysterieus: analysis.vibe_scores?.toegankelijk_mysterieus || 50,
          serieuseSpeels: analysis.vibe_scores?.serieus_speels || 50,
          rustigAvontuurlijk: analysis.vibe_scores?.rustig_avontuurlijk || 50
        },
        nieuwsgierigheidFactor: analysis.nieuwsgierigheid_factor,
        suggestie: analysis.suggestie,
        overallVibe: analysis.overall_vibe
      }
    });

  } catch (error: any) {
    console.error('Vibe Check error:', error);
    return NextResponse.json({
      error: 'Analyse mislukt',
      message: error.message
    }, { status: 500 });
  }
}

// GET: Get user's vibe check history
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
      SELECT * FROM vibe_check_results
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      success: true,
      history: results.rows
    });

  } catch (error: any) {
    console.error('Vibe Check history error:', error);
    return NextResponse.json({
      error: 'Ophalen mislukt',
      message: error.message
    }, { status: 500 });
  }
}

function getMockAnalysis() {
  return {
    eersteEmotie: 'warmte en vriendelijkheid',
    eersteGedachte: 'Deze persoon lijkt open, benaderbaar en iemand met wie je makkelijk een gesprek zou kunnen starten.',
    vibeScores: {
      toegankelijkMysterieus: 25,
      serieuseSpeels: 65,
      rustigAvontuurlijk: 55
    },
    nieuwsgierigheidFactor: 'De glimlach is oprecht en nodigt uit tot contact. De achtergrond suggereert een actief leven.',
    suggestie: 'Overweeg een foto toe te voegen die een specifieke hobby of passie toont - dit geeft matches een conversation starter.',
    overallVibe: 'Deze foto straalt een warme, uitnodigende energie uit. Je komt over als iemand die zowel serieuze gesprekken als luchtige momenten kan hebben. De balans tussen toegankelijkheid en een vleugje mysterie werkt goed.'
  };
}
