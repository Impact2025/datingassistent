import * as React from 'react';
import { WelcomeEmailTemplate } from '@/components/emails/templates/welcome-template';

interface WelcomeEmailProps {
  firstName: string;
  subscriptionType: string;
  dashboardUrl: string;
}

export const WelcomeEmail = ({
  firstName = 'Dating Expert',
  subscriptionType = 'core',
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: WelcomeEmailProps) => {
  return (
    <WelcomeEmailTemplate
      firstName={firstName}
      dashboardUrl={dashboardUrl}
      trialDays={7}
    />
  );
};

export default WelcomeEmail;

// Modern Card-Based Email Styles
const contentCard = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #f3f4f6',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
};

const greetingContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
};

const greetingIcon = {
  flexShrink: 0,
};

const greeting = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontFamily: '"Inter", Arial, sans-serif',
  fontWeight: '700',
  margin: '0 0 16px 0',
  lineHeight: '1.3',
  letterSpacing: '-0.02em',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  fontFamily: '"Inter", Arial, sans-serif',
  lineHeight: '24px',
  margin: '0 0 16px 0',
  fontWeight: '400',
};

const cardTitleContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginBottom: '20px',
};

const cardTitleIcon = {
  flexShrink: 0,
};

const cardTitle = {
  color: '#E14874',
  fontSize: '20px',
  fontFamily: '"Inter", Arial, sans-serif',
  fontWeight: '600',
  margin: '0',
  lineHeight: '1.4',
  textAlign: 'center' as const,
};

const statusCard = {
  backgroundColor: '#fef7ff',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #e9d5ff',
};

const statusHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '12px',
};

const statusIcon = {
  fontSize: '24px',
};

const statusTitle = {
  color: '#E14874',
  fontSize: '18px',
  fontFamily: '"Inter", Arial, sans-serif',
  fontWeight: '600',
  margin: '0',
  lineHeight: '1.4',
};

const statusText = {
  color: '#6b7280',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0',
  lineHeight: '1.5',
};

const stepsCard = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #f3f4f6',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
};


const stepsGrid = {
  display: 'grid',
  gap: '16px',
};

const stepCard = {
  backgroundColor: '#fafafa',
  borderRadius: '12px',
  padding: '16px',
  border: '1px solid #f3f4f6',
};

const stepHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '8px',
};

const stepNumberCard = {
  backgroundColor: 'transparent',
  color: '#E14874',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '600',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  flexShrink: 0,
};

const stepTitleCard = {
  color: '#E14874',
  fontSize: '16px',
  fontWeight: '600',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0',
  lineHeight: '1.4',
};

const stepDescCard = {
  color: '#6b7280',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0',
  lineHeight: '1.5',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const buttonContent = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};

const buttonIcon = {
  flexShrink: 0,
};

const primaryButton = {
  backgroundColor: 'transparent',
  borderRadius: '12px',
  color: '#E14874',
  fontSize: '16px',
  fontWeight: '600',
  fontFamily: '"Inter", Arial, sans-serif',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  border: 'none',
  marginBottom: '12px',
};

const ctaText = {
  color: '#6b7280',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0',
  lineHeight: '1.5',
};

const benefitsCard = {
  backgroundColor: '#f8fffe',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #b8f5e8',
};

const benefitsTitleContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginBottom: '20px',
};

const benefitsTitleIcon = {
  flexShrink: 0,
};

const benefitsTitle = {
  color: '#E14874',
  fontSize: '18px',
  fontFamily: '"Inter", Arial, sans-serif',
  fontWeight: '600',
  margin: '0',
  lineHeight: '1.4',
  textAlign: 'center' as const,
};


const benefitsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};

const benefitItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #f0fdf9',
};

const benefitIcon = {
  fontSize: '20px',
};

const benefitText = {
  color: '#374151',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0',
  fontWeight: '500',
  lineHeight: '1.4',
};

const supportCard = {
  backgroundColor: '#fffbeb',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '24px',
  border: '1px solid #fed7aa',
};

const supportContent = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
};

const supportIcon = {
  flexShrink: 0,
  marginTop: '2px',
};

const supportText = {
  color: '#92400e',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0',
  lineHeight: '1.5',
  textAlign: 'center' as const,
};

const signatureSection = {
  textAlign: 'center' as const,
  marginTop: '24px',
};

const signature = {
  color: '#374151',
  fontSize: '16px',
  fontFamily: '"Inter", Arial, sans-serif',
  lineHeight: '24px',
  margin: '0',
  fontWeight: '500',
};

// Feature Block Styles
const featureBlockCard = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #f3f4f6',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
};

const featureBlockTitleContainer = {
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const featureBlockTitle = {
  color: '#E14874',
  fontSize: '18px',
  fontFamily: '"Inter", Arial, sans-serif',
  fontWeight: '600',
  margin: '0',
  lineHeight: '1.4',
};

const featureGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};

const featureItem = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '8px',
  padding: '16px',
  backgroundColor: '#fafafa',
  borderRadius: '12px',
  border: '1px solid #f3f4f6',
};

const featureIconBackground = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const featureIconCircle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const featureText = {
  color: '#374151',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  fontWeight: '500',
  margin: '0',
  lineHeight: '1.4',
  textAlign: 'center' as const,
};

