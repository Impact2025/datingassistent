// pattern-quiz-result-email.tsx
// SendGrid email template for quiz results
// Uses @react-email/components for email-safe HTML

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

type ResultType = 'secure' | 'anxious' | 'avoidant' | 'fearful';

interface PatternQuizResultEmailProps {
  name: string;
  resultType: ResultType;
  kickstartLink?: string;
}

const resultContent = {
  secure: {
    title: 'De Stabiele Basis',
    preview: 'Je Dating Patroon: De Stabiele Basis — wat dit betekent voor jou',
    intro: `Dit betekent dat je laag scoort op zowel angst als vermijding. Je voelt je comfortabel met intimiteit én met alleen zijn. Dat is een sterke uitgangspositie.`,
    honestTruth: `Als alles zo goed ging, had je deze quiz niet ingevuld.

Wat ik na 10 jaar coaching zie bij mensen met jouw patroon: je trekt de verkeerde types aan. Juist omdat jij stabiel bent, kun je aantrekkelijk zijn voor mensen die dat niet zijn. Jij wordt dan de "fixer" in de dynamiek — en dat kost je energie.`,
    trap: 'Te lang doorgaan met iemand die niet op jouw niveau zit, omdat je denkt dat je het kunt laten werken.',
    tip: `Stel binnen de eerste 3 dates de vraag: "Wat zoek je?" — en geloof het antwoord. Als iemand zegt "ik weet het nog niet", is dat ook een antwoord. Handel ernaar.`,
    ctaIntro: 'Wil je leren hoe je sneller de juiste mensen herkent — en de verkeerde eerder loslaat?',
    bullets: [
      'Dagelijkse acties die je dating aanpak transformeren',
      'De exacte vragen om intenties te checken (zonder awkward te zijn)',
      'AI-coach voor wanneer je twijfelt',
    ],
    ps: 'Reply op deze mail met je grootste dating frustratie. Ik lees alles.',
  },
  anxious: {
    title: 'De Toegewijde Zoeker',
    preview: 'Je Dating Patroon: De Toegewijde Zoeker — wat dit betekent voor jou',
    intro: `Eerst dit: er is niets mis met je.

Je hebt een sterk verlangen naar verbinding. Je geeft veel in relaties. Je bent attent, betrokken, en je let op signalen. Dit zijn sterke eigenschappen.`,
    honestTruth: `Je brein is geprogrammeerd om afwijzing te zoeken — zelfs waar die niet is. Een laat bericht wordt bewijs dat ze je niet leuk vinden. Stilte wordt een oordeel. En hoe meer je geeft, hoe onzekerder je wordt.

Dit is uitputtend. En het is niet jouw schuld.`,
    trap: 'Je trekt mensen aan die je onzekerheid voeden. Avoidant types voelen zich aangetrokken tot jouw energie — maar kunnen je nooit geven wat je nodig hebt. Dit creëert een cyclus die je leegtrekt.',
    tip: `De volgende keer dat je onrustig wordt omdat iemand niet reageert, stel jezelf deze vraag:

"Wat is het feitelijke bewijs dat ze NIET geïnteresseerd zijn?"

Niet wat je voelt. Wat is het bewijs? In 90% van de gevallen is er geen bewijs — alleen een gevoel. Leer het verschil herkennen.`,
    ctaIntro: 'Dit patroon los je niet op met één tip. Het zit diep. Het stuurt je keuzes, je reacties, je hele dating ervaring.',
    bullets: [
      'Hoe je het verschil herkent tussen intuïtie en angst',
      'Waarom je aangetrokken bent tot mensen die je onzeker maken',
      'Concrete tools om rust te vinden — zonder afhankelijk te zijn van andermans reactie',
    ],
    ps: '"Na 3 jaar swipen had ik het opgegeven. Dit programma liet me zien waarom ik steeds dezelfde fout maakte." — Marieke, 34',
  },
  avoidant: {
    title: 'De Onafhankelijke',
    preview: 'Je Dating Patroon: De Onafhankelijke — wat dit betekent voor jou',
    intro: `Je waardeert je vrijheid. Je hebt jezelf niet nodig om gelukkig te zijn — je hebt een rijk leven, interesses, een identiteit los van relaties.

Dit is een kracht. Veel mensen verliezen zichzelf in relaties; jij niet.`,
    honestTruth: `Ergens heb je geleerd dat afhankelijkheid gevaarlijk is. Dat kwetsbaarheid leidt tot pijn. Dus houd je afstand — niet omdat je mensen niet leuk vindt, maar omdat dichtbij komen oncomfortabel voelt.

Dates gaan goed tot het "serieus" wordt — dan trek je je terug. Je vindt steeds redenen waarom iemand "toch niet de juiste" is. Dit beschermt je. Maar het houdt ook echte connectie buiten de deur.`,
    trap: 'Je raakt geïnteresseerd in mensen die onbereikbaar zijn — omdat die veilig voelen. Maar zodra iemand beschikbaar is, verdwijnt de interesse. Dit is geen toeval.',
    tip: `De volgende keer dat je de neiging voelt om afstand te nemen, doe het omgekeerde: deel één ding dat je normaal voor jezelf houdt. Het hoeft niet diep te zijn. Gewoon iets echts.

Observeer wat er gebeurt — bij de ander én bij jezelf.`,
    ctaIntro: 'Je onafhankelijkheid is waardevol. Maar als je deze quiz hebt ingevuld, weet je ook: er mist iets.',
    bullets: [
      'Verbinding maken zonder jezelf te verliezen',
      'Kleine, concrete stappen op jouw tempo',
      'Begrijpen waarom je doet wat je doet',
    ],
    ps: 'Reply op deze mail als je vragen hebt. Geen chatbot — ik lees alles zelf.',
  },
  fearful: {
    title: 'De Paradox',
    preview: 'Je Dating Patroon: De Paradox — wat dit betekent voor jou',
    intro: `Dit is misschien het lastigste patroon om mee te leven. Ik zeg dat niet om je af te schrikken — ik zeg het omdat ik wil dat je weet dat ik begrijp wat je meemaakt.

Je wilt verbinding. Echt. Je verlangt naar intimiteit, naar iemand die je begrijpt, naar een relatie die voelt als thuiskomen.

Maar zodra het dichtbij komt, schiet er iets in je brein aan dat zegt: gevaar.`,
    honestTruth: `Je begint enthousiast, maar saboteert het zodra het serieus wordt. Je wisselt tussen "ik wil dit zo graag" en "ik moet hier weg". Dit is geen karakterfout. Dit is een beschermingsmechanisme dat ooit logisch was — maar nu in de weg zit.`,
    trap: 'Je saboteert relaties zodra ze serieus worden, ook al wil je diep van binnen juist dat het werkt.',
    tip: `Let de komende week op het moment dat je wilt terugtrekken van iemand. Vraag jezelf niet "waarom doe ik dit?" — dat weet je waarschijnlijk niet.

Vraag jezelf: "Waar in mijn lichaam voel ik dit?"

Het begint met het opmerken van het patroon, niet met het direct veranderen ervan.`,
    ctaIntro: 'Van de vier patronen is dit degene die je waarschijnlijk niet alleen oplost. Je hebt een externe spiegel nodig.',
    bullets: [
      'Dagelijkse begeleiding die je helpt het patroon te herkennen',
      'AI-coach voor de momenten dat het lastig wordt',
      'Community van mensen die hetzelfde meemaken',
    ],
    ps: 'Het feit dat je deze quiz hebt gedaan, betekent dat je klaar bent om iets te veranderen. Dat is al stap 1.',
  },
};

