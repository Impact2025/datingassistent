// sendgrid-integration.ts
// Add this to your /api/quiz/pattern/submit route

import sgMail from '@sendgrid/mail';
import { render } from '@react-email/render';
import PatternQuizResultEmail from '@/emails/pattern-quiz-result-email';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Types
type ResultType = 'secure' | 'anxious' | 'avoidant' | 'fearful';

interface QuizAnswers {
  [key: string]: string;
}

// Calculate result type from answers
function calculateResultType(answers: QuizAnswers): ResultType {
  let anxietyScore = 0;
  let avoidanceScore = 0;

  // Scoring based on answer patterns
  const anxietyIndicators = [
    'analyze', 'restless', 'wait_check_phone',
    'yes_pattern', 'yes_cost',
    '3_to_7_hours', 'more_than_7_hours', 'second_job',
    'fear_rejection', 'both'
  ];

  const avoidanceIndicators = [
    'assume_not_interested', 'wait_for_them', 'private', 'depends',
    'yes_often', 'yes_confused',
    'value_independence', 'pull_back',
    'minimal_time'
  ];

  Object.values(answers).forEach((answer) => {
    if (anxietyIndicators.some(indicator => answer.includes(indicator))) {
      anxietyScore++;
    }
    if (avoidanceIndicators.some(indicator => answer.includes(indicator))) {
      avoidanceScore++;
    }
  });

  // Special handling for direct type indicators
  if (answers['7'] === 'comfortable_both') return 'secure';
  if (answers['7'] === 'fear_rejection') return 'anxious';
  if (answers['7'] === 'value_independence') return 'avoidant';
  if (answers['7'] === 'pull_back') return 'fearful';

  // Fallback to score-based calculation
  const anxietyHigh = anxietyScore >= 3;
  const avoidanceHigh = avoidanceScore >= 3;

  if (!anxietyHigh && !avoidanceHigh) return 'secure';
  if (anxietyHigh && !avoidanceHigh) return 'anxious';
  if (!anxietyHigh && avoidanceHigh) return 'avoidant';
  return 'fearful';
}

// Result titles mapping
const resultTitles: Record<ResultType, string> = {
  secure: 'De Stabiele Basis',
  anxious: 'De Toegewijde Zoeker',
  avoidant: 'De Onafhankelijke',
  fearful: 'De Paradox',
};

// Send result email
async function sendQuizResultEmail(
  email: string,
  name: string,
  resultType: ResultType
): Promise<boolean> {
  try {
    // Render the React email to HTML
    const emailHtml = render(
      PatternQuizResultEmail({
        name,
        resultType,
        kickstartLink: 'https://datingassistent.nl/prijzen',
      })
    );

    const msg = {
      to: email,
      from: {
        email: 'vincent@datingassistent.nl',
        name: 'Vincent van DatingAssistent',
      },
      replyTo: 'vincent@datingassistent.nl',
      subject: `${name}, je Dating Patroon: ${resultTitles[resultType]}`,
      html: emailHtml,
      // Optional: Add tracking
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
      // Optional: Add categories for SendGrid analytics
      categories: ['quiz-result', `result-${resultType}`],
    };

    await sgMail.send(msg);
    console.log(`Quiz result email sent to ${email} (type: ${resultType})`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// =============================================================
// USAGE IN YOUR API ROUTE
// =============================================================

/*
// In /api/quiz/pattern/submit/route.ts:

import { NextResponse } from 'next/server';
import { sendQuizResultEmail, calculateResultType } from '@/lib/sendgrid-integration';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, answers } = body;

    // 1. Calculate result type
    const resultType = calculateResultType(answers);

    // 2. Save to database (your existing code)
    // await db.quizSubmission.create({ ... });

    // 3. Send email (non-blocking, don't fail if email fails)
    sendQuizResultEmail(email, name, resultType).catch((err) => {
      console.error('Email send failed (non-blocking):', err);
    });

    // 4. Return response with redirect URL
    return NextResponse.json({
      success: true,
      resultType,
      resultTitle: resultTitles[resultType],
      redirectUrl: `/transformatie?type=${resultType}`,
    });

  } catch (error) {
    console.error('Quiz submit error:', error);
    return NextResponse.json(
      { error: 'Failed to process quiz submission' },
      { status: 500 }
    );
  }
}
*/

// =============================================================
// ALTERNATIVE: Using SendGrid Dynamic Templates
// =============================================================

/*
If you prefer using SendGrid's Dynamic Templates instead of React Email:

1. Create 4 templates in SendGrid dashboard
2. Use template IDs:

const templateIds: Record<ResultType, string> = {
  secure: 'd-xxxxxxxxxxxxxxxxxxxxxxxx',
  anxious: 'd-xxxxxxxxxxxxxxxxxxxxxxxx',
  avoidant: 'd-xxxxxxxxxxxxxxxxxxxxxxxx',
  fearful: 'd-xxxxxxxxxxxxxxxxxxxxxxxx',
};

async function sendWithDynamicTemplate(
  email: string,
  name: string,
  resultType: ResultType
) {
  const msg = {
    to: email,
    from: 'vincent@datingassistent.nl',
    templateId: templateIds[resultType],
    dynamicTemplateData: {
      name,
      result_title: resultTitles[resultType],
      kickstart_link: 'https://datingassistent.nl/kickstart',
    },
  };

  await sgMail.send(msg);
}
*/

export {
  sendQuizResultEmail,
  calculateResultType,
  resultTitles,
  type ResultType,
};
