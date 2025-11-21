import * as React from 'react';
import { NotificationEmailTemplate } from '@/components/emails';

interface WeeklyDigestEmailProps {
  firstName: string;
  weekNumber: number;
  stats: {
    toolsUsed: number;
    aiMessagesUsed: number;
    courseLessonsCompleted: number;
    daysActive: number;
  };
  weeklyTip: {
    title: string;
    description: string;
    icon: string;
  };
  featuredContent: {
    type: 'course' | 'tool' | 'article';
    title: string;
    description: string;
    url: string;
  };
  communityHighlight?: {
    username: string;
    achievement: string;
  };
  dashboardUrl: string;
}

export const WeeklyDigestEmail = ({
  firstName = 'Dating Expert',
  weekNumber = 3,
  stats = {
    toolsUsed: 6,
    aiMessagesUsed: 28,
    courseLessonsCompleted: 4,
    daysActive: 5,
  },
  weeklyTip = {
    title: 'De 3-Seconden Regel',
    description: 'Reageer binnen 3 uur op matches voor 40% meer kans op een gesprek!',
    icon: '⚡',
  },
  featuredContent = {
    type: 'course',
    title: 'Red Flags Herkennen',
    description: 'Leer hoe je waarschuwingssignalen vroeg herkent',
    url: '/courses/red-flags',
  },
  communityHighlight,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: WeeklyDigestEmailProps) => {
  const isHighActivity = stats.daysActive >= 5;
  const weekRange = `Week ${weekNumber}`;

  return (
    <NotificationEmailTemplate
      userName={firstName}
      type="info"
      title={`Week ${weekNumber} Digest`}
      message={`Deze week heb je ${stats.toolsUsed} tools gebruikt en ${stats.aiMessagesUsed} AI gesprekken gevoerd. ${isHighActivity ? 'Power week! 🔥' : 'Goede voortgang!'}`}
      action={{
        primary: {
          text: 'Bekijk Dashboard',
          url: dashboardUrl,
        },
      }}
      details={[
        { label: 'Tools gebruikt', value: stats.toolsUsed.toString() },
        { label: 'AI gesprekken', value: stats.aiMessagesUsed.toString() },
        { label: 'Dagen actief', value: `${stats.daysActive}/7` },
        { label: 'Cursussen', value: stats.courseLessonsCompleted.toString() },
      ]}
    />
  );
};

export default WeeklyDigestEmail;

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
  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
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

const h3 = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px 0',
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
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#6366f1',
  marginBottom: '4px',
};

const statLabel = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0',
  fontWeight: '500',
};

const activityBadge = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
  borderRadius: '8px',
  padding: '12px 16px',
  marginTop: '16px',
  textAlign: 'center' as const,
};

const activityBadgeText = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0',
};

const tipSection = {
  margin: '32px 0',
};

const tipBox = {
  backgroundColor: '#dbeafe',
  border: '2px solid #60a5fa',
  borderRadius: '12px',
  padding: '24px',
};

const tipHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '12px',
};

const tipIcon = {
  fontSize: '32px',
};

const tipTitle = {
  color: '#1e40af',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
};

const tipTitleText = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 8px 0',
};

const tipDescription = {
  fontSize: '15px',
  color: '#1e3a8a',
  margin: '0',
  lineHeight: '22px',
};

const featuredSection = {
  margin: '32px 0',
};

const featuredCard = {
  background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
  border: '2px solid #a78bfa',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
};

const featuredBadge = {
  backgroundColor: '#8b5cf6',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '4px 12px',
  borderRadius: '12px',
  display: 'inline-block',
  marginBottom: '12px',
};

const featuredTitle = {
  color: '#5b21b6',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const featuredDescription = {
  fontSize: '15px',
  color: '#6b21a8',
  margin: '0 0 16px 0',
  lineHeight: '22px',
};

const featuredButton = {
  backgroundColor: '#8b5cf6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 24px',
};

const communitySection = {
  margin: '32px 0',
};

const communityBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #86efac',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
};

const communityTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#065f46',
  margin: '0 0 16px 0',
};

const communityContent = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
};

const communityText = {
  fontSize: '15px',
  color: '#111827',
  margin: '0 0 8px 0',
  lineHeight: '22px',
};

const communitySubtext = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0',
};

const communityButton = {
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

const challengesSection = {
  margin: '32px 0',
};

const challengesList = {
  margin: '16px 0',
};

const challengeItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
};

const challengeIcon = {
  fontSize: '24px',
  color: '#6366f1',
  flexShrink: 0,
  fontWeight: 'bold',
};

const challengeContent = {
  flex: 1,
};

const challengeTitle = {
  fontSize: '15px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 4px 0',
};

const challengeReward = {
  fontSize: '13px',
  color: '#10b981',
  margin: '0',
  fontWeight: '600',
};

const quickLinksSection = {
  margin: '32px 0',
};

const quickLinksGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginTop: '16px',
};

const quickLink = {
  textDecoration: 'none',
};

const quickLinkCard = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  textAlign: 'center' as const,
  transition: 'all 0.2s ease',
};

const quickLinkIcon = {
  fontSize: '32px',
  display: 'block',
  marginBottom: '8px',
};

const quickLinkText = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#111827',
  margin: '0',
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
  backgroundColor: '#6366f1',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
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
  marginBottom: '12px',
};

const footerLink = {
  color: '#6366f1',
  fontSize: '12px',
  textDecoration: 'none',
};

const footerSeparator = {
  color: '#d1d5db',
  fontSize: '12px',
};

const footerNote = {
  color: '#9ca3af',
  fontSize: '11px',
  margin: '0',
  fontStyle: 'italic',
};
