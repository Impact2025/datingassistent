/**
 * Welcome Email - Sent after email verification
 * DatingAssistent World-Class Email System
 */

import * as React from 'react';
import { Section, Text, Hr } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  FeatureCard,
  StepsList,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface WelcomeEmailProps {
  firstName: string;
  subscriptionType: 'sociaal' | 'core' | 'pro' | 'premium';
  dashboardUrl?: string;
}

const tierFeatures = {
  sociaal: {
    name: 'Sociaal',
    features: ['AI Dating Coach', 'Basis tools', 'Community toegang'],
    aiMessages: 15,
  },
  core: {
    name: 'Core',
    features: ['Onbeperkt AI Coach', 'Alle tools', '8+ cursussen', 'Foto analyse'],
    aiMessages: 50,
  },
  pro: {
    name: 'Pro',
    features: ['Alles van Core', 'Priority support', 'Geavanceerde analytics', 'Exclusieve content'],
    aiMessages: 100,
  },
  premium: {
    name: 'Premium',
    features: ['Alles onbeperkt', '1-op-1 coaching', 'VIP community', 'Eerste toegang nieuwe features'],
    aiMessages: 'Onbeperkt',
  },
};

export default function WelcomeEmail({
  firstName,
  subscriptionType = 'core',
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: WelcomeEmailProps) {
  const tier = tierFeatures[subscriptionType] || tierFeatures.core;
  const preferencesUrl = `${dashboardUrl}/settings/email-preferences`;

  return (
    <BaseEmail preview={`Welkom ${firstName}! Je dating journey begint nu`}>
      <HeroHeader
        title="Welkom bij DatingAssistent!"
        subtitle="Je eerste stap naar succesvol daten"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          Wat geweldig dat je er bent! Je hebt zojuist de eerste stap gezet naar
          succesvol en zelfverzekerd daten. Met je <strong>{tier.name}</strong> pakket
          heb je toegang tot alles wat je nodig hebt.
        </Text>

        <InfoBox type="success" title="Je pakket is actief">
          Je {tier.name} abonnement is nu actief met {typeof tier.aiMessages === 'number' ? `${tier.aiMessages} AI berichten per week` : 'onbeperkte AI berichten'}.
        </InfoBox>

        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          Je eerste 3 stappen:
        </Text>

        <StepsList
          steps={[
            {
              title: 'Profiel completeren (30 sec)',
              description: 'Vul je profiel aan zodat de AI je beter kan helpen met persoonlijk advies.',
            },
            {
              title: 'Eerste AI chat starten',
              description: 'Stel je eerste vraag aan de Chat Coach en krijg direct advies.',
            },
            {
              title: 'Ontdek de tools',
              description: 'Probeer de profielanalyzer of openingszinnen generator.',
            },
          ]}
        />

        <CTAButton href={dashboardUrl}>
          Start je dating avontuur
        </CTAButton>

        <Hr style={styles.divider} />

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Wat je kunt verwachten:
        </Text>

        <FeatureCard
          icon="🤖"
          title="24/7 AI Dating Coach"
          description="Stel al je dating vragen, dag en nacht. Van profiel tips tot gesprekstechnieken."
        />
        <FeatureCard
          icon="📚"
          title="8+ Expert Cursussen"
          description="Van profieloptimalisatie tot eerste date tips. Leer van dating experts."
        />
        <FeatureCard
          icon="🛠️"
          title="20+ Slimme Tools"
          description="Profiel analyzer, openingszinnen generator, foto check, en meer."
        />
        <FeatureCard
          icon="📈"
          title="89% Meer Matches"
          description="Onze gebruikers zien gemiddeld 89% meer matches na 2 weken."
        />

        <InfoBox type="tip" title="Pro tip">
          Begin met de Chat Coach - vertel over je dating situatie en krijg
          direct persoonlijk advies. Je kunt letterlijk alles vragen!
        </InfoBox>

        <Text style={{ ...styles.paragraph, marginTop: '24px' }}>
          Heb je vragen? Reply gewoon op deze email of mail naar{' '}
          <a href="mailto:support@datingassistent.nl" style={styles.link}>
            support@datingassistent.nl
          </a>
          . We helpen je graag!
        </Text>

        <Text style={styles.paragraph}>
          Succes met je dating journey!
        </Text>

        <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark }}>
          Vincent & het DatingAssistent team
        </Text>
      </Section>

      <EmailFooter preferencesUrl={preferencesUrl} />
    </BaseEmail>
  );
}
