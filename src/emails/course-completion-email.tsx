import * as React from 'react';
import { AchievementEmailTemplate } from '@/components/emails';

interface CourseCompletionEmailProps {
  firstName: string;
  courseTitle: string;
  completionDate: string;
  nextCourseTitle?: string;
  totalCoursesCompleted: number;
  dashboardUrl: string;
}

export const CourseCompletionEmail = ({
  firstName = 'Dating Expert',
  courseTitle = 'De Perfecte Opening: Van Match tot Gesprek',
  completionDate = '11 november 2025',
  nextCourseTitle = 'Gesprek Technieken: Van Small Talk tot Deep Connection',
  totalCoursesCompleted = 1,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: CourseCompletionEmailProps) => {
  return (
    <AchievementEmailTemplate
      userName={firstName}
      achievement={{
        title: `Cursus Afgerond: ${courseTitle}`,
        description: 'Gefeliciteerd! Je hebt weer een belangrijke stap gezet in je dating journey.',
        icon: '🎓',
        rarity: 'rare',
      }}
      stats={[
        { icon: '📚', label: 'Cursussen compleet', value: totalCoursesCompleted.toString() },
        { icon: '📅', label: 'Afgerond op', value: completionDate },
        { icon: '🏆', label: 'Certificaat', value: 'Behaald ✅' },
      ]}
      nextGoal={nextCourseTitle ? {
        title: `Volgende cursus: ${nextCourseTitle}`,
        description: 'Bouw voort op wat je hebt geleerd',
        progress: 0,
      } : undefined}
      dashboardUrl={dashboardUrl}
    />
  );
};

export default CourseCompletionEmail;

const header = {
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  padding: '40px 24px',
  textAlign: 'center' as const,
};

const celebrationIcon = {
  fontSize: '80px',
  marginBottom: '16px',
  animation: 'bounce 1s ease infinite',
};

const h1 = {
  color: '#ffffff',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
};

const headerSubtext = {
  color: '#ffffff',
  fontSize: '18px',
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

const h3 = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px 0',
};

const courseBadgeSection = {
  margin: '32px 0',
};

const courseBadge = {
  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  border: '3px solid #fbbf24',
  borderRadius: '16px',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const badgeIcon = {
  fontSize: '48px',
  marginBottom: '16px',
};

const courseTitle_style = {
  color: '#92400e',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '1.3',
};

const completionDateText = {
  fontSize: '14px',
  color: '#78350f',
  margin: '0 0 16px 0',
};

const certificateBadge = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '8px 16px',
  borderRadius: '20px',
  display: 'inline-block',
};

const statsSection = {
  backgroundColor: '#f0fdf4',
  borderRadius: '12px',
  padding: '24px',
  margin: '32px 0',
};

const statsTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#065f46',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '16px',
};

const statCard = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px 12px',
  textAlign: 'center' as const,
};

const statNumber = {
  fontSize: '40px',
  fontWeight: 'bold',
  color: '#10b981',
  marginBottom: '8px',
};

const statLabel = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
  fontWeight: '500',
  lineHeight: '16px',
};

const learningSection = {
  margin: '32px 0',
};

const learningList = {
  margin: '16px 0',
};

const learningItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '12px',
};

const learningIcon = {
  fontSize: '20px',
  color: '#10b981',
  flexShrink: 0,
  fontWeight: 'bold',
};

const learningText = {
  fontSize: '15px',
  color: '#374151',
  margin: '0',
  lineHeight: '22px',
};

const actionSection = {
  margin: '32px 0',
};

const actionBox = {
  backgroundColor: '#dbeafe',
  border: '2px solid #60a5fa',
  borderRadius: '12px',
  padding: '24px',
};

const actionTitle = {
  color: '#1e40af',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
};

const actionText = {
  fontSize: '15px',
  color: '#1e3a8a',
  margin: '0 0 16px 0',
  lineHeight: '22px',
  textAlign: 'center' as const,
};

const actionSteps = {
  margin: '16px 0',
};

const actionStep = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '8px',
};

const stepNumber = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 'bold',
  flexShrink: 0,
};

const stepText = {
  fontSize: '14px',
  color: '#111827',
  margin: '0',
  fontWeight: '500',
};

const nextCourseSection = {
  margin: '32px 0',
};

const nextCourseBox = {
  backgroundColor: '#f5f3ff',
  border: '2px solid #a78bfa',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
};

const nextCourseBadge = {
  backgroundColor: '#8b5cf6',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '4px 12px',
  borderRadius: '12px',
  display: 'inline-block',
  marginBottom: '12px',
};

const nextCourseTitle_style = {
  color: '#5b21b6',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const nextCourseDescription = {
  fontSize: '15px',
  color: '#6b21a8',
  margin: '0 0 16px 0',
  lineHeight: '22px',
};

const nextCourseButton = {
  backgroundColor: '#8b5cf6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const recommendationsSection = {
  margin: '32px 0',
};

const courseCards = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '12px',
  marginTop: '16px',
};

const courseCard = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  textAlign: 'center' as const,
};

const courseCardIcon = {
  fontSize: '32px',
  marginBottom: '8px',
};

const courseCardTitle = {
  fontSize: '15px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 4px 0',
};

const courseCardDuration = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0 0 8px 0',
};

const courseCardDescription = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0',
};

const sharingSection = {
  margin: '32px 0',
};

const sharingBox = {
  backgroundColor: '#fdf2f8',
  border: '2px solid #f9a8d4',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
};

const sharingTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#9f1239',
  margin: '0 0 8px 0',
};

const sharingText = {
  fontSize: '15px',
  color: '#831843',
  margin: '0 0 16px 0',
  lineHeight: '22px',
};

const sharingButton = {
  backgroundColor: '#ec4899',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 24px',
};

const sharingReward = {
  fontSize: '13px',
  color: '#9f1239',
  margin: '12px 0 0 0',
  fontWeight: '600',
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

const logoHeader = {
  backgroundColor: '#ffffff',
  padding: '24px 24px 16px 24px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #f3f4f6',
};

const logo = {
  height: '40px',
  width: 'auto',
  maxWidth: '200px',
};
