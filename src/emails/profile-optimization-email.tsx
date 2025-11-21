import * as React from 'react';
import { NotificationEmailTemplate } from '@/components/emails';

interface ProfileOptimizationEmailProps {
  firstName: string;
  completionPercentage: number;
  missingFields: string[];
  dashboardUrl: string;
}

export const ProfileOptimizationEmail = ({
  firstName = 'Dating Expert',
  completionPercentage = 30,
  missingFields = ['Profielfoto', 'Bio tekst', 'Dating voorkeuren'],
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: ProfileOptimizationEmailProps) => {
  const missingFieldsText = missingFields.join(', ');

  return (
    <NotificationEmailTemplate
      userName={firstName}
      type="warning"
      title="Je profiel is nog niet compleet"
      message={`Je profiel is nu ${completionPercentage}% compleet. Een compleet profiel geeft 89% meer matches! Laten we de ontbrekende informatie toevoegen: ${missingFieldsText}.`}
      action={{
        primary: {
          text: 'Maak Profiel Compleet',
          url: dashboardUrl,
        },
      }}
      details={[
        { label: 'Huidig compleet', value: `${completionPercentage}%` },
        { label: 'Ontbrekende velden', value: missingFields.length.toString() },
        { label: 'Geschatte tijd', value: '2-3 minuten' },
        { label: 'Potentiële verbetering', value: '+89% matches' },
      ]}
      tips={[
        'Voeg een duidelijke profielfoto toe voor betere eerste indruk',
        'Schrijf een authentieke bio die je persoonlijkheid laat zien',
        'Stel je dating voorkeuren in voor relevantere matches',
        'Een compleet profiel wordt vaker getoond door dating apps',
      ]}
    />
  );
};

export default ProfileOptimizationEmail;

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
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  padding: '40px 24px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
};

const headerSubtext = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
  opacity: 0.9,
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

const h3 = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px 0',
};

const progressSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const progressTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px 0',
};

const progressBar = {
  backgroundColor: '#e5e7eb',
  height: '12px',
  borderRadius: '6px',
  overflow: 'hidden',
  margin: '0 0 12px 0',
};

const progressFill = {
  backgroundColor: '#8b5cf6',
  height: '100%',
  borderRadius: '6px',
  transition: 'width 0.3s ease',
};

const progressSubtext = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const whySection = {
  margin: '32px 0',
};

const benefitsList = {
  margin: '16px 0',
};

const benefitItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  marginBottom: '16px',
};

const benefitIcon = {
  fontSize: '32px',
  flexShrink: 0,
};

const benefitTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 4px 0',
};

const benefitText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const checklistSection = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const checklist = {
  margin: '16px 0',
};

const checklistItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '12px',
};

const checklistIcon = {
  fontSize: '20px',
  color: '#f59e0b',
  fontWeight: 'bold',
};

const checklistText = {
  fontSize: '16px',
  color: '#111827',
  margin: '0',
  fontWeight: '500',
};

const checklistFooter = {
  fontSize: '14px',
  color: '#92400e',
  margin: '16px 0 0 0',
  fontStyle: 'italic',
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

const testimonialSection = {
  margin: '32px 0',
};

const testimonial = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #10b981',
  borderRadius: '8px',
  padding: '20px',
};

const testimonialQuote = {
  fontSize: '16px',
  fontStyle: 'italic',
  color: '#065f46',
  margin: '0 0 8px 0',
};

const testimonialAuthor = {
  fontSize: '14px',
  color: '#047857',
  margin: '0',
  fontWeight: '600',
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
