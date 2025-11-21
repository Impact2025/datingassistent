import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { chatCompletion } from '@/lib/ai-service';
import { AIContextManager } from '@/lib/ai-context-manager';

export async function POST(request: Request) {
  try {
    // Authenticate user
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

    const { activities, activityDetails, weekStart, weekEnd } = await request.json();

    // Get user's AI context for personalized insights
    const userContext = await AIContextManager.getUserContext(user.id);

    // Build context summary
    const contextSummary = AIContextManager.getContextSummary(userContext);

    // Analyze activities and create insights prompt
    const activitySummary = createActivitySummary(activities, activityDetails);

    const systemPrompt = `Je bent Iris, een professionele dating psycholoog en gedragsanalist uit Nederland. Je analyseert dating gedrag met de precisie van een onderzoeker en de empathie van een coach.

ALS EEN PROFESSIONELE ANALIST:
- Vertel een verhaal over hun dating week gebaseerd op de data
- Identificeer gedragspatronen en psychologische inzichten
- Gebruik professionele taal maar blijf warm en benaderbaar
- Maak het persoonlijk en verhaal-achtig, niet als een lijst
- Wees specifiek over wat de data onthult over hun karakter en strategie
- Koppel inzichten aan concrete gedragsvoorbeelden
- Geef diepgaande psychologische interpretatie

STRUCTUUR ALS EEN VERHALEND RAPPORT:
1. **Opening**: Betrek de gebruiker met een verhaal-opening over hun week
2. **Analyse**: Interpreteer gedragspatronen als verhalen over karakter
3. **Inzicht**: Koppel data aan psychologische concepten
4. **Aanbeveling**: 1 specifieke, actiegerichte volgende stap
5. **Afsluiting**: Motiverende boodschap over groei

PROFESSIONELE STIJL:
- Gebruik metaforen en verhalen om inzichten te illustreren
- Vermijd clichés en generieke adviezen
- Maak het analytisch maar niet afstandelijk
- 200-300 woorden voor diepte zonder te langdradig te worden
- Nederlandse taal met professionele terminologie waar passend`;

    const userPrompt = `Analyseer deze dating week als een professionele gedragspsycholoog. Vertel het verhaal van hun dating gedrag deze week.

**RUWE DATA:**
${activitySummary}

**GEBRUIKERS CONTEXT:**
${contextSummary || 'Nieuwe gebruiker - eerste week op het platform'}

**PSYCHOLOGISCHE ANALYSE OPDRACHT:**

Schrijf een verhaal over hun dating gedrag dat onthult wie ze zijn als dater. Interpreteer de data als psychologische indicatoren:

**VERHALENDE STRUCTUUR:**
- **Begin met een karakterisering**: Wat zegt deze week over hun persoonlijkheid als dater?
- **Analyseer gedragspatronen**: Welke psychologische concepten zie je terug (bijv. risicobereidheid, sociale intelligentie, emotionele beschikbaarheid)?
- **Koppel aan concrete data**: Gebruik specifieke voorbeelden uit hun activiteiten
- **Geef professionele inzichten**: Wat onthult dit over hun relatie met intimiteit, zelfvertrouwen, sociale vaardigheden?
- **Eindig met 1 specifieke, therapeutische interventie**: Niet "probeer harder", maar een gedrag dat hun kernkwaliteiten versterkt

**PROFESSIONELE DIEPTE:**
- Vermijd oppervlakkige complimenten ("goed gedaan!")
- Focus op karakterontwikkeling en zelfbewustzijn
- Gebruik metaforen die hun gedrag illustreren
- Maak het analytisch maar bemoedigend
- Koppel technische data aan menselijke verhalen

**CONCRETE VOORBEELDEN:**
- Een nieuwe match + date = "Je springt in het diepe met de energie van een ontdekkingsreiziger"
- Alleen gesprekken = "Je bouwt bruggen met de zorgvuldigheid van een architect"
- Ghosting ervaringen = "Je leert de grenzen van digitale intimiteit kennen"

Vertel hun verhaal door de lens van een professionele coach die hun potentieel ziet.`;

    // Generate insight using OpenRouter
    const response = await chatCompletion(
      [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      {
        provider: 'openrouter',
        maxTokens: 300,
        temperature: 0.7
      }
    );

    return NextResponse.json({
      insight: response,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating dating insight:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate insight',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function createActivitySummary(activities: string[], activityDetails: any): string {
  let summary = '';

  // Count activities
  const activityCounts = activities.reduce((acc, activity) => {
    acc[activity] = (acc[activity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Create detailed behavioral analysis
  summary += '**GEDRAGSANALYSE - KWALITATIEVE DATA:**\n\n';

  // New matches analysis
  if (activityCounts.new_match) {
    const matchDetails = Object.values(activityDetails)
      .filter((detail: any) => detail.platform || detail.qualityRating);

    summary += `**NIEUWE MATCHES (${activityCounts.new_match}):**\n`;
    matchDetails.forEach((detail: any, index: number) => {
      const platform = detail.platform ? `Platform: ${detail.platform}` : 'Platform: onbekend';
      const quality = detail.qualityRating ?
        `Kwaliteit: ${detail.qualityRating === 'high' ? 'Hoog potentieel' : detail.qualityRating === 'medium' ? 'Gemiddeld' : 'Laag'}` :
        'Kwaliteit: niet beoordeeld';
      const notes = detail.notes ? `Notities: "${detail.notes}"` : '';

      summary += `- Match ${index + 1}: ${platform}, ${quality}`;
      if (notes) summary += `, ${notes}`;
      summary += '\n';
    });
    summary += '\n';
  }

  // Conversation analysis
  if (activityCounts.conversation) {
    const convDetails = Object.values(activityDetails)
      .filter((detail: any) => detail.matchName || detail.status);

    summary += `**GESPREKKEN (${activityCounts.conversation}):**\n`;
    convDetails.forEach((detail: any, index: number) => {
      const name = detail.matchName ? `Met ${detail.matchName}` : 'Anonieme match';
      const status = detail.status ?
        `Status: ${detail.status === 'just_started' ? 'Net begonnen' :
                 detail.status === 'ongoing' ? 'Lopend gesprek' :
                 detail.status === 'deep_conversation' ? 'Diepgaand' :
                 detail.status === 'planning_date' ? 'Date plannen' :
                 detail.status === 'fading' ? 'Vervagend' : detail.status}` :
        'Status: onbekend';
      const notes = detail.conversationNotes ? `Context: "${detail.conversationNotes}"` : '';

      summary += `- ${name}: ${status}`;
      if (notes) summary += `, ${notes}`;
      summary += '\n';
    });
    summary += '\n';
  }

  // Date analysis
  if (activityCounts.date) {
    const dateDetails = Object.values(activityDetails)
      .filter((detail: any) => detail.type || detail.atmosphere);

    summary += `**DATES (${activityCounts.date}):**\n`;
    dateDetails.forEach((detail: any, index: number) => {
      const type = detail.type ?
        `Type: ${detail.type === 'coffee' ? 'Koffie/drankje' :
               detail.type === 'dinner' ? 'Avondeten' :
               detail.type === 'lunch' ? 'Lunch' :
               detail.type === 'walk' ? 'Wandeling' :
               detail.type === 'activity' ? 'Activiteit' :
               detail.type === 'home' ? 'Thuis koken' : detail.type}` :
        'Type: onbekend';
      const atmosphere = detail.atmosphere ?
        `Sfeer: ${detail.atmosphere === 'great' ? 'Geweldig! 😍' :
                detail.atmosphere === 'good' ? 'Goed, klik was er 🤝' :
                detail.atmosphere === 'okay' ? 'Okay, geen chemistry 🤷‍♀️' :
                detail.atmosphere === 'bad' ? 'Niet zo goed 😕' :
                detail.atmosphere === 'terrible' ? 'Slecht, nooit meer 📵' : detail.atmosphere}` :
        'Sfeer: niet beoordeeld';
      const notes = detail.dateNotes ? `Ervaring: "${detail.dateNotes}"` : '';

      summary += `- Date ${index + 1}: ${type}, ${atmosphere}`;
      if (notes) summary += `, ${notes}`;
      summary += '\n';
    });
    summary += '\n';
  }

  // Ghosting analysis
  if (activityCounts.ghosting) {
    const ghostDetails = Object.values(activityDetails)
      .filter((detail: any) => detail.whoGhosted);

    summary += `**GHOSTING ERVARINGEN (${activityCounts.ghosting}):**\n`;
    ghostDetails.forEach((detail: any, index: number) => {
      const who = detail.whoGhosted === 'me' ? 'Gebruiker ghostte iemand anders' : 'Gebruiker werd geghost';
      const notes = detail.ghostingNotes ? `Context: "${detail.ghostingNotes}"` : '';

      summary += `- Ervaring ${index + 1}: ${who}`;
      if (notes) summary += `, ${notes}`;
      summary += '\n';
    });
    summary += '\n';
  }

  // No activity analysis
  if (activityCounts.no_activity) {
    const noActivityDetails = Object.values(activityDetails)
      .filter((detail: any) => detail.reason);

    summary += `**GEEN ACTIVITEIT (${activityCounts.no_activity}):**\n`;
    if (noActivityDetails.length > 0) {
      noActivityDetails.forEach((detail: any, index: number) => {
        summary += `- Reden: "${detail.reason}"\n`;
      });
    } else {
      summary += `- Geen specifieke reden gegeven\n`;
    }
    summary += '\n';
  }

  // Behavioral patterns analysis
  summary += '**GEDRAGS PATRONEN:**\n';
  const totalActivities = activities.length;

  if (totalActivities === 0) {
    summary += '- Geen dating activiteit deze week\n';
  } else {
    const hasMatches = activityCounts.new_match > 0;
    const hasConversations = activityCounts.conversation > 0;
    const hasDates = activityCounts.date > 0;
    const hasGhosting = activityCounts.ghosting > 0;

    if (hasMatches && hasDates) {
      summary += '- **Snelle beslisser**: Springt van match naar date (hoge energie, risicobereid)\n';
    }
    if (hasConversations && !hasDates) {
      summary += '- **Voorzichtige bouwer**: Neemt tijd voor gesprekken voordat actie onderneemt\n';
    }
    if (hasGhosting) {
      summary += '- **Ervaren dater**: Heeft digitale relatie dynamieken meegemaakt\n';
    }
    if (!hasMatches && !hasConversations && !hasDates) {
      summary += '- **Reflectieve fase**: Pauze in dating activiteit\n';
    }
  }

  return summary.trim();
}