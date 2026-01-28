/**
 * Coach Context Builder
 * Verzamelt user data voor AI personalisatie
 * Privacy: Geanonimiseerde data - geen namen, leeftijdsgroepen ipv exacte leeftijden
 */

import { sql } from '@vercel/postgres';
import { getAgeRange } from '../ai-privacy';
import type { CoachContext, UserProfile, AssessmentResults, JourneyProgress, UserGoals, RecentActivity } from './types';

export async function buildCoachContext(userId: number): Promise<CoachContext> {
  try {
    // 1. Haal user profiel op
    const userProfile = await getUserProfile(userId);

    // 2. Haal assessment resultaten op
    const assessments = await getAssessmentResults(userId);

    // 3. Haal journey progress op
    const journey = await getJourneyProgress(userId);

    // 4. Haal goals op
    const goals = await getUserGoals(userId);

    // 5. Haal recent activity op
    const activity = await getRecentActivity(userId);

    return {
      user: userProfile,
      assessments,
      journey,
      goals,
      activity,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error building coach context:', error);
    throw error;
  }
}

async function getUserProfile(userId: number): Promise<UserProfile> {
  const result = await sql`
    SELECT
      id,
      name,
      email,
      subscription_type
    FROM users
    WHERE id = ${userId}
  `;

  const user = result.rows[0];

  return {
    id: user.id,
    name: user.name || user.email,
    email: user.email,
    age: undefined,
    gender: undefined,
    lookingFor: undefined,
    subscriptionType: user.subscription_type || 'free'
  };
}

async function getAssessmentResults(userId: number): Promise<AssessmentResults> {
  const assessments: AssessmentResults = {};

  // Hechtingsstijl
  try {
    const hechtingResult = await sql`
      SELECT stijl_type, score, completed_at
      FROM hechtingsstijl_results
      WHERE user_id = ${userId}
      ORDER BY completed_at DESC
      LIMIT 1
    `;

    if (hechtingResult.rows.length > 0) {
      const h = hechtingResult.rows[0];
      assessments.hechtingsstijl = {
        type: h.stijl_type,
        score: h.score,
        completedAt: h.completed_at
      };
    }
  } catch (error) {
    console.log('No hechtingsstijl data');
  }

  // Dating Stijl
  try {
    const datingStijlResult = await sql`
      SELECT primary_style, secondary_style, blind_spots, completed_at
      FROM dating_style_results
      WHERE user_id = ${userId}
      ORDER BY completed_at DESC
      LIMIT 1
    `;

    if (datingStijlResult.rows.length > 0) {
      const ds = datingStijlResult.rows[0];
      assessments.datingStijl = {
        primary: ds.primary_style,
        secondary: ds.secondary_style,
        blindspots: ds.blind_spots ? JSON.parse(ds.blind_spots) : [],
        completedAt: ds.completed_at
      };
    }
  } catch (error) {
    console.log('No dating style data');
  }

  // Emotionele Readiness
  try {
    const readinessResult = await sql`
      SELECT score, ready_level, completed_at
      FROM emotional_readiness_results
      WHERE user_id = ${userId}
      ORDER BY completed_at DESC
      LIMIT 1
    `;

    if (readinessResult.rows.length > 0) {
      const er = readinessResult.rows[0];
      assessments.emotioneleReadiness = {
        score: er.score,
        readyLevel: er.ready_level,
        completedAt: er.completed_at
      };
    }
  } catch (error) {
    console.log('No emotional readiness data');
  }

  return assessments;
}

async function getJourneyProgress(userId: number): Promise<JourneyProgress> {
  try {
    const result = await sql`
      SELECT current_step, completed_steps, journey_started_at
      FROM user_journey_progress
      WHERE user_id = ${userId}
    `;

    if (result.rows.length > 0) {
      const jp = result.rows[0];
      const completedSteps = jp.completed_steps || [];

      return {
        currentPhase: determinePhase(jp.current_step),
        currentStep: jp.current_step,
        completedSteps: completedSteps,
        progressPercentage: calculateProgress(completedSteps),
        startedAt: jp.journey_started_at
      };
    }
  } catch (error) {
    console.log('No journey progress data');
  }

  return {
    currentPhase: 'welcome',
    currentStep: 'welcome',
    completedSteps: [],
    progressPercentage: 0,
    startedAt: new Date()
  };
}

async function getUserGoals(userId: number): Promise<UserGoals> {
  try {
    const result = await sql`
      SELECT year_goal, month_goals, week_goals, challenges
      FROM goal_hierarchies
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.rows.length > 0) {
      const g = result.rows[0];
      return {
        yearGoal: g.year_goal,
        monthGoals: g.month_goals || [],
        weekGoals: g.week_goals || [],
        challenges: g.challenges || []
      };
    }
  } catch (error) {
    console.log('No goals data');
  }

  return {};
}

async function getRecentActivity(userId: number): Promise<RecentActivity> {
  const activity: RecentActivity = {};

  // Last login
  try {
    const loginResult = await sql`
      SELECT last_login FROM users WHERE id = ${userId}
    `;
    if (loginResult.rows.length > 0) {
      activity.lastLogin = loginResult.rows[0].last_login;
    }
  } catch (error) {
    console.log('No login data');
  }

  // Courses in progress
  try {
    const cursusResult = await sql`
      SELECT DISTINCT c.titel,
        COUNT(DISTINCT usp.sectie_id) * 100.0 /
        (SELECT COUNT(*) FROM cursus_secties WHERE cursus_id = c.id) as progress
      FROM cursussen c
      JOIN cursus_lessen cl ON cl.cursus_id = c.id
      JOIN user_sectie_progress usp ON usp.les_id = cl.id
      WHERE usp.user_id = ${userId}
      GROUP BY c.id, c.titel
      LIMIT 3
    `;

    if (cursusResult.rows.length > 0) {
      activity.coursesInProgress = cursusResult.rows.map(row => ({
        title: row.titel,
        progress: Math.round(row.progress)
      }));
    }
  } catch (error) {
    console.log('No course progress data');
  }

  return activity;
}

function determinePhase(step: string): string {
  if (step.includes('fundament') || step.includes('zelfbeeld') || step.includes('hechtingsstijl')) {
    return 'fundament';
  }
  if (step.includes('profiel') || step.includes('foto') || step.includes('bio')) {
    return 'profiel';
  }
  if (step.includes('communicatie') || step.includes('gesprek') || step.includes('opener')) {
    return 'communicatie';
  }
  if (step.includes('date') || step.includes('match')) {
    return 'actief-daten';
  }
  return 'welcome';
}

function calculateProgress(completedSteps: string[]): number {
  const totalSteps = 50; // Estimated total journey steps
  return Math.round((completedSteps.length / totalSteps) * 100);
}

/**
 * Convert context to rich text for AI prompt
 * Privacy: Geen naam, leeftijdsgroep ipv exacte leeftijd, geen specifieke locatie
 */
export function contextToPrompt(context: CoachContext): string {
  const parts: string[] = [];

  // User intro - Privacy: geen naam, geen exacte leeftijd
  parts.push('Gebruiker context (geanonimiseerd):');
  if (context.user.age) {
    parts.push(` Leeftijdsgroep: ${getAgeRange(context.user.age)}`);
  }
  if (context.user.gender) {
    parts.push(`, ${context.user.gender}`);
  }
  if (context.user.lookingFor) {
    parts.push(`, zoekt: ${context.user.lookingFor}`);
  }
  parts.push(', Nederland.'); // Privacy: alleen land, geen specifieke locatie

  // Assessments
  if (context.assessments.hechtingsstijl) {
    parts.push(`\nHechtingsstijl: ${context.assessments.hechtingsstijl.type}.`);
  }
  if (context.assessments.datingStijl) {
    parts.push(`\nDating stijl: ${context.assessments.datingStijl.primary}`);
    if (context.assessments.datingStijl.blindspots && context.assessments.datingStijl.blindspots.length > 0) {
      parts.push(` (blind spots: ${context.assessments.datingStijl.blindspots.join(', ')})`);
    }
    parts.push('.');
  }
  if (context.assessments.emotioneleReadiness) {
    parts.push(`\nEmotionele readiness: ${context.assessments.emotioneleReadiness.readyLevel} (${context.assessments.emotioneleReadiness.score}%).`);
  }

  // Journey
  parts.push(`\n\nHuidige fase: ${context.journey.currentPhase}.`);
  parts.push(`\nVoortgang: ${context.journey.progressPercentage}% (${context.journey.completedSteps.length} stappen voltooid).`);

  // Goals
  if (context.goals.yearGoal) {
    parts.push(`\n\nJaardoel: ${context.goals.yearGoal}.`);
  }
  if (context.goals.weekGoals && context.goals.weekGoals.length > 0) {
    parts.push(`\nWeekdoelen: ${context.goals.weekGoals.join(', ')}.`);
  }
  if (context.goals.challenges && context.goals.challenges.length > 0) {
    parts.push(`\nUitdagingen: ${context.goals.challenges.join(', ')}.`);
  }

  // Recent activity
  if (context.activity.coursesInProgress && context.activity.coursesInProgress.length > 0) {
    parts.push(`\n\nBezig met cursussen:\n`);
    context.activity.coursesInProgress.forEach(course => {
      parts.push(`- ${course.title} (${course.progress}%)\n`);
    });
  }

  return parts.join('');
}