export const PatternQuizResultEmail = ({
  name = 'daar',
  resultType = 'anxious',
  kickstartLink = 'https://datingassistent.nl/prijzen',
}: PatternQuizResultEmailProps) => {
  const content = resultContent[resultType];

  return (
    <Html>
      <Head />
      <Preview>{content.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>DatingAssistent</Text>
          </Section>

          {/* Greeting */}
          <Section style={section}>
            <Text style={greeting}>Hey {name},</Text>
            <Text style={text}>
              Je hebt de quiz gedaan. Jouw patroon:{' '}
              <strong>{content.title}</strong>.
            </Text>
          </Section>

          {/* Intro */}
          <Section style={section}>
            <Text style={text}>{content.intro}</Text>
          </Section>

          {/* Honest truth */}
          <Section style={section}>
            <Text style={subheading}>Maar hier is de andere kant:</Text>
            <Text style={text}>{content.honestTruth}</Text>
          </Section>

          {/* Trap */}
          <Section style={highlightBox}>
            <Text style={highlightLabel}>⚠️ Je grootste valkuil:</Text>
            <Text style={highlightText}>{content.trap}</Text>
          </Section>

          {/* Tip */}
          <Section style={tipBox}>
            <Text style={tipLabel}>⚡ Wat je vandaag kunt doen:</Text>
            <Text style={text}>{content.tip}</Text>
          </Section>

          <Hr style={hr} />

          {/* CTA Section */}
          <Section style={section}>
            <Text style={text}>{content.ctaIntro}</Text>
            <Text style={text}>
              Het <strong>21-Dagen Kickstart Programma</strong> helpt je:
            </Text>
            <Text style={bulletList}>
              {content.bullets.map((bullet, i) => (
                <span key={i}>• {bullet}<br /></span>
              ))}
            </Text>
            <Link href={kickstartLink} style={ctaButton}>
              Start de 21-Dagen Kickstart →
            </Link>
            <Text style={priceText}>€47 | 14 dagen niet tevreden? Geld terug.</Text>
          </Section>

          <Hr style={hr} />

          {/* Sign off */}
          <Section style={section}>
            <Text style={text}>
              Tot snel,
              <br />
              <br />
              <strong>Vincent</strong>
              <br />
              DatingAssistent
            </Text>
            <Text style={psText}>P.S. {content.ps}</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Je ontvangt deze email omdat je de Dating Patroon Quiz hebt ingevuld op datingassistent.nl
              <br />
              <Link href="{{unsubscribe_link}}" style={footerLink}>
                Uitschrijven
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PatternQuizResultEmail;

// Styles
const main = {
  backgroundColor: '#f6f6f6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const header = {
  padding: '20px 0',
  borderBottom: '1px solid #eaeaea',
  marginBottom: '30px',
};

const logo = {
  fontSize: '24px',
  fontWeight: '700' as const,
  color: '#1a1a1a',
  margin: '0',
};

const section = {
  marginBottom: '24px',
};

const greeting = {
  fontSize: '18px',
  color: '#1a1a1a',
  marginBottom: '16px',
};

const text = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333',
  margin: '0 0 16px 0',
  whiteSpace: 'pre-line' as const,
};

const subheading = {
  fontSize: '16px',
  fontWeight: '600' as const,
  color: '#1a1a1a',
  marginBottom: '8px',
};

const highlightBox = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  padding: '16px 20px',
  marginBottom: '24px',
  borderRadius: '0 8px 8px 0',
};

const highlightLabel = {
  fontSize: '14px',
  fontWeight: '600' as const,
  color: '#92400e',
  margin: '0 0 8px 0',
};

const highlightText = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#78350f',
  margin: '0',
};

