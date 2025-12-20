/**
 * API Route: Dating Snapshot Complete
 *
 * POST - Save completed Dating Snapshot onboarding
 * GET - Get user's onboarding profile
 */

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from '@/lib/auth';
import type {
  EnergyProfile,
  AttachmentStyle,
  PainPoint,
  WelcomeMessage,
  PAIN_POINT_TEXTS,
  ATTACHMENT_STYLE_TEXTS,
  GOAL_TEXTS,
} from '@/types/dating-snapshot.types';

export const dynamic = 'force-dynamic';

// =====================================================
// POST - Save completed onboarding
// =====================================================

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { answers, scores } = body;

    if (!answers || !scores) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Extract data from answers
    const profile = {
      display_name: answers.display_name || null,
      age: answers.age ? parseInt(answers.age) : null,
      location_city: answers.location_city || null,
      occupation: answers.occupation || null,
      single_since: answers.single_since || null,
      longest_relationship_months: answers.longest_relationship_months
        ? parseInt(answers.longest_relationship_months)
        : null,

      // Dating situation
      apps_used: JSON.stringify(answers.apps_used || []),
      primary_app: answers.primary_app || null,
      app_experience_months: answers.app_experience_months
        ? parseInt(answers.app_experience_months)
        : null,
      matches_per_week: answers.matches_per_week ? parseInt(answers.matches_per_week) : null,
      matches_to_conversations_pct: answers.matches_to_conversations_pct || null,
      conversations_to_dates_pct: answers.conversations_to_dates_pct || null,
      dates_last_3_months: answers.dates_last_3_months
        ? parseInt(answers.dates_last_3_months)
        : null,
      last_date_recency: answers.last_date_recency || null,

      // Energy profile
      energy_after_social: answers.energy_after_social || null,
      conversation_preference: answers.conversation_preference || null,
      call_preparation: answers.call_preparation || null,
      post_date_need: answers.post_date_need || null,
      recharge_method: answers.recharge_method || null,
      social_battery_capacity: answers.social_battery_capacity || null,
      social_media_fatigue: answers.social_media_fatigue || null,
      introvert_score: scores.introvertScore,
      energy_profile: scores.energyProfile,

      // Pain points
      pain_points_ranked: JSON.stringify(answers.pain_points_ranked || []),
      primary_pain_point: scores.primaryPainPoint,
      secondary_pain_point: answers.pain_points_ranked?.[1] || null,
      pain_point_severity: answers.pain_point_severity || null,
      biggest_frustration: answers.biggest_frustration || null,
      tried_solutions: JSON.stringify(answers.tried_solutions || []),

      // Attachment
      attachment_q1_abandonment: answers.attachment_q1_abandonment || null,
      attachment_q2_trust: answers.attachment_q2_trust || null,
      attachment_q3_intimacy: answers.attachment_q3_intimacy || null,
      attachment_q4_validation: answers.attachment_q4_validation || null,
      attachment_q5_withdraw: answers.attachment_q5_withdraw || null,
      attachment_q6_independence: answers.attachment_q6_independence || null,
      attachment_q7_closeness: answers.attachment_q7_closeness || null,
      attachment_style_predicted: scores.attachmentStyle,
      attachment_confidence: scores.attachmentConfidence,

      // Goals
      relationship_goal: answers.relationship_goal || null,
      timeline_preference: answers.timeline_preference || null,
      one_year_vision: answers.one_year_vision || null,
      success_definition: answers.success_definition || null,
      commitment_level: answers.commitment_level || null,
      weekly_time_available: answers.weekly_time_available
        ? parseInt(answers.weekly_time_available)
        : null,

      // Context
      has_been_ghosted: answers.has_been_ghosted || false,
      ghosting_frequency: answers.ghosting_frequency || null,
      ghosting_impact: answers.ghosting_impact || null,
      has_experienced_burnout: answers.has_experienced_burnout || false,
      burnout_severity: answers.burnout_severity || null,
      previous_coaching: answers.previous_coaching || false,
      how_found_us: answers.how_found_us || null,

      // Calculate personalization flags
      enable_introvert_mode: scores.introvertScore >= 60,
      needs_extra_ghosting_support:
        answers.ghosting_frequency === 'often' ||
        answers.ghosting_frequency === 'very_often' ||
        (answers.ghosting_impact && answers.ghosting_impact >= 7),
      needs_burnout_prevention: answers.has_experienced_burnout === true,
      needs_confidence_building:
        (answers.matches_per_week && parseInt(answers.matches_per_week) <= 1) ||
        (answers.dates_last_3_months && parseInt(answers.dates_last_3_months) <= 1),
      needs_extra_validation: scores.attachmentStyle === 'anxious',
      recommended_pace: calculateRecommendedPace(answers, scores),

      // Store full answers
      answers_json: JSON.stringify(answers),
    };

    // Upsert profile
    const result = await sql`
      INSERT INTO user_onboarding_profiles (
        user_id,
        display_name, age, location_city, occupation, single_since, longest_relationship_months,
        apps_used, primary_app, app_experience_months, matches_per_week,
        matches_to_conversations_pct, conversations_to_dates_pct, dates_last_3_months, last_date_recency,
        energy_after_social, conversation_preference, call_preparation, post_date_need,
        recharge_method, social_battery_capacity, social_media_fatigue, introvert_score, energy_profile,
        pain_points_ranked, primary_pain_point, secondary_pain_point, pain_point_severity,
        biggest_frustration, tried_solutions,
        attachment_q1_abandonment, attachment_q2_trust, attachment_q3_intimacy,
        attachment_q4_validation, attachment_q5_withdraw, attachment_q6_independence, attachment_q7_closeness,
        attachment_style_predicted, attachment_confidence,
        relationship_goal, timeline_preference, one_year_vision, success_definition,
        commitment_level, weekly_time_available,
        has_been_ghosted, ghosting_frequency, ghosting_impact,
        has_experienced_burnout, burnout_severity, previous_coaching, how_found_us,
        enable_introvert_mode, needs_extra_ghosting_support, needs_burnout_prevention,
        needs_confidence_building, needs_extra_validation, recommended_pace,
        answers_json,
        is_complete, completed_at, completion_percentage
      ) VALUES (
        ${userId},
        ${profile.display_name}, ${profile.age}, ${profile.location_city}, ${profile.occupation},
        ${profile.single_since}, ${profile.longest_relationship_months},
        ${profile.apps_used}::jsonb, ${profile.primary_app}, ${profile.app_experience_months},
        ${profile.matches_per_week}, ${profile.matches_to_conversations_pct},
        ${profile.conversations_to_dates_pct}, ${profile.dates_last_3_months}, ${profile.last_date_recency},
        ${profile.energy_after_social}, ${profile.conversation_preference}, ${profile.call_preparation},
        ${profile.post_date_need}, ${profile.recharge_method}, ${profile.social_battery_capacity},
        ${profile.social_media_fatigue}, ${profile.introvert_score}, ${profile.energy_profile},
        ${profile.pain_points_ranked}::jsonb, ${profile.primary_pain_point}, ${profile.secondary_pain_point},
        ${profile.pain_point_severity}, ${profile.biggest_frustration}, ${profile.tried_solutions}::jsonb,
        ${profile.attachment_q1_abandonment}, ${profile.attachment_q2_trust}, ${profile.attachment_q3_intimacy},
        ${profile.attachment_q4_validation}, ${profile.attachment_q5_withdraw}, ${profile.attachment_q6_independence},
        ${profile.attachment_q7_closeness}, ${profile.attachment_style_predicted}, ${profile.attachment_confidence},
        ${profile.relationship_goal}, ${profile.timeline_preference}, ${profile.one_year_vision},
        ${profile.success_definition}, ${profile.commitment_level}, ${profile.weekly_time_available},
        ${profile.has_been_ghosted}, ${profile.ghosting_frequency}, ${profile.ghosting_impact},
        ${profile.has_experienced_burnout}, ${profile.burnout_severity}, ${profile.previous_coaching},
        ${profile.how_found_us},
        ${profile.enable_introvert_mode}, ${profile.needs_extra_ghosting_support},
        ${profile.needs_burnout_prevention}, ${profile.needs_confidence_building},
        ${profile.needs_extra_validation}, ${profile.recommended_pace},
        ${profile.answers_json}::jsonb,
        true, NOW(), 100
      )
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        age = EXCLUDED.age,
        location_city = EXCLUDED.location_city,
        occupation = EXCLUDED.occupation,
        single_since = EXCLUDED.single_since,
        longest_relationship_months = EXCLUDED.longest_relationship_months,
        apps_used = EXCLUDED.apps_used,
        primary_app = EXCLUDED.primary_app,
        app_experience_months = EXCLUDED.app_experience_months,
        matches_per_week = EXCLUDED.matches_per_week,
        matches_to_conversations_pct = EXCLUDED.matches_to_conversations_pct,
        conversations_to_dates_pct = EXCLUDED.conversations_to_dates_pct,
        dates_last_3_months = EXCLUDED.dates_last_3_months,
        last_date_recency = EXCLUDED.last_date_recency,
        energy_after_social = EXCLUDED.energy_after_social,
        conversation_preference = EXCLUDED.conversation_preference,
        call_preparation = EXCLUDED.call_preparation,
        post_date_need = EXCLUDED.post_date_need,
        recharge_method = EXCLUDED.recharge_method,
        social_battery_capacity = EXCLUDED.social_battery_capacity,
        social_media_fatigue = EXCLUDED.social_media_fatigue,
        introvert_score = EXCLUDED.introvert_score,
        energy_profile = EXCLUDED.energy_profile,
        pain_points_ranked = EXCLUDED.pain_points_ranked,
        primary_pain_point = EXCLUDED.primary_pain_point,
        secondary_pain_point = EXCLUDED.secondary_pain_point,
        pain_point_severity = EXCLUDED.pain_point_severity,
        biggest_frustration = EXCLUDED.biggest_frustration,
        tried_solutions = EXCLUDED.tried_solutions,
        attachment_q1_abandonment = EXCLUDED.attachment_q1_abandonment,
        attachment_q2_trust = EXCLUDED.attachment_q2_trust,
        attachment_q3_intimacy = EXCLUDED.attachment_q3_intimacy,
        attachment_q4_validation = EXCLUDED.attachment_q4_validation,
        attachment_q5_withdraw = EXCLUDED.attachment_q5_withdraw,
        attachment_q6_independence = EXCLUDED.attachment_q6_independence,
        attachment_q7_closeness = EXCLUDED.attachment_q7_closeness,
        attachment_style_predicted = EXCLUDED.attachment_style_predicted,
        attachment_confidence = EXCLUDED.attachment_confidence,
        relationship_goal = EXCLUDED.relationship_goal,
        timeline_preference = EXCLUDED.timeline_preference,
        one_year_vision = EXCLUDED.one_year_vision,
        success_definition = EXCLUDED.success_definition,
        commitment_level = EXCLUDED.commitment_level,
        weekly_time_available = EXCLUDED.weekly_time_available,
        has_been_ghosted = EXCLUDED.has_been_ghosted,
        ghosting_frequency = EXCLUDED.ghosting_frequency,
        ghosting_impact = EXCLUDED.ghosting_impact,
        has_experienced_burnout = EXCLUDED.has_experienced_burnout,
        burnout_severity = EXCLUDED.burnout_severity,
        previous_coaching = EXCLUDED.previous_coaching,
        how_found_us = EXCLUDED.how_found_us,
        enable_introvert_mode = EXCLUDED.enable_introvert_mode,
        needs_extra_ghosting_support = EXCLUDED.needs_extra_ghosting_support,
        needs_burnout_prevention = EXCLUDED.needs_burnout_prevention,
        needs_confidence_building = EXCLUDED.needs_confidence_building,
        needs_extra_validation = EXCLUDED.needs_extra_validation,
        recommended_pace = EXCLUDED.recommended_pace,
        answers_json = EXCLUDED.answers_json,
        is_complete = true,
        completed_at = NOW(),
        completion_percentage = 100,
        last_updated = NOW()
      RETURNING id
    `;

    // Also update the transformatie_onboarding table for backwards compatibility
    await sql`
      INSERT INTO transformatie_onboarding (user_id, data, completed_at)
      VALUES (
        ${userId},
        ${JSON.stringify({
          preferredName: profile.display_name,
          biggestChallenge: profile.primary_pain_point,
          goals: [profile.relationship_goal],
          commitmentLevel: profile.commitment_level >= 8 ? 'all_in' : 'serious',
          age: profile.age,
          snapshotCompleted: true,
        })}::jsonb,
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        data = EXCLUDED.data,
        completed_at = NOW()
    `;

    // Generate welcome message
    const welcomeMessage = generateWelcomeMessage(profile, scores);

    console.log(`✅ Dating Snapshot completed for user ${userId}`);

    return NextResponse.json({
      success: true,
      profile: {
        id: result.rows[0].id,
        userId,
        ...profile,
      },
      welcomeMessage,
    });
  } catch (error) {
    console.error('Error saving Dating Snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to save onboarding' },
      { status: 500 }
    );
  }
}

