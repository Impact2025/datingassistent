import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface PaymentFailedEmailProps {
  firstName: string;
  subscriptionType: string;
  amount: number;
  failureReason?: string;
  retryDate?: string;
  daysUntilSuspension: number;
  dashboardUrl: string;
}

export const PaymentFailedEmail = ({
  firstName = 'Dating Expert',
  subscriptionType = 'core',
  amount = 19.95,
  failureReason = 'Insufficient funds',
  retryDate = '15 november 2025',
  daysUntilSuspension = 3,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: PaymentFailedEmailProps) => {
  const subscriptionNames: Record<string, string> = {
    sociaal: 'Sociaal',
    core: 'Core',
    pro: 'Pro',
    premium: 'Premium',
  };

  const planName = subscriptionNames[subscriptionType] || 'Core';

  const commonReasons = [
    {
      icon: '💳',
      reason: 'Verlopen kaart',
      solution: 'Update je betaalmethode met een geldige kaart',
    },
    {
      icon: '💰',
      reason: 'Onvoldoende saldo',
      solution: 'Zorg dat er voldoende saldo op je rekening staat',
    },
    {
      icon: '🔒',
      reason: 'Geblokkeerde betaling',
      solution: 'Neem contact op met je bank of kies een andere betaalmethode',
    },
    {
      icon: '📍',
      reason: 'Adres verificatie',
      solution: 'Controleer of je factuuradres correct is',
    },
  ];

  return (
    <Html>
      <Head />
      <Preview>⚠️ Betaling mislukt - Update je betaalmethode</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <div style={headerIcon}>⚠️</div>
            <Heading style={h1}>Betaling Mislukt</Heading>
            <Text style={headerSubtext}>
              We konden je {planName} abonnement niet verlengen
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={text}>Hoi {firstName},</Text>

            <Text style={text}>
              Helaas is de automatische betaling voor je <strong>{planName}</strong> abonnement niet gelukt.
            </Text>

            {/* Payment Details */}
            <Section style={alertBox}>
              <div style={alertHeader}>
                <Text style={alertTitle}>❌ Betaling Mislukt</Text>
              </div>
              <div style={alertDetails}>
                <div style={detailRow}>
                  <Text style={detailLabel}>Bedrag:</Text>
                  <Text style={detailValue}>€{amount.toFixed(2)}</Text>
                </div>
                <div style={detailRow}>
                  <Text style={detailLabel}>Abonnement:</Text>
                  <Text style={detailValue}>{planName}</Text>
                </div>
                {failureReason && (
                  <div style={detailRow}>
                    <Text style={detailLabel}>Reden:</Text>
                    <Text style={detailValue}>{failureReason}</Text>
                  </div>
                )}
                {retryDate && (
                  <div style={detailRow}>
                    <Text style={detailLabel}>Nieuwe poging:</Text>
                    <Text style={detailValue}>{retryDate}</Text>
                  </div>
                )}
              </div>
            </Section>

            {/* Urgency Notice */}
            <Section style={urgencyBox}>
              <Text style={urgencyTitle}>⏰ Actie Vereist</Text>
              <Text style={urgencyText}>
                Je hebt nog <strong>{daysUntilSuspension} dagen</strong> om je betaalmethode bij te werken.
                Anders wordt je account tijdelijk opgeschort.
              </Text>
            </Section>

            {/* What This Means */}
            <Section style={impactSection}>
              <Heading as="h2" style={h2}>
                Wat Dit Betekent:
              </Heading>
              <div style={impactList}>
                <div style={impactItem}>
                  <span style={impactIcon}>✓</span>
                  <Text style={impactText}>
                    <strong>Nu:</strong> Je account is nog steeds actief
                  </Text>
                </div>
                <div style={impactItem}>
                  <span style={impactIcon}>⚠️</span>
                  <Text style={impactText}>
                    <strong>Over {daysUntilSuspension} dagen:</strong> Account wordt opgeschort zonder betaling
                  </Text>
                </div>
                <div style={impactItem}>
                  <span style={impactIcon}>❌</span>
                  <Text style={impactText}>
                    <strong>Bij opschorting:</strong> Geen toegang tot {planName} features
                  </Text>
                </div>
              </div>
            </Section>

            {/* Fix Steps */}
            <Section style={stepsSection}>
              <Heading as="h2" style={h2}>
                🔧 Los Het Direct Op:
              </Heading>
              <div style={stepsList}>
                <div style={stepItem}>
                  <span style={stepNumber}>1</span>
                  <div style={stepContent}>
                    <Text style={stepTitle}>Ga naar Billing Instellingen</Text>
                    <Text style={stepDescription}>
                      Open je account instellingen in het dashboard
                    </Text>
                  </div>
                </div>
                <div style={stepItem}>
                  <span style={stepNumber}>2</span>
                  <div style={stepContent}>
                    <Text style={stepTitle}>Update Betaalmethode</Text>
                    <Text style={stepDescription}>
                      Voeg een nieuwe kaart toe of kies een andere methode
                    </Text>
                  </div>
                </div>
                <div style={stepItem}>
                  <span style={stepNumber}>3</span>
                  <div style={stepContent}>
                    <Text style={stepTitle}>Bevestig de Betaling</Text>
                    <Text style={stepDescription}>
                      We proberen de betaling automatisch opnieuw
                    </Text>
                  </div>
                </div>
              </div>
            </Section>

            {/* CTA */}
            <Section style={ctaSection}>
              <Button style={button} href={`${dashboardUrl}/settings/billing`}>
                Update Betaalmethode Nu
              </Button>
              <Text style={ctaSubtext}>
                Het duurt maar 2 minuten ⚡
              </Text>
            </Section>

            {/* Common Reasons */}
            <Section style={reasonsSection}>
              <Heading as="h3" style={h3}>
                🔍 Veelvoorkomende Oorzaken:
              </Heading>
              {commonReasons.map((item, index) => (
                <div key={index} style={reasonCard}>
                  <span style={reasonIcon}>{item.icon}</span>
                  <div style={reasonContent}>
                    <Text style={reasonTitle}>{item.reason}</Text>
                    <Text style={reasonSolution}>→ {item.solution}</Text>
                  </div>
                </div>
              ))}
            </Section>

            {/* What You're Missing */}
            <Section style={missingSection}>
              <div style={missingBox}>
                <Text style={missingTitle}>⚡ Gemiste Features Bij Opschorting:</Text>
                <div style={missingList}>
                  <div style={missingItem}>❌ AI Chat Coach</div>
                  <div style={missingItem}>❌ Profiel & Foto Analyses</div>
                  <div style={missingItem}>❌ Premium Cursussen</div>
                  <div style={missingItem}>❌ Community Toegang</div>
                </div>
              </div>
            </Section>

            {/* Alternative: Downgrade */}
            {subscriptionType !== 'sociaal' && (
              <Section style={alternativeSection}>
                <div style={alternativeBox}>
                  <Text style={alternativeTitle}>💡 Alternatief:</Text>
                  <Text style={alternativeText}>
                    Momenteel budget problemen? Overweeg een downgrade naar een goedkoper plan
                    in plaats van je account te verliezen.
                  </Text>
                  <Link href={`${dashboardUrl}/settings/subscription`} style={alternativeLink}>
                    Bekijk Andere Plannen →
                  </Link>
                </div>
              </Section>
            )}

            {/* Support */}
            <Section style={supportSection}>
              <div style={supportBox}>
                <Text style={supportTitle}>💭 Hulp Nodig?</Text>
                <Text style={supportText}>
                  Problemen met je betaling? Of vragen over je abonnement?
                  Ons support team staat voor je klaar!
                </Text>
                <Text style={supportContact}>
                  📧 Antwoord op deze email<br />
                  💬 Chat via dashboard
                </Text>
              </div>
            </Section>

            <Hr style={hr} />

            <Text style={text}>
              We hopen dit snel op te lossen! 🙏
            </Text>

            <Text style={signature}>
              Bedankt voor je begrip,<br />
              <strong>Vincent & het DatingAssistent team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              DatingAssistent - Jouw AI dating coach
            </Text>
            <div style={footerLinks}>
              <Link href={`${dashboardUrl}/settings/billing`} style={footerLink}>
                Billing Instellingen
              </Link>
              <span style={footerSeparator}>|</span>
              <Link href={`${dashboardUrl}/settings/subscription`} style={footerLink}>
                Abonnement Beheren
              </Link>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentFailedEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
};

const header = {
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  padding: '40px 24px',
  textAlign: 'center' as const,
};

const headerIcon = {
  fontSize: '64px',
  marginBottom: '16px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
};

const headerSubtext = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
  opacity: 0.95,
};

const content = {
  padding: '40px 24px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const h2 = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '32px 0 20px 0',
};

const h3 = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px 0',
};

