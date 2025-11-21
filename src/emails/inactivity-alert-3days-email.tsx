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

interface InactivityAlert3DaysEmailProps {
  firstName: string;
  lastActiveDate: string;
  lastToolUsed?: string;
  dashboardUrl: string;
}

export const InactivityAlert3DaysEmail = ({
  firstName = 'Dating Expert',
  lastActiveDate = '8 november 2025',
  lastToolUsed = 'Chat Coach',
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: InactivityAlert3DaysEmailProps) => {
  const quickActions = [
    {
      icon: '💬',
      title: 'Snel een icebreaker',
      subtitle: 'Genereer in 30 seconden',
      time: '30 sec',
    },
    {
      icon: '📸',
      title: 'Foto check',
      subtitle: 'Upload en krijg instant advies',
      time: '1 min',
    },
    {
      icon: '🎯',
      title: 'Chat Coach vraag',
      subtitle: 'Stel een snelle dating vraag',
      time: '2 min',
    },
  ];

  return (
    <Html>
      <Head />
      <Preview>We missen je! Kom snel terug voor je dating journey 👋</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <div style={headerIcon}>👋</div>
            <Heading style={h1}>We Missen Je!</Heading>
            <Text style={headerSubtext}>
              Je bent al 3 dagen niet geweest...
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={text}>Hoi {firstName},</Text>

            <Text style={text}>
              Het is alweer <strong>3 dagen</strong> geleden sinds je voor het laatst bij DatingAssistent was (op {lastActiveDate}).
            </Text>

            <Text style={text}>
              Dating kan soms overweldigend zijn - we begrijpen het! Maar vergeet niet: <strong>kleine stappen maken het verschil</strong>. 💪
            </Text>

            {/* Last Activity */}
            {lastToolUsed && (
              <Section style={lastActivityBox}>
                <Text style={lastActivityTitle}>
                  📌 Je laatste activiteit:
                </Text>
                <div style={lastActivityContent}>
                  <Text style={lastActivityText}>
                    Je gebruikte <strong>{lastToolUsed}</strong>
                  </Text>
                  <Button style={continueButton} href={dashboardUrl}>
                    Ga Verder Waar Je Was
                  </Button>
                </div>
              </Section>
            )}

            {/* Quick Win Section */}
            <Section style={quickWinSection}>
              <Heading as="h2" style={h2}>
                ⚡ Snelle Wins (Kies er 1):
              </Heading>
              <Text style={quickWinSubtext}>
                Geen tijd? Kies één van deze super snelle acties:
              </Text>

              {quickActions.map((action, index) => (
                <div key={index} style={quickActionCard}>
                  <span style={quickActionIcon}>{action.icon}</span>
                  <div style={quickActionContent}>
                    <Text style={quickActionTitle}>{action.title}</Text>
                    <Text style={quickActionSubtitle}>{action.subtitle}</Text>
                  </div>
                  <div style={quickActionTime}>{action.time}</div>
                </div>
              ))}
            </Section>

            {/* Motivation */}
            <Section style={motivationSection}>
              <div style={motivationBox}>
                <Text style={motivationTitle}>💡 Wist Je Dat...</Text>
                <Text style={motivationText}>
                  Gebruikers die <strong>minimaal 3x per week</strong> inloggen hebben:
                </Text>
                <div style={motivationStats}>
                  <div style={motivationStat}>
                    <div style={motivationNumber}>5x</div>
                    <Text style={motivationLabel}>Meer dating succes</Text>
                  </div>
                  <div style={motivationStat}>
                    <div style={motivationNumber}>89%</div>
                    <Text style={motivationLabel}>Bereikt hun doel</Text>
                  </div>
                </div>
              </div>
            </Section>

            {/* What You're Missing */}
            <Section style={missingSection}>
              <Heading as="h3" style={h3}>
                🎯 Wat Je Mist:
              </Heading>
              <div style={missingList}>
                <div style={missingItem}>
                  <span style={missingIcon}>📚</span>
                  <Text style={missingText}>
                    Nieuwe cursus: <strong>"Red Flags Herkennen"</strong> is nu live!
                  </Text>
                </div>
                <div style={missingItem}>
                  <span style={missingIcon}>💬</span>
                  <Text style={missingText}>
                    <strong>12+ community posts</strong> met dating tips & ervaringen
                  </Text>
                </div>
                <div style={missingItem}>
                  <span style={missingIcon}>🎁</span>
                  <Text style={missingText}>
                    <strong>Bonus AI berichten</strong> wachten op je (login om te claimen!)
                  </Text>
                </div>
              </div>
            </Section>

            {/* Testimonial for Motivation */}
            <Section style={testimonialSection}>
              <div style={testimonial}>
                <Text style={testimonialQuote}>
                  "Ik was ook even gestopt, maar toen ik terugkwam en de Chat Coach gebruikte voor mijn gesprekken kreeg ik binnen een week mijn eerste date!"
                </Text>
                <Text style={testimonialAuthor}>- Sarah, 28 jaar</Text>
              </div>
            </Section>

            {/* CTA */}
            <Section style={ctaSection}>
              <Text style={ctaText}>
                Kom terug en zet kleine stappen! 🚀
              </Text>
              <Button style={button} href={dashboardUrl}>
                Open Dashboard Nu
              </Button>
              <Text style={ctaSubtext}>
                Start met slechts 2 minuten vandaag
              </Text>
            </Section>

            {/* Support Message */}
            <Section style={supportSection}>
              <div style={supportBox}>
                <Text style={supportTitle}>💭 Loop Je Ergens Tegenaan?</Text>
                <Text style={supportText}>
                  Soms is dating gewoon lastig. Als je ergens mee zit of vragen hebt, antwoord gewoon op deze email. We helpen je graag!
                </Text>
              </div>
            </Section>

            <Hr style={hr} />

            <Text style={text}>
              We hopen je snel weer te zien! 👋
            </Text>

            <Text style={signature}>
              Je dating journey wacht op je!<br />
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

export default InactivityAlert3DaysEmail;

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
  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
  margin: '32px 0 16px 0',
};

const h3 = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px 0',
};

const lastActivityBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
};

const lastActivityTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
};

const lastActivityContent = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '16px',
  textAlign: 'center' as const,
};

const lastActivityText = {
  fontSize: '15px',
  color: '#111827',
  margin: '0 0 12px 0',
};

const continueButton = {
  backgroundColor: '#f59e0b',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 24px',
};

const quickWinSection = {
  margin: '32px 0',
};

const quickWinSubtext = {
  fontSize: '15px',
  color: '#6b7280',
  margin: '0 0 16px 0',
  lineHeight: '22px',
};

const quickActionCard = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  backgroundColor: '#f0fdf4',
  border: '2px solid #86efac',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '12px',
};

const quickActionIcon = {
  fontSize: '36px',
  flexShrink: 0,
};

const quickActionContent = {
  flex: 1,
};

const quickActionTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#065f46',
  margin: '0 0 4px 0',
};

const quickActionSubtitle = {
  fontSize: '13px',
  color: '#047857',
  margin: '0',
};

const quickActionTime = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '6px 12px',
  borderRadius: '12px',
  flexShrink: 0,
};

const motivationSection = {
  margin: '32px 0',
};

const motivationBox = {
  backgroundColor: '#dbeafe',
  border: '2px solid #60a5fa',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
};

const motivationTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 12px 0',
};

const motivationText = {
  fontSize: '15px',
  color: '#1e3a8a',
  margin: '0 0 20px 0',
  lineHeight: '22px',
};

const motivationStats = {
  display: 'flex',
  justifyContent: 'space-around',
  gap: '20px',
};

const motivationStat = {
  flex: 1,
};

const motivationNumber = {
  fontSize: '40px',
  fontWeight: 'bold',
  color: '#3b82f6',
  marginBottom: '4px',
};

const motivationLabel = {
  fontSize: '13px',
  color: '#1e3a8a',
  margin: '0',
  fontWeight: '500',
};

const missingSection = {
  margin: '32px 0',
};

const missingList = {
  margin: '16px 0',
};

const missingItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  backgroundColor: '#f9fafb',
  borderLeft: '4px solid #ec4899',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
};

const missingIcon = {
  fontSize: '24px',
  flexShrink: 0,
};

const missingText = {
  fontSize: '15px',
  color: '#374151',
  margin: '0',
  lineHeight: '22px',
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

const ctaText = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px 0',
};

const button = {
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

const ctaSubtext = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '12px 0 0 0',
};

const supportSection = {
  margin: '32px 0',
};

const supportBox = {
  backgroundColor: '#fdf2f8',
  border: '2px solid #f9a8d4',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
};

const supportTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#9f1239',
  margin: '0 0 8px 0',
};

const supportText = {
  fontSize: '15px',
  color: '#831843',
  margin: '0',
  lineHeight: '22px',
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
  color: '#f59e0b',
  fontSize: '12px',
  textDecoration: 'none',
};

const footerSeparator = {
  color: '#d1d5db',
  fontSize: '12px',
};
