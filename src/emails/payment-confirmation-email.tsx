/**
 * Payment Confirmation Email Template
 */
import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface PaymentConfirmationEmailProps {
  firstName: string;
  amount: number;
  currency?: string;
  orderId: string;
  subscriptionType?: string;
  dashboardUrl?: string;
}

export default function PaymentConfirmationEmail({
  firstName,
  amount,
  currency = 'EUR',
  orderId,
  subscriptionType = 'Core',
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: PaymentConfirmationEmailProps) {
  const formattedAmount = (amount / 100).toFixed(2);

  return (
    <BaseEmail preview={`Betaling bevestigd - €${formattedAmount}`}>
      <Section style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        padding: '48px 32px',
        textAlign: 'center' as const,
      }}>
        <Text style={{ fontSize: '48px', margin: '0 0 16px 0' }}>✅</Text>
        <Text style={{ ...styles.heading1, color: colors.white, margin: '0 0 8px 0' }}>
          Betaling Bevestigd!
        </Text>
        <Text style={{ ...styles.paragraph, color: 'rgba(255,255,255,0.9)', margin: '0' }}>
          Je betaling is succesvol verwerkt
        </Text>
      </Section>

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          Geweldig nieuws! Je betaling is succesvol ontvangen en verwerkt.
          Je {subscriptionType} abonnement is nu actief en je hebt volledige
          toegang tot alle DatingAssistent features.
        </Text>

        {/* Receipt Card */}
        <Section style={{
          backgroundColor: '#f0fdf4',
          border: '2px solid #10b981',
          borderRadius: '16px',
          padding: '24px',
          margin: '24px 0',
        }}>
          <Text style={{ ...styles.heading2, color: '#065f46', textAlign: 'center' as const, marginBottom: '20px' }}>
            Betalingsoverzicht
          </Text>

          <Row style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #d1fae5' }}>
            <Column>
              <Text style={{ ...styles.paragraph, margin: '0', color: '#374151' }}>Ordernummer</Text>
            </Column>
            <Column style={{ textAlign: 'right' as const }}>
              <Text style={{ ...styles.paragraph, margin: '0', fontWeight: '600', color: '#065f46' }}>{orderId}</Text>
            </Column>
          </Row>

          <Row style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #d1fae5' }}>
            <Column>
              <Text style={{ ...styles.paragraph, margin: '0', color: '#374151' }}>Abonnement</Text>
            </Column>
            <Column style={{ textAlign: 'right' as const }}>
              <Text style={{ ...styles.paragraph, margin: '0', fontWeight: '600', color: '#065f46' }}>{subscriptionType}</Text>
            </Column>
          </Row>

          <Row style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #d1fae5' }}>
            <Column>
              <Text style={{ ...styles.paragraph, margin: '0', color: '#374151' }}>Betaalmethode</Text>
            </Column>
            <Column style={{ textAlign: 'right' as const }}>
              <Text style={{ ...styles.paragraph, margin: '0', fontWeight: '600', color: '#065f46' }}>MultiSafePay</Text>
            </Column>
          </Row>

          <Row style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #d1fae5' }}>
            <Column>
              <Text style={{ ...styles.paragraph, margin: '0', color: '#374151' }}>Status</Text>
            </Column>
            <Column style={{ textAlign: 'right' as const }}>
              <Text style={{ ...styles.paragraph, margin: '0', fontWeight: '600', color: '#10b981' }}>Betaald</Text>
            </Column>
          </Row>

          <Section style={{
            backgroundColor: '#10b981',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '16px',
            textAlign: 'center' as const,
          }}>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', margin: '0 0 4px 0' }}>
              Totaal Bedrag
            </Text>
            <Text style={{ color: colors.white, fontSize: '28px', fontWeight: '700', margin: '0' }}>
              €{formattedAmount}
            </Text>
          </Section>
        </Section>

        <Text style={styles.paragraph}>
          Je kunt nu direct beginnen met het gebruiken van alle tools en cursussen.
          Klik op de knop hieronder om naar je dashboard te gaan.
        </Text>

        <CTAButton href={dashboardUrl}>
          Start je dating avontuur
        </CTAButton>

        <Text style={{ ...styles.paragraph, fontSize: '14px', color: '#9ca3af', textAlign: 'center' as const }}>
          Dit is je digitale betalingsbewijs. Bewaar deze email voor je administratie.
        </Text>
      </Section>

      <EmailFooter />
    </BaseEmail>
  );
}
