/**
 * Course Introduction Email - Day 5 after registration
 */
import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  FeatureCard,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface CourseIntroductionEmailProps {
  firstName: string;
  featuredCourseTitle?: string;
  featuredCourseDescription?: string;
  coursesAvailable?: number;
  dashboardUrl?: string;
}

export default function CourseIntroductionEmail({
  firstName,
  featuredCourseTitle = 'De Perfecte Opening',
  featuredCourseDescription = 'Leer hoe je matches omzet in gesprekken',
  coursesAvailable = 8,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: CourseIntroductionEmailProps) {
  return (
    <BaseEmail preview="Ontdek onze dating cursussen - Start vandaag nog!">
      <HeroHeader
        title="Leer van de beste dating experts"
        subtitle="Je cursussen wachten op je"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          Naast de AI Coach heb je ook toegang tot <strong>{coursesAvailable} professionele cursussen</strong>.
          Van profieloptimalisatie tot gesprekstechnieken - alles wat je nodig hebt.
        </Text>

        <Section style={{
          background: 'linear-gradient(135deg, #fef3f3 0%, #fff5f5 100%)',
          borderRadius: '16px',
          padding: '24px',
          margin: '24px 0',
          border: '1px solid #fecdd3',
        }}>
          <Text style={{ fontSize: '14px', color: colors.primary, fontWeight: '600', margin: '0 0 8px 0' }}>
            AANBEVOLEN VOOR JOU
          </Text>
          <Text style={{ ...styles.heading2, margin: '0 0 8px 0' }}>
            {featuredCourseTitle}
          </Text>
          <Text style={{ ...styles.paragraph, margin: '0' }}>
            {featuredCourseDescription}
          </Text>
        </Section>

        <CTAButton href={`${dashboardUrl}?tab=courses`}>
          Bekijk alle cursussen
        </CTAButton>

        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          Wat je gaat leren:
        </Text>

        <FeatureCard
          icon="💬"
          title="Gesprekstechnieken"
          description="Van match naar date met bewezen strategieen."
        />
        <FeatureCard
          icon="📸"
          title="Profieloptimalisatie"
          description="Maak een profiel dat opvalt en matches aantrekt."
        />
        <FeatureCard
          icon="🎯"
          title="Dating Psychologie"
          description="Begrijp wat werkt en waarom in de dating wereld."
        />
        <FeatureCard
          icon="❤️"
          title="Date Voorbereiding"
          description="Van planning tot perfecte eerste indruk."
        />

        <InfoBox type="tip" title="Pro tip">
          Start met 1 cursus en pas de lessen direct toe. Theorie + praktijk = resultaat!
        </InfoBox>
      </Section>

      <EmailFooter preferencesUrl={`${dashboardUrl}/settings/email-preferences`} />
    </BaseEmail>
  );
}
