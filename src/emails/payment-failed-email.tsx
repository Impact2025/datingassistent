/**
 * Payment Failed Alert
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
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

interface PaymentFailedEmailProps {
  firstName: string;
  subscriptionType?: string;
  amount?: number;
  failureReason?: string;
  retryDate?: string;
  daysUntilSuspension?: number;
  dashboardUrl?: string;
}

export default function PaymentFailedEmail({
  firstName,
  subscriptionType = 'Core',
  amount = 19.95,
  failureReason,
  retryDate,
  daysUntilSuspension = 3,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: PaymentFailedEmailProps) {
  return (
    <BaseEmail preview="Actie vereist: Probleem met je betaling">
      <SimpleHeader />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Section style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '24px',
          margin: '24px 0',
        }}>
          <Text style={{ ...styles.heading2, color: '#dc2626', margin: '0 0 8px 0' }}>
            Betaling mislukt
          </Text>
          <Text style={{ ...styles.paragraph, margin: '0' }}>
            We konden je betaling van <strong>€{amount.toFixed(2)}</strong> voor je
            {subscriptionType} abonnement niet verwerken.
          </Text>
        </Section>

        {failureReason && (
          <Text style={styles.paragraph}>
            <strong>Reden:</strong> {failureReason}
          </Text>
        )}

        <Text style={styles.paragraph}>
          Om te voorkomen dat je toegang verliest, update je betaalmethode
          binnen <strong>{daysUntilSuspension} dagen</strong>.
        </Text>

        <CTAButton href={`${dashboardUrl}/settings/billing`}>
          Betaalmethode updaten
        </CTAButton>

        {retryDate && (
          <InfoBox type="info" title="Automatische retry">
            We proberen de betaling automatisch opnieuw op {retryDate}.
            Update je gegevens voor die tijd om onderbreking te voorkomen.
          </InfoBox>
        )}

        <Text style={{ ...styles.paragraph, marginTop: '24px' }}>
          Heb je hulp nodig? Neem contact op met{' '}
          <a href="mailto:billing@datingassistent.nl" style={styles.link}>
            billing@datingassistent.nl
          </a>
        </Text>
      </Section>

      <EmailFooter />
    </BaseEmail>
  );
}
