import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { chatCompletion } from '@/lib/ai-service';
import { AIContextManager } from '@/lib/ai-context-manager';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

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

    // Get previous weeks' data for context (last 4 weeks)
    let previousWeeksContext = '';
    try {
      const previousLogs = await sql`
        SELECT
          week_start,
          week_end,
          total_matches,
          total_conversations,
          total_dates,
          total_ghosting,
          iris_insight
        FROM weekly_dating_logs
        WHERE user_id = ${user.id}
          AND week_start < ${weekStart}
        ORDER BY week_start DESC
        LIMIT 4
      `;

      if (previousLogs && previousLogs.length > 0) {
        previousWeeksContext = '\n\n**VORIGE WEKEN (voor context):**\n';
        previousLogs.forEach((log: any, index: number) => {
          previousWeeksContext += `\n Week ${index + 1} geleden: `;
          previousWeeksContext += `${log.total_matches || 0} matches, `;
          previousWeeksContext += `${log.total_conversations || 0} gesprekken, `;
          previousWeeksContext += `${log.total_dates || 0} dates`;
          if (log.total_ghosting > 0) {
            previousWeeksContext += `, ${log.total_ghosting} ghosting`;
          }
          if (log.iris_insight) {
            // Include a very brief summary of previous insight
            const shortInsight = log.iris_insight.substring(0, 100);
            previousWeeksContext += `\n   Vorig advies: "${shortInsight}..."`;
          }
        });

        // Calculate trends
        const totalPrevMatches = previousLogs.reduce((sum: number, log: any) => sum + (log.total_matches || 0), 0);
        const totalPrevConversations = previousLogs.reduce((sum: number, log: any) => sum + (log.total_conversations || 0), 0);
        const totalPrevDates = previousLogs.reduce((sum: number, log: any) => sum + (log.total_dates || 0), 0);
        const avgMatches = totalPrevMatches / previousLogs.length;
        const avgConversations = totalPrevConversations / previousLogs.length;
        const avgDates = totalPrevDates / previousLogs.length;

        const currentMatches = activities.filter((a: string) => a === 'new_match').length;
        const currentConversations = activities.filter((a: string) => a === 'conversation').length;
        const currentDates = activities.filter((a: string) => a === 'date').length;

        previousWeeksContext += '\n\n**TREND ANALYSE:**';
        if (currentMatches > avgMatches) {
          previousWeeksContext += '\n- Matches: STIJGEND (boven gemiddelde)';
        } else if (currentMatches < avgMatches) {
          previousWeeksContext += '\n- Matches: DALEND (onder gemiddelde)';
        }
        if (currentConversations > avgConversations) {
          previousWeeksContext += '\n- Gesprekken: STIJGEND';
        } else if (currentConversations < avgConversations) {
          previousWeeksContext += '\n- Gesprekken: DALEND';
        }
        if (currentDates > avgDates) {
          previousWeeksContext += '\n- Dates: STIJGEND';
        } else if (currentDates < avgDates) {
          previousWeeksContext += '\n- Dates: DALEND';
        }
      }
    } catch (historyError) {
      // Table might not exist yet, continue without history
      console.log('Could not fetch previous logs:', historyError);
    }

    // Analyze activities and create insights prompt
    const activitySummary = createActivitySummary(activities, activityDetails);

    const systemPrompt = `Je bent Iris, een warme en ervaren dating coach uit Nederland. Je helpt mensen met praktische inzichten en persoonlijke begeleiding op hun dating reis.

ALS DATING COACH:
- Vertel een verhaal over hun dating week gebaseerd op de data
- Herken patronen en geef praktische inzichten
- Wees warm, benaderbaar en bemoedigend
- Maak het persoonlijk en verhaal-achtig, niet als een lijst
- Wees specifiek over wat je ziet in hun gedrag en strategie
- Koppel inzichten aan concrete voorbeelden
- Focus op groei en positieve stappen

STRUCTUUR:
1. **Opening**: Begin met een persoonlijke observatie over hun week
2. **Patroon**: Wat valt op in hun dating gedrag?
3. **Inzicht**: Wat betekent dit voor hun dating reis?
4. **Tip**: 1 specifieke, praktische volgende stap
5. **Afsluiting**: Bemoedigende woorden

STIJL:
- Spreek als een vriendelijke coach, niet als een therapeut
- Vermijd clichés en generieke adviezen
- Wees concreet en actionable
- 150-200 woorden - kort en krachtig
- Nederlandse taal, informeel maar respectvol`;

    const userPrompt = `Geef een persoonlijke terugblik op deze dating week.

**DATA VAN DEZE WEEK:**
${activitySummary}
${previousWeeksContext}

**CONTEXT:**
${contextSummary || 'Nieuwe gebruiker - eerste week op het platform'}

**OPDRACHT:**

Schrijf een korte, persoonlijke terugblik op hun dating week. Wees specifiek en praktisch:

**STRUCTUUR:**
1. **Wat zie je?** - Beschrijf kort wat er deze week gebeurde
2. **Wat valt op?** - Noem 1 interessant patroon of keuze die je ziet
3. **Wat kun je meenemen?** - Geef 1 concrete, praktische tip voor volgende week
4. **Bemoediging** - Eindig positief en persoonlijk

**STIJL:**
- Spreek direct tot de gebruiker (je/jouw)
- Wees concreet, niet vaag
- Geen therapeutische of psychologische termen
- Gewoon Nederlands, als een coach die je kent
- Max 150 woorden - kort en krachtig

**VOORBEELDEN VAN GOEDE OBSERVATIES:**
- "Je hebt deze week lef getoond door direct een date te plannen"
- "Je neemt de tijd om iemand te leren kennen via chat - dat is slim"
- "Ghosting is vervelend, maar het zegt meer over hen dan over jou"

Wees warm maar direct.`;

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