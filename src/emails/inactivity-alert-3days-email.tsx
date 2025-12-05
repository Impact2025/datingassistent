/**
 * Inactivity Alert - 3 Days
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import {
  BaseEmail,
  SimpleHeader,
  Greeting,
  CTAButton,
  FeatureCard,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface Inactivity3DaysEmailProps {
  firstName: string;
  lastActiveDate?: string;
  lastToolUsed?: string;
  dashboardUrl?: string;
}

export default function InactivityAlert3DaysEmail({
  firstName,
  lastActiveDate = 'een paar dagen geleden',
  lastToolUsed,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: Inactivity3DaysEmailProps) {
  return (
    <BaseEmail preview="We missen je! Kom je nog langs?">
      <SimpleHeader />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          We merkten dat je een paar dagen niet bent ingelogd. Alles goed?
        </Text>

        <Text style={styles.paragraph}>
          Je AI Coach staat 24/7 voor je klaar. Of je nu een vraag hebt over
          je profiel, een gesprek, of gewoon even wilt sparren - we zijn er voor je.
        </Text>

        <CTAButton href={dashboardUrl}>
          Terug naar DatingAssistent
        </CTAButton>

        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          Dit gemist je misschien:
        </Text>

        <FeatureCard
          icon="💬"
          title="Nieuwe gesprekstips"
          description="De Chat Coach heeft nieuwe technieken geleerd."
        />
        <FeatureCard
          icon="📚"
          title="Cursus updates"
          description="Nieuwe lessen zijn toegevoegd aan je cursussen."
        />
        <FeatureCard
          icon="🎯"
          title="Persoonlijke tips"
          description="Gebaseerd op je profiel hebben we suggesties."
        />

        <InfoBox type="tip" title="Quick tip">
          Stel de Chat Coach 1 vraag vandaag. Het duurt maar 30 seconden
          en kan je dating leven veranderen!
        </InfoBox>
      </Section>

      <EmailFooter preferencesUrl={`${dashboardUrl}/settings/email-preferences`} />
    </BaseEmail>
  );
}
