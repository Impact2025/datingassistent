// ============================================================================
// API ROUTE: POST /api/iris/chat
// 
// Chat met Iris AI Coach
// Gebruikt volledige gebruiker context voor gepersonaliseerde responses
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';
import {
  getEnrichedIrisContext,  // 🚀 WERELDKLASSE UPGRADE
  buildIrisSystemPrompt,
  saveIrisConversation,
  updateIrisContext
} from '@/lib/iris-context';
import { detectMode, buildModePrompt, type CoachingMode } from '@/lib/iris/specialized-modes';
import { analyzeConversationWithAI, generateFollowUpSuggestions } from '@/lib/iris/conversation-memory';
import { generateProactiveSuggestions } from '@/lib/iris/proactive-coaching';
import { checkIrisLimit, trackIrisUsage, type IrisUsageStatus } from '@/lib/neon-usage-tracking';


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

    // 2. 🔒 Check Iris usage limit (tier-aware)
    const usageStatus = await checkIrisLimit(userId);
    if (!usageStatus.allowed) {
      return NextResponse.json(
        {
          error: 'limit_reached',
          message: `Je hebt je dagelijkse limiet van ${usageStatus.limit} berichten bereikt. Je limiet wordt weer aangevuld over ${usageStatus.resetTimeHuman}.`,
          usageStatus,
        },
        { status: 429 }
      );
    }

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
    // Fail-safe: als DB down is geeft dit een lege basiscontext terug zodat AI blijft werken
    let irisContext: Awaited<ReturnType<typeof getEnrichedIrisContext>>;
    try {
      irisContext = await getEnrichedIrisContext(userId);
    } catch (ctxError) {
      console.warn('⚠️ Iris context ophalen mislukt (DB?), doorgaan met lege context:', ctxError);
      irisContext = {
        gebruiker: { naam: 'Gebruiker', leeftijd: null, geslacht: null, regio: null },
        dating: { status: null, situatie: null, doelen: [], apps: [] },
        voortgang: { actieve_cursus: null, voltooide_lessen: [], streak: 0 },
        cursus: { huidige_cursus: null, huidige_les: null, les_context: null },
        aiContext: null,
        patronen: [],
        recente_stemming: null,
      } as any;
    }

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

    // 5. Stream response via OpenRouter
    const openrouter = getOpenRouterClient();
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of openrouter.streamChatCompletion(
            OPENROUTER_MODELS.CLAUDE_35_SONNET,
            [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
            { max_tokens: 2048 }
          )) {
            fullResponse += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`));
          }

          // Track usage and get updated status
          await trackIrisUsage(userId);
          const updatedUsageStatus = await checkIrisLimit(userId).catch(() => null);

          // Send done event with mode and usage info
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            mode: detectedMode,
            usageStatus: updatedUsageStatus,
          })}\n\n`));

          // Fire-and-forget background ops
          Promise.all([
            analyzeConversationWithAI(message, fullResponse).then(analysis =>
              Promise.all([
                saveIrisConversation(userId, message, fullResponse, context_type, context_cursus_slug, context_les_slug, context_tool_id, analysis.sentiment),
                updateIrisContext(userId, { recente_stemming: analysis.sentiment as any }),
              ])
            ),
            generateProactiveSuggestions(userId),
            generateFollowUpSuggestions(userId),
          ]).catch(console.error);

        } catch (streamError) {
          console.error('Iris stream error:', streamError);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Er ging iets mis met Iris. Probeer het opnieuw.' })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
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
