/**
 * Program Enrollment Email Template
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  InfoBox,
  StepsList,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface ProgramEnrollmentEmailProps {
  firstName: string;
  programName: string;
  programSlug?: string;
  dayOneUrl: string;
  durationDays?: number;
  dailyTimeMinutes?: number;
}

export default function ProgramEnrollmentEmail({
  firstName,
  programName,
  programSlug,
  dayOneUrl,
  durationDays = 21,
  dailyTimeMinutes = 15,
}: ProgramEnrollmentEmailProps) {
  return (
    <BaseEmail preview={`Welkom bij ${programName} - Start vandaag!`}>
      <HeroHeader
        title={`Welkom bij ${programName}`}
        subtitle="Je staat op het punt een geweldige transformatie door te maken"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          Gefeliciteerd! Je hebt zojuist <strong>{programName}</strong> geactiveerd.
          Je staat op het punt om een geweldige transformatie door te maken.
        </Text>

        <Section style={{
          background: 'linear-gradient(135deg, #fef3f3 0%, #fef7f7 100%)',
          borderLeft: `4px solid ${colors.primary}`,
          borderRadius: '8px',
          padding: '24px',
          margin: '24px 0',
        }}>
          <Text style={{ ...styles.heading2, color: colors.primary, margin: '0 0 8px 0' }}>
            Je bent klaar om te starten!
          </Text>
          <Text style={{ ...styles.paragraph, margin: '0' }}>
            Je account is geactiveerd en dag 1 staat voor je klaar. Het enige
            wat je nog hoeft te doen is op de knop hieronder klikken.
          </Text>
        </Section>

        <CTAButton href={dayOneUrl}>
          Start met Dag 1
        </CTAButton>

        <Text style={{ ...styles.heading2, textAlign: 'center' as const, marginTop: '32px' }}>
          Wat kun je verwachten?
        </Text>

        <StepsList
          steps={[
            {
              title: 'Dagelijkse content',
              description: `Elke dag nieuwe praktische oefeningen gedurende ${durationDays} dagen`,
            },
            {
              title: 'Persoonlijke begeleiding',
              description: 'Directe feedback en ondersteuning van je AI coach',
            },
            {
              title: 'Meetbare resultaten',
              description: 'Voortgang tracking en concrete verbeteringen',
            },
          ]}
        />

        <InfoBox type="tip" title="Pro tip">
          Zet een dagelijkse reminder in je agenda om elke dag {dailyTimeMinutes}-20
          minuten aan je transformatie te werken. Consistentie is de sleutel tot succes!
        </InfoBox>

        <Section style={{
          backgroundColor: colors.lightGray,
          borderRadius: '12px',
          padding: '24px',
          margin: '24px 0',
          textAlign: 'center' as const,
        }}>
          <Text style={{ fontSize: '32px', margin: '0 0 12px 0' }}>📱</Text>
          <Text style={{ ...styles.heading2, margin: '0 0 8px 0' }}>
            Altijd en overal toegang
          </Text>
          <Text style={{ ...styles.paragraph, margin: '0' }}>
            Het programma werkt perfect op je telefoon, tablet én desktop.
            Werk aan je groei waar en wanneer het jou uitkomt.
          </Text>
        </Section>

        <Text style={styles.paragraph}>
          Vragen? We staan voor je klaar! Mail ons op{' '}
          <a href="mailto:support@datingassistent.nl" style={styles.link}>
            support@datingassistent.nl
          </a>
        </Text>
      </Section>

      <EmailFooter />
    </BaseEmail>
  );
}
