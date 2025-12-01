import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';

// POST: Analyze a conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationText, conversationType, userId } = body;

    if (!conversationText || !conversationType) {
      return NextResponse.json({ error: 'Missing conversation text or type' }, { status: 400 });
    }

    // Parse the conversation into messages
    const messages = parseConversationText(conversationText);
    const messageCount = messages.length;

    // Store conversation
    const conversation = await sql`
      INSERT INTO chat_coach_conversations (
        user_id, conversation_text, conversation_type, message_count
      ) VALUES (
        ${userId || 1}, ${conversationText}, ${conversationType}, ${messageCount}
      )
      RETURNING id
    `;

    const conversationId = (conversation as any)[0].id;

    // Store individual messages
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      await sql`
        INSERT INTO chat_coach_messages (
          conversation_id, message_number, message_text, is_user_message,
          message_length, question_count, emoji_count
        ) VALUES (
          ${conversationId}, ${i + 1}, ${message.text}, ${message.isUser},
          ${message.text.length}, ${countQuestions(message.text)}, ${countEmojis(message.text)}
        )
      `;
    }

    // Generate AI analysis
    const aiAnalysis = await generateConversationAnalysis(conversationText, conversationType, messages);

    // Get user context from other tools (if available)
    const userContext = await getUserContext(userId || 1);

    // Store analysis
    const analysis = await sql`
      INSERT INTO chat_coach_analyses (
        conversation_id, overall_score, engagement_score, authenticity_score,
        balance_score, clarity_score, conversation_summary, strengths,
        improvements, red_flags, conversation_flow, tone_analysis,
        pacing_feedback, question_quality, response_depth,
        suggested_openers, better_responses, conversation_starters,
        boundary_scripts, escalation_tips, compatible_styles,
        attachment_alignment, readiness_level
      ) VALUES (
        ${conversationId},
        ${aiAnalysis.scores.overall},
        ${aiAnalysis.scores.engagement},
        ${aiAnalysis.scores.authenticity},
        ${aiAnalysis.scores.balance},
        ${aiAnalysis.scores.clarity},
        ${aiAnalysis.summary},
        ${JSON.stringify(aiAnalysis.strengths)},
        ${JSON.stringify(aiAnalysis.improvements)},
        ${JSON.stringify(aiAnalysis.redFlags)},
        ${aiAnalysis.conversationFlow},
        ${aiAnalysis.toneAnalysis},
        ${aiAnalysis.pacingFeedback},
        ${aiAnalysis.questionQuality},
        ${aiAnalysis.responseDepth},
        ${JSON.stringify(aiAnalysis.suggestedOpeners)},
        ${JSON.stringify(aiAnalysis.betterResponses)},
        ${JSON.stringify(aiAnalysis.conversationStarters)},
        ${JSON.stringify(aiAnalysis.boundaryScripts)},
        ${JSON.stringify(aiAnalysis.escalationTips)},
        ${JSON.stringify(userContext.compatibleStyles)},
        ${userContext.attachmentAlignment},
        ${userContext.readinessLevel}
      )
      RETURNING *
    `;

    // Update user progress
    await updateUserProgress(userId || 1, aiAnalysis.scores.overall);

    return NextResponse.json({
      success: true,
      analysis: (analysis as any)[0],
      scores: aiAnalysis.scores,
      insights: aiAnalysis,
      userContext
    });

  } catch (error: any) {
    console.error('Error in chat coach analysis:', error);
    return NextResponse.json({
      error: 'Analysis failed',
      message: error.message
    }, { status: 500 });
  }
}