// =====================================================
// GET - Get user's onboarding profile
// =====================================================

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const result = await sql`
      SELECT * FROM user_onboarding_profiles
      WHERE user_id = ${userId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Error getting onboarding profile:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function calculateRecommendedPace(answers: any, scores: any): string {
  // Slow pace conditions
  if (
    answers.has_experienced_burnout &&
    answers.burnout_severity &&
    answers.burnout_severity >= 7
  ) {
    return 'slow';
  }
  if (answers.weekly_time_available && parseInt(answers.weekly_time_available) <= 1) {
    return 'slow';
  }
  if (scores.attachmentStyle === 'avoidant') {
    return 'slow';
  }

  // Intensive pace conditions
  if (answers.commitment_level && answers.commitment_level >= 8) {
    if (answers.weekly_time_available && parseInt(answers.weekly_time_available) >= 4) {
      return 'intensive';
    }
  }

  return 'normal';
}

function generateWelcomeMessage(profile: any, scores: any): WelcomeMessage {
  const name = profile.display_name || 'daar';
  const energyProfile = scores.energyProfile as EnergyProfile;
  const attachmentStyle = scores.attachmentStyle as AttachmentStyle;
  const primaryPainPoint = scores.primaryPainPoint as PainPoint;

  const painPointTexts: Record<string, string> = {
    few_matches: 'te weinig matches krijgen',
    conversations_die: 'gesprekken die doodlopen',
    no_dates: 'gesprekken die niet tot dates leiden',
    ghosting: 'geghostd worden',
    burnout: 'dating burnout en uitputting',
    wrong_people: 'steeds op de verkeerde mensen vallen',
    confidence: 'onzekerheid en niet durven beginnen',
    second_dates: 'eerste dates die niet tot tweede dates leiden',
  };

  const attachmentTexts: Record<string, string> = {
    secure: 'veilig gehecht',
    anxious: 'angstig gehecht',
    avoidant: 'vermijdend gehecht',
    fearful_avoidant: 'angstig-vermijdend gehecht',
  };

  const goalTexts: Record<string, string> = {
    serious_relationship: 'een serieuze relatie',
    casual_dating: 'casual daten',
    marriage: 'een levenspartner',
    unsure: 'ontdekken wat je wilt',
  };

  let body = '';

  if (energyProfile === 'introvert') {
    body = `Hoi ${name},

