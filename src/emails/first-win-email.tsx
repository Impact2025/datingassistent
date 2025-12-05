/**
 * First Win Email - Sent after user uses their first feature
 */

import * as React from 'react';
import { Section, Text } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  FeatureCard,
  InfoBox,
  AchievementBadge,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface FirstWinEmailProps {
  firstName: string;
  featureUsed?: string;
  dashboardUrl?: string;
}

const featureInfo: Record<string, { title: string; nextFeature: string; nextDescription: string }> = {
  ai_chat: {
    title: 'AI Chat Coach',
    nextFeature: 'Probeer nu de Openingszinnen Generator',
    nextDescription: 'Genereer perfecte eerste berichten gebaseerd op profielen.',
  },
  icebreaker: {
    title: 'Openingszinnen Generator',
    nextFeature: 'Probeer nu de Profiel Analyzer',
    nextDescription: 'Laat AI je dating profiel analyseren voor betere resultaten.',
  },
  photo_analysis: {
    title: 'Foto Analyse',
    nextFeature: 'Probeer nu de AI Chat Coach',
    nextDescription: 'Krijg persoonlijk advies voor elke dating situatie.',
  },
  default: {
    title: 'je eerste tool',
    nextFeature: 'Probeer de AI Chat Coach',
    nextDescription: 'Krijg persoonlijk advies voor elke dating situatie.',
  },
};

export default function FirstWinEmail({
  firstName,
  featureUsed = 'ai_chat',
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: FirstWinEmailProps) {
  const feature = featureInfo[featureUsed] || featureInfo.default;
  const preferencesUrl = `${dashboardUrl}/settings/email-preferences`;

  return (
    <BaseEmail preview={`${firstName}, je eerste stap is gezet! Hier is wat je hierna kunt doen.`}>
      <HeroHeader
        title="Je eerste stap is gezet!"
        subtitle="Geweldig bezig - hier is je volgende stap"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          <strong>Gefeliciteerd!</strong> Je hebt zojuist de <strong>{feature.title}</strong> gebruikt.
          Dit is een belangrijke eerste stap in je dating journey.
        </Text>

        <AchievementBadge
          icon="🏅"
          title="Eerste Stap Achievement"
          rarity="common"
        />

        <Text style={styles.paragraph}>
          Studies tonen aan dat mensen die actief tools gebruiken <strong>3x meer kans</strong> hebben
          op dating succes. Je bent op de goede weg!
        </Text>

        <InfoBox type="tip" title={feature.nextFeature}>
          {feature.nextDescription}
        </InfoBox>

        <CTAButton href={dashboardUrl}>
          Ontdek meer tools
        </CTAButton>

        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          Populair bij andere gebruikers:
        </Text>

        <FeatureCard
          icon="💬"
          title="Chat Coach"
          description="Stel elke dating vraag en krijg direct expert advies."
        />
        <FeatureCard
          icon="✨"
          title="Openingszinnen Generator"
          description="Nooit meer zonder woorden - genereer perfecte openers."
        />
        <FeatureCard
          icon="📸"
          title="Foto Analyse"
          description="Ontdek welke foto's het beste werken op dating apps."
        />
        <FeatureCard
          icon="📚"
          title="Expert Cursussen"
          description="Van match tot date - leer van de beste dating coaches."
        />

        <Text style={{ ...styles.paragraph, marginTop: '24px' }}>
          Blijf ontdekken en experimenteren!
        </Text>

        <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark }}>
          Veel succes!<br />
          Het DatingAssistent team
        </Text>
      </Section>

      <EmailFooter preferencesUrl={preferencesUrl} />
    </BaseEmail>
  );
}
