/**
 * Weekly Check-in Email - Day 7 after registration
 */
import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  StatsGrid,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface WeeklyCheckinEmailProps {
  firstName: string;
  daysActive?: number;
  toolsUsed?: number;
  coursesStarted?: number;
  aiMessagesUsed?: number;
  dashboardUrl?: string;
  feedbackUrl?: string;
}

export default function WeeklyCheckinEmail({
  firstName,
  daysActive = 7,
  toolsUsed = 3,
  coursesStarted = 1,
  aiMessagesUsed = 12,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
  feedbackUrl = 'https://datingassistent.nl/feedback',
}: WeeklyCheckinEmailProps) {
  return (
    <BaseEmail preview="Je eerste week is voorbij - Hoe gaat het?">
      <HeroHeader
        title="Je eerste week samengevat"
        subtitle="Kijk wat je allemaal hebt bereikt!"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          Een week geleden begon je je dating journey met DatingAssistent.
          Hier is wat je hebt bereikt:
        </Text>

        <StatsGrid
          stats={[
            { value: String(daysActive), label: 'Dagen actief', icon: '📅' },
            { value: String(toolsUsed), label: 'Tools gebruikt', icon: '🛠️' },
            { value: String(aiMessagesUsed), label: 'AI chats', icon: '💬' },
          ]}
        />

        <Text style={styles.paragraph}>
          {toolsUsed >= 3
            ? 'Geweldig! Je bent goed op weg. Blijf zo doorgaan!'
            : 'Er is nog zoveel te ontdekken. Probeer deze week meer tools!'}
        </Text>

        <CTAButton href={dashboardUrl}>
          Ga naar je dashboard
        </CTAButton>

        <InfoBox type="info" title="We horen graag van je">
          Hoe bevalt DatingAssistent tot nu toe? Je feedback helpt ons om
          de ervaring te verbeteren voor iedereen.
        </InfoBox>

        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <a href={feedbackUrl} style={{ ...styles.link, fontSize: '14px' }}>
            Geef feedback (1 minuut)
          </a>
        </Section>
      </Section>

      <EmailFooter preferencesUrl={`${dashboardUrl}/settings/email-preferences`} />
    </BaseEmail>
  );
}
