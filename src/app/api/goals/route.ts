import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params or auth token
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    
    // If no userId in query params, try to get from auth token
    if (!userId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          // Simple token parsing - in production use proper JWT verification
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          userId = tokenData.user?.id || tokenData.userId || tokenData.id || tokenData.sub;
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
    }
    
    // If still no userId, return error
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required. Please provide userId query parameter or valid auth token.' },
        { status: 400 }
      );
    }

    // Get goals from database - check if deadline column exists
    let result;
    try {
      result = await sql`
        SELECT
          g.id,
          g.title,
          g.description,
          g.category,
          g.target_value,
          g.current_value,
          g.status,
          g.created_at,
          g.updated_at,
          CASE
            WHEN g.target_value > 0 THEN
              LEAST(100, (g.current_value::float / g.target_value::float) * 100)
            ELSE 0
          END as progress_percentage
        FROM user_goals g
        WHERE g.user_id = ${parseInt(userId)}
        ORDER BY g.status = 'completed' ASC, g.created_at DESC
      `;
    } catch (error: any) {
      // If deadline column doesn't exist, that's okay - just continue without it
      console.log('Note: deadline column may not exist in user_goals table');
      result = await sql`
        SELECT
          g.id,
          g.title,
          g.description,
          g.category,
          g.target_value,
          g.current_value,
          g.status,
          g.created_at,
          g.updated_at,
          CASE
            WHEN g.target_value > 0 THEN
              LEAST(100, (g.current_value::float / g.target_value::float) * 100)
            ELSE 0
          END as progress_percentage
        FROM user_goals g
        WHERE g.user_id = ${parseInt(userId)}
        ORDER BY g.status = 'completed' ASC, g.created_at DESC
      `;
    }

    // If no goals found, create default goals
    if (result.rows.length === 0) {
      await createDefaultGoals(parseInt(userId));
      
      // Fetch the newly created goals
      const newResult = await sql`
        SELECT
          g.id,
          g.title,
          g.description,
          g.category,
          g.target_value,
          g.current_value,
          g.status,
          g.created_at,
          g.updated_at,
          CASE
            WHEN g.target_value > 0 THEN
              LEAST(100, (g.current_value::float / g.target_value::float) * 100)
            ELSE 0
          END as progress_percentage
        FROM user_goals g
        WHERE g.user_id = ${parseInt(userId)}
        ORDER BY g.status = 'completed' ASC, g.created_at DESC
      `;
      
      return NextResponse.json(newResult.rows);
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, category, target_value, goal_type } = body;
    
    // Get userId from body or auth token
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          effectiveUserId = tokenData.user?.id || tokenData.userId || tokenData.id || tokenData.sub;
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
    }
    
    if (!effectiveUserId || !title || !category) {
      return NextResponse.json(
        { error: 'userId, title, and category are required' },
        { status: 400 }
      );
    }
    
    // Insert new goal
    const result = await sql`
      INSERT INTO user_goals (
        user_id,
        goal_type,
        title,
        description,
        category,
        target_value,
        current_value,
        status
      ) VALUES (
        ${parseInt(effectiveUserId)},
        ${goal_type || 'monthly'},
        ${title},
        ${description || ''},
        ${category},
        ${target_value || 1},
        ${0},
        ${'active'}
      )
      RETURNING *
    `;
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}

// Create default goals for new users
async function createDefaultGoals(userId: number) {
  try {
    // Get coaching profile to personalize goals
    const profileResult = await sql`
      SELECT * FROM coaching_profiles WHERE user_id = ${userId}
    `;
    
    const profile = profileResult.rows[0];
    const primaryGoal = profile?.primary_goal || 'relationship';
    const mainChallenge = profile?.main_challenge || 'profile_insecurity';
    
    // Create default goals based on profile with tool links
    const goals = [
      {
        goal_type: 'weekly',
        title: 'Voltooi je persoonlijkheidsscan',
        description: 'Beantwoord alle vragen in de persoonlijkheidsscan om je dating DNA te ontdekken',
        category: 'onboarding',
        target_value: 1,
        current_value: 0,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        tool_link: 'skills-assessment'
      },
      {
        goal_type: 'monthly',
        title: 'Optimaliseer je dating profiel',
        description: 'Gebruik de Profiel Coach om een aantrekkelijk en authentiek profiel te maken',
        category: 'profile',
        target_value: 1,
        current_value: 0,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'active',
        tool_link: 'profiel-coach'
      },
      {
        goal_type: 'monthly',
        title: 'Verbeter je foto\'s',
        description: 'Upload en analyseer je foto\'s met de Foto Advies tool',
        category: 'photos',
        target_value: 3,
        current_value: 0,
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: 'active',
        tool_link: 'foto-advies'
      }
    ];
    
    // Add goal based on primary goal
    if (primaryGoal === 'relationship') {
      goals.push({
        goal_type: 'monthly',
        title: 'Ga op 3 dates',
        description: 'Plan en ga op 3 dates met verschillende matches',
        category: 'dating',
        target_value: 3,
        current_value: 0,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'active',
        tool_link: 'dateplanner'
      });
    } else if (primaryGoal === 'confidence') {
      goals.push({
        goal_type: 'monthly',
        title: 'Verbeter je dating zelfvertrouwen',
        description: 'Voltooi de zelfvertrouwen module in de online cursus',
        category: 'skills',
        target_value: 1,
        current_value: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        tool_link: 'online-cursus'
      });
    }
    
    // Add goal based on main challenge
    if (mainChallenge === 'profile_insecurity') {
      goals.push({
        goal_type: 'weekly',
        title: 'Krijg feedback op je profiel',
        description: 'Gebruik de Profiel Analyse tool om expert feedback te krijgen',
        category: 'profile',
        target_value: 1,
        current_value: 0,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'active',
        tool_link: 'profiel-analyse'
      });
    } else if (mainChallenge === 'shallow_conversations') {
      goals.push({
        goal_type: 'monthly',
        title: 'Verbeter je gesprekstechnieken',
        description: 'Gebruik de Chat Coach om 5 keer te oefenen met gesprekken',
        category: 'conversation',
        target_value: 5,
        current_value: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        tool_link: 'chat-coach'
      });
    }
    
    // Insert goals into database
    for (const goal of goals) {
      try {
        // Start with basic columns only to avoid column errors
        await sql`
          INSERT INTO user_goals (
            user_id,
            goal_type,
            title,
            description,
            category,
            target_value,
            current_value,
            status
          ) VALUES (
            ${userId},
            ${goal.goal_type},
            ${goal.title},
            ${goal.description},
            ${goal.category},
            ${goal.target_value},
            ${goal.current_value},
            ${goal.status}
          )
        `;
      } catch (error: any) {
        console.error('Failed to insert goal:', error);
        // Continue with next goal
      }
    }
    
    console.log(`✅ Created ${goals.length} default goals for user ${userId}`);
    
    // Update coaching profile with active goals
    const goalIds = await sql`
      SELECT id FROM user_goals WHERE user_id = ${userId} AND status = 'active'
    `;
    
    const activeGoalIds = goalIds.rows.map(row => row.id);
    
    await sql`
      UPDATE coaching_profiles
      SET active_goals = ${JSON.stringify(activeGoalIds)}
      WHERE user_id = ${userId}
    `;
    
    return true;
  } catch (error) {
    console.error('Error creating default goals:', error);
    return false;
  }
}