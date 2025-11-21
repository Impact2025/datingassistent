import * as React from 'react';
import { AchievementEmailTemplate } from '@/components/emails';

interface MonthlyProgressReportEmailProps {
  firstName: string;
  monthName: string;
  stats: {
    toolsUsed: number;
    aiMessages: number;
    coursesCompleted: number;
    lessonsCompleted: number;
    daysActive: number;
    totalDaysInMonth: number;
    streakDays: number;
    communityPosts: number;
  };
  achievements: string[];
  topFeature: {
    name: string;
    usage: number;
    icon: string;
  };
  comparisonToLastMonth: {
    improvement: boolean;
    percentage: number;
  };
  dashboardUrl: string;
}

export const MonthlyProgressReportEmail = ({
  firstName = 'Dating Expert',
  monthName = 'Oktober',
  stats = {
    toolsUsed: 9,
    aiMessages: 87,
    coursesCompleted: 4,
    lessonsCompleted: 15,
    daysActive: 22,
    totalDaysInMonth: 31,
    streakDays: 7,
    communityPosts: 3,
  },
  achievements = ['7-dag streak', '3 cursussen compleet', 'Top 10% actieve gebruikers'],
  topFeature = {
    name: 'Chat Coach',
    usage: 45,
    icon: '💬',
  },
  comparisonToLastMonth = {
    improvement: true,
    percentage: 35,
  },
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: MonthlyProgressReportEmailProps) => {
  const activityPercentage = Math.round((stats.daysActive / stats.totalDaysInMonth) * 100);
  const isHighActivity = activityPercentage >= 70;

  return (
    <AchievementEmailTemplate
      userName={firstName}
      achievement={{
        title: `${monthName} Review Compleet`,
        description: `Wat een maand! ${stats.daysActive} dagen actief met ${stats.toolsUsed} tools gebruikt en ${stats.aiMessages} AI gesprekken.`,
        icon: '📊',
        rarity: isHighActivity ? 'legendary' : 'epic',
      }}
      stats={[
        {
          icon: '📅',
          value: `${stats.daysActive}/${stats.totalDaysInMonth}`,
          label: 'Dagen Actief',
        },
        {
          icon: '💬',
          value: stats.aiMessages.toString(),
          label: 'AI Gesprekken',
        },
        {
          icon: '🎯',
          value: stats.toolsUsed.toString(),
          label: 'Tools Gebruikt',
        },
        {
          icon: '📚',
          value: stats.coursesCompleted.toString(),
          label: 'Cursussen',
        },
      ]}
      nextGoal={{
        title: 'Bouw voort op deze maand!',
        description: `Verhoog je activiteit naar ${Math.min(stats.daysActive + 3, stats.totalDaysInMonth)} dagen volgende maand.`,
        progress: activityPercentage,
      }}
      dashboardUrl={dashboardUrl}
    />
  );
};

export default MonthlyProgressReportEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
};

const header = {
  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  padding: '40px 24px',
  textAlign: 'center' as const,
};

const headerBadge = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '6px 12px',
  borderRadius: '12px',
  display: 'inline-block',
  marginBottom: '12px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
};

const headerSubtext = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
  opacity: 0.95,
};

const content = {
  padding: '40px 24px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const h2 = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '32px 0 20px 0',
};

const statsSection = {
  margin: '32px 0',
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginTop: '20px',
};

const statCard = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
};

const statIcon = {
  fontSize: '32px',
  marginBottom: '8px',
};

const statValue = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#8b5cf6',
  marginBottom: '4px',
};

const statLabel = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
  fontWeight: '500',
};

const statPercentage = {
  fontSize: '14px',
  color: '#10b981',
  margin: '4px 0 0 0',
  fontWeight: '600',
};

const badgeSection = {
  margin: '24px 0',
};

const activityBadge = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
  borderRadius: '12px',
  padding: '16px',
  textAlign: 'center' as const,
};

const activityBadgeText = {
  fontSize: '15px',
  color: '#92400e',
  margin: '0',
};

const comparisonSection = {
  margin: '24px 0',
};

const comparisonBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #86efac',
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const comparisonIcon = {
  fontSize: '32px',
  flexShrink: 0,
};

const comparisonText = {
  fontSize: '15px',
  color: '#065f46',
  margin: '0',
  lineHeight: '22px',
};

const topFeatureSection = {
  margin: '32px 0',
};

const topFeatureCard = {
  backgroundColor: '#fdf2f8',
  border: '2px solid #f9a8d4',
  borderRadius: '12px',
  padding: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '12px',
};

const topFeatureIcon = {
  fontSize: '48px',
  flexShrink: 0,
};

const topFeatureContent = {
  flex: 1,
};

const topFeatureName = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#9f1239',
  margin: '0 0 4px 0',
};

const topFeatureUsage = {
  fontSize: '16px',
  color: '#831843',
  margin: '0',
  fontWeight: '600',
};

const topFeatureFootnote = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
  textAlign: 'center' as const,
};

const achievementsSection = {
  margin: '32px 0',
};

const achievementsList = {
  margin: '16px 0',
};

const achievementItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '8px',
};

const achievementIcon = {
  fontSize: '24px',
  flexShrink: 0,
};

const achievementText = {
  fontSize: '15px',
  color: '#111827',
  margin: '0',
  fontWeight: '500',
};

const learningSection = {
  margin: '32px 0',
};

const learningBox = {
  backgroundColor: '#dbeafe',
  border: '2px solid #60a5fa',
  borderRadius: '12px',
  padding: '24px',
};

const learningTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const learningProgressBar = {
  backgroundColor: '#e5e7eb',
  height: '12px',
  borderRadius: '6px',
  overflow: 'hidden',
  marginBottom: '12px',
};

const learningProgressFill = (lessons: number) => ({
  backgroundColor: '#3b82f6',
  height: '100%',
  width: `${Math.min((lessons / 30) * 100, 100)}%`,
  borderRadius: '6px',
});

const learningText = {
  fontSize: '15px',
  color: '#1e3a8a',
  margin: '0',
  lineHeight: '22px',
  textAlign: 'center' as const,
};

const communitySection = {
  margin: '32px 0',
};

const communityBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #86efac',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
};

const communityTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#065f46',
  margin: '0 0 8px 0',
};

const communityText = {
  fontSize: '15px',
  color: '#047857',
  margin: '0',
  lineHeight: '22px',
};

const goalsSection = {
  margin: '32px 0',
};

const goalsList = {
  margin: '16px 0',
};

const goalItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '14px',
  marginBottom: '10px',
};

const goalIcon = {
  fontSize: '20px',
  color: '#8b5cf6',
  flexShrink: 0,
  fontWeight: 'bold',
};

const goalText = {
  fontSize: '15px',
  color: '#374151',
  margin: '2px 0 0 0',
  lineHeight: '22px',
};

const quoteSection = {
  margin: '32px 0',
};

const quoteBox = {
  backgroundColor: '#f5f3ff',
  borderLeft: '4px solid #8b5cf6',
  borderRadius: '8px',
  padding: '24px',
};

const quoteText = {
  fontSize: '17px',
  fontStyle: 'italic',
  color: '#5b21b6',
  margin: '0 0 12px 0',
  lineHeight: '26px',
};

const quoteAuthor = {
  fontSize: '14px',
  color: '#7c3aed',
  margin: '0',
  fontWeight: '600',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const ctaText = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px 0',
};

const button = {
  backgroundColor: '#8b5cf6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const ctaSubtext = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '12px 0 0 0',
};

const sharingSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '24px',
  margin: '32px 0',
  textAlign: 'center' as const,
};

const sharingTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 8px 0',
};

const sharingText = {
  fontSize: '15px',
  color: '#6b7280',
  margin: '0 0 16px 0',
  lineHeight: '22px',
};

const sharingButton = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 24px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const signature = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0',
};

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0 0 12px 0',
};

const footerLinks = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
};

const footerLink = {
  color: '#8b5cf6',
  fontSize: '12px',
  textDecoration: 'none',
};

const footerSeparator = {
  color: '#d1d5db',
  fontSize: '12px',
};
