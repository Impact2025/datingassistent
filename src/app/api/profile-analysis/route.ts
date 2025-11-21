import { NextRequest, NextResponse } from 'next/server';
import { openRouter, OPENROUTER_MODELS } from '@/lib/openrouter';

interface ProfileData {
  name: string;
  age: string;
  bio: string;
  interests: string;
  occupation: string;
  location: string;
}

interface AnalysisResult {
  overallScore: number;
  categories: {
    bio: CategoryScore;
    photos: CategoryScore;
    interests: CategoryScore;
    personality: CategoryScore;
  };
  recommendations: string[];
  strengths: string[];
  improvements: string[];
}

interface CategoryScore {
  score: number;
  label: string;
  feedback: string;
}

export async function POST(request: NextRequest) {
  try {
    const profileData: ProfileData = await request.json();

    // Validate required fields
    if (!profileData.bio || !profileData.name) {
      return NextResponse.json({
        error: 'missing_required_fields',
        message: 'Naam en bio zijn verplicht'
      }, { status: 400 });
    }

    // Create comprehensive analysis prompt
    const analysisPrompt = `
Je bent een professionele dating profile analist met jarenlange ervaring. Analyseer dit dating profiel en geef een gedetailleerde score van 0-100 voor elke categorie.

Profiel gegevens:
- Naam: ${profileData.name}
- Leeftijd: ${profileData.age || 'Niet opgegeven'}
- Beroep: ${profileData.occupation || 'Niet opgegeven'}
- Locatie: ${profileData.location || 'Niet opgegeven'}
- Bio: "${profileData.bio}"
- Interesses: "${profileData.interests || 'Niet opgegeven'}"

Beoordeel op deze categorieën:
1. BIO (0-100): Lengte, aantrekkelijkheid, persoonlijkheid, schrijfstijl, humor, authenticiteit
2. FOTO'S (0-100): Hoewel we geen foto's zien, geef advies gebaseerd op bio en profilering
3. INTERESSES (0-100): Diversiteit, aantrekkelijkheid voor doelgroep, originaliteit
4. PERSOONLIJKHEID (0-100): Benaderbaarheid, authenticiteit, aantrekkingskracht

Geef een JSON response met deze structuur:
{
  "overallScore": number,
  "categories": {
    "bio": {"score": number, "label": "string", "feedback": "string"},
    "photos": {"score": number, "label": "string", "feedback": "string"},
    "interests": {"score": number, "label": "string", "feedback": "string"},
    "personality": {"score": number, "label": "string", "feedback": "string"}
  },
  "recommendations": ["string"],
  "strengths": ["string"],
  "improvements": ["string"]
}

Wees eerlijk maar bemoedigend. Focus op concrete verbeterpunten.
`;

    // Call AI for analysis
    const aiResponse = await openRouter.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [{ role: 'user', content: analysisPrompt }],
      {
        max_tokens: 1500,
        temperature: 0.7,
      }
    );

    let analysisResult: AnalysisResult;

    try {
      // Parse AI response
      const rawResponse = aiResponse.trim();

      // Clean up response if it has markdown formatting
      const cleanedResponse = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      analysisResult = JSON.parse(cleanedResponse);

      // Validate the response structure
      if (!analysisResult.overallScore || !analysisResult.categories) {
        throw new Error('Invalid response structure');
      }

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI response:', aiResponse);

      // Fallback response
      analysisResult = {
        overallScore: 75,
        categories: {
          bio: {
            score: 78,
            label: 'Goed',
            feedback: 'Je bio is duidelijk en authentiek. Er is ruimte voor meer persoonlijkheid.'
          },
          photos: {
            score: 70,
            label: 'Gemiddeld',
            feedback: 'Zorg voor diverse foto\'s die je persoonlijkheid laten zien.'
          },
          interests: {
            score: 80,
            label: 'Goed',
            feedback: 'Je interesses spreken een breed publiek aan.'
          },
          personality: {
            score: 75,
            label: 'Goed',
            feedback: 'Je komt benaderbaar over, maar zou meer humor kunnen gebruiken.'
          }
        },
        recommendations: [
          'Maak je bio persoonlijker met specifieke verhalen',
          'Voeg foto\'s toe in verschillende settings',
          'Wees specifieker over wat je zoekt in een partner'
        ],
        strengths: [
          'Duidelijke communicatie',
          'Authentieke uitstraling',
          'Interessante achtergrond'
        ],
        improvements: [
          'Meer humor toevoegen',
          'Specifiekere interesses benoemen',
          'Duidelijker maken wat je zoekt'
        ]
      };
    }

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Profile analysis error:', error);
    return NextResponse.json({
      error: 'analysis_failed',
      message: 'Analyse mislukt. Probeer het opnieuw.'
    }, { status: 500 });
  }
}