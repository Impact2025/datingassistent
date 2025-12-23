/**
 * Email Template Renderer
 * Renders React Email components to HTML and plain text
 */

import { render } from '@react-email/components';
import WelcomeEmail from '@/emails/welcome-email';
import VerificationEmail from '@/emails/verification-email';
import ProfileOptimizationEmail from '@/emails/profile-optimization-email';
import FirstWinEmail from '@/emails/first-win-email';
import CourseIntroductionEmail from '@/emails/course-introduction-email';
import WeeklyCheckinEmail from '@/emails/weekly-checkin-email';
import FeatureDeepDiveChatEmail from '@/emails/feature-deepdive-chat-email';
import MidTrialCheckEmail from '@/emails/mid-trial-check-email';
import CourseCompletionEmail from '@/emails/course-completion-email';
import WeeklyDigestEmail from '@/emails/weekly-digest-email';
import InactivityAlert3DaysEmail from '@/emails/inactivity-alert-3days-email';
import MilestoneAchievementEmail from '@/emails/milestone-achievement-email';
import MonthlyProgressReportEmail from '@/emails/monthly-progress-report-email';
import SubscriptionRenewalEmail from '@/emails/subscription-renewal-email';
import FeatureLimitReachedEmail from '@/emails/feature-limit-reached-email';
import PaymentFailedEmail from '@/emails/payment-failed-email';
import KickstartUpgradeEmail from '@/emails/kickstart-upgrade-email';
import { NotificationEmailTemplate } from '@/components/emails';
import { AchievementEmailTemplate } from '@/components/emails/templates/achievement-template';
import type { EmailType, EmailTemplateData } from './email-engagement';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://datingassistent.nl';

interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

/**
 * Render email template to HTML and plain text
 */
export async function renderEmailTemplate(
  emailType: EmailType,
  data: EmailTemplateData
): Promise<EmailContent> {
  const content = getEmailContent(emailType, data);

  try {
    // Render React component to HTML
    const html = await render(content.component, {
      pretty: true,
    });

    // Generate plain text version
    const text = content.textVersion;

    return {
      subject: content.subject,
      html,
      text,
    };
  } catch (error) {
    console.error('Error rendering email template:', error);
    // Fallback to basic HTML
    return {
      subject: content.subject,
      html: `<p>${content.textVersion}</p>`,
      text: content.textVersion,
    };
  }
}

/**
 * Get email content configuration
 */
