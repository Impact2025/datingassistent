import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';
import { AIContextManager } from '@/lib/ai-context-manager';

// Scoring weights for each attachment style
const SCORING_WEIGHTS = {
  anxious: [1, 2, 5, 6, 8, 12, 16], // question IDs
  avoidant: [3, 4, 7, 10, 11, 13], // note: 7 is reverse scored
  fearful_avoidant: [9, 14],
  secure: [15] // reverse scored
};

// POST - Process assessment results and generate AI insights
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentId, userId } = body;

    if (!assessmentId || !userId) {
      return NextResponse.json({ error: 'Assessment ID and User ID required' }, { status: 400 });
    }

    // Get all responses for this assessment
    const responsesResult = await sql`
      SELECT question_id, response_value, response_time_ms
      FROM attachment_responses
      WHERE assessment_id = ${assessmentId}
      ORDER BY question_id
    `;

    if (responsesResult.rows.length === 0) {
      return NextResponse.json({ error: 'No responses found for this assessment' }, { status: 404 });
    }

    // Get question metadata for scoring
    const questionsResult = await sql`
      SELECT id, category, is_reverse_scored, weight
      FROM attachment_questions
    `;

    const questionsMap = new Map(
      questionsResult.rows.map(q => [q.id, {
        category: q.category,
        isReverseScored: q.is_reverse_scored,
        weight: q.weight
      }])
    );

    // Calculate scores for each attachment style
    const scores = {
      anxious: 0,
      avoidant: 0,
      fearful_avoidant: 0,
      secure: 0
    };

    // Calculate maximum possible scores for each category
    const maxScores = {
      anxious: 0,
      avoidant: 0,
      fearful_avoidant: 0,
      secure: 0
    };

    let totalResponseTime = 0;
    const responseTimes: number[] = [];

    responsesResult.rows.forEach(response => {
      const questionMeta = questionsMap.get(response.question_id);
      if (!questionMeta) return;

      let score = response.response_value;
      if (questionMeta.isReverseScored) {
        score = 6 - score; // Reverse score (1->5, 2->4, 3->3, 4->2, 5->1)
      }

      scores[questionMeta.category as keyof typeof scores] += score * questionMeta.weight;
      maxScores[questionMeta.category as keyof typeof maxScores] += 5 * questionMeta.weight; // Max score (5) * weight

      if (response.response_time_ms) {
        totalResponseTime += response.response_time_ms;
        responseTimes.push(response.response_time_ms);
      }
    });

    // Normalize scores to 0-100 scale based on actual maximum for each category
    const normalizedScores = {
      anxious: maxScores.anxious > 0 ? Math.round((scores.anxious / maxScores.anxious) * 100 * 100) / 100 : 0,
      avoidant: maxScores.avoidant > 0 ? Math.round((scores.avoidant / maxScores.avoidant) * 100 * 100) / 100 : 0,
      fearful_avoidant: maxScores.fearful_avoidant > 0 ? Math.round((scores.fearful_avoidant / maxScores.fearful_avoidant) * 100 * 100) / 100 : 0,
      secure: maxScores.secure > 0 ? Math.round((scores.secure / maxScores.secure) * 100 * 100) / 100 : 0
    };

    // Determine primary attachment style
    const styleScores = Object.entries(normalizedScores);
    styleScores.sort((a, b) => b[1] - a[1]);
    const primaryStyle = styleScores[0][0];
    const secondaryStyle = styleScores[1][0];

    // Calculate confidence score
    const completionRate = (responsesResult.rows.length / 16) * 100;
    const avgResponseTime = totalResponseTime / responsesResult.rows.length;
    const variance = responseTimes.length > 1 ?
      responseTimes.reduce((acc, time) => acc + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length : 0;

    // Validity checks
    const validityWarnings: string[] = [];
    if (avgResponseTime < 3000) validityWarnings.push('Zeer snelle antwoorden gedetecteerd');
    if (variance > 50000) validityWarnings.push('Inconsistente antwoordtijden');
    if (completionRate < 80) validityWarnings.push('Niet alle vragen beantwoord');

    const confidenceScore = Math.max(0, Math.min(100,
      completionRate - (validityWarnings.length * 10) - (variance > 30000 ? 5 : 0)
    ));

    // Generate AI insights based on attachment style
    const getAIInsights = (style: string) => {
      switch (style) {
        case 'anxious':
          return {
            summary: `Je primaire hechtingsstijl is angstig (anxious). Dit betekent dat je sterk waarde hecht aan zekerheid en bevestiging in relaties.`,
            characteristics: [
              'Snel bevestiging zoeken in contact',
              'Voelen van onzekerheid bij afstand',
              'Sterke behoefte aan nabijheid',
              'Snel reageren op signalen van partner'
            ],
            implications: 'In dating context kan dit leiden tot frequent appen en behoefte aan snelle bevestiging. Dit is begrijpelijk maar kan soms overweldigend zijn voor partners.',
            redFlags: [
              'Te frequent contact zoeken',
              'Overmatig reageren op vertragingen',
              'Moeite met alleen zijn',
              'Angst voor verlating'
            ],
            goldenFlags: [
              'Open over behoeften communiceren',
              'Geduld hebben met respons tijden',
              'Eigenwaarde opbouwen',
              'Balans tussen geven en nemen'
            ],
            tips: [
              'Stel duidelijke communicatie afspraken',
              'Werk aan zelfvertrouwen buiten relaties',
              'Leer omgaan met onzekerheid',
              'Focus op eigen interesses en leven'
            ],
            exercises: {
              chat_scripts: ['Stel duidelijke grenzen in gesprekken'],
              boundary_practice: 'Oefen met "nee" zeggen wanneer iets niet goed voelt',
              self_reflection: 'Reflecteer dagelijks: "Wat heb ik vandaag nodig in mijn relaties?"'
            }
          };

        case 'avoidant':
          return {
            summary: `Je primaire hechtingsstijl is vermijdend (avoidant). Je waardeert onafhankelijkheid en hebt ruimte nodig in relaties.`,
            characteristics: [
              'Waardeer onafhankelijkheid sterk',
              'Voelen van opgeslotenheid bij te veel nabijheid',
              'Moeite met emotionele kwetsbaarheid',
              'Voorkeur voor eigen ruimte'
            ],
            implications: 'In dating kan dit zich uiten als behoefte aan afstand en moeite met dagelijkse updates. Dit beschermt je maar kan afstand creëren.',
            redFlags: [
              'Vermijden van diepe gesprekken',
              'Terugtrekken bij conflicten',
              'Moeite met commitment tonen',
              'Voorkeur voor oppervlakkige contacten'
            ],
            goldenFlags: [
              'Open zijn over behoefte aan ruimte',
              'Kwaliteit boven kwantiteit in contact',
              'Betrokkenheid tonen op eigen manier',
              'Grenzen respecteren van beide kanten'
            ],
            tips: [
              'Communiceer ruimte behoeften duidelijk',
              'Leer emoties te uiten in veilige setting',
              'Vind balans tussen alleen en samen tijd',
              'Werk aan vertrouwen in relaties'
            ],
            exercises: {
              chat_scripts: ['Geef ruimte in gesprekken'],
              boundary_practice: 'Leer nee te zeggen zonder schuldgevoel',
              self_reflection: 'Reflecteer: "Hoeveel ruimte heb ik vandaag nodig?"'
            }
          };

        case 'fearful_avoidant':
          return {
            summary: `Je primaire hechtingsstijl is angstig-vermijdend (fearful-avoidant). Je hebt conflicterende behoeften aan zowel nabijheid als afstand.`,
            characteristics: [
              'Wissel tussen zoeken naar nabijheid en afstand nemen',
              'Angst voor verlating maar ook voor te nauwe banden',
              'Conflicterende emoties in relaties',
              'Moeite met consistente benadering'
            ],
            implications: 'Dit kan leiden tot een patroon van push-pull gedrag in relaties, wat verwarrend kan zijn voor beide partijen.',
            redFlags: [
              'Onvoorspelbaar gedrag in relaties',
              'Angst voor zowel verlating als binding',
              'Conflicten tussen behoeften',
              'Moeite met stabiele relatiepatronen'
            ],
            goldenFlags: [
              'Bewustzijn van eigen patroon',
              'Open communicatie over angsten',
              'Geleidelijke opbouw van vertrouwen',
              'Professionele hulp zoeken indien nodig'
            ],
            tips: [
              'Herken je push-pull patronen',
              'Zoek therapeutische ondersteuning',
              'Bouw langzaam vertrouwen op',
              'Leer omgaan met ambivalente gevoelens'
            ],
            exercises: {
              chat_scripts: ['Vind balans tussen nabijheid en afstand'],
              boundary_practice: 'Oefen consistente communicatie',
              self_reflection: 'Reflecteer: "Wat veroorzaakt mijn angsten?"'
            }
          };

        default: // secure
          return {
            summary: `Je primaire hechtingsstijl is veilig (secure). Je voelt je comfortabel met intimiteit en kunt goed balanceren tussen nabijheid en onafhankelijkheid.`,
            characteristics: [
              'Comfortabel met emotionele nabijheid',
              'Goede balans tussen relatie en individuele behoeften',
              'Vertrouwen in relaties',
              'Voldoende zelfvertrouwen'
            ],
            implications: 'Dit geeft je een sterke basis voor gezonde relaties. Je kunt goed communiceren en grenzen stellen.',
            redFlags: [
              'Soms te tolerant voor disfunctioneel gedrag',
              'Kan moeite hebben met zeer onafhankelijke partners',
              'Verwachtingen kunnen te hoog zijn'
            ],
            goldenFlags: [
              'Open en eerlijke communicatie',
              'Evenwichtige afhankelijkheid',
              'Respect voor eigen en partner behoeften',
              'Gezonde conflict oplossing'
            ],
            tips: [
              'Blijf werken aan zelfontwikkeling',
              'Wees selectief in partner keuze',
              'Communiceer behoeften duidelijk',
              'Geniet van gezonde relatie dynamiek'
            ],
            exercises: {
              chat_scripts: ['Gebruik je sterke communicatie vaardigheden'],
              boundary_practice: 'Blijf grenzen stellen met respect',
              self_reflection: 'Reflecteer: "Wat maakt deze relatie gezond?"'
            }
          };
      }
    };

    const aiInsights = getAIInsights(primaryStyle);

    // Save results to database
    const resultInsert = await sql`
      INSERT INTO attachment_results (
        assessment_id, primary_style, secondary_style,
        secure_score, anxious_score, avoidant_score, fearful_avoidant_score,
        validity_warnings, completion_rate, response_variance,
        ai_summary, key_characteristics, dating_implications,
        red_flags, golden_flags, practical_tips, micro_exercises
      ) VALUES (
        ${assessmentId}, ${primaryStyle}, ${secondaryStyle === primaryStyle ? null : secondaryStyle},
        ${normalizedScores.secure}, ${normalizedScores.anxious},
        ${normalizedScores.avoidant}, ${normalizedScores.fearful_avoidant},
        ARRAY[${validityWarnings.map(w => `'${w.replace(/'/g, "''")}'`).join(', ')}],
        ${completionRate}, ${variance},
        ${aiInsights.summary},
        ARRAY[${aiInsights.characteristics.map(c => `'${c.replace(/'/g, "''")}'`).join(', ')}],
        ${aiInsights.implications},
        ARRAY[${aiInsights.redFlags.map(f => `'${f.replace(/'/g, "''")}'`).join(', ')}],
        ARRAY[${aiInsights.goldenFlags.map(f => `'${f.replace(/'/g, "''")}'`).join(', ')}],
        ARRAY[${aiInsights.tips.map(t => `'${t.replace(/'/g, "''")}'`).join(', ')}],
        ${JSON.stringify(aiInsights.exercises)}
      )
      RETURNING *
    `;

    // Update assessment with confidence score
    await sql`
      UPDATE attachment_assessments
      SET confidence_score = ${confidenceScore}
      WHERE id = ${assessmentId}
    `;

    // Update progress
    await sql`
      UPDATE attachment_progress
      SET
        last_assessment_id = ${assessmentId},
        assessment_count = assessment_count + 1,
        can_retake_after = NOW() + INTERVAL '3 months',
        updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    // Save attachment style data to AI context for AI coach integration
    try {
      await AIContextManager.saveUserContext(userId, {
        attachmentStyle: {
          primaryStyle: primaryStyle,
          secondaryStyle: secondaryStyle,
          scores: normalizedScores,
          confidence: confidenceScore,
          completedAt: new Date(),
          keyInsights: aiInsights.characteristics,
          redFlags: aiInsights.redFlags,
          goldenFlags: aiInsights.goldenFlags,
          practicalTips: aiInsights.tips
        }
      });
      console.log(`✅ Attachment style data saved to AI context for user ${userId}`);
    } catch (contextError) {
      console.error('Error saving attachment data to AI context:', contextError);
      // Don't fail the request if context save fails
    }

    return NextResponse.json({
      result: resultInsert.rows[0],
      confidence: confidenceScore,
      scores: normalizedScores,
      aiInsights
    });

  } catch (error) {
    console.error('Error processing attachment assessment results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
