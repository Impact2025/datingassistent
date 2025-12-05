/**
 * Mid Trial Check - 2 weeks review
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  StatsGrid,
  ProgressBar,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface MidTrialCheckEmailProps {
  firstName: string;
  daysActive?: number;
  toolsUsed?: number;
  coursesCompleted?: number;
  subscriptionType?: string;
  dashboardUrl?: string;
}

export default function MidTrialCheckEmail({
  firstName,
  daysActive = 14,
  toolsUsed = 5,
  coursesCompleted = 2,
  subscriptionType = 'core',
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: MidTrialCheckEmailProps) {
  const engagementScore = Math.min(100, (toolsUsed * 10) + (coursesCompleted * 20) + (daysActive * 2));

  return (
    <BaseEmail preview="Je bent 2 weken bezig - Hoe gaat het?">
      <HeroHeader
        title="2 Weken Check-in"
        subtitle="Halverwege - tijd voor een update!"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          Je bent nu 2 weken onderweg met DatingAssistent. Laten we kijken
          hoe je ervoor staat en wat je nog kunt ontdekken.
        </Text>

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Je engagement score:
        </Text>
        <ProgressBar progress={engagementScore} label={`${engagementScore}/100 punten`} />

        <StatsGrid
          stats={[
            { value: String(daysActive), label: 'Dagen actief', icon: '📅' },
            { value: String(toolsUsed), label: 'Tools gebruikt', icon: '🛠️' },
            { value: String(coursesCompleted), label: 'Cursussen klaar', icon: '📚' },
          ]}
        />

        {engagementScore < 50 ? (
          <InfoBox type="warning" title="Je mist nog veel!">
            Je hebt nog niet alle features ontdekt. Er is zoveel meer dat
            je kan helpen met je dating journey. Probeer deze week eens
            een nieuwe tool of cursus!
          </InfoBox>
        ) : engagementScore < 80 ? (
          <InfoBox type="info" title="Goed bezig!">
            Je bent op de goede weg. Blijf zo doorgaan en je zult binnenkort
            resultaten zien in je dating leven.
          </InfoBox>
        ) : (
          <InfoBox type="success" title="Power user!">
            Wow, je haalt echt alles uit je abonnement! Je bent een
            voorbeeld voor andere gebruikers.
          </InfoBox>
        )}

        <CTAButton href={dashboardUrl}>
          Naar mijn dashboard
        </CTAButton>

        <Text style={styles.paragraph}>
          Heb je vragen of feedback? We horen graag van je! Reply gewoon
          op deze email.
        </Text>
      </Section>

      <EmailFooter preferencesUrl={`${dashboardUrl}/settings/email-preferences`} />
    </BaseEmail>
  );
}
