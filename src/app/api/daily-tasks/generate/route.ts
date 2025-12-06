/**
 * API: Generate AI-Powered Daily Tasks
 * Uses OpenAI to create personalized, adaptive daily tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { openRouter, OPENROUTER_MODELS } from '@/lib/openrouter';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, journeyDay, userProfile, recentActivity, completedTasks } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user context from database
    const userContext = await getUserContext(userId);
    const taskHistory = await getTaskHistory(userId);

    // Generate personalized tasks using AI
    const tasks = await generatePersonalizedTasks({
      userId,
      journeyDay: journeyDay || 1,
      userProfile: userProfile || userContext.profile,
      recentActivity: recentActivity || userContext.recentActivity,
      completedTasks: completedTasks || taskHistory,
      userContext
    });

    return NextResponse.json({
      tasks,
      generatedAt: new Date().toISOString(),
      personalizationLevel: 'high'
    });

  } catch (error: any) {
    console.error('Error generating daily tasks:', error);
    return NextResponse.json({
      error: 'Failed to generate tasks',
      message: error.message
    }, { status: 500 });
  }
}

async function getUserContext(userId: number) {
  try {
    // Get user profile and preferences
    const profileQuery = await sql`
      SELECT
        up.*,
        json_build_object(
          'currentStreak', COALESCE(ue.current_streak, 0),
          'journeyDay', COALESCE(ue.journey_day, 1),
          'totalPoints', COALESCE(ue.total_points, 0),
          'completedTasks', COALESCE(ue.completed_tasks, 0)
        ) as engagement
      FROM user_profiles up
      LEFT JOIN user_engagement ue ON ue.user_id = up.user_id
      WHERE up.user_id = ${userId}
    `;

    // Get recent activity (last 7 days)
    const activityQuery = await sql`
      SELECT
        activity_type,
        COUNT(*) as count,
        MAX(created_at) as last_activity
      FROM user_activity_log
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY activity_type
      ORDER BY count DESC
    `;

    // Get tool usage patterns
    const toolUsageQuery = await sql`
      SELECT
        tool_name,
        COUNT(*) as usage_count,
        MAX(completed_at) as last_used
      FROM tool_progress
      WHERE user_id = ${userId}
        AND status = 'completed'
      GROUP BY tool_name
      ORDER BY usage_count DESC
      LIMIT 5
    `;

    return {
      profile: profileQuery.rows[0] || {},
      recentActivity: activityQuery.rows,
      toolUsage: toolUsageQuery.rows,
      hasData: profileQuery.rows.length > 0
    };
  } catch (error) {
    console.error('Error fetching user context:', error);
    return {
      profile: {},
      recentActivity: [],
      toolUsage: [],
      hasData: false
    };
  }
}

async function getTaskHistory(userId: number) {
  try {
    const historyQuery = await sql`
      SELECT
        task_title,
        task_category,
        status,
        completed_at,
        target_value,
        current_value
      FROM daily_tasks
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return historyQuery.rows;
  } catch (error) {
    console.error('Error fetching task history:', error);
    return [];
  }
}

async function generatePersonalizedTasks({
  userId,
  journeyDay,
  userProfile,
  recentActivity,
  completedTasks,
  userContext
}: any) {

  // Build comprehensive context for AI
  const context = buildAIContext({
    journeyDay,
    userProfile,
    recentActivity,
    completedTasks,
    userContext
  });

  // Generate tasks using OpenRouter
  const aiResponse = await openRouter.createChatCompletion(
    OPENROUTER_MODELS.CLAUDE_35_HAIKU,
    [
      {
        role: "system",
        content: `Je bent een expert dating coach die dagelijkse taken genereert voor gebruikers van een dating app.

BELANGRIJK: Genereer ALTIJD precies 3 taken per categorie voor in totaal 9 taken. Zorg voor variatie en progressieve moeilijkheid.

TAKEN STRUCTUUR:
- Elke taak moet haalbaar zijn voor 1 dag
- Moet specifiek en meetbaar zijn
- Moet aansluiten bij user's niveau en doelen
- Moet motiverend en positief zijn

CATEGORIEËN (3 taken per categorie):
1. SOCIAL: Taken over communicatie, dates, sociale interacties
2. PRACTICAL: Taken over profiel, foto's, app gebruik
3. MINDSET: Taken over zelfvertrouwen, perspectief, groei

DIFFICULTY LEVELS:
- Journey dag 1-3: Beginners niveau (makkelijk)
- Journey dag 4-7: Intermediate (gemiddeld)
- Journey dag 8+: Advanced (uitdagend)

ANTWOORD FORMAT: JSON array met exact 9 objecten.`
      },
      {
        role: "user",
        content: `Genereer 9 gepersonaliseerde dagelijkse taken voor deze gebruiker:

${context}

Output als JSON array met deze structuur:
[
  {
    "taskTitle": "Specifieke taak titel",
    "taskDescription": "Korte uitleg (optioneel)",
    "taskCategory": "social|practical|mindset",
    "targetValue": 1,
    "difficulty": "beginner|intermediate|advanced",
    "personalizationReason": "Waarom deze taak voor deze gebruiker"
  }
]`
      }
    ],
    {
      max_tokens: 1500,
      temperature: 0.7,
    }
  );

  if (!aiResponse) {
    throw new Error('No response from AI');
  }

  // Parse and validate AI response
  let tasks;
  try {
    tasks = JSON.parse(aiResponse);
  } catch (parseError) {
    console.error('Failed to parse AI response:', aiResponse);
    // Fallback to default tasks
    tasks = generateFallbackTasks(journeyDay);
  }

  // Validate and ensure we have exactly 9 tasks
  if (!Array.isArray(tasks) || tasks.length !== 9) {
    console.warn('AI returned invalid task format, using fallback');
    tasks = generateFallbackTasks(journeyDay);
  }

  // Save tasks to database and return
  return await saveTasksToDatabase(userId, tasks, journeyDay);
}

function buildAIContext({
  journeyDay,
  userProfile,
  recentActivity,
  completedTasks,
  userContext
}: any) {

  const context = `USER CONTEXT:
- Journey dag: ${journeyDay}
- Leeftijd: ${userProfile?.age || 'onbekend'}
- Geslacht: ${userProfile?.gender || 'onbekend'}
- Doel: ${userProfile?.seekingType || 'onbekend'}
- Locatie: ${userProfile?.location || 'onbekend'}

ENGAGEMENT DATA:
- Current streak: ${userContext?.engagement?.currentStreak || 0}
- Total points: ${userContext?.engagement?.totalPoints || 0}
- Completed tasks: ${userContext?.engagement?.completedTasks || 0}

RECENT ACTIVITY (laatste 7 dagen):
${recentActivity?.map((activity: any) =>
  `- ${activity.activity_type}: ${activity.count}x (laatste: ${activity.last_activity})`
).join('\n') || 'Geen recente activiteit'}

TOOL USAGE PATRONEN:
${userContext?.toolUsage?.map((tool: any) =>
  `- ${tool.tool_name}: ${tool.usage_count}x gebruikt`
).join('\n') || 'Geen tool gebruik'}

COMPLETED TASKS HISTORY:
${completedTasks?.slice(0, 5).map((task: any) =>
  `- ${task.task_title} (${task.task_category}) - ${task.status}`
).join('\n') || 'Geen task geschiedenis'}

ADAPTATION NOTES:
- Pas difficulty aan journey dag aan (1-3: beginner, 4-7: intermediate, 8+: advanced)
- Gebruik tool usage om relevante taken te maken
- Vermijd herhaling van recent completed tasks
- Focus op pijnpunten gebaseerd op activity patterns`;

  return context;
}

async function saveTasksToDatabase(userId: number, tasks: any[], journeyDay: number) {
  try {
    const savedTasks = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      const result = await sql`
        INSERT INTO daily_tasks (
          user_id,
          task_title,
          task_description,
          task_category,
          target_value,
          current_value,
          status,
          difficulty,
          personalization_reason,
          journey_day,
          created_at
        ) VALUES (
          ${userId},
          ${task.taskTitle},
          ${task.taskDescription || null},
          ${task.taskCategory},
          ${task.targetValue || 1},
          0,
          'pending',
          ${task.difficulty || 'intermediate'},
          ${task.personalizationReason || 'AI generated'},
          ${journeyDay},
          NOW()
        )
        RETURNING id, task_title, task_description, task_category, target_value, current_value, status
      `;

      savedTasks.push({
        id: result.rows[0].id,
        taskTitle: result.rows[0].task_title,
        taskDescription: result.rows[0].task_description,
        taskCategory: result.rows[0].task_category,
        targetValue: result.rows[0].target_value,
        currentValue: result.rows[0].current_value,
        status: result.rows[0].status
      });
    }

    return savedTasks;
  } catch (error) {
    console.error('Error saving tasks to database:', error);
    throw error;
  }
}

function generateFallbackTasks(journeyDay: number) {
  // Fallback tasks if AI generation fails
  const difficulty = journeyDay <= 3 ? 'beginner' : journeyDay <= 7 ? 'intermediate' : 'advanced';

  return [
    // Social tasks
    {
      taskTitle: "Stuur een bericht naar 1 match",
      taskDescription: "Begin een gesprek met iemand die je interessant vindt",
      taskCategory: "social",
      targetValue: 1,
      difficulty,
      personalizationReason: "Fallback task - basic social engagement"
    },
    {
      taskTitle: journeyDay <= 3 ? "Bekijk 3 profielen" : "Bekijk 5 profielen aandachtig",
      taskDescription: "Neem tijd om profielen goed te lezen",
      taskCategory: "social",
      targetValue: journeyDay <= 3 ? 3 : 5,
      difficulty,
      personalizationReason: "Fallback task - profile exploration"
    },
    {
      taskTitle: "Reageer op 2 berichten",
      taskDescription: "Houd gesprekken gaande die al bezig zijn",
      taskCategory: "social",
      targetValue: 2,
      difficulty,
      personalizationReason: "Fallback task - conversation maintenance"
    },

    // Practical tasks
    {
      taskTitle: "Update je profiel bio",
      taskDescription: "Maak je bio aantrekkelijker en persoonlijker",
      taskCategory: "practical",
      targetValue: 1,
      difficulty,
      personalizationReason: "Fallback task - profile optimization"
    },
    {
      taskTitle: "Voeg 1 nieuwe foto toe",
      taskDescription: "Verbeter je profiel met een nieuwe foto",
      taskCategory: "practical",
      targetValue: 1,
      difficulty,
      personalizationReason: "Fallback task - photo improvement"
    },
    {
      taskTitle: "Stel je dating app notificaties bij",
      taskDescription: "Zorg dat je berichten niet mist",
      taskCategory: "practical",
      targetValue: 1,
      difficulty,
      personalizationReason: "Fallback task - app optimization"
    },

    // Mindset tasks
    {
      taskTitle: "Schrijf 3 dingen op waar je dankbaar voor bent",
      taskDescription: "Focus op positiviteit in je leven",
      taskCategory: "mindset",
      targetValue: 3,
      difficulty,
      personalizationReason: "Fallback task - gratitude practice"
    },
    {
      taskTitle: "Visualiseer een succesvolle date",
      taskDescription: "Stel je voor hoe een leuke date zou verlopen",
      taskCategory: "mindset",
      targetValue: 1,
      difficulty,
      personalizationReason: "Fallback task - positive visualization"
    },
    {
      taskTitle: "Complimenteer jezelf op 1 dating stap",
      taskDescription: "Wees trots op je vooruitgang",
      taskCategory: "mindset",
      targetValue: 1,
      difficulty,
      personalizationReason: "Fallback task - self-appreciation"
    }
  ];
}