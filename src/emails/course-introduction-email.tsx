import * as React from 'react';
import { NotificationEmailTemplate } from '@/components/emails';

interface CourseIntroductionEmailProps {
  firstName: string;
  featuredCourseTitle?: string;
  featuredCourseDescription?: string;
  coursesAvailable?: number;
  dashboardUrl: string;
}

export const CourseIntroductionEmail = ({
  firstName = 'Dating Expert',
  featuredCourseTitle = 'De Perfecte Opening: Van Match tot Gesprek',
  featuredCourseDescription = 'Leer hoe je matches omzet in échte gesprekken met bewezen technieken',
  coursesAvailable = 12,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: CourseIntroductionEmailProps) => {
  return (
    <NotificationEmailTemplate
      userName={firstName}
      type="success"
      title="Ontdek Onze Dating Cursussen"
      message={`Je bent al 5 dagen bezig met DatingAssistent - geweldig! Tijd om je naar het volgende niveau te brengen. Gebruikers die minimaal 1 cursus afmaken hebben 3x meer dating succes. Featured cursus: ${featuredCourseTitle}.`}
      action={{
        primary: {
          text: 'Start Cursus Nu',
          url: `${dashboardUrl}/courses`,
        },
      }}
      details={[
        { label: 'Featured cursus', value: featuredCourseTitle },
        { label: 'Totale duur', value: '53 minuten' },
        { label: 'Cursussen beschikbaar', value: `${coursesAvailable}+` },
        { label: 'Succes boost', value: '3x meer matches' },
      ]}
      tips={[
        'Praktisch toepasbaar: Geen theorie, direct bruikbaar',
        'Korte modules: 10-20 minuten per les',
        'Expert kennis: Van professionele dating coaches',
        'Altijd beschikbaar: Leer wanneer jij wilt',
      ]}
    />
  );
};

export default CourseIntroductionEmail;

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
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  padding: '40px 24px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#111827',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
};

const headerSubtext = {
  color: '#6b7280',
  fontSize: '16px',
  margin: '0',
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
  margin: '24px 0 16px 0',
};

const h3 = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px 0',
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

const featuredSection = {
  backgroundColor: '#fffbeb',
  border: '2px solid #fbbf24',
  borderRadius: '12px',
  padding: '24px',
  margin: '32px 0',
};

const featuredBadge = {
  backgroundColor: '#fbbf24',
  color: '#78350f',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '4px 12px',
  borderRadius: '12px',
  display: 'inline-block',
  marginBottom: '16px',
};

const featuredDescription = {
  fontSize: '16px',
  color: '#78350f',
  lineHeight: '24px',
  margin: '12px 0 24px 0',
};

const modulesContainer = {
  margin: '24px 0',
};

const modulesTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 16px 0',
};

const moduleItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '12px',
  border: '1px solid #fde68a',
};


const moduleContent = {
  flex: 1,
};

const moduleTitle = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 4px 0',
};

const moduleDuration = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0',
};

const totalDuration = {
  textAlign: 'center' as const,
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: '1px solid #fde68a',
};

const totalDurationText = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#e14874',
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

const moreCoursesSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const courseGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  marginTop: '20px',
};

const courseCard = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
};


const courseTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 4px 0',
};

const courseSubtitle = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
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

const benefitsSection = {
  margin: '32px 0',
};

const benefitsList = {
  margin: '16px 0',
};

const benefitItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '16px',
};


const benefitText = {
  fontSize: '15px',
  color: '#374151',
  margin: '0',
  lineHeight: '22px',
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
  color: '#e14874',
  fontSize: '12px',
  textDecoration: 'none',
};

const footerSeparator = {
  color: '#d1d5db',
  fontSize: '12px',
};
