import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { CoachingProfileService } from '@/lib/coaching-profile-service';
import { trackUserActivity } from '@/lib/progress-tracker';

export async function POST(request: NextRequest) {
  try {
    const { userId, goalId, newValue, completed } = await request.json();

    if (!userId || !goalId) {
      return NextResponse.json(
        { error: 'userId and goalId are required' },
        { status: 400 }
      );
    }

    // Get current goal data
    const goalResult = await sql`
      SELECT * FROM user_goals WHERE id = ${goalId} AND user_id = ${userId}
    `;

    if (goalResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    const goal = goalResult.rows[0];
    const previousValue = goal.current_value;
    const targetValue = goal.target_value;
    
    // Update goal progress
    let updateResult;
    
    if (completed) {
      // Mark goal as completed
      updateResult = await sql`
        UPDATE user_goals
        SET
          current_value = ${targetValue},
          status = 'completed',
          updated_at = NOW()
        WHERE id = ${goalId} AND user_id = ${userId}
        RETURNING *
      `;
    } else if (newValue !== undefined) {
      // Update current value
      updateResult = await sql`
        UPDATE user_goals
        SET
          current_value = ${newValue},
          status = CASE
            WHEN ${newValue} >= target_value THEN 'completed'
            ELSE status
          END,
          updated_at = NOW()
        WHERE id = ${goalId} AND user_id = ${userId}
        RETURNING *
      `;
    } else {
      return NextResponse.json(
        { error: 'Either newValue or completed must be provided' },
        { status: 400 }
      );
    }

    const updatedGoal = updateResult.rows[0];
    const wasCompleted = previousValue < targetValue && updatedGoal.current_value >= targetValue;
    
    // Calculate progress percentage
    const progressPercentage = targetValue > 0 
      ? Math.min(100, (updatedGoal.current_value / targetValue) * 100) 
      : 0;
    
    // Track activity
    try {
      await trackUserActivity(userId, {
        type: 'goal_progress',
        data: {
          goalId,
          title: updatedGoal.title,
          category: updatedGoal.category,
          previousValue,
          newValue: updatedGoal.current_value,
          targetValue,
          completed: updatedGoal.status === 'completed'
        },
        points: wasCompleted ? 10 : 2 // More points for completing a goal
      });
    } catch (error) {
      console.error('Failed to track goal progress activity:', error);
      // Non-blocking error
    }
    
    // If goal was completed, update coaching profile
    if (wasCompleted) {
      try {
        // Get coaching profile
        const profile = await CoachingProfileService.getProfile(userId);
        
        if (profile) {
          // Remove completed goal from active goals
          const activeGoals = profile.activeGoals.filter(id => id !== goalId);
          
          // Update coaching profile
          await CoachingProfileService.updateProfile(userId, {
            // Use the field name from the interface
            completedSteps: [...(profile.completedSteps || []), `goal_completed_${goalId}`]
          });
          
          console.log(`✅ Removed completed goal ${goalId} from active goals for user ${userId}`);
        }
      } catch (error) {
        console.error('Failed to update coaching profile after goal completion:', error);
        // Non-blocking error
      }
    }
    
    // Return updated goal with progress percentage
    return NextResponse.json({
      ...updatedGoal,
      progress_percentage: progressPercentage
    });
    
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return NextResponse.json(
      { error: 'Failed to update goal progress' },
      { status: 500 }
    );
  }
}