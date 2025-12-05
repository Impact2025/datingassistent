/**
 * Subscription Renewal Reminder - 7 days before
 */
import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  SimpleHeader,
  Greeting,
  CTAButton,
  StatsGrid,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface SubscriptionRenewalEmailProps {
  firstName: string;
  subscriptionType?: string;
  renewalDate?: string;
  daysUntilRenewal?: number;
  monthlyPrice?: number;
  statsThisMonth?: {
    toolsUsed: number;
    aiMessages: number;
    coursesCompleted: number;
  };
  dashboardUrl?: string;
}

export default function SubscriptionRenewalEmail({
  firstName,
  subscriptionType = 'Core',
  renewalDate = '18 december 2025',
  daysUntilRenewal = 7,
  monthlyPrice = 19.95,
  statsThisMonth,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: SubscriptionRenewalEmailProps) {
  return (
    <BaseEmail preview={`Je abonnement verlengt over ${daysUntilRenewal} dagen`}>
      <SimpleHeader />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          Je <strong>{subscriptionType}</strong> abonnement wordt automatisch verlengd
          op <strong>{renewalDate}</strong> ({daysUntilRenewal} dagen).
        </Text>

        <Section style={{
          backgroundColor: colors.lightGray,
          borderRadius: '12px',
          padding: '24px',
          margin: '24px 0',
        }}>
          <Row>
            <Column>
              <Text style={{ ...styles.paragraph, margin: '0', fontWeight: '600', color: colors.dark }}>
                {subscriptionType} Abonnement
              </Text>
              <Text style={{ ...styles.paragraph, margin: '4px 0 0 0', fontSize: '14px' }}>
                Volgende betaling: {renewalDate}
              </Text>
            </Column>
            <Column style={{ textAlign: 'right' }}>
              <Text style={{ ...styles.statValue, fontSize: '24px' }}>
                €{monthlyPrice.toFixed(2)}
              </Text>
              <Text style={{ ...styles.paragraph, margin: '0', fontSize: '12px' }}>
                per maand
              </Text>
            </Column>
          </Row>
        </Section>

        {statsThisMonth && (
          <>
            <Text style={{ ...styles.heading2, marginTop: '24px' }}>
              Dit heb je deze maand gebruikt:
            </Text>
            <StatsGrid
              stats={[
                { value: String(statsThisMonth.toolsUsed), label: 'Tools', icon: '🛠️' },
                { value: String(statsThisMonth.aiMessages), label: 'AI chats', icon: '💬' },
                { value: String(statsThisMonth.coursesCompleted), label: 'Cursussen', icon: '📚' },
              ]}
            />
          </>
        )}

        <CTAButton href={`${dashboardUrl}/settings/subscription`}>
          Abonnement beheren
        </CTAButton>

        <InfoBox type="info" title="Vragen over je abonnement?">
          Je kunt je abonnement op elk moment aanpassen of opzeggen via
          je dashboard. Neem contact op als je hulp nodig hebt.
        </InfoBox>
      </Section>

      <EmailFooter preferencesUrl={`${dashboardUrl}/settings/email-preferences`} />
    </BaseEmail>
  );
}
