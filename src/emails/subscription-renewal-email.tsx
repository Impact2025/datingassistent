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

interface SubscriptionRenewalEmailProps {
  firstName: string;
  subscriptionType: string;
  renewalDate: string;
  daysUntilRenewal: number;
  monthlyPrice: number;
  statsThisMonth: {
    toolsUsed: number;
    aiMessages: number;
    coursesCompleted: number;
  };
  dashboardUrl: string;
}

export const SubscriptionRenewalEmail = ({
  firstName = 'Dating Expert',
  subscriptionType = 'core',
  renewalDate = '18 november 2025',
  daysUntilRenewal = 7,
  monthlyPrice = 19.95,
  statsThisMonth = {
    toolsUsed: 8,
    aiMessages: 45,
    coursesCompleted: 3,
  },
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: SubscriptionRenewalEmailProps) => {
  const subscriptionNames: Record<string, string> = {
    sociaal: 'Sociaal',
    core: 'Core',
    pro: 'Pro',
    premium: 'Premium',
  };

  const planName = subscriptionNames[subscriptionType] || 'Core';

  return (
    <Html>
      <Head />
      <Preview>Je {planName} abonnement vernieuwt over {daysUntilRenewal} dagen 📅</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <div style={headerIcon}>📅</div>
            <Heading style={h1}>Abonnement Vernieuwing</Heading>
            <Text style={headerSubtext}>
              Je {planName} plan vernieuwt binnenkort
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={text}>Hoi {firstName},</Text>

            <Text style={text}>
              Je <strong>{planName}</strong> abonnement vernieuwt automatisch over <strong>{daysUntilRenewal} dagen</strong> (op {renewalDate}).
            </Text>

            {/* Subscription Details */}
            <Section style={subscriptionBox}>
              <div style={subscriptionHeader}>
                <Text style={subscriptionTitle}>Je Huidige Plan:</Text>
                <div style={planBadge}>{planName}</div>
              </div>
              <div style={subscriptionDetails}>
                <div style={detailRow}>
                  <Text style={detailLabel}>Vernieuwingsdatum:</Text>
                  <Text style={detailValue}>{renewalDate}</Text>
                </div>
                <div style={detailRow}>
                  <Text style={detailLabel}>Bedrag:</Text>
                  <Text style={detailValue}>€{monthlyPrice.toFixed(2)}/maand</Text>
                </div>
                <div style={detailRow}>
                  <Text style={detailLabel}>Status:</Text>
                  <Text style={{...detailValue, color: '#10b981'}}>✓ Actief</Text>
                </div>
              </div>
            </Section>

            {/* This Month's Usage */}
            <Section style={statsSection}>
              <Heading as="h2" style={h2}>
                📊 Wat Je Deze Maand Hebt Bereikt:
              </Heading>
              <div style={statsGrid}>
                <div style={statCard}>
                  <div style={statIcon}>🎯</div>
                  <div style={statValue}>{statsThisMonth.toolsUsed}</div>
                  <Text style={statLabel}>Tools Gebruikt</Text>
                </div>
                <div style={statCard}>
                  <div style={statIcon}>💬</div>
                  <div style={statValue}>{statsThisMonth.aiMessages}</div>
                  <Text style={statLabel}>AI Gesprekken</Text>
                </div>
                <div style={statCard}>
                  <div style={statIcon}>📚</div>
                  <div style={statValue}>{statsThisMonth.coursesCompleted}</div>
                  <Text style={statLabel}>Cursussen Compleet</Text>
                </div>
              </div>
              <Text style={statsFootnote}>
                Je maakt goed gebruik van je {planName} abonnement! 💪
              </Text>
            </Section>

            {/* Value Reminder */}
            <Section style={valueSection}>
              <Heading as="h3" style={h3}>
                💎 Wat Je Blijft Krijgen:
              </Heading>
              <div style={valueList}>
                {subscriptionType === 'sociaal' && (
                  <>
                    <div style={valueItem}>✓ 25 AI chat berichten per week</div>
                    <div style={valueItem}>✓ Basis cursussen toegang</div>
                    <div style={valueItem}>✓ Community forum</div>
                    <div style={valueItem}>✓ Alle 10 dating tools</div>
                  </>
                )}
                {subscriptionType === 'core' && (
                  <>
                    <div style={valueItem}>✓ 50 AI chat berichten per week</div>
                    <div style={valueItem}>✓ Alle cursussen</div>
                    <div style={valueItem}>✓ Premium support</div>
                    <div style={valueItem}>✓ Profiel optimalisatie</div>
                  </>
                )}
                {subscriptionType === 'pro' && (
                  <>
                    <div style={valueItem}>✓ Onbeperkte AI chat</div>
                    <div style={valueItem}>✓ Alle premium features</div>
                    <div style={valueItem}>✓ Priority support</div>
                    <div style={valueItem}>✓ Exclusieve content</div>
                  </>
                )}
                {subscriptionType === 'premium' && (
                  <>
                    <div style={valueItem}>✓ Alles van Pro +</div>
                    <div style={valueItem}>✓ 1-op-1 coaching sessies</div>
                    <div style={valueItem}>✓ Profielfoto shoots</div>
                    <div style={valueItem}>✓ VIP support 24/7</div>
                  </>
                )}
              </div>
            </Section>

            {/* Upgrade Option (if not Premium) */}
            {subscriptionType !== 'premium' && (
              <Section style={upgradeSection}>
                <div style={upgradeBox}>
                  <div style={upgradeBadge}>⬆️ Upgrade Optie</div>
                  <Heading as="h3" style={upgradeTitle}>
                    Klaar voor Meer?
                  </Heading>
                  <Text style={upgradeText}>
                    {subscriptionType === 'sociaal' && 'Upgrade naar Core voor 2x meer AI berichten en alle cursussen!'}
                    {subscriptionType === 'core' && 'Upgrade naar Pro voor onbeperkte AI chat en exclusieve features!'}
                    {subscriptionType === 'pro' && 'Upgrade naar Premium voor persoonlijke coaching en VIP support!'}
                  </Text>
                  <Button style={upgradeButton} href={`${dashboardUrl}/upgrade`}>
                    Bekijk Upgrade Opties
                  </Button>
                  <Text style={upgradeDiscount}>
                    🎁 <strong>Speciale renewal bonus:</strong> 15% korting bij upgrade
                  </Text>
                </div>
              </Section>
            )}

            {/* Payment Info */}
            <Section style={paymentSection}>
              <div style={paymentBox}>
                <Text style={paymentTitle}>💳 Betaling & Facturatie</Text>
                <Text style={paymentText}>
                  Je wordt automatisch gefactureerd op {renewalDate}. Je ontvangt een bevestigingsmail na betaling.
                </Text>
                <Link href={`${dashboardUrl}/settings/billing`} style={paymentLink}>
                  Beheer betaalmethode →
                </Link>
              </div>
            </Section>

            {/* Cancel Info */}
            <Section style={cancelSection}>
              <Text style={cancelTitle}>Wil je opzeggen?</Text>
              <Text style={cancelText}>
                We vinden het jammer als je gaat! Je kunt je abonnement tot {renewalDate} opzeggen.
                Na opzegging blijft je account actief tot het einde van de huidige periode.
              </Text>
              <Link href={`${dashboardUrl}/settings/subscription`} style={cancelLink}>
                Abonnement beheren
              </Link>
            </Section>

            {/* Testimonial */}
            <Section style={testimonialSection}>
              <div style={testimonial}>
                <Text style={testimonialQuote}>
                  "DatingAssistent heeft echt een verschil gemaakt. Na 2 maanden had ik eindelijk de tools en confidence om échte connecties te maken!"
                </Text>
                <Text style={testimonialAuthor}>- Mike, 29 jaar, Core gebruiker sinds 3 maanden</Text>
              </div>
            </Section>

            {/* CTA */}
            <Section style={ctaSection}>
              <Button style={button} href={dashboardUrl}>
                Ga Naar Dashboard
              </Button>
              <Text style={ctaSubtext}>
                Blijf groeien met {planName}! 🚀
              </Text>
            </Section>

            <Hr style={hr} />

            <Text style={text}>
              Vragen over je abonnement? Antwoord gewoon op deze email!
            </Text>

            <Text style={signature}>
              Bedankt voor je vertrouwen!<br />
              <strong>Vincent & het DatingAssistent team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              DatingAssistent - Jouw AI dating coach
            </Text>
            <div style={footerLinks}>
              <Link href={dashboardUrl} style={footerLink}>
                Dashboard
              </Link>
              <span style={footerSeparator}>|</span>
              <Link href={`${dashboardUrl}/settings/subscription`} style={footerLink}>
                Abonnement Beheren
              </Link>
              <span style={footerSeparator}>|</span>
              <Link href={`${dashboardUrl}/settings/email-preferences`} style={footerLink}>
                Email Voorkeuren
              </Link>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SubscriptionRenewalEmail;

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
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
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

const subscriptionBox = {
  backgroundColor: '#dbeafe',
  border: '2px solid #60a5fa',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const subscriptionHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  paddingBottom: '16px',
  borderBottom: '1px solid #93c5fd',
};

const subscriptionTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0',
};

const planBadge = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '6px 16px',
  borderRadius: '16px',
};

const subscriptionDetails = {
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

const statsSection = {
  margin: '32px 0',
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '12px',
  marginTop: '20px',
  marginBottom: '16px',
};

const statCard = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '20px 12px',
  textAlign: 'center' as const,
};

const statIcon = {
  fontSize: '32px',
  marginBottom: '8px',
};

const statValue = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#3b82f6',
  marginBottom: '4px',
};