const alertBox = {
  backgroundColor: '#fef2f2',
  border: '3px solid #fca5a5',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const alertHeader = {
  marginBottom: '16px',
  paddingBottom: '16px',
  borderBottom: '1px solid #fca5a5',
};

const alertTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#991b1b',
  margin: '0',
};

const alertDetails = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '16px',
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
};

const detailLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const detailValue = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#111827',
  margin: '0',
};

const urgencyBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const urgencyTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 8px 0',
};

const urgencyText = {
  fontSize: '15px',
  color: '#78350f',
  margin: '0',
  lineHeight: '22px',
};

const impactSection = {
  margin: '32px 0',
};

const impactList = {
  margin: '16px 0',
};

const impactItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
};

const impactIcon = {
  fontSize: '24px',
  flexShrink: 0,
};

const impactText = {
  fontSize: '15px',
  color: '#374151',
  margin: '0',
  lineHeight: '22px',
};

const stepsSection = {
  margin: '32px 0',
};

const stepsList = {
  margin: '16px 0',
};

const stepItem = {
  display: 'flex',
  gap: '16px',
  backgroundColor: '#dbeafe',
  border: '2px solid #60a5fa',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
};

const stepNumber = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  fontWeight: 'bold',
  flexShrink: 0,
};

const stepContent = {
  flex: 1,
};

