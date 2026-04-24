import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const scanData = await request.json();

    logger.log('🧬 Generating Dating DNA for scan data:', scanData);

    // Build AI prompt
    const prompt = `Je bent een expert dating psycholoog en DatingAssistent coach. Analyseer de volgende dating persoonlijkheidscan en genereer een gedetailleerd "Dating Profiel DNA" rapport dat specifiek adviseert over het gebruik van DatingAssistent tools.

**Scan Resultaten:**
- Huidige situatie: ${scanData.currentSituation || scanData.current_situation}
- Comfort niveau: ${scanData.comfortLevel || scanData.comfort_level}/10
- Grootste uitdaging: ${scanData.mainChallenge || scanData.main_challenge}
- Gewenst resultaat: ${scanData.desiredOutcome || scanData.desired_outcome}
- Eigen krachten: ${scanData.strengthSelf || scanData.strength_self}
- Werk punten: ${scanData.weaknessSelf || scanData.weakness_self}
- Week commitment: ${scanData.weeklyCommitment || scanData.weekly_commitment}

**DatingAssistent Tools die je moet aanbevelen:**
- Chat Coach: AI gesprekstrainer voor oefenen van openingszinnen en replies
- Profiel Analyse: AI feedback op foto's en bio
- Opener Generator: Persoonlijke openingszinnen voor matches
- Icebreakers: Creatieve gesprekstarters
- Bio Generator: AI gegenereerde profiel teksten
- Cursussen: Stapsgewijze dating skill training
- Goal Tracker: Doelen stellen en voortgang bijhouden

Genereer een JSON object met de volgende structuur:
{
  "personalityType": "Een creatieve, beschrijvende naam voor hun dating stijl (bijv: 'De Authentieke Charmeur', 'De Thoughtful Connector')",
  "datingStyle": "Een korte beschrijving (2-3 zinnen) van hun unieke dating aanpak",
  "coreStrengths": ["3-4 concrete krachten gebaseerd op hun antwoorden"],
  "growthAreas": ["3-4 specifieke verbeterpunten"],
  "communicationStyle": "Beschrijving van hoe ze communiceren in dating context",
  "confidenceLevel": "low|medium|high - gebaseerd op comfort level en antwoorden",
  "recommendedApproach": "Specifieke aanpak strategie voor hun situatie",
  "keyInsights": ["3-4 belangrijke inzichten over hun dating persoonlijkheid"],
  "actionItems": ["3-4 concrete acties die DATINGASSISTENT TOOLS gebruiken"],
  "appRecommendations": {
    "primaryTools": ["2-3 belangrijkste DatingAssistent tools voor hun situatie"],
    "usageTips": ["3-4 specifieke tips hoe ze de tools moeten gebruiken"],
    "weeklyRoutine": "Specifieke routine met app tools voor hun commitment niveau",
    "expectedOutcomes": "Wat ze kunnen verwachten na 2-4 weken app gebruik"
  }
}

**Belangrijk:**
- Wees eerlijk maar bemoedigend
- Geef concrete, actionable adviezen MET SPECIFIEKE APP TOOLS
- Gebruik informele "je/jij" aanspreekvorm in Nederlands
- Wees specifiek - gebruik hun eigen woorden waar mogelijk
- Focus op groei en positieve ontwikkeling
- Maak actionItems afhankelijk van DatingAssistent features
- Zorg dat appRecommendations praktisch en motiverend zijn

Antwoord ALLEEN met het JSON object, geen extra text.`;

    let dnaResults;

    try {
      const aiResponse = await chatCompletion(
        [
          {
            role: 'system',
            content: 'Je bent een expert dating psycholoog. Geef altijd een geldig JSON antwoord, geen extra tekst.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        {
          provider: 'openrouter',
          maxTokens: 1200,
          temperature: 0.7
        }
      );

      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in AI response');
      dnaResults = JSON.parse(jsonMatch[0]);

      logger.log('✅ Generated DNA Results via AI');

      return NextResponse.json({
        success: true,
        dnaResults,
      });

    } catch (aiError) {
      console.error('AI generation failed:', aiError);

      // Return template-based fallback
      const fallbackDNA = {
        personalityType: "Jouw Authentieke Dating Stijl",
        datingStyle: "Je hebt een oprechte en doelgerichte benadering van daten. Je bent bereid om te investeren in je groei en dat is een sterke basis.",
        coreStrengths: [
          scanData.strengthSelf || scanData.strength_self || "Je bent oprecht en authentiek",
          "Je bent gemotiveerd om te groeien",
          "Je hebt een duidelijk doel voor ogen"
        ],
        growthAreas: [
          scanData.weaknessSelf || scanData.weakness_self || "Meer zelfvertrouwen opbouwen",
          "Betere profiel optimalisatie",
          "Consistentie in dating activiteiten"
        ],
        communicationStyle: "Je communiceert eerlijk en bent open voor feedback en verbetering.",
        confidenceLevel: (scanData.comfortLevel || scanData.comfort_level || 5) >= 7 ? "high" : (scanData.comfortLevel || scanData.comfort_level || 5) >= 4 ? "medium" : "low",
        recommendedApproach: "Begin met kleine stappen: verbeter eerst je profiel, dan je communicatie, en bouw langzaam je ervaring op.",
        keyInsights: [
          "Je zelfkennis is sterk - je weet wat je krachten en verbeterpunten zijn",
          "Je commitment niveau laat zien dat je dating serieus neemt",
          "Je bent in de juiste fase om echte vooruitgang te boeken"
        ],
        actionItems: [
          "Gebruik Profiel Analyse om je huidige foto's te verbeteren",
          "Genereer persoonlijke openers met de Opener Generator",
          "Oefen gesprekken met de Chat Coach",
          "Volg een cursus voor je specifieke uitdagingen"
        ],
        appRecommendations: {
          primaryTools: ["Profiel Analyse", "Chat Coach", "Opener Generator"],
          usageTips: [
            "Upload je beste foto eerst naar Profiel Analyse voor directe feedback",
            "Begin met eenvoudige oefeningen in Chat Coach om zelfvertrouwen op te bouwen",
            "Kopieer gegenereerde openers naar dating apps voor direct gebruik"
          ],
          weeklyRoutine: `Week routine: Ma - Profiel verbeteren, Di - Chat oefenen, Wo - Nieuwe openers maken, Do/Vr - Cursussen volgen, Za - Uitvoeren in praktijk`,
          expectedOutcomes: "Na 1 week: Betere profiel en eerste oefeningen. Na 2 weken: Meer matches door betere openers. Na 4 weken: Vloeiendere gesprekken en meer dates."
        }
      };

      return NextResponse.json({
        success: true,
        dnaResults: fallbackDNA,
        fallback: true,
      });
    }

  } catch (error) {
    console.error('DNA generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate DNA profile' },
      { status: 500 }
    );
  }
}