const statLabel = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
  fontWeight: '500',
};

const statsFootnote = {
  fontSize: '14px',
  color: '#10b981',
  margin: '0',
  textAlign: 'center' as const,
  fontWeight: '600',
};

const valueSection = {
  margin: '32px 0',
};

const valueList = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #86efac',
  borderRadius: '12px',
  padding: '20px',
  margin: '16px 0',
};

const valueItem = {
  fontSize: '15px',
  color: '#065f46',
  padding: '8px 0',
  fontWeight: '500',
};

const upgradeSection = {
  margin: '32px 0',
};

const upgradeBox = {
  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  border: '2px solid #fbbf24',
  borderRadius: '12px',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const upgradeBadge = {
  backgroundColor: '#f59e0b',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '4px 12px',
  borderRadius: '12px',
  display: 'inline-block',
  marginBottom: '12px',
};

const upgradeTitle = {
  color: '#92400e',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const upgradeText = {
  fontSize: '15px',
  color: '#78350f',
  margin: '0 0 20px 0',
  lineHeight: '22px',
};

const upgradeButton = {
  backgroundColor: '#f59e0b',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const upgradeDiscount = {
  fontSize: '13px',
  color: '#92400e',
  margin: '12px 0 0 0',
};

const paymentSection = {
  margin: '32px 0',
};

const paymentBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
};

const paymentTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 8px 0',
};

const paymentText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 12px 0',
  lineHeight: '20px',
};

