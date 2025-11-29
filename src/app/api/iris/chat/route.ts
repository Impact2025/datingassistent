// ============================================================================
// API ROUTE: POST /api/iris/chat
// 
// Chat met Iris AI Coach
// Gebruikt volledige gebruiker context voor gepersonaliseerde responses
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Anthropic from '@anthropic-ai/sdk';
import {
  getEnrichedIrisContext,  // 🚀 WERELDKLASSE UPGRADE
  buildIrisSystemPrompt,
  saveIrisConversation,
  updateIrisContext
} from '@/lib/iris-context';
import { detectMode, buildModePrompt, type CoachingMode } from '@/lib/iris/specialized-modes';
import { analyzeConversationWithAI, generateFollowUpSuggestions } from '@/lib/iris/conversation-memory';
import { generateProactiveSuggestions } from '@/lib/iris/proactive-coaching';

// Lazy initialization to avoid build-time errors when env vars are missing
const getAnthropicClient = () => {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
};

export async function POST(request: NextRequest) {
  try {
    // 1. Check authenticatie
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niet ingelogd' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const {
      message,
      context_type = 'general',
      context_cursus_slug,
      context_les_slug,
      context_tool_id,
      coaching_mode,  // 🚀 NEW: Optional manual mode override
      additional_context  // 🚀 NEW: Extra context (profile text, match info, etc)
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Bericht is verplicht' },
        { status: 400 }
      );
    }

    // 2. 🚀 Haal VERRIJKTE Iris context op (met ALLE 7 assessments!)
    const irisContext = await getEnrichedIrisContext(userId);

    // 3. Override met huidige context indien meegegeven
    if (context_cursus_slug) {
      irisContext.cursus.huidige_cursus = context_cursus_slug;
    }
    if (context_les_slug) {
      irisContext.cursus.huidige_les = context_les_slug;
      
      // Haal les-specifieke context op
      const { sql } = await import('@vercel/postgres');
      const lesResult = await sql`
        SELECT ai_coach_context 
        FROM cursus_lessen 
        WHERE slug = ${context_les_slug}
        AND cursus_id = (SELECT id FROM cursussen WHERE slug = ${context_cursus_slug})
      `;
      if (lesResult.rows[0]?.ai_coach_context) {
        irisContext.cursus.les_context = lesResult.rows[0].ai_coach_context;
      }
    }

    // 4. 🚀 Detecteer coaching mode (auto of manual)
    const detectedMode: CoachingMode = coaching_mode || detectMode(message);

    // 5. 🚀 Bouw ENHANCED system prompt met mode-specific instructies
    const baseSystemPrompt = buildIrisSystemPrompt(irisContext);
    const modePrompt = buildModePrompt(detectedMode, irisContext.aiContext, additional_context);

    const systemPrompt = `${baseSystemPrompt}\n\n${modePrompt}`;

    // 5. 🚀 Call Claude API met WERELDKLASSE setup
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',  // Beste model voor gepersonaliseerde coaching
      max_tokens: 2048,  // Meer tokens voor rijkere, diepere antwoorden
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const irisResponse = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // 6. 🧠 AI-powered conversation analysis
    const conversationAnalysis = await analyzeConversationWithAI(message, irisResponse);
    const sentiment = conversationAnalysis.sentiment;

    // 7. 💡 Genereer proactive suggestions (async, don't wait)
    const proactiveSuggestions = await generateProactiveSuggestions(userId).catch(() => []);
    const followUpSuggestions = await generateFollowUpSuggestions(userId).catch(() => []);

    // 8. 💾 Sla gesprek op met enhanced metadata
    await saveIrisConversation(
      userId,
      message,
      irisResponse,
      context_type,
      context_cursus_slug,
      context_les_slug,
      context_tool_id,
      sentiment
    );

    // 9. ⚙️ Update stemming in context
    await updateIrisContext(userId, {
      recente_stemming: sentiment as any,
    });

    // 10. 🚀 Return WERELDKLASSE response
    return NextResponse.json({
      response: irisResponse,
      sentiment,
      mode: detectedMode,
      topics: conversationAnalysis.topics,
      emotionalTone: conversationAnalysis.emotionalTone,
      proactiveSuggestions: proactiveSuggestions.slice(0, 3),  // Top 3
      followUpSuggestions: followUpSuggestions.slice(0, 3),  // Top 3
    });

  } catch (error) {
    console.error('Error in Iris chat:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis met Iris. Probeer het opnieuw.' },
      { status: 500 }
    );
  }
}

// ✅ analyzeSentiment function removed - now using AI-powered analysis in conversation-memory.ts
