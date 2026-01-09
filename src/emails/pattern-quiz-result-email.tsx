/**
 * Pattern Quiz Result Email
 *
 * Follow-up email sent after completing the Dating Pattern Quiz.
 * Personalized content based on attachment pattern.
 */

import * as React from 'react';
import { Section, Text, Hr } from '@react-email/components';
import {
  BaseEmail,
  PinkHeader,
  Greeting,
  CTAButton,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';
import type { AttachmentPattern } from '@/lib/quiz/pattern/pattern-types';

interface PatternQuizResultEmailProps {
  firstName: string;
  attachmentPattern: AttachmentPattern;
  resultUrl: string;
}

// Pattern-specific content
const patternContent: Record<
  AttachmentPattern,
  {
    title: string;
    subtitle: string;
    color: string;
    intro: string;
    insight: string;
    tip: string;
    nextSteps: string[];
  }
> = {
  secure: {
    title: 'De Stabiele Basis',
    subtitle: 'Veilig Gehecht',
    color: '#10b981',
    intro:
      'Je hebt een gezonde basis voor relaties. Je voelt je comfortabel met intimiteit én met onafhankelijkheid. Dit is een sterke uitgangspositie.',
    insight:
      'Maar hier is wat ik vaak zie: juist omdat jij stabiel bent, kun je aantrekkelijk zijn voor mensen die dat niet zijn. Je wordt dan de "fixer" in de dynamiek.',
    tip:
      'Stel binnen de eerste 3 dates de vraag: "Wat zoek je?" — en geloof het antwoord. Als iemand zegt "ik weet het nog niet", is dat ook een antwoord. Handel ernaar.',
    nextSteps: [
      'Dagelijkse acties die je dating aanpak transformeren',
      'De exacte vragen om intenties te checken',
      'AI-coach voor wanneer je twijfelt',
    ],
  },
  anxious: {
    title: 'De Toegewijde Zoeker',
    subtitle: 'Angstig Gehecht',
    color: '#f59e0b',
    intro:
      'Je hebt een sterk verlangen naar verbinding. Je bent attent, betrokken, en je let op signalen. Dit zijn sterke eigenschappen.',
    insight:
      'Maar je brein is geprogrammeerd om afwijzing te zoeken — zelfs waar die niet is. Een laat bericht wordt bewijs dat ze je niet leuk vinden. Dit is uitputtend.',
    tip:
      'De volgende keer dat je onrustig wordt omdat iemand niet reageert: "Wat is het feitelijke bewijs dat ze NIET geïnteresseerd zijn?" In 90% van de gevallen is er geen bewijs — alleen een gevoel.',
    nextSteps: [
      'Hoe je het verschil herkent tussen intuïtie en angst',
      'Waarom je aangetrokken bent tot mensen die je onzeker maken',
      'Concrete tools om rust te vinden',
    ],
  },
  avoidant: {
    title: 'De Onafhankelijke',
    subtitle: 'Vermijdend Gehecht',
    color: '#6366f1',
    intro:
      'Je waardeert je vrijheid en hebt een rijk leven los van relaties. Dit is een kracht die veel mensen missen.',
    insight:
      'Maar ergens heb je geleerd dat kwetsbaarheid gevaarlijk is. Dus houd je afstand — niet omdat je mensen niet leuk vindt, maar omdat dichtbij komen oncomfortabel voelt.',
    tip:
      'De volgende keer dat je de neiging voelt om afstand te nemen, doe het omgekeerde: deel één ding dat je normaal voor jezelf houdt. Observeer wat er gebeurt.',
    nextSteps: [
      'Hoe je verbinding maakt zonder jezelf te verliezen',
      'Kleine, concrete stappen richting kwetsbaarheid',
      'Op jouw tempo, zonder druk',
    ],
  },
  fearful_avoidant: {
    title: 'De Paradox',
    subtitle: 'Angstig-Vermijdend Gehecht',
    color: '#ef4444',
    intro:
      'Je wilt verbinding. Echt. Je verlangt naar intimiteit. Maar zodra het dichtbij komt, schiet er iets aan dat zegt: gevaar.',
    insight:
      'Dit is het lastigste patroon om mee te leven, maar ook het meest veranderbare. Je hebt een externe spiegel nodig.',
    tip:
      'Let de komende week op het moment dat je wilt terugtrekken. Vraag jezelf: "Waar in mijn lichaam voel ik dit?" Het begint met opmerken, niet met veranderen.',
    nextSteps: [
      'Dagelijkse begeleiding die je helpt het patroon te herkennen',
      'AI-coach voor de momenten dat het lastig wordt',
      'Kleine stappen die grote verandering brengen',
    ],
  },
};

export default function PatternQuizResultEmail({
  firstName,
  attachmentPattern,
  resultUrl = 'https://datingassistent.nl/quiz/dating-patroon/resultaat',
}: PatternQuizResultEmailProps) {
  const content = patternContent[attachmentPattern];
  const kickstartUrl = 'https://datingassistent.nl/prijzen';
  const preferencesUrl = 'https://datingassistent.nl/settings/email-preferences';

  return (
    <BaseEmail
      preview={`${firstName}, je Dating Patroon is: ${content.title}`}
    >
      <PinkHeader
        title={`Je Dating Patroon: ${content.title}`}
        subtitle={content.subtitle}
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          Je hebt de quiz gedaan. Jouw patroon: <strong>{content.title}</strong>.
        </Text>

        <InfoBox type="info" title="Wat dit betekent">
          {content.intro}
        </InfoBox>

        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          Maar hier is de andere kant:
        </Text>

        <Text style={styles.paragraph}>{content.insight}</Text>

        <InfoBox type="warning" title="Je grootste valkuil">
          Dit patroon houdt zichzelf in stand als je het niet bewust doorbreekt.
        </InfoBox>

        <InfoBox type="success" title="Wat je vandaag kunt doen">
          {content.tip}
        </InfoBox>

        <Hr style={styles.divider} />

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Klaar om dit patroon te doorbreken?
        </Text>

        <Text style={styles.paragraph}>
          In 21 dagen leer je:
        </Text>

        <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
          {content.nextSteps.map((step, index) => (
            <li
              key={index}
              style={{
                ...styles.paragraph,
                marginBottom: '8px',
                color: colors.gray,
              }}
            >
              {step}
            </li>
          ))}
        </ul>

        <CTAButton href={kickstartUrl}>
          Start de 21-Dagen Kickstart →
        </CTAButton>

        <Text style={{ textAlign: 'center' as const, color: colors.gray, fontSize: '14px', marginTop: '-16px' }}>
          €47 • 21 dagen • Direct starten
        </Text>

        <Hr style={styles.divider} />

        <Text style={styles.paragraph}>
          De komende dagen stuur ik je specifieke inzichten voor jouw type. Geen
          generieke tips — dingen die werken voor {content.title}.
        </Text>

        <Text style={{ ...styles.paragraph, marginTop: '32px' }}>
          Tot morgen,
        </Text>

        <Text
          style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark }}
        >
          Vincent
          <br />
          <span style={{ fontWeight: '400', color: colors.gray }}>
            DatingAssistent
          </span>
        </Text>

        <InfoBox type="tip" title="P.S.">
          Reply op deze mail met je grootste dating frustratie. Ik lees alles
          persoonlijk.
        </InfoBox>
      </Section>

      <EmailFooter preferencesUrl={preferencesUrl} />
    </BaseEmail>
  );
}
