/**
 * Pattern Quiz Result Email - Volledige persoonlijke analyse
 *
 * Verstuurd direct na het afronden van de Dating Patroon Quiz.
 * Bevat de complete analyse op basis van het hechtingspatroon,
 * inclusief scores, inzichten, valkuil, tip en CTA naar lidmaatschap.
 */

import * as React from 'react';
import { Section, Text, Hr, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  InfoBox,
  ProgressBar,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';
import { getPatternResult } from '@/lib/quiz/pattern/pattern-results';
import type { AttachmentPattern } from '@/lib/quiz/pattern/pattern-types';

interface PatternQuizResultEmailProps {
  firstName: string;
  attachmentPattern: AttachmentPattern;
  resultUrl: string;
  anxietyScore?: number;
  avoidanceScore?: number;
}

function BulletItem({ text }: { text: string }) {
  return (
    <Row style={{ marginBottom: '10px' }}>
      <Column style={{ width: '18px', verticalAlign: 'top', paddingTop: '2px' }}>
        <Text style={{ margin: '0', fontSize: '10px', color: colors.primary, fontWeight: '700', lineHeight: '1.8' }}>
          &#x25B8;
        </Text>
      </Column>
      <Column>
        <Text style={{ ...styles.paragraph, fontSize: '14px', margin: '0', color: colors.gray, lineHeight: '1.65' }}>
          {text}
        </Text>
      </Column>
    </Row>
  );
}

export default function PatternQuizResultEmail({
  firstName,
  attachmentPattern,
  resultUrl = 'https://datingassistent.nl/quiz/dating-patroon/resultaat',
  anxietyScore,
  avoidanceScore,
}: PatternQuizResultEmailProps) {
  const result = getPatternResult(attachmentPattern);
  const kickstartUrl = 'https://datingassistent.nl/prijzen';
  const transformatieUrl = 'https://datingassistent.nl/prijzen';
  const preferencesUrl = 'https://datingassistent.nl/settings/email-preferences';

  return (
    <BaseEmail
      preview={`${firstName}, je Dating Patroon: ${result.title} — je persoonlijke analyse staat klaar`}
    >
      <HeroHeader
        title={result.title}
        subtitle={result.subtitle}
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          Je hebt de Dating Patroon Quiz afgerond. Op basis van je antwoorden is jouw hechtingspatroon: <strong>{result.title}</strong>.
        </Text>

        {/* Score visualisatie */}
        {(anxietyScore !== undefined || avoidanceScore !== undefined) && (
          <Section style={{
            backgroundColor: colors.cream,
            border: `1px solid ${colors.lightGray}`,
            borderRadius: '4px',
            padding: '20px 24px',
            margin: '20px 0',
          }}>
            {anxietyScore !== undefined && (
              <ProgressBar
                progress={anxietyScore}
                label={`Angst dimensie — ${anxietyScore}%`}
              />
            )}
            {avoidanceScore !== undefined && (
              <ProgressBar
                progress={avoidanceScore}
                label={`Vermijding dimensie — ${avoidanceScore}%`}
              />
            )}
          </Section>
        )}

        {/* Opening */}
        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          {result.opening.headline}
        </Text>
        <Text style={styles.paragraph}>
          {result.opening.paragraph}
        </Text>

        {/* Nuance */}
        <InfoBox type="info" title={result.nuance.headline}>
          {result.nuance.paragraph}
        </InfoBox>

        {/* Patroon uitgelegd */}
        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          {result.patternExplained.headline}
        </Text>
        <Text style={{ ...styles.paragraph, marginBottom: '16px' }}>
          {result.patternExplained.paragraph}
        </Text>
        <Section style={{ margin: '0 0 8px 0' }}>
          {result.patternExplained.bullets.map((bullet, index) => (
            <BulletItem key={index} text={bullet} />
          ))}
        </Section>

        <Hr style={styles.divider} />

        {/* Grootste valkuil */}
        <InfoBox type="warning" title={result.mainPitfall.headline}>
          {result.mainPitfall.paragraph}
        </InfoBox>

        {/* Concrete tip */}
        <InfoBox type="tip" title={result.concreteTip.headline}>
          {result.concreteTip.tip}
        </InfoBox>

        <Hr style={{ ...styles.divider, margin: '32px 0' }} />

        {/* CTA sectie */}
        <Text style={{ ...styles.heading2, marginTop: '0' }}>
          {result.ctaSection.headline}
        </Text>

        <Text style={styles.paragraph}>
          {result.ctaSection.paragraph}
        </Text>

        {result.ctaSection.bullets && (
          <Section style={{ margin: '0 0 24px 0' }}>
            {result.ctaSection.bullets.map((bullet, index) => (
              <BulletItem key={index} text={bullet} />
            ))}
          </Section>
        )}

        <CTAButton href={kickstartUrl}>
          {result.ctaSection.buttonText}
        </CTAButton>

        <Text style={{ textAlign: 'center' as const, color: colors.grayLight, fontSize: '13px', marginTop: '-16px' }}>
          47 euro &mdash; 21 dagen &mdash; Direct starten
        </Text>

        {result.ctaSection.buttonTextSecondary && (
          <Text style={{ textAlign: 'center' as const, color: colors.gray, fontSize: '13px', marginTop: '16px' }}>
            Of kies voor de complete begeleiding:{' '}
            <a href={transformatieUrl} style={{ color: colors.primary, textDecoration: 'none', fontWeight: '500' }}>
              {result.ctaSection.buttonTextSecondary} Transformatie &mdash; 147 euro
            </a>
          </Text>
        )}

        {/* Testimonial */}
        {result.ctaSection.testimonial && (
          <Section style={{
            backgroundColor: colors.cream,
            border: `1px solid ${colors.lightGray}`,
            borderRadius: '4px',
            padding: '20px 24px',
            margin: '24px 0',
          }}>
            <Text style={{ ...styles.paragraph, fontStyle: 'italic', color: colors.gray, margin: '0 0 10px 0' }}>
              &ldquo;{result.ctaSection.testimonial.quote}&rdquo;
            </Text>
            <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark, margin: '0', fontSize: '13px' }}>
              &mdash; {result.ctaSection.testimonial.name}, {result.ctaSection.testimonial.age} jaar
            </Text>
          </Section>
        )}

        <Hr style={styles.divider} />

        {/* Bekijk online */}
        <CTAButton href={resultUrl} variant="secondary">
          Bekijk je analyse online
        </CTAButton>

        <Text style={{ ...styles.paragraph, marginTop: '32px' }}>
          Tot morgen,
        </Text>

        <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark }}>
          Vincent
          <br />
          <span style={{ fontWeight: '400', color: colors.gray }}>
            DatingAssistent
          </span>
        </Text>

        <InfoBox type="tip" title="P.S.">
          Reply op deze mail met je grootste dating frustratie. Ik lees alles persoonlijk.
        </InfoBox>
      </Section>

      <EmailFooter preferencesUrl={preferencesUrl} />
    </BaseEmail>
  );
}
