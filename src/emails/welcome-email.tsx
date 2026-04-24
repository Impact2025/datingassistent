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
  FeatureItem,
  StepsList,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface WelcomeEmailProps {
  firstName: string;
  subscriptionType: 'sociaal' | 'core' | 'pro' | 'premium' | 'kickstart' | 'transformatie' | 'vip' | 'free';
  dashboardUrl?: string;
}

const tierFeatures: Record<string, { name: string; features: string[]; aiMessages: number | string }> = {
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
  kickstart: {
    name: '21-Dagen Kickstart',
    features: ['21 dagen dagelijks programma', 'Persoonlijke AI begeleiding', 'Praktische oefeningen', 'Voortgang tracking'],
    aiMessages: 'Onbeperkt (21 dagen)',
  },
  transformatie: {
    name: 'De Transformatie',
    features: ['90 dagen dagelijks programma', 'Persoonlijke AI begeleiding', 'Video modules & live Q&A', 'Meetbare resultaten'],
    aiMessages: 'Onbeperkt (90 dagen)',
  },
  vip: {
    name: 'VIP',
    features: ['Alles onbeperkt', '1-op-1 VIP coaching', 'Exclusieve content', 'Directe coach toegang'],
    aiMessages: 'Onbeperkt',
  },
  free: {
    name: 'Gratis',
    features: ['Basis AI Dating Coach', 'Kennisbank toegang'],
    aiMessages: 5,
  },
};

const isProgramSubscription = (type: string) =>
  type === 'kickstart' || type === 'transformatie';

export default function WelcomeEmail({
  firstName,
  subscriptionType = 'core',
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: WelcomeEmailProps) {
  const tier = tierFeatures[subscriptionType] || tierFeatures.free;
  const preferencesUrl = `${dashboardUrl}/settings/email-preferences`;
  const isProgram = isProgramSubscription(subscriptionType);

  const programSteps =
    subscriptionType === 'transformatie'
      ? [
          { title: 'Start Dag 1 van De Transformatie', description: 'Je programma staat klaar. Ga naar je dashboard en klik op "Start Dag 1".' },
          { title: 'Dagelijks 15-20 minuten', description: 'Werk elke dag aan je transformatie. Consistentie is de sleutel tot succes.' },
          { title: 'AI coach voor al je vragen', description: 'Stel vragen aan de AI coach wanneer je twijfelt of meer wilt weten.' },
        ]
      : subscriptionType === 'kickstart'
      ? [
          { title: 'Start Dag 1 van de 21-Dagen Kickstart', description: 'Je programma staat klaar. Ga naar je dashboard en klik op "Start Dag 1".' },
          { title: 'Dagelijks 15-20 minuten', description: 'Werk elke dag aan je dating skills. 21 dagen consequent voor echte resultaten.' },
          { title: 'AI coach voor al je vragen', description: 'Stel vragen aan de AI coach wanneer je twijfelt of meer wilt weten.' },
        ]
      : [
          { title: 'Profiel completeren (30 sec)', description: 'Vul je profiel aan zodat de AI je beter kan helpen met persoonlijk advies.' },
          { title: 'Eerste AI chat starten', description: 'Stel je eerste vraag aan de Chat Coach en krijg direct advies.' },
          { title: 'Ontdek de tools', description: 'Probeer de profielanalyzer of openingszinnen generator.' },
        ];

  return (
    <BaseEmail preview={`Welkom ${firstName}! ${isProgram ? `Je ${tier.name} programma staat klaar` : 'Je dating journey begint nu'}`}>
      <HeroHeader
        title={isProgram ? `Welkom bij ${tier.name}!` : 'Welkom bij DatingAssistent!'}
        subtitle={isProgram ? 'Je programma staat klaar — start vandaag nog' : 'Je eerste stap naar succesvol daten'}
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          {isProgram
            ? <>Gefeliciteerd! Je hebt zojuist <strong>{tier.name}</strong> geactiveerd. Je staat op het punt een geweldige transformatie door te maken.</>
            : <>Wat geweldig dat je er bent! Je hebt zojuist de eerste stap gezet naar succesvol en zelfverzekerd daten. Met je <strong>{tier.name}</strong> pakket heb je toegang tot alles wat je nodig hebt.</>
          }
        </Text>

        <InfoBox type="success" title={isProgram ? `${tier.name} is geactiveerd` : 'Je pakket is actief'}>
          {isProgram
            ? `Je ${tier.name} programma is nu actief. Ga direct aan de slag!`
            : `Je ${tier.name} abonnement is nu actief met ${typeof tier.aiMessages === 'number' ? `${tier.aiMessages} AI berichten per week` : 'onbeperkte AI berichten'}.`
          }
        </InfoBox>

        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          {isProgram ? 'Zo ga je van start:' : 'Je eerste 3 stappen:'}
        </Text>

        <StepsList steps={programSteps} />

        <CTAButton href={dashboardUrl}>
          {isProgram ? 'Naar je programma' : 'Naar je dashboard'}
        </CTAButton>

        <Hr style={styles.divider} />

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Wat je kunt verwachten:
        </Text>

        {isProgram && subscriptionType === 'transformatie' ? (
          <>
            <FeatureItem title="90 dagen dagelijks programma" description="Elke dag nieuwe content en oefeningen die je dating aanpak stap voor stap transformeren." />
            <FeatureItem title="Persoonlijke AI begeleiding" description="Directe feedback en ondersteuning van je AI coach — wanneer jij het nodig hebt." />
            <FeatureItem title="Video modules & live Q&A" description="Diepgaande video lessen plus live sessies om al je vragen te beantwoorden." />
            <FeatureItem title="Meetbare resultaten" description="Voortgang tracking zodat je precies ziet hoe ver je bent gekomen." />
          </>
        ) : isProgram && subscriptionType === 'kickstart' ? (
          <>
            <FeatureItem title="21 dagen dagelijks programma" description="Elke dag een concrete stap die je direct kunt toepassen in je dating leven." />
            <FeatureItem title="Persoonlijke AI begeleiding" description="Directe feedback en ondersteuning van je AI coach — wanneer jij het nodig hebt." />
            <FeatureItem title="Praktische oefeningen" description="Geen theorie maar acties — wat werkt voor jou, nu." />
            <FeatureItem title="Voortgang tracking" description="Zie elke dag hoe je groeit en wat het volgende doel is." />
          </>
        ) : (
          <>
            <FeatureItem title="24/7 AI Dating Coach" description="Stel al je dating vragen, dag en nacht. Van profiel tips tot gesprekstechnieken." />
            <FeatureItem title="8+ Expert Cursussen" description="Van profieloptimalisatie tot eerste date tips. Leer van dating experts." />
            <FeatureItem title="20+ Slimme Tools" description="Profiel analyzer, openingszinnen generator, foto check, en meer." />
            <FeatureItem title="89% Meer Matches" description="Onze gebruikers zien gemiddeld 89% meer matches na 2 weken." />
          </>
        )}

        <InfoBox type="tip" title="Pro tip">
          {isProgram
            ? 'Zet een dagelijkse reminder in je agenda voor 15-20 minuten. Consistentie is de sleutel tot succes!'
            : 'Begin met de Chat Coach - vertel over je dating situatie en krijg direct persoonlijk advies. Je kunt letterlijk alles vragen!'
          }
        </InfoBox>

        <Text style={{ ...styles.paragraph, marginTop: '24px' }}>
          Heb je vragen? Reply gewoon op deze email of mail naar{' '}
          <a href="mailto:info@datingassistent.nl" style={styles.link}>
            info@datingassistent.nl
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