Wat fijn dat je er bent. Ik heb je antwoorden bekeken en ik begrijp je situatie.

**Wat ik zie:**
Je bent een introvert die "${painPointTexts[primaryPainPoint]}" als grootste uitdaging ervaart. Dat herken ik — en het goede nieuws is dat deze cursus speciaal is ontworpen met introverts in gedachten.

**Wat ik voor je heb ingesteld:**
✅ Introvert Modus geactiveerd
✅ Aangepast tempo — geen druk, jouw ritme
✅ Extra voorbereiding bij gespreksoefeningen

**Je hechtingsstijl lijkt:** ${attachmentTexts[attachmentStyle]}
In Module 2 gaan we hier dieper op in.

**Jouw doel:** ${goalTexts[profile.relationship_goal] || 'jouw eigen pad'}
${profile.one_year_vision ? `Over een jaar wil je: "${profile.one_year_vision}"` : ''}

Klaar om te beginnen?

Iris`;
  } else if (energyProfile === 'extrovert') {
    body = `Hey ${name}!

Super dat je erbij bent. Ik heb je antwoorden doorgenomen.

**Wat opvalt:**
Je haalt energie uit sociale interactie — mooi! Maar je worstelt met "${painPointTexts[primaryPainPoint]}". Dat gaan we aanpakken.

**Je hechtingsstijl lijkt:** ${attachmentTexts[attachmentStyle]}
Module 2 duikt hier diep in.

**Jouw doel:** ${goalTexts[profile.relationship_goal] || 'jouw eigen pad'}
${profile.one_year_vision ? `"${profile.one_year_vision}" — dat gaan we waarmaken.` : ''}

Vol gas?

Iris`;
  } else {
    body = `Hoi ${name},

Goed om je te ontmoeten. Je bent een ambivert — je schakelt tussen sociale energie en rusttijd. Dat is een superkracht in dating.

**Je grootste uitdaging:** "${painPointTexts[primaryPainPoint]}"
Daar gaan we vol op in.

**Je hechtingsstijl lijkt:** ${attachmentTexts[attachmentStyle]}
Herkenbaar? In Module 2 krijg je het complete plaatje.

**Jouw doel:** ${goalTexts[profile.relationship_goal] || 'jouw eigen pad'}
${profile.one_year_vision ? `Over een jaar: "${profile.one_year_vision}"` : ''}

Laten we beginnen!

Iris`;
  }

  return {
    subject: `Welkom bij je Transformatie, ${name}!`,
    body,
  };
}
