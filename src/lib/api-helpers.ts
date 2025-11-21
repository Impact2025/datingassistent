import { NextResponse } from 'next/server';
import { getFeatureLimits } from './neon-subscription';
import { checkFeatureLimit } from './neon-usage-tracking';

/**
 * Check if user has remaining usage for a feature
 * Returns NextResponse with error if limit exceeded, null if allowed
 */
export async function checkAndEnforceLimit(
  userId: number,
  featureType:
    | 'ai_message'
    | 'profile_rewrite'
    | 'photo_check'
    | 'platform_advice'
    | 'icebreaker'
    | 'opener'
    | 'date_idea'
    | 'date_analysis'
    | 'safety_check'
    | 'module_ai'
): Promise<NextResponse | null> {
  // Get user's feature limits based on subscription
  const limits = await getFeatureLimits(userId);

  if (!limits) {
    return NextResponse.json(
      {
        error: 'subscription_required',
        message: 'Je hebt een actief abonnement nodig om deze functie te gebruiken.',
      },
      { status: 403 }
    );
  }

  // Map feature type to limit
  let limit: number;
  let resetPeriod: string;

  switch (featureType) {
    case 'ai_message':
      limit = limits.aiMessagesPerWeek;
      resetPeriod = 'week';
      break;
    case 'profile_rewrite':
      limit = limits.profileRewritesRolling30Days;
      resetPeriod = '30 dagen';
      break;
    case 'photo_check':
      limit = limits.photoChecksRolling30Days;
      resetPeriod = '30 dagen';
      break;
    case 'platform_advice':
      limit = limits.platformAdviceRolling30Days;
      resetPeriod = '30 dagen';
      break;
    case 'icebreaker':
      limit = limits.icebreakersPerDay;
      resetPeriod = 'dag';
      break;
    case 'opener':
      limit = limits.openersPerDay;
      resetPeriod = 'dag';
      break;
    case 'date_idea':
      limit = limits.dateIdeasPerDay;
      resetPeriod = 'dag';
      break;
    case 'date_analysis':
      limit = limits.dateAnalysisPerDay;
      resetPeriod = 'dag';
      break;
    case 'safety_check':
      limit = limits.safetyChecksPerDay;
      resetPeriod = 'dag';
      break;
    case 'module_ai':
      limit = limits.moduleAiFeedbackPerDay;
      resetPeriod = 'dag';
      break;
    default:
      return NextResponse.json(
        { error: 'Unknown feature type' },
        { status: 400 }
      );
  }

  // Check current usage against limit
  const limitCheck = await checkFeatureLimit(userId, featureType, limit);

  if (!limitCheck.allowed) {
    const resetDate = new Date(limitCheck.resetDate);
    const resetTime = resetDate.toLocaleString('nl-NL', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });

    return NextResponse.json(
      {
        error: 'feature_limit_exceeded',
        message: `Je hebt je limiet bereikt (${limitCheck.current}/${limitCheck.limit} per ${resetPeriod}). Reset op ${resetTime}.`,
        current: limitCheck.current,
        limit: limitCheck.limit,
        resetDate: limitCheck.resetDate
      },
      { status: 429 }
    );
  }

  // Allowed - return null
  return null;
}
