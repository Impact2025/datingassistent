/**
 * Yearly Report Service
 * Aggregates data from all monthly reports to generate comprehensive yearly insights
 */

import { sql } from '@vercel/postgres';
import { openRouter, OPENROUTER_MODELS } from './openrouter';

export interface YearlyStats {
  userId: number;
  year: number;
  reportDate: string;

  // Aggregated dating metrics
  totalMatches: number;
  qualityMatches: number;
  totalConversations: number;
  meaningfulConversations: number;
  totalDates: number;
  secondDates: number;

  // Aggregated engagement metrics
  daysActive: number;
  totalDays: number;
  consistencyScore: number;
  longestStreak: number;

  // Aggregated activity metrics
  totalTasksCompleted: number;
  totalPointsEarned: number;
  badgesEarned: number;
  goalsAchieved: number;

  // Growth metrics
  startProfileScore: number;
  endProfileScore: number;
  profileImprovement: number;

  // Monthly highlights
  topMonths: Array<{
    month: string;
    score: number;
    highlight: string;
  }>;

  // Trends
  growthAreas: Array<{
    area: string;
    improvement: number;
    trend: string;
  }>;
}

export interface YearlyInsights {
  overallProgress: number;
  strengthAreas: string[];
  improvementAreas: string[];
  personalizedTips: string[];
  aiSummary: string;
  nextYearFocus: string[];
  motivationalMessage: string;
  highlights: string[];
  achievements: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

export interface YearlyReport {
  stats: YearlyStats;
  insights: YearlyInsights;
}

/**
 * Generate yearly report by aggregating all monthly reports
 */
export async function generateYearlyReport(
  userId: number,
  year: number
): Promise<YearlyReport> {
  try {
    // Get all monthly reports for the year
    const monthlyReports = await sql`
      SELECT
        month_number,
        metrics_data,
        insights_data,
        overall_score
      FROM monthly_reports
      WHERE user_id = ${userId}
      AND year = ${year}
      ORDER BY month_number
    `;

    if (monthlyReports.rows.length === 0) {
      // Return default/empty report if no monthly reports exist
      return getDefaultYearlyReport(userId, year);
    }

    // Aggregate data from all monthly reports
    const aggregatedStats = aggregateMonthlyData(monthlyReports.rows, year);

    // Generate AI insights based on yearly data (with fallback if API key not available)
    let insights;
    try {
      insights = await generateYearlyAIInsights(aggregatedStats);
    } catch (aiError) {
      console.warn('AI insights generation failed, using fallback:', aiError);
      insights = getFallbackInsights(aggregatedStats);
    }

    return {
      stats: aggregatedStats,
      insights
    };

  } catch (error) {
    console.error('Failed to generate yearly report:', error);
    return getDefaultYearlyReport(userId, year);
  }
}

/**
 * Aggregate data from monthly reports
 */
function aggregateMonthlyData(monthlyData: any[], year: number): YearlyStats {
  let totalMatches = 0;
  let qualityMatches = 0;
  let totalConversations = 0;
  let meaningfulConversations = 0;
  let totalDates = 0;
  let secondDates = 0;
  let daysActive = 0;
  let totalTasksCompleted = 0;
  let totalPointsEarned = 0;
  let badgesEarned = 0;
  let goalsAchieved = 0;
  let longestStreak = 0;
  let startProfileScore = 100;
  let endProfileScore = 0;

  const monthlyHighlights: Array<{month: string; score: number; highlight: string}> = [];
  const monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];

  // Process each monthly report
  monthlyData.forEach(row => {
    const metrics = row.metrics_data;
    const score = row.overall_score || 0;

    // Aggregate metrics
    totalMatches += metrics.totalMatches || 0;
    qualityMatches += metrics.qualityMatches || 0;
    totalConversations += metrics.totalConversations || 0;
    meaningfulConversations += metrics.meaningfulConversations || 0;
    totalDates += metrics.totalDates || 0;
    secondDates += metrics.secondDates || 0;
    daysActive += metrics.daysActive || 0;
    totalTasksCompleted += metrics.tasksCompleted || 0;
    totalPointsEarned += metrics.pointsEarned || 0;
    badgesEarned += metrics.badgesEarned || 0;
    goalsAchieved += metrics.goalsAchieved || 0;

    if ((metrics.longestStreak || 0) > longestStreak) {
      longestStreak = metrics.longestStreak;
    }

    // Track profile score progression
    if (metrics.profileScore) {
      startProfileScore = Math.min(startProfileScore, metrics.profileScore);
      endProfileScore = Math.max(endProfileScore, metrics.profileScore);
    }

    // Add monthly highlight
    const monthName = monthNames[row.month_number - 1];
    let highlight = `${metrics.totalDates || 0} dates`;

    if (metrics.totalMatches > 20) highlight = `Meeste matches (${metrics.totalMatches})`;
    else if (metrics.consistencyScore > 80) highlight = `Hoogste consistentie (${Math.round(metrics.consistencyScore)}%)`;
    else if (metrics.longestStreak > 20) highlight = `Langste streak (${metrics.longestStreak} dagen)`;

    monthlyHighlights.push({
      month: monthName,
      score: Math.round(score),
      highlight
    });
  });

