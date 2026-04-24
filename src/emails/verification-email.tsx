/**
 * Email Verification - Sent immediately after registration
 * DatingAssistent World-Class Email System
 */

import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  SimpleHeader,
  Greeting,
  CTAButton,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface VerificationEmailProps {
  firstName: string;
  verificationCode: string;
  verificationUrl?: string;
  expiresIn?: string;
}

export default function VerificationEmail({
  firstName,
  verificationCode,
  verificationUrl,
  expiresIn = '24 uur',
}: VerificationEmailProps) {
  const hasCode = verificationCode && verificationCode.length > 0;

  // Determine preview text based on verification type
  const previewText = hasCode
    ? `Je verificatiecode: ${verificationCode}`
    : 'Verifieer je emailadres - DatingAssistent';

  return (
    <BaseEmail preview={previewText}>
      <SimpleHeader />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        {hasCode ? (
          // Code-based verification
          <>
            <Text style={styles.paragraph}>
              Welkom bij DatingAssistent! Om je account te activeren, gebruik de
              onderstaande verificatiecode:
            </Text>

            <Section style={{
              backgroundColor: colors.cream,
              borderRadius: '16px',
              padding: '36px 32px',
              margin: '28px 0',
              textAlign: 'center',
              border: `1px solid ${colors.lightGray}`,
            }}>
              <Text style={{
                fontSize: '11px',
                color: colors.grayLight,
                margin: '0 0 20px 0',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontWeight: '600',
              }}>
                Je verificatiecode
              </Text>

              <Text style={{
                fontSize: '40px',
                fontWeight: '700',
                color: colors.dark,
                fontFamily: '"Courier New", Courier, monospace',
                letterSpacing: '10px',
                margin: '0',
                padding: '18px 28px',
                backgroundColor: colors.white,
                borderRadius: '12px',
                border: `1.5px solid ${colors.lightGray}`,
                display: 'inline-block',
              }}>
                {verificationCode}
              </Text>

              <Text style={{
                fontSize: '13px',
                color: colors.grayLight,
                margin: '20px 0 0 0',
              }}>
                Verloopt over {expiresIn}
              </Text>
            </Section>

            {verificationUrl && (
              <>
                <Text style={{ ...styles.paragraph, textAlign: 'center', color: colors.gray }}>
                  Of klik op de knop hieronder:
                </Text>
                <CTAButton href={verificationUrl}>
                  Email Verifieren
                </CTAButton>
              </>
            )}

            <InfoBox type="warning" title="Beveiligingstip">
              Deel deze code met niemand. DatingAssistent zal je nooit vragen om
              je code te delen via telefoon of chat.
            </InfoBox>
          </>
        ) : (
          // Link-based verification (no code)
          <>
            <Text style={styles.paragraph}>
              Welkom bij DatingAssistent! Om je account te activeren en te zorgen
              voor een veilige dating community, klik op de onderstaande knop om
              je emailadres te verifieren.
            </Text>

            {verificationUrl && (
              <CTAButton href={verificationUrl}>
                Email Verifieren
              </CTAButton>
            )}

            <InfoBox type="warning" title="Link verloopt">
              Deze verificatie link verloopt over {expiresIn}. Klik op de knop
              hierboven om je account direct te activeren.
            </InfoBox>
          </>
        )}

        <Text style={styles.paragraph}>
          Heb je geen account aangemaakt? Negeer dan deze email of neem
          contact op met{' '}
          <a href="mailto:info@datingassistent.nl" style={styles.link}>
            info@datingassistent.nl
          </a>.
        </Text>
      </Section>

      <EmailFooter />
    </BaseEmail>
  );
}
