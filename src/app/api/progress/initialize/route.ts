import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { userId, onboardingCompleted, personalityScanDone, coachAdviceReceived } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    console.log(`🔄 Initializing progress data for user ${userId}...`);

    // Calculate initial scores based on onboarding completion
    let profileScore = 0;
    let conversationQuality = 0;
    let consistency = 20; // Base consistency for completing onboarding

    if (personalityScanDone) {
      profileScore += 30; // Points for completing personality scan
      conversationQuality += 20; // Some conversation skills identified
    }

    if (coachAdviceReceived) {
      profileScore += 20; // Additional points for receiving personalized advice
      conversationQuality += 15; // Coach provided conversation tips
    }

    if (onboardingCompleted) {
      profileScore += 25; // Bonus for completing entire onboarding
      conversationQuality += 20; // Full coaching experience
      consistency += 30; // Shows commitment to the process
    }

    // Cap scores at 100
    profileScore = Math.min(100, profileScore);
    conversationQuality = Math.min(100, conversationQuality);
    consistency = Math.min(100, consistency);

    // Calculate overall score
    const overallScore = Math.round((profileScore * 0.4) + (conversationQuality * 0.4) + (consistency * 0.2));

    // Get week start (Monday)
    const weekStart = getWeekStart();
    const weekStartStr = weekStart.toISOString().split('T')[0];

    console.log(`📊 Initial scores - Profile: ${profileScore}, Conversation: ${conversationQuality}, Consistency: ${consistency}, Overall: ${overallScore}`);

    // Insert initial progress metrics
    await sql`
      INSERT INTO user_progress_metrics (user_id, metric_type, metric_value, week_start)
      VALUES
        (${userId}, 'profile_score', ${profileScore}, ${weekStartStr}),
        (${userId}, 'conversation_quality', ${conversationQuality}, ${weekStartStr}),
        (${userId}, 'consistency', ${consistency}, ${weekStartStr}),
        (${userId}, 'overall', ${overallScore}, ${weekStartStr})
      ON CONFLICT (user_id, metric_type, week_start)
      DO UPDATE SET metric_value = EXCLUDED.metric_value
    `;

    // Create some initial insights
    const insights = [];

    if (onboardingCompleted) {
      insights.push({
        type: 'celebration',
        title: 'Welkom bij DatingAssistent! 🎉',
        description: 'Geweldig dat je de onboarding hebt voltooid. Je bent nu klaar om je dating skills te verbeteren.',
        actionable: false,
        priority: 3
      });
    }

    if (personalityScanDone) {
      insights.push({
        type: 'improvement',
        title: 'Persoonlijkheidsscan Voltooid',
        description: 'Je hebt je persoonlijkheid in kaart gebracht. Gebruik deze inzichten om betere matches te vinden.',
        actionable: false,
        priority: 2
      });
    }

    // Insert insights
    for (const insight of insights) {
      await sql`
        INSERT INTO weekly_insights (user_id, week_start, insight_type, title, description, actionable, priority)
        VALUES (${userId}, ${weekStartStr}, ${insight.type}, ${insight.title}, ${insight.description}, ${insight.actionable}, ${insight.priority})
      `;
    }

    console.log(`✅ Initial progress data created: ${insights.length} insights`);

    return NextResponse.json({
      success: true,
      scores: { profileScore, conversationQuality, consistency, overallScore },
      insightsCreated: insights.length
    });

  } catch (error) {
    console.error('Error initializing progress:', error);
    return NextResponse.json({
      error: 'Failed to initialize progress data'
    }, { status: 500 });
  }
}

// Utility function to get week start (Monday)
function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(d.setDate(diff));
}