const stepTitle = {
  fontSize: '17px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 6px 0',
};

const stepDescription = {
  fontSize: '14px',
  color: '#1e3a8a',
  margin: '0',
  lineHeight: '20px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#ef4444',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 40px',
};

const ctaSubtext = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '12px 0 0 0',
};

const reasonsSection = {
  margin: '32px 0',
};

const reasonCard = {
  display: 'flex',
  gap: '12px',
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
};

const reasonIcon = {
  fontSize: '28px',
  flexShrink: 0,
};

const reasonContent = {
  flex: 1,
};

const reasonTitle = {
  fontSize: '15px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 4px 0',
};

const reasonSolution = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
  lineHeight: '20px',
};

const missingSection = {
  margin: '32px 0',
};

const missingBox = {
  backgroundColor: '#fef2f2',
  border: '2px solid #fca5a5',
  borderRadius: '12px',
  padding: '20px',
};

const missingTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#991b1b',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
};

const missingList = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px',
};

const missingItem = {
  fontSize: '14px',
  color: '#7f1d1d',
  padding: '8px',
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  textAlign: 'center' as const,
  fontWeight: '500',
};

const alternativeSection = {
  margin: '32px 0',
};

const alternativeBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #86efac',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
};

const alternativeTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#065f46',
  margin: '0 0 8px 0',
};

const alternativeText = {
  fontSize: '15px',
  color: '#047857',
  margin: '0 0 12px 0',
  lineHeight: '22px',
};

const alternativeLink = {
  fontSize: '15px',
  color: '#10b981',
  fontWeight: '600',
  textDecoration: 'none',
};

const supportSection = {
  margin: '32px 0',
};

const supportBox = {
  backgroundColor: '#f5f3ff',
  border: '2px solid #c4b5fd',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
};

const supportTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#5b21b6',
  margin: '0 0 8px 0',
};

const supportText = {
  fontSize: '15px',
  color: '#6b21a8',
  margin: '0 0 12px 0',
  lineHeight: '22px',
};

const supportContact = {
  fontSize: '14px',
  color: '#7c3aed',
  margin: '0',
  lineHeight: '22px',
  fontWeight: '600',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const signature = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0',
};

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0 0 12px 0',
};

const footerLinks = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
};

const footerLink = {
  color: '#ef4444',
  fontSize: '12px',
  textDecoration: 'none',
};

const footerSeparator = {
  color: '#d1d5db',
  fontSize: '12px',
};
