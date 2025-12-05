/**
 * Profile Optimization Reminder - Sent 24h after registration if profile incomplete
 */

import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  ProgressBar,
  InfoBox,
  FeatureCard,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface ProfileOptimizationEmailProps {
  firstName: string;
  completionPercentage: number;
  missingFields: string[];
  dashboardUrl?: string;
}

export default function ProfileOptimizationEmail({
  firstName,
  completionPercentage = 30,
  missingFields = ['Profielfoto', 'Bio tekst', 'Dating voorkeuren'],
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: ProfileOptimizationEmailProps) {
  const profileUrl = `${dashboardUrl}?tab=profile`;
  const preferencesUrl = `${dashboardUrl}/settings/email-preferences`;

  return (
    <BaseEmail preview={`${firstName}, je profiel is ${completionPercentage}% compleet - nog even door!`}>
      <HeroHeader
        title="Je profiel is bijna klaar!"
        subtitle="Nog een paar stappen naar betere resultaten"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          Je bent goed op weg! Je profiel is nu <strong>{completionPercentage}%</strong> compleet.
          Met een volledig profiel krijgt de AI Coach een veel beter beeld van jou.
        </Text>

        <Section style={{
          backgroundColor: colors.lightGray,
          borderRadius: '16px',
          padding: '24px',
          margin: '24px 0',
        }}>
          <Row>
            <Column style={{ width: '80px', textAlign: 'center', verticalAlign: 'middle' }}>
              <Text style={{
                fontSize: '36px',
                fontWeight: '700',
                color: colors.primary,
                margin: '0',
              }}>
                {completionPercentage}%
              </Text>
            </Column>
            <Column style={{ paddingLeft: '16px' }}>
              <Text style={{ ...styles.paragraph, fontWeight: '600', marginBottom: '8px', color: colors.dark }}>
                Profiel voortgang
              </Text>
              <ProgressBar progress={completionPercentage} />
            </Column>
          </Row>
        </Section>

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Dit mist nog:
        </Text>

        <Section style={{ margin: '16px 0' }}>
          {missingFields.map((field, index) => (
            <Row key={index} style={{ marginBottom: '12px' }}>
              <Column style={{ width: '32px' }}>
                <Text style={{ fontSize: '18px', margin: '0' }}>⭕</Text>
              </Column>
              <Column>
                <Text style={{ ...styles.paragraph, margin: '0' }}>{field}</Text>
              </Column>
            </Row>
          ))}
        </Section>

        <CTAButton href={profileUrl}>
          Profiel Afronden
        </CTAButton>

        <InfoBox type="tip" title="Wist je dat?">
          Gebruikers met een volledig profiel krijgen <strong>40% betere</strong> AI
          suggesties en halen gemiddeld <strong>2x meer</strong> uit hun abonnement.
        </InfoBox>

        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          Waarom dit belangrijk is:
        </Text>

        <FeatureCard
          icon="🎯"
          title="Persoonlijker advies"
          description="De AI begrijpt jouw unieke situatie en geeft relevantere tips."
        />
        <FeatureCard
          icon="💬"
          title="Betere openingszinnen"
          description="Genereer berichten die echt bij jouw persoonlijkheid passen."
        />
        <FeatureCard
          icon="📊"
          title="Slimmere analyses"
          description="Krijg diepere inzichten gebaseerd op jouw dating doelen."
        />

        <Text style={{ ...styles.paragraph, marginTop: '24px' }}>
          Duurt maar 2 minuten! 🚀
        </Text>
      </Section>

      <EmailFooter preferencesUrl={preferencesUrl} />
    </BaseEmail>
  );
}
