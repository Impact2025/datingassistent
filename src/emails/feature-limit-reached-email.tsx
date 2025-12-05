/**
 * Feature Limit Reached - Upsell Email
 */
import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
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

interface FeatureLimitReachedEmailProps {
  firstName: string;
  featureType?: string;
  currentLimit?: number;
  usageThisWeek?: number;
  subscriptionType?: string;
  resetDate?: string;
  dashboardUrl?: string;
}

const featureNames: Record<string, string> = {
  ai_messages: 'AI berichten',
  photo_analysis: 'Foto analyses',
  icebreakers: 'Openingszinnen',
};

export default function FeatureLimitReachedEmail({
  firstName,
  featureType = 'ai_messages',
  currentLimit = 25,
  usageThisWeek = 25,
  subscriptionType = 'Sociaal',
  resetDate,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: FeatureLimitReachedEmailProps) {
  const featureName = featureNames[featureType] || featureType;

  return (
    <BaseEmail preview={`Je hebt je ${featureName} limiet bereikt`}>
      <SimpleHeader />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          Je hebt je wekelijkse limiet van <strong>{currentLimit} {featureName}</strong> bereikt.
          Dit laat zien dat je actief bezig bent met je dating journey!
        </Text>

        <Section style={{
          backgroundColor: colors.lightGray,
          borderRadius: '12px',
          padding: '24px',
          margin: '24px 0',
          textAlign: 'center',
        }}>
          <Text style={{ ...styles.statValue, marginBottom: '8px' }}>
            {usageThisWeek}/{currentLimit}
          </Text>
          <Text style={{ ...styles.paragraph, margin: '0' }}>
            {featureName} deze week gebruikt
          </Text>
          {resetDate && (
            <Text style={{ ...styles.paragraph, margin: '12px 0 0 0', fontSize: '14px' }}>
              Reset op: {resetDate}
            </Text>
          )}
        </Section>

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Wil je meer?
        </Text>

        <Text style={styles.paragraph}>
          Upgrade naar een hoger pakket voor meer {featureName} en extra features:
        </Text>

        <FeatureCard
          icon="💬"
          title="Core - €19.95/maand"
          description="50 AI berichten per week + alle cursussen"
        />
        <FeatureCard
          icon="⭐"
          title="Pro - €29.95/maand"
          description="100 AI berichten per week + priority support"
        />
        <FeatureCard
          icon="👑"
          title="Premium - €49.95/maand"
          description="Onbeperkt alles + 1-op-1 coaching"
        />

        <CTAButton href={`${dashboardUrl}/pricing`}>
          Bekijk upgrade opties
        </CTAButton>

        <InfoBox type="tip" title="Tip">
          Als je je vragen slim formuleert, kun je meer uit elk AI bericht halen.
          Probeer specifieke, gedetailleerde vragen te stellen.
        </InfoBox>
      </Section>

      <EmailFooter preferencesUrl={`${dashboardUrl}/settings/email-preferences`} />
    </BaseEmail>
  );
}
