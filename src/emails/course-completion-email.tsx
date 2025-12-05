/**
 * Course Completion Celebration Email
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  AchievementBadge,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface CourseCompletionEmailProps {
  firstName: string;
  courseTitle: string;
  completionDate?: string;
  nextCourseTitle?: string;
  totalCoursesCompleted?: number;
  dashboardUrl?: string;
}

export default function CourseCompletionEmail({
  firstName,
  courseTitle,
  completionDate = new Date().toLocaleDateString('nl-NL'),
  nextCourseTitle,
  totalCoursesCompleted = 1,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: CourseCompletionEmailProps) {
  return (
    <BaseEmail preview={`Gefeliciteerd! Je hebt "${courseTitle}" voltooid!`}>
      <HeroHeader
        title="Cursus Voltooid!"
        subtitle="Geweldig gedaan - je groeit als dater!"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          <strong>Gefeliciteerd!</strong> Je hebt zojuist de cursus
          "<strong>{courseTitle}</strong>" succesvol afgerond!
        </Text>

        <AchievementBadge
          icon="🎓"
          title={`Cursus #${totalCoursesCompleted} Voltooid`}
          rarity={totalCoursesCompleted >= 5 ? 'epic' : totalCoursesCompleted >= 3 ? 'rare' : 'common'}
        />

        <Text style={styles.paragraph}>
          Je hebt nu waardevolle kennis die je direct kunt toepassen in je
          dating leven. Onthoud: kennis + actie = resultaat!
        </Text>

        {nextCourseTitle && (
          <InfoBox type="tip" title="Aanbevolen volgende cursus">
            <strong>{nextCourseTitle}</strong> - Perfect om verder te bouwen op wat je net hebt geleerd.
          </InfoBox>
        )}

        <CTAButton href={`${dashboardUrl}?tab=courses`}>
          {nextCourseTitle ? 'Start volgende cursus' : 'Bekijk meer cursussen'}
        </CTAButton>

        <Section style={{
          backgroundColor: colors.lightGray,
          borderRadius: '12px',
          padding: '24px',
          margin: '24px 0',
          textAlign: 'center',
        }}>
          <Text style={{ fontSize: '14px', color: colors.gray, margin: '0 0 8px 0' }}>
            Voltooid op
          </Text>
          <Text style={{ ...styles.heading2, margin: '0', color: colors.primary }}>
            {completionDate}
          </Text>
        </Section>

        <Text style={styles.paragraph}>
          Blijf leren en groeien. Elke cursus brengt je dichter bij je dating doelen!
        </Text>
      </Section>

      <EmailFooter preferencesUrl={`${dashboardUrl}/settings/email-preferences`} />
    </BaseEmail>
  );
}