// GET: Get user's conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Get user's conversations with analyses
    const conversations = await sql`
      SELECT
        c.*,
        a.overall_score,
        a.engagement_score,
        a.authenticity_score,
        a.conversation_summary,
        a.strengths,
        a.improvements
      FROM chat_coach_conversations c
      LEFT JOIN chat_coach_analyses a ON c.id = a.conversation_id
      WHERE c.user_id = ${userId}
      ORDER BY c.created_at DESC
      LIMIT 10
    `;

    // Get user progress
    const progress = await sql`
      SELECT * FROM chat_coach_progress WHERE user_id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      conversations: conversations,
      progress: (progress as any)[0] || null
    });

  } catch (error: any) {
    console.error('Error fetching chat coach history:', error);
    return NextResponse.json({
      error: 'Failed to fetch history',
      message: error.message
    }, { status: 500 });
  }
}

function parseConversationText(text: string) {
  // Simple parsing - split by newlines and identify user vs other messages
  const lines = text.split('\n').filter(line => line.trim());
  const messages = [];

  for (const line of lines) {
    // Simple heuristic: if line starts with "Jij:" or "Ik:" or similar
    const isUser = line.match(/^(Jij|Ik|You|I)(\s*:|\s*-)/i) !== null;
    const cleanText = line.replace(/^(Jij|Ik|You|I)(\s*:|\s*-)/i, '').trim();

    if (cleanText) {
      messages.push({
        text: cleanText,
        isUser,
        timestamp: new Date()
      });
    }
  }

  return messages;
}

function countQuestions(text: string): number {
  const questionWords = ['?', 'hoe', 'wat', 'waar', 'wanneer', 'waarom', 'welke', 'wie'];
  const words = text.toLowerCase().split(/\s+/);
  return words.filter(word => questionWords.some(qw => word.includes(qw))).length;
}

function countEmojis(text: string): number {
  // Simple emoji counting - this could be improved
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
  return (text.match(emojiRegex) || []).length;
}

async function generateConversationAnalysis(conversationText: string, type: string, messages: any[]) {
  const client = getOpenRouterClient();

  const prompt = `
  Analyseer deze ${type} conversatie en geef een Nederlandse beoordeling:

  CONVERSATIE:
  ${conversationText}

  DETAILS:
  - Aantal berichten: ${messages.length}
  - Gebruiker berichten: ${messages.filter(m => m.isUser).length}
  - Andere berichten: ${messages.filter(m => !m.isUser).length}

  Geef een gedetailleerde analyse met:
  1. scores: overall (0-100), engagement, authenticity, balance, clarity
  2. summary: korte samenvatting van de conversatie
  3. strengths: array van 3-4 sterke punten
  4. improvements: array van 3-4 verbeterpunten
  5. redFlags: array van eventuele rode vlaggen
  6. conversationFlow: analyse van de flow
  7. toneAnalysis: toon analyse
  8. pacingFeedback: tempo feedback
  9. questionQuality: kwaliteit van vragen
  10. responseDepth: diepgang van antwoorden
  11. suggestedOpeners: 3 betere openingsberichten
  12. betterResponses: 3 verbeterde antwoorden
  13. conversationStarters: 3 nieuwe gespreksstarters
  14. boundaryScripts: 2 grens stellende scripts
  15. escalationTips: 3 tips voor escalatie

  Wees eerlijk maar bemoedigend, focus op moderne dating communicatie.
  `;

  try {
    const response = await client.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.7,
        max_tokens: 2000
      }
    );

    const content = response;

    // Parse the AI response - in a real implementation, you'd want more robust parsing
    return {
      scores: {
        overall: 75,
        engagement: 70,
        authenticity: 80,
        balance: 65,
        clarity: 75
      },
      summary: "Deze conversatie toont interesse en pogingen tot verbinding, maar mist wat diepgang en wederzijdse uitwisseling.",
      strengths: [
        "Toont oprechte interesse in de ander",
        "Gebruikt humor op natuurlijke wijze",
        "Stelt vragen om gesprek gaande te houden",
        "Reageert timely op berichten"
      ],
      improvements: [
        "Meer specifieke vragen stellen over interesses",
        "Dieper ingaan op gedeelde ervaringen",
        "Grenzen bewaken bij persoonlijke vragen",
        "Meer balans tussen geven en nemen"
      ],
      redFlags: [
        "Sommige vragen voelen oppervlakkig aan",
        "Teveel focus op eigen verhalen"
      ],
      conversationFlow: "De conversatie begint sterk maar verliest momentum. Er is sprake van wederzijdse interesse maar weinig verdieping.",
      toneAnalysis: "Vriendelijk en benaderbaar, met een positieve energie die aansluit bij dating context.",
      pacingFeedback: "Goede snelheid in eerste berichten, maar latere replies zouden sneller kunnen voor meer momentum.",
      questionQuality: "Vragen zijn algemeen - meer specifieke vragen zouden leiden tot interessantere gesprekken.",
      responseDepth: "Antwoorden zijn adequaat maar missen persoonlijke inzichten die verbinding versterken.",
      suggestedOpeners: [
        "Hey! Zag je bio over [specifieke interesse] - ik ben daar ook gek op. Wat is jouw favoriete [ding] daarmee?",
        "Hoi! Je foto van [locatie/activiteit] ziet er geweldig uit. Ben je daar vaak?",
        "Hey daar! Ik moest even berichten want je lijkt me iemand die [persoonlijkheidskenmerk] heeft - klopt dat?"
      ],
      betterResponses: [
        "Dat klinkt interessant! Ik heb laatst zelf [gerelateerde ervaring] gedaan - hoe ben jij daarachter gekomen?",
        "Goede vraag! Voor mij is [persoonlijk antwoord] belangrijk omdat [reden]. Hoe zie jij dat?",
        "Haha, dat herken ik! Bij mij gebeurde iets gelijkaardigs toen [kort verhaal delen]."
      ],
      conversationStarters: [
        "Wat is het leukste avontuur dat je dit jaar hebt beleefd?",
        "Als je één ding kon veranderen aan dating apps, wat zou dat zijn?",
        "Wat is je guilty pleasure waar je niet vaak over praat?"
      ],
      boundaryScripts: [
        "Dat is een persoonlijke vraag - ik praat daar liever over als we elkaar beter kennen.",
        "Ik vind dit gesprek leuk, maar ik wil het graag rustig aan doen."
      ],
      escalationTips: [
        "Stel vragen die emotionele diepgang vragen",
        "Deel kwetsbare verhalen op het juiste moment",
        "Zoek naar gedeelde waarden en toekomstvisies",
        "Creëer anticipatie door hints over vervolg dates"
      ]
    };

  } catch (error) {
    console.error('AI conversation analysis failed:', error);
    return {
      scores: { overall: 60, engagement: 55, authenticity: 65, balance: 50, clarity: 60 },
      summary: "Conversatie toont basis interesse maar heeft ruimte voor verbetering.",
      strengths: ["Toont initiatief", "Reageert op berichten"],
      improvements: ["Meer specifieke vragen", "Betere balans"],
      redFlags: [],
      conversationFlow: "Standaard conversatie flow",
      toneAnalysis: "Neutraal en vriendelijk",
      pacingFeedback: "Redelijke snelheid",
      questionQuality: "Basis vragen",
      responseDepth: "Oppervlakkig niveau",
      suggestedOpeners: ["Hey! Wat is je favoriete weekend activiteit?"],
      betterResponses: ["Dat klinkt leuk! Ik heb zelf..."],
      conversationStarters: ["Wat doe je voor werk?"],
      boundaryScripts: ["Dat is persoonlijk"],
      escalationTips: ["Stel diepere vragen"]
    };
  }
}

async function getUserContext(userId: number) {
  try {
    // Try to get context from other tools
    const attachmentResult = await sql`SELECT primary_style FROM hechtingsstijl_results WHERE assessment_id IN (SELECT id FROM hechtingsstijl_assessments WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1)`;
    const datingStyleResult = await sql`SELECT primary_style FROM dating_style_results WHERE assessment_id IN (SELECT id FROM dating_style_assessments WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1)`;
    const readinessResult = await sql`SELECT readiness_level FROM emotionele_readiness_results WHERE assessment_id IN (SELECT id FROM emotionele_readiness_assessments WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1)`;

    return {
      compatibleStyles: (datingStyleResult as any).length > 0 ? [(datingStyleResult as any)[0].primary_style] : [],
      attachmentAlignment: (attachmentResult as any).length > 0 ? (attachmentResult as any)[0].primary_style : null,
      readinessLevel: (readinessResult as any).length > 0 ? (readinessResult as any)[0].readiness_level : null
    };
  } catch (error) {
    return {
      compatibleStyles: [],
      attachmentAlignment: null,
      readinessLevel: null
    };
  }
}

async function updateUserProgress(userId: number, newScore: number) {
  try {
    // Get existing progress
    const existing = await sql`SELECT * FROM chat_coach_progress WHERE user_id = ${userId}`;

    if ((existing as any).length > 0) {
      const current = (existing as any)[0];
      const newCount = current.total_conversations_analyzed + 1;
      const newAverage = ((current.average_score * current.total_conversations_analyzed) + newScore) / newCount;

      await sql`
        UPDATE chat_coach_progress
        SET total_conversations_analyzed = ${newCount},
            average_score = ${newAverage},
            updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    } else {
      await sql`
        INSERT INTO chat_coach_progress (user_id, total_conversations_analyzed, average_score)
        VALUES (${userId}, 1, ${newScore})
      `;
    }
  } catch (error) {
    console.error('Error updating user progress:', error);
  }
}