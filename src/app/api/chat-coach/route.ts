import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { OPENROUTER_MODELS } from '@/lib/openrouter';
import { cachedChatCompletion } from '@/lib/ai-service';

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

    // Get user context (including kernwaarden) before analysis
    const userContext = await getUserContext(userId || 1);

    // Generate AI analysis with user context
    const aiAnalysis = await generateConversationAnalysis(conversationText, conversationType, messages, userContext);

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

async function generateConversationAnalysis(
  conversationText: string,
  type: string,
  messages: any[],
  userContext: Awaited<ReturnType<typeof getUserContext>>
) {
  const kernwaardenSection = userContext.coreValues?.length
    ? `\nGEBRUIKER KERNWAARDEN (uit Waarden Kompas):
${userContext.coreValues.map((v: string) => `• ${v}`).join('\n')}
Rode vlaggen voor deze gebruiker: ${userContext.redFlags?.slice(0, 3).join('; ') || 'onbekend'}

Gebruik deze kernwaarden om de analyse te PERSONALISEREN: detecteer of de gesprekspartner tekenen toont die passen of botsen met deze waarden.\n`
    : '';

  const prompt = `Je bent een Nederlandse dating communicatie coach. Analyseer deze ${type} conversatie en geef een eerlijke, gepersonaliseerde beoordeling in JSON.
${kernwaardenSection}
CONVERSATIE:
${conversationText}

DETAILS:
- Berichten totaal: ${messages.length}
- Gebruiker berichten: ${messages.filter(m => m.isUser).length}
${userContext.attachmentAlignment ? `- Hechtingsstijl gebruiker: ${userContext.attachmentAlignment}` : ''}

Geef een JSON object terug met deze exacte structuur:
{
  "scores": {"overall": 0-100, "engagement": 0-100, "authenticity": 0-100, "balance": 0-100, "clarity": 0-100},
  "summary": "Persoonlijke samenvatting van 2-3 zinnen",
  "strengths": ["sterke punt 1", "sterke punt 2", "sterke punt 3"],
  "improvements": ["verbeterpunt 1", "verbeterpunt 2", "verbeterpunt 3"],
  "redFlags": ["rode vlag indien aanwezig"],
  "conversationFlow": "Analyse van de flow",
  "toneAnalysis": "Toon analyse",
  "pacingFeedback": "Tempo feedback",
  "questionQuality": "Kwaliteit van vragen",
  "responseDepth": "Diepgang van antwoorden",
  "suggestedOpeners": ["opener 1", "opener 2", "opener 3"],
  "betterResponses": ["beter antwoord 1", "beter antwoord 2", "beter antwoord 3"],
  "conversationStarters": ["starter 1", "starter 2", "starter 3"],
  "boundaryScripts": ["script 1", "script 2"],
  "escalationTips": ["tip 1", "tip 2", "tip 3"]
}

Wees eerlijk maar bemoedigend. Geef ALLEEN het JSON object terug.`;

  try {
    const response = await cachedChatCompletion(
      [{ role: 'user', content: prompt }],
      { model: OPENROUTER_MODELS.CLAUDE_35_HAIKU, temperature: 0.7, maxTokens: 2000 }
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate essential fields
    if (!parsed.scores || !parsed.summary) throw new Error('Missing required fields');

    return parsed;
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
      escalationTips: ["Stel diepere vragen"],
    };
  }
}

async function getUserContext(userId: number) {
  try {
    const [attachmentResult, datingStyleResult, readinessResult, waardenResult] = await Promise.all([
      sql`SELECT primary_style FROM hechtingsstijl_results WHERE assessment_id IN (SELECT id FROM hechtingsstijl_assessments WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1)`,
      sql`SELECT primary_style FROM dating_style_results WHERE assessment_id IN (SELECT id FROM dating_style_assessments WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1)`,
      sql`SELECT readiness_level FROM emotionele_readiness_results WHERE assessment_id IN (SELECT id FROM emotionele_readiness_assessments WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1)`,
      sql`SELECT core_values, red_flags, green_flags FROM waarden_kompas_results WHERE user_id = ${userId} ORDER BY generated_at DESC LIMIT 1`,
    ]);

    // Extract core value names from JSON
    let coreValues: string[] = [];
    let redFlags: string[] = [];
    let greenFlags: string[] = [];

    if (waardenResult.rows.length > 0) {
      const row = waardenResult.rows[0];
      const rawValues = typeof row.core_values === 'string' ? JSON.parse(row.core_values) : row.core_values;
      const rawRedFlags = typeof row.red_flags === 'string' ? JSON.parse(row.red_flags) : row.red_flags;
      const rawGreenFlags = typeof row.green_flags === 'string' ? JSON.parse(row.green_flags) : row.green_flags;

      coreValues = Array.isArray(rawValues) ? rawValues.map((v: any) => v.name || v) : [];
      redFlags = Array.isArray(rawRedFlags) ? rawRedFlags : [];
      greenFlags = Array.isArray(rawGreenFlags) ? rawGreenFlags : [];
    }

    return {
      compatibleStyles: datingStyleResult.rows.length > 0 ? [datingStyleResult.rows[0].primary_style] : [],
      attachmentAlignment: attachmentResult.rows.length > 0 ? attachmentResult.rows[0].primary_style : null,
      readinessLevel: readinessResult.rows.length > 0 ? readinessResult.rows[0].readiness_level : null,
      coreValues,
      redFlags,
      greenFlags,
    };
  } catch (error) {
    return {
      compatibleStyles: [],
      attachmentAlignment: null,
      readinessLevel: null,
      coreValues: [],
      redFlags: [],
      greenFlags: [],
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