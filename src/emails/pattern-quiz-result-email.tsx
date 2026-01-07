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
  HeroHeader,
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
    nextSteps: [
      'Herken sneller wanneer iemand niet op jouw niveau zit',
      'Stel binnen 3 dates de vraag: "Wat zoek je?"',
      'Geloof het antwoord — ook als dat "ik weet het niet" is',
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
    nextSteps: [
      'Leer het verschil tussen intuïtie en angst',
      'Stel jezelf de vraag: "Wat is het feitelijke bewijs?"',
      'Bouw rust op die niet afhankelijk is van andermans reactie',
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
    nextSteps: [
      'Probeer kleine stappen richting kwetsbaarheid',
      'Deel één ding dat je normaal voor jezelf houdt',
      'Observeer wat er gebeurt — bij de ander én bij jezelf',
    ],
  },
  fearful_avoidant: {
    title: 'De Paradox',
    subtitle: 'Angstig-Vermijdend Gehecht',
    color: '#ef4444',
    intro:
      'Je wilt verbinding. Echt. Je verlangt naar intimiteit. Maar zodra het dichtbij komt, schiet er iets aan dat zegt: gevaar.',
    insight:
      'Dit is het lastigste patroon om mee te leven, maar ook het meest veranderbare. Juist omdat het aangeleerd is, kan het ook afgeleerd worden.',
    nextSteps: [
      'Herken het push-pull patroon in je gedrag',
      'Let op waar in je lichaam je de neiging voelt om terug te trekken',
      'Overweeg begeleiding — dit patroon los je moeilijk alleen op',
    ],
  },
};

export default function PatternQuizResultEmail({
  firstName,
  attachmentPattern,
  resultUrl = 'https://datingassistent.nl/quiz/dating-patroon/resultaat',
}: PatternQuizResultEmailProps) {
  const content = patternContent[attachmentPattern];
  const transformatieUrl = 'https://datingassistent.nl/transformatie';
  const preferencesUrl = 'https://datingassistent.nl/settings/email-preferences';

  return (
    <BaseEmail
      preview={`${firstName}, je Dating Patroon is: ${content.title}`}
    >
      <HeroHeader
        title={`Je Dating Patroon: ${content.title}`}
        subtitle={content.subtitle}
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          Je hebt de quiz gedaan. Je bent <strong>{content.title}</strong>.
        </Text>

        <Text style={styles.paragraph}>
          Ik weet dat dit misschien confronterend is. Of misschien dacht je: "ja,
          dit klopt precies."
        </Text>

        <InfoBox type="info" title="Jouw patroon in het kort">
          {content.intro}
        </InfoBox>

        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          Hier is wat ik wil dat je weet:
        </Text>

        <Text style={styles.paragraph}>{content.insight}</Text>

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Wat je kunt doen:
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

        <CTAButton href={resultUrl}>Bekijk je volledige resultaat</CTAButton>

        <Hr style={styles.divider} />

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Een patroon herkennen is stap 1.
        </Text>

        <Text style={styles.paragraph}>
          Het veranderen is stap 2. De meeste mensen blijven hangen bij stap 1.
          Ze lezen hun resultaat, knikken, en gaan door met wat ze altijd deden.
          Over 6 maanden zitten ze nog steeds vast.
        </Text>

        <Text style={styles.paragraph}>
          <strong>Ik wil je helpen naar stap 2.</strong>
        </Text>

        <Text style={styles.paragraph}>
          De komende dagen stuur ik je specifieke inzichten voor jouw type. Geen
          generieke tips — dingen die werken voor {content.title} en niet voor
          de andere drie.
        </Text>

        <Text style={styles.paragraph}>
          Maar als je nu al weet dat je klaar bent voor actie:
        </Text>

        <CTAButton href={transformatieUrl}>
          Bekijk het Transformatie Programma
        </CTAButton>

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
