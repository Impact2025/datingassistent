import * as React from 'react';
import { FeatureLimitEmail } from '@/components/emails';

interface FeatureLimitReachedEmailProps {
  firstName: string;
  featureType: 'ai_messages' | 'photo_analysis' | 'profile_rewrites' | 'icebreakers';
  currentLimit: number;
  usageThisWeek: number;
  subscriptionType: string;
  resetDate?: string;
  dashboardUrl: string;
}

export const FeatureLimitReachedEmail = ({
  firstName = 'Dating Expert',
  featureType = 'ai_messages',
  currentLimit = 25,
  usageThisWeek = 25,
  subscriptionType = 'sociaal',
  resetDate = 'maandag',
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: FeatureLimitReachedEmailProps) => {
  const featureContent = {
    ai_messages: {
      icon: '💬',
      name: 'AI Chat Berichten',
      tip: 'Je hebt veel vragen - dat is geweldig! Het toont dat je actief bezig bent met je dating journey.',
    },
    photo_analysis: {
      icon: '📸',
      name: 'Foto Analyses',
      tip: 'Je wilt duidelijk de beste foto\'s - slim! Goede profielfoto\'s maken echt het verschil.',
    },
    profile_rewrites: {
      icon: '✍️',
      name: 'Profiel Rewrites',
      tip: 'Je werkt hard aan je profiel - perfect! Een sterk profiel is de basis van dating succes.',
    },
    icebreakers: {
      icon: '🔥',
      name: 'Icebreakers',
      tip: 'Je gebruikt veel icebreakers - top! Originele openers maken een groot verschil.',
    },
  };

  const feature = featureContent[featureType];
  const isWeeklyLimit = featureType === 'ai_messages' || featureType === 'icebreakers';

  return (
    <FeatureLimitEmail
      userName={firstName}
      feature={feature.name}
      dashboardUrl={dashboardUrl}
    />
  );
};

export default FeatureLimitReachedEmail;

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

const usageBox = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const usageHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  marginBottom: '16px',
};

const usageIcon = {
  fontSize: '32px',
};

const usageTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0',
};

const progressBarContainer = {
  backgroundColor: '#e5e7eb',
  height: '16px',
  borderRadius: '8px',
  overflow: 'hidden',
  margin: '16px 0',
};

const progressBar = {
  height: '100%',
  borderRadius: '8px',
  transition: 'width 0.3s ease',
};

const usageText = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '12px 0 0 0',
};

const resetText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '8px 0 0 0',
};

const positiveBox = {
  backgroundColor: '#dbeafe',
  border: '2px solid #60a5fa',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
};

const positiveTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 8px 0',
};

const positiveText = {
  fontSize: '15px',
  color: '#1e3a8a',
  margin: '0',
  lineHeight: '22px',
};

const optionsSection = {
  margin: '32px 0',
};

const optionCard = {
  display: 'flex',
  gap: '16px',
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
};

const upgradeCard = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
};

const optionNumber = {
  backgroundColor: '#6b7280',
  color: '#ffffff',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  fontWeight: 'bold',
  flexShrink: 0,
};

const optionContent = {
  flex: 1,
};

const optionTitle = {
  fontSize: '17px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 6px 0',
};

const optionDescription = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
  lineHeight: '20px',
};

const upgradeSection = {
  margin: '32px 0',
};

const upgradeBox = {
  background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
  border: '3px solid #a78bfa',
  borderRadius: '16px',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const upgradeBadge = {
  backgroundColor: '#8b5cf6',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '6px 14px',
  borderRadius: '16px',
  display: 'inline-block',
  marginBottom: '16px',
};

const upgradeTitle = {
  color: '#5b21b6',
  fontSize: '26px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const upgradePrice = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#8b5cf6',
  margin: '0 0 24px 0',
};

const benefitsList = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'left' as const,
};

const benefitsTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#5b21b6',
  margin: '0 0 12px 0',
};

const benefitItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '10px',
};

const benefitIcon = {
  fontSize: '20px',
  color: '#10b981',
  fontWeight: 'bold',
  flexShrink: 0,
};

const benefitText = {
  fontSize: '15px',
  color: '#374151',
  margin: '0',
  fontWeight: '500',
};

const upgradeButton = {
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 40px',
  marginTop: '8px',
};

const upgradeSubtext = {
  fontSize: '14px',
  color: '#6b21a8',
  margin: '16px 0 0 0',
};

const socialProofSection = {
  margin: '32px 0',
};

const socialProofBox = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #10b981',
  borderRadius: '8px',
  padding: '20px',
};

const socialProofTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#065f46',
  margin: '0 0 8px 0',
};

const socialProofText = {
  fontSize: '15px',
  color: '#047857',
  margin: '0',
  lineHeight: '22px',
};

const alternativesSection = {
  margin: '32px 0',
};

const alternativesList = {
  margin: '16px 0',
};

const alternativeItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
};

const alternativeIcon = {
  fontSize: '28px',
  flexShrink: 0,
};

const alternativeText = {
  fontSize: '15px',
  color: '#374151',
  margin: '4px 0 0 0',
  lineHeight: '22px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
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