  // Sort top months by score
  monthlyHighlights.sort((a, b) => b.score - a.score);
  const topMonths = monthlyHighlights.slice(0, 3);

  // Calculate growth areas
  const dateConversionRate = totalDates > 0 ? (secondDates / totalDates) * 100 : 0;
  const consistencyRate = (daysActive / (monthlyData.length * 30.5)) * 100;
  const profileImprovement = endProfileScore - startProfileScore;

  const growthAreas = [
    {
      area: 'Date Conversie',
      improvement: Math.round(dateConversionRate),
      trend: `${secondDates}/${totalDates} dates werden tweede dates`
    },
    {
      area: 'Consistentie',
      improvement: Math.round(consistencyRate),
      trend: `${daysActive} actieve dagen van ${year}`
    },
    {
      area: 'Profiel Score',
      improvement: Math.round(profileImprovement),
      trend: `Van ${Math.round(startProfileScore)} naar ${Math.round(endProfileScore)}`
    }
  ];

  return {
    userId: monthlyData[0]?.user_id || 0,
    year,
    reportDate: new Date().toISOString().split('T')[0],
    totalMatches,
    qualityMatches,
    totalConversations,
    meaningfulConversations,
    totalDates,
    secondDates,
    daysActive,
    totalDays: year % 4 === 0 ? 366 : 365, // Leap year check
    consistencyScore: Math.round(consistencyRate),
    longestStreak,
    totalTasksCompleted,
    totalPointsEarned,
    badgesEarned,
    goalsAchieved,
    startProfileScore: Math.round(startProfileScore),
    endProfileScore: Math.round(endProfileScore),
    profileImprovement: Math.round(profileImprovement),
    topMonths,
    growthAreas
  };
}

/**
 * Generate fallback insights when AI is not available
 */
function getFallbackInsights(stats: YearlyStats): YearlyInsights {
  const overallProgress = Math.round((stats.consistencyScore + (stats.profileImprovement > 0 ? 50 : 0)) / 2);

  return {
    overallProgress,
    strengthAreas: ['Consistente activiteit', 'Profiel verbetering', 'Doelen behalen'],
    improvementAreas: ['Meer kwaliteit gesprekken', 'Date naar relatie conversie', 'Langere streaks'],
    personalizedTips: [
      'Focus op kwaliteit boven kwantiteit bij matches',
      'Plan dates binnen 3 dagen na goed gesprek',
      'Werk aan consistentie door dagelijkse routines',
      'Gebruik de AI tools voor betere gesprekken',
      'Stel realistische doelen voor volgend jaar'
    ],
    aiSummary: `Een succesvol jaar met ${stats.totalMatches} matches en ${stats.totalDates} dates. Je consistentie van ${stats.consistencyScore}% en profiel verbetering van +${stats.profileImprovement} punten tonen duidelijke groei.`,
    nextYearFocus: ['Verhoog date kwaliteit', 'Verbeter conversie rates', 'Bouw langdurige relaties'],
    motivationalMessage: 'Je hebt dit jaar geweldige stappen gezet. Volgend jaar wordt nog beter!',
    highlights: [
      `${stats.totalMatches} matches - een solide basis`,
      `${stats.totalDates} dates - ervaring opgedaan`,
      `${stats.consistencyScore}% consistentie - geweldige discipline`,
      `Profiel verbetering van +${stats.profileImprovement} punten`,
      `${stats.badgesEarned} badges verdiend - erkenning voor inspanningen`
    ],
    achievements: [
      {
        title: 'Jaar Champion',
        description: `${stats.daysActive} dagen actief geweest`,
        icon: '🏆'
      },
      {
        title: 'Growth Master',
        description: `Profiel score +${stats.profileImprovement} verbeterd`,
        icon: '📈'
      },
      {
        title: 'Consistency King',
        description: `${stats.longestStreak} dagen langste streak`,
        icon: '🔥'
      }
    ]
  };
}

/**
 * Generate AI insights for yearly data
 */
