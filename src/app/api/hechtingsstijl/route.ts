import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { openRouter, OPENROUTER_MODELS } from '@/lib/openrouter';

// POST: Start new assessment or submit responses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, responses, microIntake } = body;

    if (action === 'start') {
      // Validate userId
      if (!userId || typeof userId !== 'number') {
        return NextResponse.json(
          {
            error: 'Invalid user ID',
            message: 'User ID is required and must be a valid number'
          },
          { status: 400 }
        );
      }

      // Validate microIntake data (optional but validated if present)
      if (microIntake) {
        if (microIntake.stressNiveau && (microIntake.stressNiveau < 1 || microIntake.stressNiveau > 5)) {
          return NextResponse.json(
            {
              error: 'Invalid stress level',
              message: 'Stress niveau must be between 1 and 5'
            },
            { status: 400 }
          );
        }
      }

      try {
        // Start new assessment
        const assessment = await sql`
          INSERT INTO hechtingsstijl_assessments (
            user_id, dating_fase, laatste_relatie_recent, stress_niveau
          ) VALUES (
            ${userId}, ${microIntake?.datingFase || null}, ${microIntake?.laatsteRelatieRecent || false}, ${microIntake?.stressNiveau || 3}
          )
          RETURNING id
        `;

        // Check if insert was successful
        if (!assessment.rows || assessment.rows.length === 0 || !assessment.rows[0]?.id) {
          console.error('Failed to create assessment:', assessment);
          return NextResponse.json(
            {
              error: 'Database error',
              message: 'Failed to create assessment - no ID returned'
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          assessmentId: assessment.rows[0].id
        });
      } catch (dbError: any) {
        console.error('Database error creating assessment:', dbError);
        return NextResponse.json(
          {
            error: 'Database error',
            message: 'Failed to create assessment. Please try again.',
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
          },
          { status: 500 }
        );
      }

    } else if (action === 'submit' && responses) {
      const { assessmentId } = body;

      // Validate assessmentId
      if (!assessmentId || typeof assessmentId !== 'number') {
        return NextResponse.json(
          {
            error: 'Invalid assessment ID',
            message: 'Assessment ID is required and must be a valid number'
          },
          { status: 400 }
        );
      }

      // Validate userId
      if (!userId || typeof userId !== 'number') {
        return NextResponse.json(
          {
            error: 'Invalid user ID',
            message: 'User ID is required for submitting responses'
          },
          { status: 400 }
        );
      }

      // Validate responses
      if (!Array.isArray(responses) || responses.length === 0) {
        return NextResponse.json(
          {
            error: 'Invalid responses',
            message: 'Responses must be a non-empty array'
          },
          { status: 400 }
        );
      }

      // Validate each response has required fields
      for (const response of responses) {
        if (!response.questionId || !response.type || !response.category || response.value === undefined) {
          return NextResponse.json(
            {
              error: 'Invalid response format',
              message: 'Each response must have questionId, type, category, and value'
            },
            { status: 400 }
          );
        }

        // Validate value range (1-5 for Likert, 1-3 for scenarios)
        if (response.type === 'statement' && (response.value < 1 || response.value > 5)) {
          return NextResponse.json(
            {
              error: 'Invalid response value',
              message: 'Statement responses must be between 1 and 5'
            },
            { status: 400 }
          );
        }

        if (response.type === 'scenario' && (response.value < 1 || response.value > 3)) {
          return NextResponse.json(
            {
              error: 'Invalid response value',
              message: 'Scenario responses must be between 1 and 3'
            },
            { status: 400 }
          );
        }
      }

      try {
        console.log('📊 Starting assessment submission...');
        console.log('Assessment ID:', assessmentId, 'User ID:', userId);

        // Retrieve assessment to get microIntake data
        const assessmentQuery = await sql`
          SELECT dating_fase, laatste_relatie_recent, stress_niveau
          FROM hechtingsstijl_assessments
          WHERE id = ${assessmentId} AND user_id = ${userId}
        `;

        if (assessmentQuery.rows.length === 0) {
          console.error('❌ Assessment not found for ID:', assessmentId, 'User:', userId);
          return NextResponse.json(
            {
              error: 'Assessment not found',
              message: 'Could not find the assessment. Please try again.'
            },
            { status: 404 }
          );
        }

        console.log('✅ Assessment found:', assessmentQuery.rows[0]);

        // Reconstruct microIntake from database
        const assessmentData = assessmentQuery.rows[0];
        const retrievedMicroIntake = {
          datingFase: assessmentData.dating_fase,
          laatsteRelatieRecent: assessmentData.laatste_relatie_recent,
          stressNiveau: assessmentData.stress_niveau
        };

        console.log('📋 MicroIntake:', retrievedMicroIntake);

        // Calculate scores based on responses
        console.log('🧮 Calculating scores...');
        const scores = calculateAttachmentScores(responses);
        console.log('✅ Scores calculated:', scores);

        // Calculate validity metrics and confidence
        console.log('📈 Calculating validity metrics...');
        const validity = calculateValidityMetrics(responses);
        console.log('✅ Validity metrics:', validity);

        // Generate AI analysis with retrieved microIntake
        console.log('🤖 Generating AI analysis...');
        let aiAnalysis;
        try {
          aiAnalysis = await generateAIAnalysis(scores, retrievedMicroIntake);
          console.log('✅ AI analysis generated');
        } catch (aiError: any) {
          console.error('⚠️ AI analysis failed, using fallback:', aiError.message);
          // Use fallback analysis if AI fails
          const styleNames = {
            veilig: 'Veilig',
            angstig: 'Angstig',
            vermijdend: 'Vermijdend',
            angstig_vermijdend: 'Angstig-Vermijdend'
          };
          const primaryStyleName = styleNames[scores.primaryStyle as keyof typeof styleNames] || scores.primaryStyle;
          aiAnalysis = getFallbackAnalysis(scores.primaryStyle, scores, primaryStyleName);
        }

        // Calculate total time taken
        const totalTime = responses.reduce((sum, r) => sum + (r.timeMs || 0), 0);
        const totalTimeSeconds = Math.round(totalTime / 1000);

        // Store results - serialize arrays to JSON for database storage
        const result = await sql`
        INSERT INTO hechtingsstijl_results (
          assessment_id, primary_style, secondary_style,
          veilig_score, angstig_score, vermijdend_score, angstig_vermijdend_score,
          validity_warnings, completion_rate, response_variance,
          ai_profiel, toekomstgerichte_interpretatie, dating_voorbeelden,
          triggers, herstel_strategieen, micro_interventies, gesprek_scripts,
          recommended_tools
        ) VALUES (
          ${assessmentId},
          ${scores.primaryStyle},
          ${scores.secondaryStyle},
          ${scores.veilig}, ${scores.angstig}, ${scores.vermijdend}, ${scores.angstigVermijdend},
          ${JSON.stringify(validity.validityWarnings)},
          ${validity.completionRate},
          ${validity.responseVariance},
          ${aiAnalysis.profiel},
          ${aiAnalysis.toekomstgerichteInterpretatie},
          ${JSON.stringify(aiAnalysis.datingVoorbeelden)},
          ${JSON.stringify(aiAnalysis.triggers)},
          ${JSON.stringify(aiAnalysis.herstelStrategieen)},
          ${JSON.stringify(aiAnalysis.microInterventies)},
          ${JSON.stringify(aiAnalysis.gesprekScripts)},
          ${JSON.stringify(aiAnalysis.recommendedTools)}
        )
        RETURNING *
      `;

      // Update assessment status with confidence and timing
      await sql`
        UPDATE hechtingsstijl_assessments
        SET
          status = 'completed',
          completed_at = NOW(),
          total_time_seconds = ${totalTimeSeconds},
          confidence_score = ${validity.confidenceScore}
        WHERE id = ${assessmentId}
      `;

      // ✅ WRITE TO SCAN HISTORY SYSTEM
      try {
        // Insert into user_scan_history
        await sql`
          INSERT INTO user_scan_history (
            user_id, scan_type, assessment_id, completed_at, total_time_seconds,
            confidence_score, primary_result, scores_json, full_results
          ) VALUES (
            ${userId}, 'hechtingsstijl', ${assessmentId}, NOW(), ${totalTimeSeconds},
            ${validity.confidenceScore}, ${scores.primaryStyle},
            ${JSON.stringify(scores)}::jsonb,
            ${JSON.stringify({
              primaryStyle: scores.primaryStyle,
              secondaryStyle: scores.secondaryStyle,
              scores: scores,
              aiAnalysis: aiAnalysis,
              confidence: validity.confidenceScore
            })}::jsonb
          )
          ON CONFLICT (scan_type, assessment_id) DO NOTHING
        `;

        // Update or insert scan_retake_status
        await sql`
          INSERT INTO scan_retake_status (
            user_id, scan_type, total_attempts, last_completed_at,
            can_retake_after, cooldown_days, max_attempts_per_year
          ) VALUES (
            ${userId}, 'hechtingsstijl', 1, NOW(),
            NOW() + INTERVAL '90 days', 90, 4
          )
          ON CONFLICT (user_id, scan_type) DO UPDATE SET
            total_attempts = scan_retake_status.total_attempts + 1,
            last_completed_at = NOW(),
            can_retake_after = NOW() + INTERVAL '90 days',
            updated_at = NOW()
        `;

        // Update user_scan_progress
        await sql`
          INSERT INTO user_scan_progress (
            user_id, scans_completed, hechtingsstijl_completed,
            first_scan_completed_at, last_scan_completed_at
          ) VALUES (
            ${userId}, 1, TRUE, NOW(), NOW()
          )
          ON CONFLICT (user_id) DO UPDATE SET
            scans_completed = (
              SELECT COUNT(DISTINCT scan_type) FROM user_scan_history WHERE user_id = ${userId}
            ),
            hechtingsstijl_completed = TRUE,
            last_scan_completed_at = NOW(),
            total_retakes = user_scan_progress.total_retakes + 1,
            updated_at = NOW()
        `;
      } catch (historyError: any) {
        // Log but don't fail the scan completion
        console.error('Failed to write to scan history:', historyError);
      }

        // Store individual responses
        for (const response of responses) {
          await sql`
            INSERT INTO hechtingsstijl_responses (
              assessment_id, question_type, question_id, response_value, response_time_ms
            ) VALUES (
              ${assessmentId}, ${response.type}, ${response.questionId},
              ${response.value}, ${response.timeMs || 0}
            )
          `;
        }

        return NextResponse.json({
          success: true,
          result: result.rows[0],
          scores,
          aiAnalysis,
          validity: {
            confidenceScore: validity.confidenceScore,
            completionRate: validity.completionRate,
            warnings: validity.validityWarnings
          }
        });
      } catch (submitError: any) {
        console.error('❌ Error submitting assessment:', submitError);
        console.error('Error stack:', submitError.stack);
        console.error('Error name:', submitError.name);
        console.error('Error message:', submitError.message);
        console.error('Full error object:', JSON.stringify(submitError, null, 2));

        // Try to mark assessment as failed
        try {
          await sql`
            UPDATE hechtingsstijl_assessments
            SET status = 'abandoned'
            WHERE id = ${assessmentId}
          `;
        } catch (updateError) {
          console.error('Failed to update assessment status:', updateError);
        }

        return NextResponse.json(
          {
            error: 'Submission failed',
            message: 'Failed to process your responses. Please try again.',
            details: submitError.message,
            errorType: submitError.name,
            stack: process.env.NODE_ENV === 'development' ? submitError.stack : undefined
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Error in hechtingsstijl assessment:', error);
    return NextResponse.json({
      error: 'Assessment failed',
      message: error.message
    }, { status: 500 });
  }
}

// GET: Get assessment results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const userId = searchParams.get('userId');

    if (assessmentId) {
      const result = await sql`
        SELECT * FROM hechtingsstijl_results WHERE assessment_id = ${assessmentId}
      `;

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        result: result.rows[0]
      });
    }

    if (userId) {
      // Get user's latest assessment
      const assessment = await sql`
        SELECT a.*, r.*
        FROM hechtingsstijl_assessments a
        LEFT JOIN hechtingsstijl_results r ON a.id = r.assessment_id
        WHERE a.user_id = ${userId}
        ORDER BY a.created_at DESC
        LIMIT 1
      `;

      return NextResponse.json({
        success: true,
        assessment: assessment.rows[0]
      });
    }

    return NextResponse.json({ error: 'Missing assessmentId or userId' }, { status: 400 });

  } catch (error: any) {
    console.error('Error fetching hechtingsstijl results:', error);
    return NextResponse.json({
      error: 'Failed to fetch results',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * Calculate attachment scores based on responses
 * Uses a dynamic scoring system that adapts to question categories
 */
function calculateAttachmentScores(responses: any[]) {
  // Initialize raw scores
  let scores = {
    veilig: 0,
    angstig: 0,
    vermijdend: 0,
    angstigVermijdend: 0
  };

  // Track maximum possible scores for accurate normalization
  let maxScores = {
    veilig: 0,
    angstig: 0,
    vermijdend: 0,
    angstigVermijdend: 0
  };

  // Category-based scoring weights
  const categoryWeights = {
    nabijheid_afstand: { base: 10, importance: 1.2 },
    communicatie_triggers: { base: 9, importance: 1.1 },
    intimiteit_veiligheid: { base: 10, importance: 1.2 },
    moderne_dating: { base: 8, importance: 1.0 }
  };

  // Process each response
  for (const response of responses) {
    const value = response.value; // 1-5 Likert scale or scenario choice
    const category = response.category;
    const questionId = response.questionId;

    // Get category weight
    const weight = categoryWeights[category as keyof typeof categoryWeights]?.base || 8;

    if (response.type === 'statement') {
      // Likert scale questions (1-5)
      // Calculate contribution based on category and question content

      if (category === 'nabijheid_afstand') {
        if (questionId === 1) { // Overweldigd bij dichtbij
          // High score = vermijdend/angstig-vermijdend, Low score = veilig
          scores.vermijdend += (value - 1) * weight * 1.2;
          scores.angstigVermijdend += (value - 1) * weight * 0.8;
          scores.veilig += (5 - value) * weight * 0.6;

          maxScores.vermijdend += 4 * weight * 1.2;
          maxScores.angstigVermijdend += 4 * weight * 0.8;
          maxScores.veilig += 4 * weight * 0.6;

        } else if (questionId === 2) { // Pas echt hechten bij zekerheid
          // High score = veilig, Low score = angstig
          scores.veilig += (value - 1) * weight * 1.0;
          scores.angstig += (5 - value) * weight * 0.8;

          maxScores.veilig += 4 * weight * 1.0;
          maxScores.angstig += 4 * weight * 0.8;

        } else if (questionId === 3) { // Tijd alleen nodig
          // High score = vermijdend, Low score = angstig
          scores.vermijdend += (value - 1) * weight * 1.1;
          scores.angstigVermijdend += (value - 1) * weight * 0.7;
          scores.angstig += (5 - value) * weight * 0.5;

          maxScores.vermijdend += 4 * weight * 1.1;
          maxScores.angstigVermijdend += 4 * weight * 0.7;
          maxScores.angstig += 4 * weight * 0.5;
        }
      }

      else if (category === 'communicatie_triggers') {
        if (questionId === 4) { // Onzeker bij traag reageren
          // High score = angstig
          scores.angstig += (value - 1) * weight * 1.3;
          scores.angstigVermijdend += (value - 1) * weight * 0.7;
          scores.veilig += (5 - value) * weight * 0.5;

          maxScores.angstig += 4 * weight * 1.3;
          maxScores.angstigVermijdend += 4 * weight * 0.7;
          maxScores.veilig += 4 * weight * 0.5;

        } else if (questionId === 5) { // Moeilijk zeggen wat nodig is
          // High score = vermijdend + angstig
          scores.vermijdend += (value - 1) * weight * 1.0;
          scores.angstig += (value - 1) * weight * 0.9;
          scores.veilig += (5 - value) * weight * 0.7;

          maxScores.vermijdend += 4 * weight * 1.0;
          maxScores.angstig += 4 * weight * 0.9;
          maxScores.veilig += 4 * weight * 0.7;

        } else if (questionId === 6) { // Terugtrekken bij conflicten
          // High score = vermijdend
          scores.vermijdend += (value - 1) * weight * 1.2;
          scores.angstigVermijdend += (value - 1) * weight * 0.9;
          scores.veilig += (5 - value) * weight * 0.8;

          maxScores.vermijdend += 4 * weight * 1.2;
          maxScores.angstigVermijdend += 4 * weight * 0.9;
          maxScores.veilig += 4 * weight * 0.8;
        }
      }

      else if (category === 'intimiteit_veiligheid') {
        if (questionId === 7) { // Veilig bij voorspelbaar
          // High score = veilig, Low score = angstig
          scores.veilig += (value - 1) * weight * 1.2;
          scores.angstig += (5 - value) * weight * 1.0;

          maxScores.veilig += 4 * weight * 1.2;
          maxScores.angstig += 4 * weight * 1.0;

        } else if (questionId === 8) { // Gespannen bij te afhankelijk
          // High score = vermijdend
          scores.vermijdend += (value - 1) * weight * 1.1;
          scores.angstigVermijdend += (value - 1) * weight * 0.8;
          scores.veilig += (5 - value) * weight * 0.6;

          maxScores.vermijdend += 4 * weight * 1.1;
          maxScores.angstigVermijdend += 4 * weight * 0.8;
          maxScores.veilig += 4 * weight * 0.6;
        }
      }

      else if (category === 'moderne_dating') {
        if (questionId === 9) { // Snel emotioneel betrokken
          // High score = angstig
          scores.angstig += (value - 1) * weight * 1.1;
          scores.angstigVermijdend += (value - 1) * weight * 0.7;
          scores.veilig += (5 - value) * weight * 0.5;

          maxScores.angstig += 4 * weight * 1.1;
          maxScores.angstigVermijdend += 4 * weight * 0.7;
          maxScores.veilig += 4 * weight * 0.5;

        } else if (questionId === 10) { // Interesse verliezen bij beschikbaarheid
          // High score = vermijdend
          scores.vermijdend += (value - 1) * weight * 1.2;
          scores.angstigVermijdend += (value - 1) * weight * 0.8;
          scores.veilig += (5 - value) * weight * 0.5;

          maxScores.vermijdend += 4 * weight * 1.2;
          maxScores.angstigVermijdend += 4 * weight * 0.8;
          maxScores.veilig += 4 * weight * 0.5;
        }
      }
    }

    // Scenario questions have stronger weight
    else if (response.type === 'scenario') {
      const scenarioWeight = 22; // Higher weight for scenarios

      if (questionId === 11) { // App gedrag scenario
        if (value === 1) { // Onrustig en analyserend
          scores.angstig += scenarioWeight;
          scores.angstigVermijdend += scenarioWeight * 0.5;
        } else if (value === 2) { // Prima, druk
          scores.veilig += scenarioWeight;
        } else if (value === 3) { // Emotioneel terugtrekken
          scores.vermijdend += scenarioWeight;
          scores.angstigVermijdend += scenarioWeight * 0.6;
        }

        maxScores.angstig += scenarioWeight;
        maxScores.veilig += scenarioWeight;
        maxScores.vermijdend += scenarioWeight;
        maxScores.angstigVermijdend += scenarioWeight * 0.6;

      } else if (questionId === 12) { // Conflict scenario
        if (value === 1) { // Meteen oplossen
          scores.veilig += scenarioWeight;
        } else if (value === 2) { // Rusten maar onzeker
          scores.angstig += scenarioWeight;
          scores.angstigVermijdend += scenarioWeight * 0.4;
        } else if (value === 3) { // Afsluiten
          scores.vermijdend += scenarioWeight;
          scores.angstigVermijdend += scenarioWeight * 0.7;
        }

        maxScores.veilig += scenarioWeight;
        maxScores.angstig += scenarioWeight;
        maxScores.vermijdend += scenarioWeight;
        maxScores.angstigVermijdend += scenarioWeight * 0.7;
      }
    }
  }

  // Normalize to 0-100 scale using actual maximum possible scores
  const normalizedScores = {
    veilig: maxScores.veilig > 0 ? Math.min(100, (scores.veilig / maxScores.veilig) * 100) : 0,
    angstig: maxScores.angstig > 0 ? Math.min(100, (scores.angstig / maxScores.angstig) * 100) : 0,
    vermijdend: maxScores.vermijdend > 0 ? Math.min(100, (scores.vermijdend / maxScores.vermijdend) * 100) : 0,
    angstigVermijdend: maxScores.angstigVermijdend > 0 ? Math.min(100, (scores.angstigVermijdend / maxScores.angstigVermijdend) * 100) : 0
  };

  // Determine primary and secondary styles
  const styles = [
    { name: 'veilig', score: normalizedScores.veilig },
    { name: 'angstig', score: normalizedScores.angstig },
    { name: 'vermijdend', score: normalizedScores.vermijdend },
    { name: 'angstig_vermijdend', score: normalizedScores.angstigVermijdend }
  ];

  styles.sort((a, b) => b.score - a.score);

  // Secondary style is only counted if it's significantly present (>40% and within 25% of primary)
  const hasStrongSecondary = styles[1].score > 40 && (styles[0].score - styles[1].score) < 25;

  return {
    veilig: Math.round(normalizedScores.veilig),
    angstig: Math.round(normalizedScores.angstig),
    vermijdend: Math.round(normalizedScores.vermijdend),
    angstigVermijdend: Math.round(normalizedScores.angstigVermijdend),
    primaryStyle: styles[0].name,
    secondaryStyle: hasStrongSecondary ? styles[1].name : null
  };
}

/**
 * Calculate response quality metrics and confidence score
 */
function calculateValidityMetrics(responses: any[]) {
  const totalQuestions = 12; // Expected number of questions
  const completionRate = (responses.length / totalQuestions) * 100;

  // Calculate response variance (straight-lining detection)
  const values = responses.map(r => r.value);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);

  // Calculate average response time
  const avgResponseTime = responses.reduce((sum, r) => sum + (r.timeMs || 0), 0) / responses.length;

  // Validity warnings
  const warnings: string[] = [];

  // Straight-lining detection (very low variance)
  if (standardDeviation < 0.5) {
    warnings.push('Lage variantie in antwoorden - mogelijk niet nauwkeurig ingevuld');
  }

  // Response speeding (< 2 seconds average)
  if (avgResponseTime < 2000) {
    warnings.push('Zeer snelle antwoorden - mogelijk niet goed gelezen');
  }

  // Response slowness (> 60 seconds average)
  if (avgResponseTime > 60000) {
    warnings.push('Zeer lange antwoordtijden - mogelijk afleiding tijdens invullen');
  }

  // Incomplete assessment
  if (completionRate < 100) {
    warnings.push(`Assessment niet volledig afgerond (${Math.round(completionRate)}%)`);
  }

  // Pattern detection - all same values
  const allSame = values.every(v => v === values[0]);
  if (allSame) {
    warnings.push('Alle antwoorden hetzelfde - resultaat mogelijk niet betrouwbaar');
  }

  // Calculate overall confidence score (0-100)
  let confidenceScore = 100;

  // Reduce confidence based on issues
  if (standardDeviation < 0.5) confidenceScore -= 25;
  else if (standardDeviation < 0.8) confidenceScore -= 10;

  if (avgResponseTime < 2000) confidenceScore -= 20;
  else if (avgResponseTime < 3000) confidenceScore -= 10;

  if (avgResponseTime > 60000) confidenceScore -= 15;

  if (completionRate < 100) confidenceScore -= (100 - completionRate) * 0.5;

  if (allSame) confidenceScore -= 30;

  // Ensure confidence is between 0-100
  confidenceScore = Math.max(0, Math.min(100, confidenceScore));

  return {
    completionRate: Math.round(completionRate * 10) / 10,
    responseVariance: Math.round(variance * 100) / 100,
    avgResponseTimeSeconds: Math.round(avgResponseTime / 1000),
    validityWarnings: warnings,
    confidenceScore: Math.round(confidenceScore)
  };
}

async function generateAIAnalysis(scores: any, microIntake: any) {
  const styleNames = {
    veilig: 'Veilig',
    angstig: 'Angstig',
    vermijdend: 'Vermijdend',
    angstig_vermijdend: 'Angstig-Vermijdend'
  };

  const primaryStyleName = styleNames[scores.primaryStyle as keyof typeof styleNames] || scores.primaryStyle;
  const secondaryStyleName = scores.secondaryStyle ? styleNames[scores.secondaryStyle as keyof typeof styleNames] : null;

  const prompt = `Je bent een expert in hechtingstheorie en moderne dating. Analyseer het volgende hechtingsstijl profiel en geef praktische, toekomstgerichte inzichten.

SCORES:
- Veilig: ${scores.veilig}%
- Angstig: ${scores.angstig}%
- Vermijdend: ${scores.vermijdend}%
- Angstig-Vermijdend: ${scores.angstigVermijdend}%

PROFIEL:
- Primaire stijl: ${primaryStyleName} (${Math.max(scores.veilig, scores.angstig, scores.vermijdend, scores.angstigVermijdend)}%)
${secondaryStyleName ? `- Secundaire stijl: ${secondaryStyleName}` : ''}

CONTEXT:
- Dating fase: ${microIntake?.datingFase || 'onbekend'}
- Recente relatie: ${microIntake?.laatsteRelatieRecent ? 'Ja' : 'Nee'}
- Stress niveau: ${microIntake?.stressNiveau || 'onbekend'}/5

Genereer een VOLLEDIG JSON object (geen extra tekst ervoor of erna) met de volgende structuur:

{
  "profiel": "Jouw hechtingsprofiel: [Stijlnaam] ([hoogste percentage]% match)",
  "toekomstgerichteInterpretatie": "2-3 zinnen over hoe dit profiel zich uit in moderne dating en wat dit betekent voor jouw relatiepatronen. Mild, niet-pathologiserend, toekomstgericht.",
  "datingVoorbeelden": [
    "Concreet voorbeeld 1 van hoe dit zich uit bij app-gebruik",
    "Concreet voorbeeld 2 van hoe dit zich uit bij eerste dates",
    "Concreet voorbeeld 3 van hoe dit zich uit bij communicatie"
  ],
  "triggers": [
    "Specifieke trigger 1 die past bij dit profiel (bijv. 'Traag reageren op berichten')",
    "Specifieke trigger 2 die past bij dit profiel",
    "Specifieke trigger 3 die past bij dit profiel"
  ],
  "herstelStrategieen": [
    "Praktische strategie 1 om met triggers om te gaan",
    "Praktische strategie 2 om met triggers om te gaan",
    "Praktische strategie 3 om met triggers om te gaan"
  ]
}

BELANGRIJK:
- Output ALLEEN het JSON object, geen extra tekst
- Alle teksten in het Nederlands
- Concreet en praktisch, geen algemene adviezen
- Mild en bemoedigend taalgebruik
- Focus op wat WEL kan, niet op beperkingen`;

  try {
    const response = await openRouter.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.7,
        max_tokens: 2000
      }
    );

    // Try to parse the JSON response
    let parsedData;
    try {
      // Clean the response - remove any markdown code blocks
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
      }

      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw response:', response);
      throw new Error('AI returned invalid JSON');
    }

    // Return the parsed data with additional fixed data
    return {
      profiel: parsedData.profiel || `Jouw hechtingsprofiel: ${primaryStyleName} (${Math.max(scores.veilig, scores.angstig, scores.vermijdend, scores.angstigVermijdend)}% match)`,
      toekomstgerichteInterpretatie: parsedData.toekomstgerichteInterpretatie || "Dit profiel helpt je bewuster te daten door je natuurlijke reactiepatronen te begrijpen.",
      datingVoorbeelden: parsedData.datingVoorbeelden || ["Voorbeeld wordt geladen..."],
      triggers: parsedData.triggers || ["Triggers worden geanalyseerd..."],
      herstelStrategieen: parsedData.herstelStrategieen || ["Strategieën worden bepaald..."],
      microInterventies: {
        "veiligheidsanker": {
          titel: "Veiligheidsanker (2 min/dag)",
          beschrijving: "Kort ritueel voor daten/appen om innerlijke rust te creëren",
          stappen: [
            "Adem 3x diep in en uit",
            "Vraag jezelf: 'Wat is feitelijk waar?'",
            "Herinner jezelf: 'Ik ben veilig in dit moment'",
            "Stel één kleine, haalbare intentie"
          ]
        },
        "pre_date_grounding": {
          titel: "Pre-Date Grounding",
          beschrijving: "Voorbereiding voor elke date om aanwezig te blijven",
          stappen: [
            "Noteer 3 verwachtingen voor deze date",
            "Bepaal 1 grens die je wilt bewaken",
            "Identificeer 1 behoefte die je wilt uitspreken",
            "Neem een ademruimte om te centeren"
          ]
        },
        "temporiseren": {
          titel: "Temporiseren Script",
          beschrijving: "Bij te snelle intensiteit of onrust",
          stappen: [
            "Zeg: 'Ik vind dit leuk, maar laten we een rustig tempo kiezen'",
            "Alternatief: 'Ik wil dit goed doen, dus neem ik even tijd'",
            "Of: 'Dit voelt intens - mag ik even landen?'",
            "Gebruik wanneer emoties te hoog oplopen"
          ]
        }
      },
      gesprekScripts: {
        inconsistent_reageren: "Hey, ik merk dat ik wat ga invullen. Hoe is jouw week qua drukte?",
        ruimte_nodig: "Ik vind dit leuk, en ik wil het goed doen. Mag ik even landen en dan reageer ik later op je?",
        grenzen: "Ik voel me prettiger als we iets duidelijker afstemmen hoe vaak we appen.",
        intensiteit: "Ik vind dit leuk, maar laten we een rustig tempo kiezen zodat we het echt goed leren kennen.",
        check_in: "Ik heb genoten van onze date. Hoe kijk jij erop terug?",
        herstel: "Ik wil dit graag oplossen. Mag ik uitleggen hoe ik het bedoelde?"
      },
      recommendedTools: [
        { name: "AI Relationship Coach", url: "/ai-relationship-coach", reason: "Persoonlijke coaching afgestemd op jouw hechtingsstijl" },
        { name: "Waarden Kompas", url: "/waarden-kompas", reason: "Ontdek welke waarden belangrijk zijn in relaties" },
        { name: "Relatiepatronen Tool", url: "/relatiepatronen", reason: "Dieper inzicht in jouw relatiegedrag" },
        { name: "Dating DNA Profiel", url: "/dating-dna", reason: "Volledig beeld van je dating persoonlijkheid" },
        { name: "Profiel Optimalisatie", url: "/profiel", reason: "Profiel afstemmen op jouw authentieke zelf" },
        { name: "Community Forum", url: "/community/forum", reason: "Ervaringen delen met anderen" }
      ]
    };

  } catch (error) {
    console.error('AI analysis generation failed:', error);

    // Return high-quality fallback analysis based on the attachment style
    const fallbackData = getFallbackAnalysis(scores.primaryStyle, scores, primaryStyleName);
    return fallbackData;
  }
}

