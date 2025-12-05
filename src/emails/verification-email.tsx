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
  const codeDigits = hasCode ? verificationCode.split('') : [];

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
              backgroundColor: colors.lightGray,
              borderRadius: '16px',
              padding: '32px',
              margin: '32px 0',
              textAlign: 'center',
            }}>
              <Text style={{
                fontSize: '14px',
                color: colors.gray,
                margin: '0 0 16px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: '500',
              }}>
                Je verificatiecode
              </Text>

              <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
                <tr>
                  {codeDigits.map((digit, index) => (
                    <td key={index} style={{ padding: '0 4px' }}>
                      <div style={{
                        backgroundColor: colors.white,
                        border: `2px solid ${colors.primary}`,
                        borderRadius: '12px',
                        width: '48px',
                        height: '56px',
                        display: 'inline-block',
                        textAlign: 'center',
                        lineHeight: '52px',
                        fontSize: '28px',
                        fontWeight: '700',
                        color: colors.primary,
                        fontFamily: 'monospace',
                      }}>
                        {digit}
                      </div>
                    </td>
                  ))}
                </tr>
              </table>

              <Text style={{
                fontSize: '13px',
                color: colors.gray,
                margin: '16px 0 0 0',
              }}>
                Deze code verloopt over {expiresIn}
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
          <a href="mailto:support@datingassistent.nl" style={styles.link}>
            support@datingassistent.nl
          </a>.
        </Text>
      </Section>

      <EmailFooter />
    </BaseEmail>
  );
}