const paymentLink = {
  fontSize: '14px',
  color: '#3b82f6',
  fontWeight: '600',
  textDecoration: 'none',
};

const cancelSection = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '20px',
  margin: '32px 0',
  textAlign: 'center' as const,
};

const cancelTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#991b1b',
  margin: '0 0 8px 0',
};

const cancelText = {
  fontSize: '14px',
  color: '#7f1d1d',
  margin: '0 0 12px 0',
  lineHeight: '20px',
};

const cancelLink = {
  fontSize: '14px',
  color: '#dc2626',
  fontWeight: '600',
  textDecoration: 'none',
};

const testimonialSection = {
  margin: '32px 0',
};

const testimonial = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #10b981',
  borderRadius: '8px',
  padding: '20px',
};

const testimonialQuote = {
  fontSize: '16px',
  fontStyle: 'italic',
  color: '#065f46',
  margin: '0 0 8px 0',
  lineHeight: '24px',
};

const testimonialAuthor = {
  fontSize: '14px',
  color: '#047857',
  margin: '0',
  fontWeight: '600',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const ctaSubtext = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '12px 0 0 0',
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
  flexWrap: 'wrap' as const,
};

const footerLink = {
  color: '#3b82f6',
  fontSize: '12px',
  textDecoration: 'none',
};

const footerSeparator = {
  color: '#d1d5db',
  fontSize: '12px',
};
