import * as React from 'react';
import { AchievementEmailTemplate } from '@/components/emails';

interface FirstWinEmailProps {
  firstName: string;
  featureUsed?: string;
  dashboardUrl: string;
}

export const FirstWinEmail = ({
  firstName = 'Dating Expert',
  featureUsed = 'Chat Coach',
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: FirstWinEmailProps) => {
  const achievementTitle = featureUsed
    ? `Eerste ${featureUsed} Gebruikt!`
    : 'Je Eerste Stap Zet!';

  const achievementDescription = featureUsed
    ? `Super! Je hebt zojuist ${featureUsed} gebruikt. Dat is de eerste stap naar dating succes!`
    : 'We zien dat je al een paar dagen lid bent. Tijd om echt aan de slag te gaan!';

  return (
    <AchievementEmailTemplate
      userName={firstName}
      achievement={{
        title: achievementTitle,
        description: achievementDescription,
        icon: '🎉',
        rarity: 'common',
      }}
      stats={[
        {
          icon: '🚀',
          value: '1',
          label: 'Eerste Stap',
        },
        {
          icon: '⏱️',
          value: '6 min',
          label: 'Totale Tijd',
        },
        {
          icon: '📈',
          value: '5x',
          label: 'Meer Kans',
        },
      ]}
      nextGoal={{
        title: 'Probeer 3 features deze week!',
        description: 'Gebruikers die 3+ features proberen hebben 5x meer kans op matches.',
        progress: 33, // 1/3 = 33%
      }}
      dashboardUrl={dashboardUrl}
    />
  );
};

export default FirstWinEmail;

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
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  padding: '40px 24px',
  textAlign: 'center' as const,
};

const celebrationIcon = {
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
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px 0',
  textAlign: 'center' as const,
};

const statsBox = {
  backgroundColor: '#dbeafe',
  borderLeft: '4px solid #3b82f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const statsTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 8px 0',
};

const statsText = {
  fontSize: '15px',
  color: '#1e3a8a',
  margin: '0',
  lineHeight: '22px',
};

const quickWinsSection = {
  margin: '32px 0',
};

const quickWinCard = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
};

const quickWinHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '12px',
};

const quickWinIcon = {
  fontSize: '36px',
  flexShrink: 0,
};

const quickWinHeaderText = {
  flex: 1,
};

const quickWinTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 4px 0',
};

const quickWinTime = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
};

const quickWinBenefit = {
  fontSize: '14px',
  color: '#059669',
  margin: '0',
  fontWeight: '500',
};

const successSection = {
  margin: '32px 0',
};

const successBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
};

const successTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 12px 0',
};

const successQuote = {
  fontSize: '16px',
  color: '#78350f',
  margin: '0',
  lineHeight: '24px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#10b981',
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

const featureGridSection = {
  margin: '32px 0',
  backgroundColor: '#f0fdf4',
  borderRadius: '12px',
  padding: '24px',
};

const featureGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  marginTop: '16px',
};

const featureItem = {
  textAlign: 'center' as const,
  padding: '16px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
};

const featureEmoji = {
  fontSize: '32px',
  display: 'block',
  marginBottom: '8px',
};

const featureText = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  margin: '0',
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
  color: '#10b981',
  fontSize: '12px',
  textDecoration: 'none',
};

const footerSeparator = {
  color: '#d1d5db',
  fontSize: '12px',
};
