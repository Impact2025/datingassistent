import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-service';
import { verifyToken } from '@/lib/auth';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';

interface ConversationMessage {
  id: string;
  sender: 'user' | 'date';
  content: string;
  timestamp: string;
}

interface ConversationAnalysis {
  overallScore: number;
  engagement: number;
  authenticity: number;
  listening: number;
  humor: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  };
  realTimeTips: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimit = await rateLimitExpensiveAI(identifier);

    if (!rateLimit.success) {
      const headers = createRateLimitHeaders(rateLimit);
      const resetDate = new Date(rateLimit.resetAt);
      return NextResponse.json(
        {
          error: 'rate_limit_exceeded',
          message: `Te veel verzoeken. Probeer opnieuw na ${resetDate.toLocaleTimeString('nl-NL')}.`,
          resetAt: resetDate.toISOString(),
        },
        { status: 429, headers }
      );
    }

    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { messages }: { messages: ConversationMessage[] } = await request.json();

    if (!messages || messages.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 messages required for analysis' },
        { status: 400 }
      );
    }

    // Analyze conversation using AI
    const analysis = await analyzeConversation(messages);

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Conversation analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze conversation' },
      { status: 500 }
    );
  }
}

async function analyzeConversation(messages: ConversationMessage[]): Promise<ConversationAnalysis> {
  const conversationText = messages
    .map(msg => `${msg.sender === 'user' ? 'User' : 'Date'}: ${msg.content}`)
    .join('\n');

  const prompt = `
Analyze this dating conversation and provide detailed feedback. Focus on:

1. Overall conversation quality (0-100)
2. Engagement level (0-100) - how well they keep each other interested
3. Authenticity (0-100) - how genuine and natural the conversation feels
4. Listening skills (0-100) - how well they respond to what the other says
5. Humor level (0-100) - appropriate use of humor

Provide specific, actionable feedback in Dutch for a Dutch dating context.

Conversation:
${conversationText}

Respond with a JSON object containing:
{
  "overallScore": number,
  "engagement": number,
  "authenticity": number,
  "listening": number,
  "humor": number,
  "feedback": {
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "nextSteps": ["step1", "step2"]
  },
  "realTimeTips": ["tip1", "tip2"]
}

Make the feedback specific to this conversation and culturally appropriate for Dutch dating culture.
`;

  try {
    const response = await chatCompletion(
      [
        {
          role: 'system',
          content: 'Je bent een ervaren dating coach die gesprekken analyseert. Geef altijd een geldig JSON antwoord.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      {
        provider: 'openrouter',
        maxTokens: 1500,
        temperature: 0.7
      }
    );

    const content = response;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate and provide defaults if needed
    return {
      overallScore: Math.max(0, Math.min(100, analysis.overallScore || 70)),
      engagement: Math.max(0, Math.min(100, analysis.engagement || 70)),
      authenticity: Math.max(0, Math.min(100, analysis.authenticity || 70)),
      listening: Math.max(0, Math.min(100, analysis.listening || 70)),
      humor: Math.max(0, Math.min(100, analysis.humor || 70)),
      feedback: {
        strengths: analysis.feedback?.strengths || ['Goede start van het gesprek'],
        improvements: analysis.feedback?.improvements || ['Probeer meer vragen te stellen'],
        nextSteps: analysis.feedback?.nextSteps || ['Blijf het gesprek gaande houden']
      },
      realTimeTips: analysis.realTimeTips || ['Luister actief naar wat de ander zegt']
    };

  } catch (error) {
    console.error('AI analysis error:', error);

    // Return fallback analysis
    return {
      overallScore: 70,
      engagement: 65,
      authenticity: 75,
      listening: 70,
      humor: 60,
      feedback: {
        strengths: [
          'Natuurlijk gesprek',
          'Goede balans tussen geven en nemen'
        ],
        improvements: [
          'Stel meer open vragen om dieper te gaan',
          'Deel meer persoonlijke verhalen'
        ],
        nextSteps: [
          'Plan een vervolg date voor',
          'Stuur een bedank berichtje'
        ]
      },
      realTimeTips: [
        'Toon interesse in wat de ander zegt',
        'Deel iets persoonlijks om connectie te maken',
        'Gebruik humor op natuurlijke momenten'
      ]
    };
  }
}