function getEmailContent(emailType: EmailType, data: EmailTemplateData): {
  component: React.ReactElement;
  subject: string;
  textVersion: string;
} {
  const templates: Record<EmailType, any> = {
    // ONBOARDING EMAILS
    verification: {
      component: (
        <VerificationEmail
          firstName={data.firstName}
          verificationCode={data.verificationCode || '123456'}
          verificationUrl={data.verificationUrl}
          expiresIn={data.expiresIn || '24 uur'}
        />
      ),
      subject: `Verificeer je email adres - DatingAssistent`,
      textVersion: `Hoi ${data.firstName},\n\nWelkom bij DatingAssistent! Gebruik deze verificatiecode om je account te activeren: ${data.verificationCode || '123456'}\n\nDeze code verloopt over ${data.expiresIn || '24 uur'}.`,
    },

    welcome: {
      component: (
        <WelcomeEmail
          firstName={data.firstName}
          subscriptionType={data.subscriptionType}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `Welkom ${data.firstName}! Je dating journey begint nu 🚀`,
      textVersion: getWelcomeTextVersion(data),
    },

    profile_optimization_reminder: {
      component: (
        <ProfileOptimizationEmail
          firstName={data.firstName}
          completionPercentage={data.completionPercentage || 30}
          missingFields={data.missingFields || ['Profielfoto', 'Bio tekst', 'Dating voorkeuren']}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `${data.firstName}, je profiel is nog niet compleet 📝`,
      textVersion: `Hoi ${data.firstName},\n\nJe profiel is nu ${data.completionPercentage || 30}% compleet. Laten we verder gaan!\n\nKlik hier: ${BASE_URL}/dashboard`,
    },

    first_win: {
      component: (
        <FirstWinEmail
          firstName={data.firstName}
          featureUsed={data.featureUsed}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `Je eerste stap is gezet! 🎉`,
      textVersion: `Geweldig ${data.firstName}! Je hebt je eerste feature gebruikt.`,
    },

    course_introduction: {
      component: (
        <CourseIntroductionEmail
          firstName={data.firstName}
          featuredCourseTitle={data.courseName || 'De Perfecte Opening: Van Match tot Gesprek'}
          featuredCourseDescription={data.courseDescription || 'Leer hoe je matches omzet in échte gesprekken'}
          coursesAvailable={data.coursesAvailable || 12}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `📚 Ontdek onze dating cursussen - Start vandaag nog!`,
      textVersion: `Hoi ${data.firstName},\n\nJe eerste cursus wacht op je!`,
    },

    weekly_checkin: {
      component: (
        <WeeklyCheckinEmail
          firstName={data.firstName}
          daysActive={data.daysActive || 7}
          toolsUsed={data.toolsUsed || 3}
          coursesStarted={data.coursesStarted || 1}
          aiMessagesUsed={data.aiMessagesUsed || 12}
          dashboardUrl={`${BASE_URL}/dashboard`}
          feedbackUrl={`${BASE_URL}/feedback`}
        />
      ),
      subject: `Je eerste week is voorbij - Hoe gaat het? 📊`,
      textVersion: `Hoi ${data.firstName},\n\nEen week geleden ben je gestart. Hoe gaat het tot nu toe?`,
    },

    feature_deepdive_chat: {
      component: (
        <FeatureDeepDiveChatEmail
          firstName={data.firstName}
          messagesUsed={data.messagesUsed || 15}
          messagesRemaining={data.messagesRemaining || 35}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `Feature Deep Dive: Chat Coach - Jouw 24/7 dating assistent 💬`,
      textVersion: `Ontdek Chat Coach - jouw persoonlijke gesprekshulp!`,
    },

    mid_trial_check: {
      component: (
        <MidTrialCheckEmail
          firstName={data.firstName}
          daysActive={data.daysActive || 14}
          toolsUsed={data.toolsUsed || 5}
          coursesCompleted={data.coursesCompleted || 2}
          subscriptionType={data.subscriptionType || 'core'}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `Je bent 2 weken bezig - Hoe gaat het? 🎯`,
      textVersion: `Je eerste 2 weken zijn voorbij. Bekijk je voortgang!`,
    },

    // ENGAGEMENT EMAILS
    course_completion: {
      component: (
        <CourseCompletionEmail
          firstName={data.firstName}
          courseTitle={data.courseName || 'De Perfecte Opening: Van Match tot Gesprek'}
          completionDate={data.completionDate || new Date().toLocaleDateString('nl-NL')}
          nextCourseTitle={data.nextCourseName}
          totalCoursesCompleted={data.coursesCompleted || 1}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `🎉 Gefeliciteerd! Je hebt "${data.courseName || 'de cursus'}" voltooid!`,
      textVersion: `Geweldig ${data.firstName}! Je hebt de cursus voltooid.`,
    },

    weekly_digest: {
      component: (
        <WeeklyDigestEmail
          firstName={data.firstName}
          weekNumber={data.weekNumber || 1}
          stats={{
            toolsUsed: data.toolsUsed || 6,
            aiMessagesUsed: data.aiMessagesUsed || 28,
            courseLessonsCompleted: data.courseLessonsCompleted || 4,
            daysActive: data.daysActive || 5,
          }}
          weeklyTip={{
            title: data.weeklyTipTitle || 'De 3-Seconden Regel',
            description: data.weeklyTipDescription || 'Reageer binnen 3 uur op matches voor 40% meer kans op een gesprek!',
            icon: data.weeklyTipIcon || '⚡',
          }}
          featuredContent={{
            type: data.featuredContentType || 'course',
            title: data.featuredContentTitle || 'Red Flags Herkennen',
            description: data.featuredContentDescription || 'Leer hoe je waarschuwingssignalen vroeg herkent',
            url: data.featuredContentUrl || '/courses/red-flags',
          }}
          communityHighlight={data.communityHighlight}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `📊 Je week ${data.weekNumber || ''} samenvatting`,
      textVersion: `Je wekelijkse update is klaar!`,
    },

    feature_discovery: {
      component: (
        <NotificationEmailTemplate
          userName={data.firstName}
          type="info"
          title={`Ontdek ${data.featureName || 'Nieuwe Tool'}`}
          message={`We hebben gemerkt dat je nog niet onze ${data.featureName || 'geavanceerde tool'} hebt gebruikt. Dit kan je dating resultaten aanzienlijk verbeteren!`}
          action={{
            primary: {
              text: `${data.featureName || 'Tool'} Uitproberen`,
              url: `${BASE_URL}/dashboard?tab=${data.featureSlug || 'dashboard'}`,
            },
          }}
          details={[
            { label: 'Wat het doet', value: data.featureDescription || 'Verbeter je dating succes met AI hulp' },
            { label: 'Waarom nu?', value: data.discoveryReason || 'Perfect moment gebaseerd op je voortgang' },
            { label: 'Verwacht effect', value: data.expectedImpact || 'Tot 40% meer matches mogelijk' },
          ]}
          tips={[
            'Neem 5 minuten om de nieuwe functie te verkennen',
            'Combineer met je bestaande tools voor beste resultaten',
            'Deel je ervaringen in de community voor extra tips',
          ]}
        />
      ),
      subject: `🔍 Ontdek ${data.featureName || 'Nieuwe Tool'} - Verbeter je dating resultaten!`,
      textVersion: `Hoi ${data.firstName},\n\nWe zien dat je nog niet onze ${data.featureName || 'geavanceerde tool'} hebt uitgeprobeerd. Dit kan je dating succes aanzienlijk verbeteren!\n\nProbeer het nu: ${BASE_URL}/dashboard`,
    },

    milestone_achievement: {
      component: (
        <AchievementEmailTemplate
          userName={data.firstName}
          achievement={{
            title: data.milestoneName || 'Nieuwe Mijlpaal Bereikt!',
            description: data.milestoneDescription || 'Gefeliciteerd met deze belangrijke stap in je dating journey!',
            icon: data.milestoneIcon || '🏆',
            rarity: data.milestoneRarity || 'rare',
          }}
          stats={[
            { icon: '📊', label: 'Voortgang', value: data.progressPercentage || '75%' },
            { icon: '🎯', label: 'Doel', value: data.currentGoal || 'Volgende mijlpaal' },
            { icon: '⭐', label: 'Score', value: data.achievementScore || 'Uitstekend' },
          ]}
          nextGoal={data.nextMilestone ? {
            title: `Volgende: ${data.nextMilestone}`,
            description: 'Blijf doorgaan voor nog meer success!',
            progress: data.nextGoalProgress || 0,
          } : undefined}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `🏆 ${data.milestoneName || 'Nieuwe Mijlpaal'} Bereikt - Gefeliciteerd!`,
      textVersion: `Gefeliciteerd ${data.firstName}! Je hebt een belangrijke mijlpaal bereikt in je dating journey.`,
    },

    course_unlock: {
      component: (
        <NotificationEmailTemplate
          userName={data.firstName}
          type="success"
          title={`Nieuwe Cursus Beschikbaar: ${data.courseName || 'Nieuwe Les'}`}
          message={`Gefeliciteerd! Je hebt toegang gekregen tot een nieuwe cursus gebaseerd op je voortgang. Deze cursus gaat je helpen om nog betere resultaten te behalen.`}
          action={{
            primary: {
              text: 'Cursus Starten',
              url: `${BASE_URL}/dashboard/courses/${data.courseSlug || 'new'}`,
            },
          }}
          details={[
            { label: 'Cursus naam', value: data.courseName || 'Nieuwe Dating Cursus' },
            { label: 'Duur', value: data.courseDuration || '15-20 minuten' },
            { label: 'Waarom nu?', value: data.unlockReason || 'Perfect moment gebaseerd op je niveau' },
          ]}
          tips={[
            'Neem je tijd - kwaliteit boven snelheid',
            'Pas de geleerde technieken direct toe',
            'Herhaal moeilijke onderdelen indien nodig',
            'Deel je success stories voor inspiratie',
          ]}
        />
      ),
      subject: `🔓 Nieuwe Cursus Vrijgespeeld: ${data.courseName || 'Nieuwe Les'}!`,
      textVersion: `Gefeliciteerd ${data.firstName}! Een nieuwe cursus is nu beschikbaar voor jou.`,
    },

    weekly_limit_reminder: {
      component: (
        <NotificationEmailTemplate
          userName={data.firstName}
          type="warning"
          title={`Je hebt nog ${data.remaining || 5} AI berichten deze week`}
          message={`Je huidige abonnement geeft je ${data.weeklyLimit || 25} AI berichten per week. Je hebt er nog ${data.remaining || 5} over voordat je limiet reset op ${data.resetDate || 'maandag'}.`}
          action={{
            primary: {
              text: 'Upgrade voor Meer Berichten',
              url: `${BASE_URL}/dashboard/subscription`,
            },
            secondary: {
              text: 'Slimmer Gebruiken',
              url: `${BASE_URL}/dashboard?tab=usage-tips`,
            },
          }}
          details={[
            { label: 'Huidig abonnement', value: data.subscriptionType || 'Core' },
            { label: 'Gebruikt deze week', value: `${data.usedThisWeek || 20} berichten` },
            { label: 'Nog beschikbaar', value: `${data.remaining || 5} berichten` },
            { label: 'Reset op', value: data.resetDate || 'Maandag 00:00' },
          ]}
          tips={[
            'Plan je belangrijkste vragen voor het begin van de week',
            'Gebruik de Chat Coach voor diepgaande gesprekken',
            'Combineer korte vragen voor efficiënter gebruik',
            'Overweeg upgrade voor ongelimiteerd gebruik',
          ]}
        />
      ),
      subject: `⏰ Nog ${data.remaining || 5} AI berichten - Plan slim deze week!`,
      textVersion: `Hoi ${data.firstName},\n\nJe hebt nog ${data.remaining || 5} AI berichten deze week. Plan je vragen strategisch!`,
    },

    monthly_progress: {
      component: (
        <MonthlyProgressReportEmail
          firstName={data.firstName}
          monthName={data.monthName || 'Oktober'}
          stats={{
            toolsUsed: data.toolsUsed || 9,
            aiMessages: data.aiMessagesUsed || 87,
            coursesCompleted: data.coursesCompleted || 4,
            lessonsCompleted: data.lessonsCompleted || 15,
            daysActive: data.daysActive || 22,
            totalDaysInMonth: data.totalDaysInMonth || 31,
            streakDays: data.streakDays || 7,
            communityPosts: data.communityPosts || 3,
          }}
          achievements={data.achievements || []}
          topFeature={{
            name: data.topFeatureName || 'Chat Coach',
            usage: data.topFeatureUsage || 45,
            icon: data.topFeatureIcon || '💬',
          }}
          comparisonToLastMonth={{
            improvement: data.comparisonImprovement !== false,
            percentage: data.comparisonPercentage || 35,
          }}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `📊 Je ${data.monthName || 'maand'} in review`,
      textVersion: `Bekijk je maandelijkse voortgang!`,
    },

    // RETENTION EMAILS
    inactivity_3days: {
      component: (
        <InactivityAlert3DaysEmail
          firstName={data.firstName}
          lastActiveDate={data.lastActiveDate || '8 november 2025'}
          lastToolUsed={data.lastToolUsed}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `We missen je! 👋`,
      textVersion: `Hoi ${data.firstName}, we hebben je een paar dagen niet gezien. Alles oké?`,
    },

    inactivity_7days: {
      component: (
        <NotificationEmailTemplate
          userName={data.firstName}
          type="warning"
          title="Een week zonder DatingAssistent"
          message={`Het is al een week geleden dat we je voor het laatst zagen. We missen je! Je hebt nog ${data.unusedCredits || 60} ongebruikte AI credits die binnenkort verlopen.`}
          action={{
            primary: {
              text: 'Terug naar Dashboard',
              url: `${BASE_URL}/dashboard`,
            },
            secondary: {
              text: 'Credits Behouden',
              url: `${BASE_URL}/dashboard/subscription`,
            },
          }}
          details={[
            { label: 'Laatste activiteit', value: data.lastActiveDate || '7 dagen geleden' },
            { label: 'Ongebruikte credits', value: `${data.unusedCredits || 60} berichten` },
            { label: 'Verloopt over', value: data.expiryDays || '7 dagen' },
            { label: 'Laatste tool gebruikt', value: data.lastToolUsed || 'Profiel Coach' },
          ]}
          tips={[
            'Je credits blijven behouden als je binnenkort terugkomt',
            'Overweeg een pauze als dating momenteel niet prioriteit heeft',
            'Je voortgang wordt automatisch opgeslagen',
            'Neem contact op als je hulp nodig hebt',
          ]}
        />
      ),
      subject: `🚨 ${data.unusedCredits || 60} ongebruikte AI credits verlopen binnenkort`,
      textVersion: `Hoi ${data.firstName},\n\nHet is een week geleden dat we je zagen. Je hebt nog ${data.unusedCredits || 60} credits die binnenkort verlopen.`,
    },

    inactivity_14days: {
      component: (
        <NotificationEmailTemplate
          userName={data.firstName}
          type="info"
          title="Is dating momenteel even te veel?"
          message={`Het is al twee weken geleden dat we je zagen. We begrijpen dat dating soms overweldigend kan zijn. Neem een pauze als je die nodig hebt - je account blijft veilig.`}
          action={{
            primary: {
              text: 'Even Bijpraten',
              url: `${BASE_URL}/dashboard`,
            },
            secondary: {
              text: 'Account Pauzeren',
              url: `${BASE_URL}/dashboard/settings`,
            },
          }}
          details={[
            { label: 'Laatste login', value: data.lastActiveDate || '14 dagen geleden' },
            { label: 'Account status', value: 'Actief - geen zorgen' },
            { label: 'Opgeslagen data', value: 'Alles veilig bewaard' },
            { label: 'Ondersteuning', value: 'Altijd beschikbaar' },
          ]}
          tips={[
            'Dating succes is geen sprint maar een marathon',
            'Neem de tijd die je nodig hebt',
            'Je kunt altijd terugkomen wanneer je klaar bent',
            'We zijn er om je te helpen wanneer je wilt',
          ]}
        />
      ),
      subject: `💔 Is dating momenteel even te veel? Neem je tijd`,
      textVersion: `Hoi ${data.firstName},\n\nHet is twee weken geleden dat we je zagen. We begrijpen dat dating soms overweldigend kan zijn.`,
    },

    exit_survey: {
      component: (
        <NotificationEmailTemplate
          userName={data.firstName}
          type="info"
          title="Help ons beter te worden"
          message={`Het spijt ons dat we je niet volledig hebben kunnen helpen. Jouw feedback is cruciaal om DatingAssistent te verbeteren voor anderen.`}
          action={{
            primary: {
              text: 'Feedback Geven (2 min)',
              url: `${BASE_URL}/feedback?reason=${data.exitReason || 'general'}`,
            },
          }}
          details={[
            { label: 'Waarom feedback?', value: 'Helpt ons verbeteren voor anderen' },
            { label: 'Duur', value: '2 minuten' },
            { label: 'Anoniem mogelijk', value: 'Als je dat prefereert' },
            { label: 'Impact', value: 'Direct invloed op verbeteringen' },
          ]}
          tips={[
            'Wees eerlijk - constructieve kritiek helpt ons groeien',
            'Specifieke voorbeelden maken je feedback waardevoller',
            'Je helpt anderen door je ervaringen te delen',
            'Bedankt voor je tijd en inzet',
          ]}
        />
      ),
      subject: `📋 Sorry dat we je niet volledig hebben kunnen helpen`,
      textVersion: `Hoi ${data.firstName},\n\nHet spijt ons dat we je niet volledig hebben kunnen helpen. Jouw feedback helpt ons beter te worden.`,
    },

    // MILESTONE EMAILS
    dating_success: {
      component: (
        <AchievementEmailTemplate
          userName={data.firstName}
          achievement={{
            title: 'Dating Succes Gevierd! 🎉',
            description: `Gefeliciteerd met je ${data.successType || 'eerste date'}! Dit is een enorme mijlpaal waar je trots op kunt zijn.`,
            icon: '💑',
            rarity: 'legendary',
          }}
          stats={[
            { icon: '📅', label: 'Sinds start', value: data.daysSinceStart || '30 dagen' },
            { icon: '🎯', label: 'Doelen behaald', value: data.goalsAchieved || '3/5' },
            { icon: '⭐', label: 'Succes niveau', value: data.successLevel || 'Uitstekend' },
          ]}
          nextGoal={{
            title: 'Bouw voort op dit succes',
            description: 'Gebruik wat je hebt geleerd voor nog meer dates',
            progress: data.nextGoalProgress || 25,
          }}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `🎉 GEFELICITEERD! Wat geweldig nieuws over je dating succes!`,
      textVersion: `Gefeliciteerd ${data.firstName}! We zijn zo trots op je dating succes!`,
    },

    streak_achievement: {
      component: (
        <AchievementEmailTemplate
          userName={data.firstName}
          achievement={{
            title: `${data.streakDays || 7}-Dagen Actief Streak! 🔥`,
            description: `Je bent ${data.streakDays || 7} dagen op rij actief geweest met DatingAssistent. Consistentie is de sleutel tot succes!`,
            icon: '🔥',
            rarity: 'epic',
          }}
          stats={[
            { icon: '📊', label: 'Streak lengte', value: `${data.streakDays || 7} dagen` },
            { icon: '🎯', label: 'Tools gebruikt', value: data.toolsUsedInStreak || '12' },
            { icon: '⭐', label: 'Gemiddelde score', value: data.averageQuality || '8.5/10' },
          ]}
          nextGoal={{
            title: `Naar ${data.nextStreakGoal || 14} dagen streak`,
            description: 'Blijf doorgaan voor nog meer momentum',
            progress: data.streakProgress || 50,
          }}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `🔥 ${data.streakDays || 7}-Dagen Streak! Je bent on fire!`,
      textVersion: `Gefeliciteerd ${data.firstName}! Je bent ${data.streakDays || 7} dagen op rij actief geweest!`,
    },

    annual_anniversary: {
      component: (
        <AchievementEmailTemplate
          userName={data.firstName}
          achievement={{
            title: 'Een Jaar DatingAssistent! 🎂',
            description: `Een jaar geleden begon je je dating journey met ons. Kijk eens hoe ver je bent gekomen!`,
            icon: '🎂',
            rarity: 'legendary',
          }}
          stats={[
            { icon: '📅', label: 'Lid sinds', value: data.memberSince || 'November 2024' },
            { icon: '🎯', label: 'Totaal tools gebruikt', value: data.totalToolsUsed || '89' },
            { icon: '🏆', label: 'Mijlpalen behaald', value: data.milestonesAchieved || '12' },
            { icon: '⭐', label: 'Succes rate', value: data.successRate || '78%' },
          ]}
          nextGoal={{
            title: 'Jaar 2: Nog meer succes',
            description: 'Bouw voort op je ervaringen',
            progress: 0,
          }}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `🎂 Een jaar geleden startte je dating journey met ons!`,
      textVersion: `Gefeliciteerd ${data.firstName}! Een jaar geleden begon je bij DatingAssistent.`,
    },

    // CHURN PREVENTION
    subscription_renewal: {
      component: (
        <SubscriptionRenewalEmail
          firstName={data.firstName}
          subscriptionType={data.subscriptionType || 'core'}
          renewalDate={data.renewalDate || '18 november 2025'}
          daysUntilRenewal={data.daysUntilRenewal || 7}
          monthlyPrice={data.monthlyPrice || 19.95}
          statsThisMonth={{
            toolsUsed: data.toolsUsed || 8,
            aiMessages: data.aiMessagesUsed || 45,
            coursesCompleted: data.coursesCompleted || 3,
          }}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `Je ${data.subscriptionType || 'Core'} abonnement verlengt over ${data.daysUntilRenewal || 7} dagen 📅`,
      textVersion: `Je abonnement wordt automatisch verlengd op ${data.renewalDate}.`,
    },

    payment_failed: {
      component: (
        <PaymentFailedEmail
          firstName={data.firstName}
          subscriptionType={data.subscriptionType || 'core'}
          amount={data.amount || 19.95}
          failureReason={data.failureReason}
          retryDate={data.retryDate}
          daysUntilSuspension={data.daysUntilSuspension || 3}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `⚠️ Betaling mislukt - Update je betaalmethode`,
      textVersion: `Er ging iets mis met je betaling. Los het snel op!`,
    },

    downgrade_warning: {
      component: (
        <NotificationEmailTemplate
          userName={data.firstName}
          type="warning"
          title="We zien dat je overweegt te downgraden"
          message={`We merken dat je interesse toont in een lager abonnement. Voordat je deze beslissing neemt, willen we je laten zien wat je gaat missen.`}
          action={{
            primary: {
              text: 'Huidig Plan Behouden',
              url: `${BASE_URL}/dashboard/subscription`,
            },
            secondary: {
              text: 'Alternatieven Bekijken',
              url: `${BASE_URL}/dashboard/subscription?tab=compare`,
            },
          }}
          details={[
            { label: 'Huidig abonnement', value: data.currentPlan || 'Core' },
            { label: 'Overwogen downgrade', value: data.downgradeTo || 'Sociaal' },
            { label: 'Functies die je verliest', value: data.featuresLost || 'AI Chat, Foto Analyse' },
            { label: 'Besparingen', value: data.savingsAmount || '€5/maand' },
          ]}
          tips={[
            'Test eerst de beperkte versie om te zien of het voldoende is',
            'Overweeg een pauze in plaats van downgraden',
            'Neem contact op voor persoonlijk advies',
            'Je kunt altijd weer upgraden wanneer je wilt',
          ]}
        />
      ),
      subject: `📉 We zien dat je overweegt te downgraden - Weet je zeker?`,
      textVersion: `Hoi ${data.firstName},\n\nWe zien dat je interesse toont in downgraden. Voordat je deze beslissing neemt...`,
    },

    cancellation_intent: {
      component: (
        <NotificationEmailTemplate
          userName={data.firstName}
          type="warning"
          title="We willen je niet laten gaan"
          message={`Het spijt ons te horen dat je overweegt te stoppen. Voordat je gaat, hebben we een speciaal aanbod om je te behouden als gewaardeerde klant.`}
          action={{
            primary: {
              text: 'Speciaal Aanbod Accepteren',
              url: `${BASE_URL}/dashboard/subscription?offer=retention`,
            },
            secondary: {
              text: 'Even Blijven',
              url: `${BASE_URL}/dashboard`,
            },
          }}
          details={[
            { label: 'Speciaal aanbod', value: data.specialOffer || '3 maanden 50% korting' },
            { label: 'Reden voor vertrek', value: data.cancellationReason || 'Niet gespecificeerd' },
            { label: 'Account sinds', value: data.memberSince || 'November 2024' },
            { label: 'Totale waarde', value: data.totalValue || '€150+ besparingen' },
          ]}
          tips={[
            'Vertel ons wat we kunnen verbeteren',
            'Overweeg een pauze in plaats van volledig stoppen',
            'Je data blijft altijd veilig bewaard',
            'Je kunt altijd terugkomen wanneer je wilt',
          ]}
        />
      ),
      subject: `🚪 We willen je niet laten gaan - Speciaal aanbod voor jou`,
      textVersion: `Hoi ${data.firstName},\n\nHet spijt ons te horen dat je overweegt te stoppen. We hebben een speciaal aanbod...`,
    },

    // UPSELL EMAILS
    feature_limit_reached: {
      component: (
        <FeatureLimitReachedEmail
          firstName={data.firstName}
          featureType={data.featureType || 'ai_messages'}
          currentLimit={data.currentLimit || 25}
          usageThisWeek={data.usageThisWeek || 25}
          subscriptionType={data.subscriptionType || 'sociaal'}
          resetDate={data.resetDate}
          dashboardUrl={`${BASE_URL}/dashboard`}
        />
      ),
      subject: `Je hebt je ${data.featureName || 'limiet'} bereikt - Upgrade? ⚡`,
      textVersion: `Je hebt je limiet bereikt. Upgrade voor 2x meer!`,
    },

    upgrade_suggestion: {
      component: (
        <NotificationEmailTemplate
          userName={data.firstName}
          type="info"
          title="Perfect moment om te upgraden"
          message={`Gebaseerd op je gebruikspatroon van de afgelopen ${data.analysisPeriod || 'maand'} zien we dat je klaar bent voor meer mogelijkheden.`}
          action={{
            primary: {
              text: 'Upgrade Bekijken',
              url: `${BASE_URL}/dashboard/subscription?tab=upgrade`,
            },
            secondary: {
              text: 'Huidig Plan Behouden',
              url: `${BASE_URL}/dashboard/subscription`,
            },
          }}
          details={[
            { label: 'Aanbevolen upgrade', value: data.recommendedPlan || 'Core naar Pro' },
            { label: 'Extra functies', value: data.newFeatures || 'Onbeperkt AI, Premium cursussen' },
            { label: 'Maandelijkse kosten', value: data.upgradePrice || '€29.95/maand' },
            { label: 'Verwacht effect', value: data.expectedImprovement || '40% meer matches' },
          ]}
          tips={[
            'Upgrade geeft toegang tot alle geavanceerde functies',
            'Pro gebruikers behalen gemiddeld 2x meer dates',
            'Je kunt altijd downgraden als het niet bevalt',
            'Eerste maand 50% korting als welkomstkorting',
          ]}
        />
      ),
      subject: `⏰ Perfect moment om te upgraden - Gebaseerd op je gebruik`,
      textVersion: `Hoi ${data.firstName},\n\nGebaseerd op je gebruik zien we dat je klaar bent voor meer mogelijkheden.`,
    },

    seasonal_promotion: {
      component: (
        <NotificationEmailTemplate
          userName={data.firstName}
          type="success"
          title={(data.seasonalEvent || 'Kerst') + ' Special - Upgrade Je Dating Game'}
          message={'Speciaal voor ' + (data.seasonalEvent || 'de feestdagen') + ' hebben we een unieke aanbieding voor jou. Verbeter je dating resultaten met ' + (data.discountPercentage || 50) + '% korting!'}
          action={{
            primary: {
              text: 'Speciaal Aanbod Claimen',
              url: `${BASE_URL}/dashboard/subscription?promo=${data.promoCode || 'SEASONAL2025'}`,
            },
          }}
          details={[
            { label: 'Speciaal aanbod', value: data.specialOffer || '3 maanden 50% korting' },
            { label: 'Normale prijs', value: data.normalPrice || '€29.95/maand' },
            { label: 'Jouw prijs', value: data.discountedPrice || '€14.98/maand' },
            { label: 'Aanbieding geldig tot', value: data.expiryDate || '31 december 2025' },
          ]}
          tips={[
            'Dit is onze grootste korting van het jaar',
            'Upgrade nu voor de beste feestdagen ooit',
            'Deel met vrienden voor extra voordelen',
            'Volledig risicovrij - 30 dagen geld terug garantie',
          ]}
        />
      ),
      subject: '🎁 ' + (data.seasonalEvent || 'Kerst') + ' Special - ' + (data.discountPercentage || 50) + '% Korting op Upgrade!',
      textVersion: 'Speciaal ' + (data.seasonalEvent || 'kerstaanbod') + '! Upgrade met ' + (data.discountPercentage || 50) + '% korting.',
    },

    referral_reward: {
      component: (
        <NotificationEmailTemplate
          userName={data.firstName}
          type="success"
          title="Deel de liefde - Verdien beloningen"
          message={`Help je vrienden met hun dating journey en verdien tegelijkertijd gratis maanden DatingAssistent. Voor elke vriend die zich aanmeldt, krijg jij ${data.rewardAmount || '1 maand'} gratis!`}
          action={{
            primary: {
              text: 'Verwijs Vrienden',
              url: `${BASE_URL}/dashboard/referrals`,
            },
            secondary: {
              text: 'Bekijk Voortgang',
              url: `${BASE_URL}/dashboard/referrals?tab=progress`,
            },
          }}
          details={[
            { label: 'Beloning per verwijzing', value: data.rewardPerReferral || '1 maand gratis' },
            { label: 'Vrienden uitgenodigd', value: data.friendsInvited || '3' },
            { label: 'Beloningen verdiend', value: data.rewardsEarned || '2 maanden' },
            { label: 'Verwijs link', value: data.referralLink || 'klaar voor gebruik' },
          ]}
          tips={[
            'Deel je persoonlijke ervaringen met vrienden',
            'Focus op vrienden die serieus zijn over dating',
            'Gebruik social media om je link te delen',
            'Hoe meer vrienden, hoe meer gratis maanden',
          ]}
        />
      ),
      subject: `🤝 Deel de liefde - Verdien ${data.rewardAmount || '1 maand'} gratis per verwijzing!`,
      textVersion: `Hoi ${data.firstName},\n\nVerdien gratis maanden door vrienden uit te nodigen voor DatingAssistent!`,
    },

    // KICKSTART → TRANSFORMATIE UPSELL SEQUENCE
    kickstart_upgrade_day7: {
      component: (
        <KickstartUpgradeEmail
          firstName={data.firstName}
          daysCompleted={data.daysCompleted || 7}
          upgradeUrl={data.upgradeUrl || `${BASE_URL}/checkout/transformatie-upgrade`}
          currentScore={data.currentScore}
          variant="day7"
        />
      ),
      subject: `${data.firstName}, week 1 voltooid! Wat nu?`,
      textVersion: `Hoi ${data.firstName},\n\nJe hebt al 7 dagen van je Kickstart afgerond. Geweldig! Wil je door naar het volgende niveau?\n\nBekijk Transformatie: ${data.upgradeUrl || `${BASE_URL}/checkout/transformatie-upgrade`}`,
    },

    kickstart_upgrade_day14: {
      component: (
        <KickstartUpgradeEmail
          firstName={data.firstName}
          daysCompleted={data.daysCompleted || 14}
          upgradeUrl={data.upgradeUrl || `${BASE_URL}/checkout/transformatie-upgrade`}
          improvementPercentage={data.improvementPercentage}
          variant="day14"
        />
      ),
      subject: `${data.firstName}, halverwege! Klaar voor meer?`,
      textVersion: `Hoi ${data.firstName},\n\nJe bent halverwege je Kickstart! 14 dagen voltooid. Het perfecte moment om te beslissen of je door wilt naar de complete Transformatie.\n\nBekijk je opties: ${data.upgradeUrl || `${BASE_URL}/checkout/transformatie-upgrade`}`,
    },

    kickstart_upgrade_day21: {
      component: (
        <KickstartUpgradeEmail
          firstName={data.firstName}
          daysCompleted={21}
          upgradeUrl={data.upgradeUrl || `${BASE_URL}/checkout/transformatie-upgrade`}
          currentScore={data.currentScore}
          improvementPercentage={data.improvementPercentage}
          variant="day21"
        />
      ),
      subject: `🎉 ${data.firstName}, Kickstart voltooid! Speciale aanbieding binnen`,
      textVersion: `Gefeliciteerd ${data.firstName}!\n\n21 dagen Kickstart voltooid! Je hebt het gehaald. Als bedankje voor je toewijding: upgrade naar Transformatie voor slechts €100 extra (je Kickstart wordt volledig verrekend).\n\nClaim je upgrade: ${data.upgradeUrl || `${BASE_URL}/checkout/transformatie-upgrade`}`,
    },
  };

  return templates[emailType] || {
    component: <div>Email Template</div>,
    subject: 'DatingAssistent Update',
    textVersion: 'Update from DatingAssistent',
  };
}

/**
 * Generate plain text version of welcome email
 */
function getWelcomeTextVersion(data: EmailTemplateData): string {
  const tierNames: Record<string, string> = {
    sociaal: 'Sociaal',
    core: 'Core',
    pro: 'Pro',
    premium: 'Premium'
  };

  return `
Welkom bij DatingAssistent!

Hoi ${data.firstName},

Wat geweldig dat je er bent! Je hebt zojuist de eerste stap gezet naar succesvol en zelfverzekerd daten.

Je ${tierNames[data.subscriptionType]} pakket is actief.

Hier zijn je eerste 3 stappen:

1. ✅ Profiel completeren (30 seconden)
   Vul je profiel aan voor betere matches

2. 💬 Eerste AI chat starten
   Probeer de Chat Coach en krijg direct advies

3. 📸 Foto uploaden
   Laat AI je profielfoto analyseren voor optimale impact

Start nu: ${BASE_URL}/dashboard

Wat je kunt verwachten:
• 🤖 24/7 AI coaching
• 📚 Expert cursussen
• 💬 Real-time advies
• 📈 89% meer matches

Heb je vragen? Antwoord gewoon op deze email - we helpen je graag!

Succes!
Vincent & het DatingAssistent team

---
DatingAssistent - 10+ jaar ervaring in dating coaching
Dashboard: ${BASE_URL}/dashboard
Help: ${BASE_URL}/help
Email Voorkeuren: ${BASE_URL}/dashboard/settings/email-preferences
  `.trim();
}

/**
 * Preview URL generator for email templates
 */
export function getEmailPreviewUrl(emailType: EmailType): string {
  return `${BASE_URL}/api/email-preview/${emailType}`;
}