// Fallback analysis with style-specific content
function getFallbackAnalysis(primaryStyle: string, scores: any, styleName: string) {
  const highestScore = Math.max(scores.veilig, scores.angstig, scores.vermijdend, scores.angstigVermijdend);

  const styleSpecificContent: Record<string, any> = {
    veilig: {
      interpretatie: "Je hebt een veilige hechtingsstijl, wat betekent dat je comfortabel bent met zowel nabijheid als autonomie. Dit helpt je om balans te vinden in moderne dating.",
      voorbeelden: [
        "Je kunt genieten van app-gesprekken zonder direct te veel te investeren",
        "Bij eerste dates voel je je ontspannen en authentiek",
        "Je communiceert open over je behoeften en grenzen"
      ],
      triggers: [
        "Extreme onvoorspelbaarheid in communicatie",
        "Gebrek aan wederzijdse investering",
        "Chronische inconsistentie"
      ],
      strategieen: [
        "Blijf communiceren over verwachtingen",
        "Handhaaf je grenzen op een vriendelijke manier",
        "Vertrouw op je intuïtie bij rode vlaggen"
      ]
    },
    angstig: {
      interpretatie: "Je hebt een angstige hechtingsstijl, wat betekent dat je sterke behoefte hebt aan zekerheid en bevestiging. Met bewustzijn kun je dit omzetten in gezondere patronen.",
      voorbeelden: [
        "Je checkt vaak je telefoon als iemand niet direct reageert",
        "Na een goede date maak je je zorgen of de ander wel geïnteresseerd is",
        "Je zoekt veel bevestiging in de beginfase van daten"
      ],
      triggers: [
        "Traag of inconsistent reageren op berichten",
        "Onduidelijkheid over waar jullie staan",
        "Afstand of minder contact na intimiteit"
      ],
      strategieen: [
        "Gebruik het Veiligheidsanker ritueel dagelijks",
        "Stel directe vragen in plaats van te gissen",
        "Oefen met het uitstellen van reacties"
      ]
    },
    vermijdend: {
      interpretatie: "Je hebt een vermijdende hechtingsstijl, wat betekent dat je autonomie belangrijk vindt. Met bewustzijn kun je nabijheid toelaten zonder je onafhankelijkheid te verliezen.",
      voorbeelden: [
        "Je hebt ruimte nodig na intens contact",
        "Te veel aandacht voelt soms overweldigend",
        "Je trekt je terug bij conflicten of diepe gesprekken"
      ],
      triggers: [
        "Te snelle emotionele intensiteit",
        "Druk om je te committeren",
        "Veel communicatie verwachtingen"
      ],
      strategieen: [
        "Communiceer proactief je behoefte aan ruimte",
        "Oefen met kleine stapjes naar nabijheid",
        "Gebruik het Temporiseren Script bij overload"
      ]
    },
    angstig_vermijdend: {
      interpretatie: "Je hebt kenmerken van zowel angstige als vermijdende hechting, wat kan leiden tot conflicterende behoeften. Met bewustzijn kun je balans vinden tussen nabijheid en autonomie.",
      voorbeelden: [
        "Je wilt nabijheid maar trekt terug als het te intens wordt",
        "Wisselende behoefte aan contact en afstand",
        "Intense emoties gevolgd door terugtrekken"
      ],
      triggers: [
        "Onvoorspelbaarheid in communicatie (activeert beide kanten)",
        "Te veel of te weinig contact",
        "Intimiteit gevolgd door afstand"
      ],
      strategieen: [
        "Herken je wisselende patronen zonder oordeel",
        "Communiceer eerlijk over je conflicterende behoeften",
        "Zoek balans tussen ruimte en connectie"
      ]
    }
  };

  const content = styleSpecificContent[primaryStyle] || styleSpecificContent.veilig;

  return {
    profiel: `Jouw hechtingsprofiel: ${styleName} (${highestScore}% match)`,
    toekomstgerichteInterpretatie: content.interpretatie,
    datingVoorbeelden: content.voorbeelden,
    triggers: content.triggers,
    herstelStrategieen: content.strategieen,
    microInterventies: {
      "veiligheidsanker": {
        titel: "Veiligheidsanker (2 min/dag)",
        beschrijving: "Kort ritueel voor daten/appen om innerlijke rust te creëren",
        stappen: [
          "Adem 3x diep in en uit",
          "Vraag jezelf: 'Wat is feitelijk waar?'",
          "Herinner jezelf: 'Ik ben veilig in dit moment'",
          "Stel één kleine, haalbare intentie"
        ]
      },
      "pre_date_grounding": {
        titel: "Pre-Date Grounding",
        beschrijving: "Voorbereiding voor elke date om aanwezig te blijven",
        stappen: [
          "Noteer 3 verwachtingen voor deze date",
          "Bepaal 1 grens die je wilt bewaken",
          "Identificeer 1 behoefte die je wilt uitspreken",
          "Neem een ademruimte om te centeren"
        ]
      },
      "temporiseren": {
        titel: "Temporiseren Script",
        beschrijving: "Bij te snelle intensiteit of onrust",
        stappen: [
          "Zeg: 'Ik vind dit leuk, maar laten we een rustig tempo kiezen'",
          "Alternatief: 'Ik wil dit goed doen, dus neem ik even tijd'",
          "Of: 'Dit voelt intens - mag ik even landen?'",
          "Gebruik wanneer emoties te hoog oplopen"
        ]
      }
    },
    gesprekScripts: {
      inconsistent_reageren: "Hey, ik merk dat ik wat ga invullen. Hoe is jouw week qua drukte?",
      ruimte_nodig: "Ik vind dit leuk, en ik wil het goed doen. Mag ik even landen en dan reageer ik later op je?",
      grenzen: "Ik voel me prettiger als we iets duidelijker afstemmen hoe vaak we appen.",
      intensiteit: "Ik vind dit leuk, maar laten we een rustig tempo kiezen zodat we het echt goed leren kennen.",
      check_in: "Ik heb genoten van onze date. Hoe kijk jij erop terug?",
      herstel: "Ik wil dit graag oplossen. Mag ik uitleggen hoe ik het bedoelde?"
    },
    recommendedTools: [
      { name: "AI Relationship Coach", url: "/ai-relationship-coach", reason: "Persoonlijke coaching afgestemd op jouw hechtingsstijl" },
      { name: "Waarden Kompas", url: "/waarden-kompas", reason: "Ontdek welke waarden belangrijk zijn in relaties" },
      { name: "Relatiepatronen Tool", url: "/relatiepatronen", reason: "Dieper inzicht in jouw relatiegedrag" },
      { name: "Dating DNA Profiel", url: "/dating-dna", reason: "Volledig beeld van je dating persoonlijkheid" },
      { name: "Profiel Optimalisatie", url: "/profiel", reason: "Profiel afstemmen op jouw authentieke zelf" },
      { name: "Community Forum", url: "/community/forum", reason: "Ervaringen delen met anderen" }
    ]
  };
}