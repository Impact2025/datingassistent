/**
 * Subscription Cancelled Email Template
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import {
  BaseEmail,
  SimpleHeader,
  Greeting,
  CTAButton,
  InfoBox,
  StatsGrid,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface SubscriptionCancelledEmailProps {
  firstName: string;
  endDate: string;
  subscriptionType?: string;
  totalSessions?: number;
  coursesCompleted?: number;
  daysActive?: number;
  reactivateUrl?: string;
  feedbackUrl?: string;
}

export default function SubscriptionCancelledEmail({
  firstName,
  endDate,
  subscriptionType = 'Core',
  totalSessions = 0,
  coursesCompleted = 0,
  daysActive = 0,
  reactivateUrl = 'https://datingassistent.nl/prijzen',
  feedbackUrl = 'https://datingassistent.nl/feedback',
}: SubscriptionCancelledEmailProps) {
  return (
    <BaseEmail preview="Je abonnement is opgezegd - Tot snel!">
      <SimpleHeader />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          We hebben je opzegging van het {subscriptionType} abonnement verwerkt.
          Het spijt ons dat je weggaat!
        </Text>

        <Section style={{
          backgroundColor: colors.lightGray,
          borderRadius: '12px',
          padding: '24px',
          margin: '24px 0',
          textAlign: 'center' as const,
        }}>
          <Text style={{ ...styles.paragraph, margin: '0 0 8px 0' }}>
            Je hebt nog toegang tot
          </Text>
          <Text style={{ ...styles.heading1, color: colors.primary, margin: '0' }}>
            {endDate}
          </Text>
          <Text style={{ ...styles.paragraph, fontSize: '14px', margin: '8px 0 0 0' }}>
            Daarna verlies je toegang tot alle premium features
          </Text>
        </Section>

        {(totalSessions > 0 || coursesCompleted > 0 || daysActive > 0) && (
          <>
            <Text style={{ ...styles.heading2, textAlign: 'center' as const }}>
              Wat je hebt bereikt
            </Text>
            <StatsGrid
              stats={[
                { value: totalSessions.toString(), label: 'Chat sessies', icon: '💬' },
                { value: coursesCompleted.toString(), label: 'Cursussen', icon: '📚' },
                { value: daysActive.toString(), label: 'Actieve dagen', icon: '🔥' },
              ]}
            />
          </>
        )}

        <InfoBox type="tip" title="Van gedachten veranderd?">
          Je kunt op elk moment je abonnement weer activeren en verder gaan
          waar je gebleven was. Al je voortgang en data blijft bewaard.
        </InfoBox>

        <CTAButton href={reactivateUrl}>
          Abonnement Heractiveren
        </CTAButton>

        <Section style={{
          borderTop: `1px solid ${colors.lightGray}`,
          marginTop: '32px',
          paddingTop: '24px',
        }}>
          <Text style={{ ...styles.paragraph, textAlign: 'center' as const }}>
            We zouden graag weten waarom je weggaat zodat we kunnen verbeteren.
          </Text>
          <CTAButton href={feedbackUrl} variant="secondary">
            Deel je feedback
          </CTAButton>
        </Section>

        <Text style={{ ...styles.paragraph, fontSize: '14px', color: '#9ca3af', marginTop: '24px' }}>
          Heb je vragen over je opzegging? Neem contact op met{' '}
          <a href="mailto:support@datingassistent.nl" style={styles.link}>
            support@datingassistent.nl
          </a>
        </Text>
      </Section>

      <EmailFooter />
    </BaseEmail>
  );
}
