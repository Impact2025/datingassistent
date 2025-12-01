import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';
import { TriggerQualityRequest, TriggerQualityResponse } from '@/components/courses/module3/types/module3.types';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body: TriggerQualityRequest = await request.json();
    const { triggerLines } = body;

    if (!triggerLines || !Array.isArray(triggerLines) || triggerLines.length !== 3) {
      return NextResponse.json(
        { error: 'Exactly 3 trigger lines required' },
        { status: 400 }
      );
    }

    // Validate trigger lines
    for (const line of triggerLines) {
      if (typeof line !== 'string' || line.trim().length < 10) {
        return NextResponse.json(
          { error: 'Each trigger line must be at least 10 characters' },
          { status: 400 }
        );
      }
    }

    // AI Analysis Logic (simplified for demo - in production use OpenRouter)
    const scores: number[] = [];
    const feedback: string[] = [];

    for (let i = 0; i < triggerLines.length; i++) {
      const line = triggerLines[i];
      const wordCount = line.split(' ').filter(word => word.length > 0).length;

      // Scoring algorithm based on best practices
      let score = 3; // Base score

      // Length bonus (ideal: 10-15 words)
      if (wordCount >= 8 && wordCount <= 15) score += 1;
      else if (wordCount < 5 || wordCount > 20) score -= 1;

      // Content analysis (simplified)
      const hasPersonalDetail = /\b(ik|ben|mijn|hou|werk|leef|reis|sport|kook|lees|schrijf|bouw|maak|speel)\b/i.test(line);
      const hasQuestion = /\?|!/g.test(line);
      const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(line);

      if (hasPersonalDetail) score += 0.5;
      if (hasQuestion) score += 0.5;
      if (hasEmoji) score += 0.5;

      // Ensure score is between 1-5
      score = Math.max(1, Math.min(5, Math.round(score)));

      scores.push(score);

      // Generate feedback
      let feedbackText = '';
      if (score >= 4) {
        feedbackText = 'Uitstekend! Balans tussen mysterie en authenticiteit.';
      } else if (score >= 3) {
        feedbackText = 'Goed begin. Meer specifieke details maken het sterker.';
      } else {
        feedbackText = 'Te algemeen. Voeg unieke persoonlijke details toe.';
      }

      feedback.push(feedbackText);
    }

    // Find best score
    const bestIndex = scores.indexOf(Math.max(...scores));

    const response: TriggerQualityResponse = {
      scores,
      feedback,
      bestIndex
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Trigger quality analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}