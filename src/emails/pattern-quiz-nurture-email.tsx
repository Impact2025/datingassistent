/**
 * Pattern Quiz Nurture Sequence Emails
 *
 * Follow-up emails sent after the initial quiz result.
 * Day 1: Founder story
 * Day 3: Quick win per pattern
 * Day 5: Case study/testimonial
 * Day 7: Urgency + last chance
 */

import * as React from 'react';
import { Section, Text, Hr } from '@react-email/components';
import {
  BaseEmail,
  PinkHeader,
  SimpleHeader,
  Greeting,
  CTAButton,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';
import type { AttachmentPattern } from '@/lib/quiz/pattern/pattern-types';

type NurtureDay = 1 | 3 | 5 | 7;

interface PatternQuizNurtureEmailProps {
  firstName: string;
  attachmentPattern: AttachmentPattern;
  day: NurtureDay;
}

// Pattern titles for reference
const patternTitles: Record<AttachmentPattern, string> = {
  secure: 'De Stabiele Basis',
  anxious: 'De Toegewijde Zoeker',
  avoidant: 'De Onafhankelijke',
  fearful_avoidant: 'De Paradox',
};

// Day 3: Quick wins per pattern
const quickWins: Record<AttachmentPattern, { title: string; content: string; example: string }> = {
  secure: {
    title: 'De "Intentie Check" Vraag',
    content: 'Stel in de eerste 3 dates deze vraag: "Wat zoek je op dit moment in dating?"',
    example: '❌ "Ik weet het niet echt" = Nog niet klaar\n❌ "We zien wel" = Geen intentie\n✅ "Ik zoek iets serieus" = Potentieel match\n\nJIJ geeft mensen vaak te veel kansen, hopend dat ze veranderen. Met deze vraag filter je VOORDAT je emotioneel investeert.',
  },
  anxious: {
    title: 'De 24-Uur Regel',
    content: 'Wanneer je onrustig wordt omdat iemand niet reageert:',
    example: '1. Kijk op de klok\n2. Geef jezelf 24 uur voordat je iets doet\n3. Na 24 uur: vraag jezelf "Is er FEITELIJK bewijs dat ze niet geïnteresseerd zijn?"\n\nJe eerste reactie is emotie. Na 24 uur komt ratio. In 90% van de gevallen is er na 24 uur geen reden meer tot paniek.',
  },
  avoidant: {
    title: 'De "Wat Houd Ik Achter?" Vraag',
    content: 'De volgende keer dat je een date hebt, vraag jezelf:',
    example: '"Wat is één ding dat ik normaal voor mezelf houd, dat ik nu zou kunnen delen?"\n\nHet hoeft niet diep te zijn:\n• "Ik vind het eigenlijk best spannend om hier te zijn"\n• "Ik ben niet zo goed in small talk"\n• Een hobby die je normaal niet noemt\n\nJouw patroon houdt mensen op afstand door weinig te delen. Eén klein ding delen voelt oncomfortabel — maar creëert verbinding.',
  },
  fearful_avoidant: {
    title: 'De Lichaamsscan',
    content: 'Wanneer je de neiging voelt om je terug te trekken van iemand:',
    example: '1. Stop\n2. Vraag: "Waar voel ik dit in mijn lichaam?"\n3. Benoem het: "Ik voel druk op mijn borst" of "Mijn schouders zijn gespannen"\n\nJouw patroon draait om automatische reacties. Je brein zegt "gevaar" voordat je kunt nadenken. Door naar je lichaam te luisteren, creëer je een pauze tussen trigger en reactie.',
  },
};

// Day 5: Case studies per pattern
const caseStudies: Record<AttachmentPattern, { name: string; age: number; story: string; outcome: string }> = {
  secure: {
    name: 'Lisa',
    age: 32,
    story: '"Ik trok steeds mensen aan die mij nodig hadden om stabiel te zijn. Ik werd de therapeut in elke relatie."',
    outcome: '"Ik leerde binnen 3 dates de juiste vragen te stellen. Niet confronterend — gewoon eerlijk. En voor het eerst in jaren date ik iemand die net zo stabiel is als ik."',
  },
  anxious: {
    name: 'Marieke',
    age: 34,
    story: '"Ik analyseerde elk bericht. Als iemand een uur niet reageerde, was ik ervan overtuigd dat ze me niet leuk vonden."',
    outcome: '"Ik leerde het verschil tussen angst en intuïtie. Mijn gevoel zei altijd \'ze wijzen je af\' — maar het bewijs zei iets anders. Die scheiding maken was alles. Nu, 8 maanden later, zit ik in een relatie met iemand die consistent is. Geen drama. Geen onzekerheid. Gewoon... rust."',
  },
  avoidant: {
    name: 'Thomas',
    age: 36,
    story: '"Elke keer als het serieus werd, vond ik een reden om te stoppen. Ze was \'toch niet de juiste\'. Of ik \'had meer tijd nodig voor mezelf\'."',
    outcome: '"De Kickstart liet me zien dat ik mezelf beschermde tegen iets dat ik eigenlijk wilde. Ik hield mensen op afstand voordat ze mij konden afwijzen. Nu deel ik kleine dingen. Niet alles — dat hoeft niet. Maar genoeg om verbinding te voelen zonder mezelf te verliezen."',
  },
  fearful_avoidant: {
    name: 'Nina',
    age: 29,
    story: '"Ik wilde verbinding. Echt. Maar zodra het dichtbij kwam, saboteerde ik het. Elke keer."',
    outcome: '"Ik leerde dat het een patroon was — niet wie ik ben. En patronen kun je doorbreken. Niet door ze te negeren, maar door ze te herkennen in het moment. Ik voel nog steeds soms de neiging om te vluchten. Maar nu kan ik het opmerken, benoemen, en een andere keuze maken."',
  },
};

export default function PatternQuizNurtureEmail({
  firstName,
  attachmentPattern,
  day,
}: PatternQuizNurtureEmailProps) {
  const patternTitle = patternTitles[attachmentPattern];
  const kickstartUrl = 'https://datingassistent.nl/prijzen';
  const preferencesUrl = 'https://datingassistent.nl/settings/email-preferences';

  // Day 1: Founder Story
  if (day === 1) {
    return (
      <BaseEmail preview="Waarom ik DatingAssistent startte (het verhaal dat ik niemand vertelde)">
        <SimpleHeader />
        <Section style={styles.content}>
          <Greeting name={firstName} />

          <Text style={styles.paragraph}>
            Gisteren kreeg je je quiz resultaat. Vandaag wil ik je iets persoonlijks vertellen.
          </Text>

          <Text style={{ ...styles.heading2, marginTop: '24px' }}>
            3 jaar geleden was ik de slechtste dater die je kunt voorstellen.
          </Text>

          <Text style={styles.paragraph}>
            Ik maakte elke fout die je kunt bedenken:
          </Text>

          <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
            <li style={{ ...styles.paragraph, marginBottom: '8px', color: colors.gray }}>
              Berichten sturen om 2 uur 's nachts (geen goed idee)
            </li>
            <li style={{ ...styles.paragraph, marginBottom: '8px', color: colors.gray }}>
              Na één date al fantaseren over onze toekomst samen
            </li>
            <li style={{ ...styles.paragraph, marginBottom: '8px', color: colors.gray }}>
              Ghosted worden en mezelf de schuld geven
            </li>
          </ul>

          <Text style={styles.paragraph}>
            Het ergste? Ik wist dat ik patronen herhaalde. Maar ik wist niet hoe ik ze kon doorbreken.
          </Text>

          <Text style={styles.paragraph}>
            Tot ik begon met het bestuderen van attachment theory, de Gottman methode, en jarenlang mensen coachte met dezelfde struggles.
          </Text>

          <InfoBox type="info" title="Wat ik ontdekte">
            Dating gaat niet over trucjes of "de juiste opening line." Het gaat over het begrijpen van je eigen patronen — en dan bewust andere keuzes maken.
          </InfoBox>

          <Text style={styles.paragraph}>
            Daarom bouwde ik DatingAssistent. Niet als zoveelste dating app. Maar als een plek waar je leert begrijpen WAAROM je doet wat je doet.
          </Text>

          <Text style={styles.paragraph}>
            Je quiz resultaat (<strong>{patternTitle}</strong>) is stap 1.
          </Text>

          <Text style={styles.paragraph}>
            Maar echte verandering? Die komt van dagelijkse actie.
          </Text>

          <CTAButton href={kickstartUrl}>
            Start de 21-Dagen Kickstart →
          </CTAButton>

          <Text style={{ textAlign: 'center' as const, color: colors.gray, fontSize: '14px', marginTop: '-16px' }}>
            €47 • Je eerste doorbraak in 21 dagen
          </Text>

          <Hr style={styles.divider} />

          <Text style={{ ...styles.paragraph, marginTop: '32px' }}>
            Tot morgen,
          </Text>

          <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark }}>
            Vincent
            <br />
            <span style={{ fontWeight: '400', color: colors.gray }}>DatingAssistent</span>
          </Text>

          <InfoBox type="tip" title="P.S.">
            Heb je vragen over je resultaat? Reply gewoon op deze mail. Ik lees alles.
          </InfoBox>
        </Section>
        <EmailFooter preferencesUrl={preferencesUrl} />
      </BaseEmail>
    );
  }

  // Day 3: Quick Win
  if (day === 3) {
    const quickWin = quickWins[attachmentPattern];

    return (
      <BaseEmail preview={`${quickWin.title} (specifiek voor jouw patroon)`}>
        <SimpleHeader />
        <Section style={styles.content}>
          <Greeting name={firstName} />

          <Text style={styles.paragraph}>
            Je quiz resultaat was "<strong>{patternTitle}</strong>."
          </Text>

          <Text style={styles.paragraph}>
            Hier is een quick win specifiek voor jou:
          </Text>

          <Text style={{ ...styles.heading2, marginTop: '24px' }}>
            {quickWin.title}
          </Text>

          <Text style={styles.paragraph}>
            {quickWin.content}
          </Text>

          <InfoBox type="success" title="Zo werkt het">
            {quickWin.example.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </InfoBox>

          <Hr style={styles.divider} />

          <Text style={styles.paragraph}>
            Dit is slechts één tip. In de 21-Dagen Kickstart krijg je elke dag dit soort concrete tools.
          </Text>

          <CTAButton href={kickstartUrl}>
            Start de 21-Dagen Kickstart →
          </CTAButton>

          <Text style={{ textAlign: 'center' as const, color: colors.gray, fontSize: '14px', marginTop: '-16px' }}>
            €47 • 21 dagen • Direct starten
          </Text>

          <Hr style={styles.divider} />

          <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark }}>
            Vincent
          </Text>
        </Section>
        <EmailFooter preferencesUrl={preferencesUrl} />
      </BaseEmail>
    );
  }

  // Day 5: Case Study
  if (day === 5) {
    const caseStudy = caseStudies[attachmentPattern];

    return (
      <BaseEmail preview={`Hoe ${caseStudy.name} haar patroon doorbrak (zelfde type als jij)`}>
        <SimpleHeader />
        <Section style={styles.content}>
          <Greeting name={firstName} />

          <Text style={styles.paragraph}>
            <strong>{caseStudy.name} ({caseStudy.age})</strong> had hetzelfde patroon als jij: {patternTitle}.
          </Text>

          <InfoBox type="info" title="Haar verhaal">
            {caseStudy.story}
          </InfoBox>

          <Text style={{ ...styles.heading2, marginTop: '24px' }}>
            Haar doorbraak:
          </Text>

          <Text style={styles.paragraph}>
            {caseStudy.outcome}
          </Text>

          <Hr style={styles.divider} />

          <Text style={styles.paragraph}>
            Het verschil? Ze stopte met hopen en begon met doen.
          </Text>

          <CTAButton href={kickstartUrl}>
            Jouw transformatie begint hier →
          </CTAButton>

          <Text style={{ textAlign: 'center' as const, color: colors.gray, fontSize: '14px', marginTop: '-16px' }}>
            €47 • 21 dagen • Direct starten
          </Text>

          <Hr style={styles.divider} />

          <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark }}>
            Vincent
          </Text>
        </Section>
        <EmailFooter preferencesUrl={preferencesUrl} />
      </BaseEmail>
    );
  }

  // Day 7: Urgency
  return (
    <BaseEmail preview={`${firstName}, één vraag voor je`}>
      <PinkHeader
        title="Één vraag voor je"
        subtitle="Een week geleden deed je de quiz..."
      />
      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          Een week geleden deed je de Dating Patroon Quiz.
        </Text>

        <Text style={styles.paragraph}>
          Je resultaat: <strong>{patternTitle}</strong>.
        </Text>

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Één vraag:
        </Text>

        <Text style={styles.paragraph}>
          <em>Wat is er sindsdien veranderd?</em>
        </Text>

        <Text style={styles.paragraph}>
          Als je eerlijk bent: waarschijnlijk niet veel.
        </Text>

        <Text style={styles.paragraph}>
          En dat is niet jouw schuld. Patronen zijn hardnekkig. Ze veranderen niet door er over te lezen. Ze veranderen door dagelijkse actie.
        </Text>

        <InfoBox type="warning" title="Daarom bouwde ik de 21-Dagen Kickstart">
          • Elke dag een korte video (max 8 min)<br />
          • Elke dag een concrete actie<br />
          • AI-coach wanneer je vastloopt
        </InfoBox>

        <Text style={styles.paragraph}>
          €47. 21 dagen. De eerste stap naar doorbreken wat je al jaren herhaalt.
        </Text>

        <CTAButton href={kickstartUrl}>
          Start vandaag nog →
        </CTAButton>

        <Text style={{ textAlign: 'center' as const, color: colors.gray, fontSize: '14px', marginTop: '-16px' }}>
          Niet tevreden? Geld terug. Geen gedoe.
        </Text>

        <Hr style={styles.divider} />

        <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark }}>
          Vincent
          <br />
          <span style={{ fontWeight: '400', color: colors.gray }}>DatingAssistent</span>
        </Text>

        <InfoBox type="tip" title="P.S.">
          Dit is de laatste email in deze serie. Daarna laat ik je met rust — ik wil niet die spammy marketeer zijn. Maar als je klaar bent voor verandering, is dit het moment.
        </InfoBox>
      </Section>
      <EmailFooter preferencesUrl={preferencesUrl} />
    </BaseEmail>
  );
}
