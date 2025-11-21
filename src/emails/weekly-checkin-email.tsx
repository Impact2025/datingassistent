import * as React from 'react';
import { NotificationEmailTemplate } from '@/components/emails';

interface WeeklyCheckinEmailProps {
  firstName: string;
  daysActive: number;
  toolsUsed: number;
  coursesStarted: number;
  aiMessagesUsed: number;
  dashboardUrl: string;
  feedbackUrl?: string;
}

export const WeeklyCheckinEmail = ({
  firstName = 'Dating Expert',
  daysActive = 7,
  toolsUsed = 3,
  coursesStarted = 1,
  aiMessagesUsed = 12,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
  feedbackUrl = 'https://datingassistent.nl/feedback',
}: WeeklyCheckinEmailProps) => {
  const achievements = [
    { condition: toolsUsed >= 3, text: '3+ tools geprobeerd' },
    { condition: coursesStarted >= 1, text: 'Cursus gestart' },
    { condition: aiMessagesUsed >= 10, text: '10+ AI gesprekken' },
    { condition: daysActive >= 7, text: '7 dagen actief' },
  ];

  const activeAchievements = achievements.filter(a => a.condition);
  const achievementText = activeAchievements.length > 0
    ? `Achievements: ${activeAchievements.map(a => a.text).join(', ')}`
    : 'Goede voortgang deze week!';

  return (
    <NotificationEmailTemplate
      userName={firstName}
      type="info"
      title="Week 1 Check-in"
      message={`Je bent nu ${daysActive} dagen actief bij DatingAssistent! ${achievementText} Hoe bevalt het tot nu toe?`}
      action={{
        primary: {
          text: 'Geef Feedback',
          url: feedbackUrl || dashboardUrl,
        },
        secondary: {
          text: 'Naar Dashboard',
          url: dashboardUrl,
        },
      }}
      details={[
        { label: 'Tools gebruikt', value: toolsUsed.toString() },
        { label: 'AI gesprekken', value: aiMessagesUsed.toString() },
        { label: 'Cursussen gestart', value: coursesStarted.toString() },
        { label: 'Dagen actief', value: `${daysActive}/7` },
      ]}
      tips={[
        'Deel je feedback en krijg 25 extra AI berichten cadeau',
        'Probeer meer tools uit voor betere resultaten',
        'Bouw een dagelijkse streak voor extra bonussen',
        'Sluit je aan bij de community voor ondersteuning',
      ]}
    />
  );
};

export default WeeklyCheckinEmail;

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
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  padding: '40px 24px',
  textAlign: 'center' as const,
};

const headerIcon = {
  fontSize: '64px',
  marginBottom: '16px',
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
  gap: '16px',
  marginTop: '20px',
};

const statCard = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
};

const statNumber = {
  fontSize: '48px',
  fontWeight: 'bold',
  color: '#3b82f6',
  marginBottom: '8px',
};

const statLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
  fontWeight: '500',
};

const achievementsSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '24px',
  margin: '32px 0',
};

const achievementsList = {
  margin: '16px 0',
};

const achievementItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#ffffff',
  padding: '12px 16px',
  borderRadius: '8px',
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

const feedbackSection = {
  margin: '32px 0',
};

const feedbackBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #10b981',
  borderRadius: '12px',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const feedbackTitle = {
  color: '#065f46',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const feedbackText = {
  fontSize: '16px',
  color: '#047857',
  lineHeight: '24px',
  margin: '0 0 24px 0',
};

const questionContainer = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'left' as const,
};

const questionText = {
  fontSize: '16px',
  color: '#111827',
  margin: '0 0 12px 0',
};

const optionsList = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '28px',
};

const optionItem = {
  marginBottom: '4px',
};

const feedbackButton = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  marginTop: '16px',
};

const feedbackReward = {
  fontSize: '14px',
  color: '#047857',
  margin: '12px 0 0 0',
  fontWeight: '600',
};

const tipsSection = {
  margin: '32px 0',
};

const tipCard = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  backgroundColor: '#dbeafe',
  border: '1px solid #93c5fd',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
};

const tipIcon = {
  fontSize: '28px',
  flexShrink: 0,
};

const tipTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 4px 0',
};

const tipText = {
  fontSize: '14px',
  color: '#1e3a8a',
  margin: '0',
  lineHeight: '20px',
};

const communitySection = {
  margin: '32px 0',
};

const communityBox = {
  backgroundColor: '#f5f3ff',
  border: '2px solid #a78bfa',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
};

const communityTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#5b21b6',
  margin: '0 0 8px 0',
};

const communityText = {
  fontSize: '15px',
  color: '#6b21a8',
  margin: '0 0 16px 0',
  lineHeight: '22px',
};

const communityButton = {
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

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
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
  color: '#3b82f6',
  fontSize: '12px',
  textDecoration: 'none',
};

const footerSeparator = {
  color: '#d1d5db',
  fontSize: '12px',
};
