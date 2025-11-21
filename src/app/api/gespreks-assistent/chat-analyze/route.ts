import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';
import { sql } from '@vercel/postgres';
import { trackTokenUsage, extractAnthropicTokenUsage, trackTokenUsageWithTiming } from '@/lib/token-tracker';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatContent, platform, userId } = await request.json();

    if (!chatContent || !platform) {
      return NextResponse.json({
        error: 'Chat content and platform are required'
      }, { status: 400 });
    }

    // Analyze chat content with AI
    const startTime = Date.now();
    const { analysisResult, aiResponse } = await analyzeChatWithAI(chatContent, platform);

    // Track token usage
    try {
      const tokenData = extractAnthropicTokenUsage(aiResponse, OPENROUTER_MODELS.CLAUDE_35_HAIKU);
      await trackTokenUsageWithTiming(
        startTime,
        user.id,
        '/api/gespreks-assistent/chat-analyze',
        {
          ...tokenData,
          statusCode: 200
        }
      );
    } catch (trackingError) {
      console.error('Token tracking failed:', trackingError);
      // Don't fail the request if tracking fails
    }

    // Store analysis in database
    try {
      await sql`
        INSERT INTO conversation_analyses (
          user_id, conversation_type, platform, raw_content,
          analysis_data, metrics, insights, created_at, updated_at
        ) VALUES (
          ${userId}, 'chat_app', ${platform}, ${chatContent},
          ${JSON.stringify(analysisResult.analysis_data)},
          ${JSON.stringify(analysisResult.metrics)},
          ${JSON.stringify(analysisResult.insights)},
          NOW(), NOW()
        )
      `;
    } catch (dbError) {
      console.error('Failed to store analysis:', dbError);
      // Continue without storing - don't fail the request
    }

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Chat analysis error:', error);
    return NextResponse.json({
      error: 'Failed to analyze chat'
    }, { status: 500 });
  }
}

async function analyzeChatWithAI(chatContent: string, platform: string): Promise<{ analysisResult: any; aiResponse: any }> {
  const openRouter = getOpenRouterClient();

  const prompt = `Je bent een professionele dating coach en gesprek analytisch. Analyseer deze chat conversatie tussen twee mensen die elkaar net leren kennen via ${platform}.

CHAT INHOUD:
${chatContent}

VEREISTE OUTPUT FORMAT (alleen geldig JSON, geen extra tekst):

{
  "overall_score": 75,
  "vibe_analysis": {
    "your_tone": "warm en geïnteresseerd",
    "their_tone": "positief en open",
    "compatibility": 82
  },
  "flirt_balance": {
    "your_investment": 65,
    "their_investment": 78,
    "ratio": "78/65"
  },
  "conversation_metrics": {
    "message_count": 24,
    "response_times": "gemiddeld 2-3 uur",
    "engagement_level": 71,
    "depth_score": 68
  },
  "red_flags": [
    "korte antwoorden kunnen desinteresse tonen",
    "vraag-antwoord patroon mist diepgang"
  ],
  "green_flags": [
    "regelmatige communicatie",
    "persoonlijke vragen stellen",
    "humor gebruiken"
  ],
  "recommendations": [
    {
      "priority": "high",
      "category": "Diepgang",
      "advice": "Stel meer open vragen om echte interesses te ontdekken",
      "expected_impact": "Verhoogt kans op betekenisvolle connectie met 25%"
    },
    {
      "priority": "medium",
      "category": "Timing",
      "advice": "Reageer sneller om momentum te behouden",
      "expected_impact": "Verbeterd engagement met 15%"
    }
  ],
  "success_probability": 68,
  "next_steps": [
    "Stel een specifieke date voor met duidelijke locatie en tijd",
    "Deel een persoonlijk verhaal om emotionele connectie te versterken",
    "Gebruik humor om de vibe luchtiger te maken"
  ],
  "analysis_data": {
    "sentiment_trends": "positief toenemend",
    "communication_patterns": "vraag-antwoord ritme",
    "emotional_depth": "oppervlakkig naar medium"
  },
  "metrics": {
    "flirtation_index": 0.65,
    "reciprocity_score": 0.78,
    "engagement_consistency": 0.82
  },
  "insights": {
    "strengths": ["Goede vraagvaardigheden", "Humoristische elementen"],
    "weaknesses": ["Timing inconsistent", "Diepgang beperkt"],
    "opportunities": ["Date voorstellen", "Persoonlijker worden"]
  }
}

BELANGRIJK:
- Geef ALLEEN geldig JSON terug
- Baseer scores op realistische dating psychologische principes
- Wees eerlijk maar bemoedigend
- Focus op actionable insights
- Overweeg ${platform} specifieke gedragsregels`;

  try {
    const response = await openRouter.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.3,
        max_tokens: 4000
      }
    );

    // Parse the JSON response
    const rawResponse = response.trim();

    // Try to extract JSON if wrapped in markdown
    let jsonString = rawResponse;
    if (rawResponse.includes('```json')) {
      const match = rawResponse.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (match) jsonString = match[1];
    } else if (rawResponse.includes('```')) {
      const match = rawResponse.match(/```\s*(\{[\s\S]*?\})\s*```/);
      if (match) jsonString = match[1];
    }

    const analysisResult = JSON.parse(jsonString);

    // Validate required fields and provide defaults if missing
    const result = {
      overall_score: analysisResult.overall_score || 50,
      vibe_analysis: analysisResult.vibe_analysis || {
        your_tone: "neutraal",
        their_tone: "neutraal",
        compatibility: 50
      },
      flirt_balance: analysisResult.flirt_balance || {
        your_investment: 50,
        their_investment: 50,
        ratio: "50/50"
      },
      conversation_metrics: analysisResult.conversation_metrics || {
        message_count: 0,
        response_times: "onbekend",
        engagement_level: 50,
        depth_score: 50
      },
      red_flags: analysisResult.red_flags || [],
      green_flags: analysisResult.green_flags || [],
      recommendations: analysisResult.recommendations || [],
      success_probability: analysisResult.success_probability || 50,
      next_steps: analysisResult.next_steps || [],
      analysis_data: analysisResult.analysis_data || {},
      metrics: analysisResult.metrics || {},
      insights: analysisResult.insights || {}
    };

    return {
      analysisResult: result,
      aiResponse: response
    };

  } catch (error) {
    console.error('AI analysis failed:', error);

    // Return fallback analysis
    const fallbackResult = {
      overall_score: 60,
      vibe_analysis: {
        your_tone: "neutraal",
        their_tone: "neutraal",
        compatibility: 60
      },
      flirt_balance: {
        your_investment: 50,
        their_investment: 50,
        ratio: "50/50"
      },
      conversation_metrics: {
        message_count: chatContent.split('\n').length,
        response_times: "gemiddeld",
        engagement_level: 60,
        depth_score: 55
      },
      red_flags: ["Analyse tijdelijk niet beschikbaar"],
      green_flags: ["Chat inhoud gedetecteerd"],
      recommendations: [{
        priority: "medium",
        category: "Technisch",
        advice: "Probeer de analyse later opnieuw",
        expected_impact: "Volledige analyse beschikbaar"
      }],
      success_probability: 60,
      next_steps: ["Probeer de analyse later opnieuw"],
      analysis_data: {},
      metrics: {},
      insights: {}
    };

    return {
      analysisResult: fallbackResult,
      aiResponse: null
    };
  }
}