const tipBox = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #22c55e',
  padding: '16px 20px',
  marginBottom: '24px',
  borderRadius: '0 8px 8px 0',
};

const tipLabel = {
  fontSize: '14px',
  fontWeight: '600' as const,
  color: '#166534',
  margin: '0 0 8px 0',
};

const bulletList = {
  fontSize: '16px',
  lineHeight: '1.8',
  color: '#333',
  margin: '0 0 24px 0',
};

const ctaButton = {
  display: 'inline-block',
  backgroundColor: '#db2777',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  padding: '14px 28px',
  borderRadius: '8px',
  marginBottom: '12px',
};

const priceText = {
  fontSize: '14px',
  color: '#666',
  margin: '8px 0 0 0',
};

const hr = {
  borderColor: '#eaeaea',
  margin: '32px 0',
};

const psText = {
  fontSize: '14px',
  fontStyle: 'italic' as const,
  color: '#666',
  marginTop: '24px',
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
};

const footer = {
  marginTop: '40px',
  paddingTop: '20px',
  borderTop: '1px solid #eaeaea',
};

const footerText = {
  fontSize: '12px',
  color: '#999',
  textAlign: 'center' as const,
  lineHeight: '1.6',
};

const footerLink = {
  color: '#db2777',
  textDecoration: 'underline',
};