async function generateYearlyAIInsights(stats: YearlyStats): Promise<YearlyInsights> {
  const prompt = `Je bent een dating coach AI. Analyseer deze jaarlijkse metrics en genereer persoonlijke inzichten:

Jaarcijfers ${stats.year}:
- ${stats.totalMatches} matches (${stats.qualityMatches} kwaliteit)
- ${stats.totalConversations} gesprekken (${stats.meaningfulConversations} betekenisvol)
- ${stats.totalDates} dates (${stats.secondDates} tweede dates)
- ${stats.daysActive}/${stats.totalDays} dagen actief (${stats.consistencyScore}% consistentie)
- ${stats.totalTasksCompleted} taken voltooid
- ${stats.badgesEarned} badges verdiend
- Profiel score: ${stats.startProfileScore} → ${stats.endProfileScore} (+${stats.profileImprovement})

Geef terug in JSON format:
{
  "overallProgress": <0-100 score>,
  "strengthAreas": [<3 sterke punten>],
  "improvementAreas": [<3 verbeterpunten>],
  "personalizedTips": [<5 concrete tips voor volgend jaar>],
  "aiSummary": "<samenvattende analyse in 2-3 zinnen>",
  "nextYearFocus": [<3 focus gebieden voor volgend jaar>],
  "motivationalMessage": "<motiverende boodschap>",
  "highlights": [<5 hoogtepunten van het jaar>],
  "achievements": [<3 achievements met title, description, icon>]
}`;

  try {
    const response = await openRouter.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [{ role: 'user', content: prompt }],
      { temperature: 0.7, max_tokens: 1500 }
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to generate yearly AI insights:', error);
  }

  // Fallback insights
  return {
    overallProgress: Math.round((stats.consistencyScore + (stats.profileImprovement > 0 ? 50 : 0)) / 2),
    strengthAreas: ['Consistente activiteit', 'Profiel verbetering', 'Doelen behalen'],
    improvementAreas: ['Meer kwaliteit gesprekken', 'Date naar relatie conversie', 'Langere streaks'],
    personalizedTips: [
      'Focus op kwaliteit boven kwantiteit bij matches',
      'Plan dates binnen 3 dagen na goed gesprek',
      'Werk aan consistentie door dagelijkse routines',
      'Gebruik AI tools voor betere gesprekken',
      'Stel realistische doelen voor volgend jaar'
    ],
    aiSummary: `Een succesvol jaar met ${stats.totalMatches} matches en ${stats.totalDates} dates. Je consistentie van ${stats.consistencyScore}% en profiel verbetering van +${stats.profileImprovement} punten tonen duidelijke groei.`,
    nextYearFocus: ['Verhoog date kwaliteit', 'Verbeter conversie rates', 'Bouw langdurige relaties'],
    motivationalMessage: 'Je hebt dit jaar geweldige stappen gezet. Volgend jaar wordt nog beter!',
    highlights: [
      `${stats.totalMatches} matches - een solide basis`,
      `${stats.totalDates} dates - ervaring opgedaan`,
      `${stats.consistencyScore}% consistentie - geweldige discipline`,
      `Profiel verbetering van +${stats.profileImprovement} punten`,
      `${stats.badgesEarned} badges verdiend - erkenning voor inspanningen`
    ],
    achievements: [
      {
        title: 'Jaar Champion',
        description: `${stats.daysActive} dagen actief geweest`,
        icon: '🏆'
      },
      {
        title: 'Growth Master',
        description: `Profiel score +${stats.profileImprovement} verbeterd`,
        icon: '📈'
      },
      {
        title: 'Consistency King',
        description: `${stats.longestStreak} dagen langste streak`,
        icon: '🔥'
      }
    ]
  };
}

/**
 * Get default yearly report when no data exists
 */
function getDefaultYearlyReport(userId: number, year: number): YearlyReport {
  return {
    stats: {
      userId,
      year,
      reportDate: new Date().toISOString().split('T')[0],
      totalMatches: 0,
      qualityMatches: 0,
      totalConversations: 0,
      meaningfulConversations: 0,
      totalDates: 0,
      secondDates: 0,
      daysActive: 0,
      totalDays: year % 4 === 0 ? 366 : 365,
      consistencyScore: 0,
      longestStreak: 0,
      totalTasksCompleted: 0,
      totalPointsEarned: 0,
      badgesEarned: 0,
      goalsAchieved: 0,
      startProfileScore: 0,
      endProfileScore: 0,
      profileImprovement: 0,
      topMonths: [],
      growthAreas: []
    },
    insights: {
      overallProgress: 0,
      strengthAreas: ['Nieuwe start', 'Potentieel voor groei', 'Verse motivatie'],
      improvementAreas: ['Profiel opbouwen', 'Routine ontwikkelen', 'Doelen stellen'],
      personalizedTips: [
        'Begin met je profiel compleet maken',
        'Stel dagelijkse dating gewoontes op',
        'Gebruik de AI tools voor ondersteuning',
        'Stel realistische doelen voor het jaar',
        'Bouw consistentie op met dagelijkse check-ins'
      ],
      aiSummary: 'Een nieuw jaar ligt voor je. Focus op het opbouwen van sterke fundamenten voor dating succes.',
      nextYearFocus: ['Profiel optimaliseren', 'Routine ontwikkelen', 'Eerste successen behalen'],
      motivationalMessage: 'Elk succesvol jaar begint met de eerste stap. Jij gaat dit jaar geweldige dingen bereiken!',
      highlights: [
        'Nieuwe start gemaakt met DatingAssistent',
        'AI tools klaar voor gebruik',
        'Potentieel voor groei aanwezig',
        'Ondersteuning systeem beschikbaar',
        'Basis voor succes gelegd'
      ],
      achievements: [
        {
          title: 'Nieuwe Start',
          description: 'Begonnen met DatingAssistent',
          icon: '🚀'
        },
        {
          title: 'Voorbereid',
          description: 'Alle tools beschikbaar',
          icon: '⚡'
        },
        {
          title: 'Gemotiveerd',
          description: 'Klaar voor succes',
          icon: '💪'
        }
      ]
    }
  };
}