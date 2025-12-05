/**
 * Password Reset Email Template
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
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

interface PasswordResetEmailProps {
  firstName: string;
  resetUrl: string;
  expirationHours?: number;
}

export default function PasswordResetEmail({
  firstName,
  resetUrl,
  expirationHours = 1,
}: PasswordResetEmailProps) {
  return (
    <BaseEmail preview="Reset je wachtwoord voor DatingAssistent">
      <HeroHeader
        title="Wachtwoord Reset"
        subtitle="Je kunt een nieuw wachtwoord instellen"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          We hebben een verzoek ontvangen om je wachtwoord te resetten. Klik op de
          onderstaande knop om een nieuw wachtwoord in te stellen.
        </Text>

        <CTAButton href={resetUrl}>
          Wachtwoord Resetten
        </CTAButton>

        <InfoBox type="warning" title="Belangrijk">
          Deze link verloopt over {expirationHours} uur. Als je geen wachtwoord
          reset hebt aangevraagd, kun je deze email veilig negeren.
        </InfoBox>

        <Section style={{
          backgroundColor: colors.lightGray,
          borderRadius: '12px',
          padding: '20px',
          margin: '24px 0',
        }}>
          <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark, marginBottom: '12px' }}>
            Tips voor een sterk wachtwoord:
          </Text>
          <Text style={{ ...styles.paragraph, fontSize: '14px', margin: '0 0 8px 0' }}>
            • Gebruik minimaal 8 tekens
          </Text>
          <Text style={{ ...styles.paragraph, fontSize: '14px', margin: '0 0 8px 0' }}>
            • Combineer letters, cijfers en speciale tekens
          </Text>
          <Text style={{ ...styles.paragraph, fontSize: '14px', margin: '0' }}>
            • Gebruik geen voor de hand liggende woorden
          </Text>
        </Section>

        <Text style={{ ...styles.paragraph, fontSize: '14px', color: '#9ca3af' }}>
          Deel deze link niet met anderen. DatingAssistent zal je nooit om je
          wachtwoord vragen via email.
        </Text>
      </Section>

      <EmailFooter />
    </BaseEmail>
  );
}
