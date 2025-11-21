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

interface MidTrialCheckEmailProps {
  firstName: string;
  daysActive: number;
  toolsUsed: number;
  coursesCompleted: number;
  subscriptionType: string;
  dashboardUrl: string;
}

export const MidTrialCheckEmail = ({
  firstName = 'Dating Expert',
  daysActive = 14,
  toolsUsed = 5,
  coursesCompleted = 2,
  subscriptionType = 'core',
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: MidTrialCheckEmailProps) => {
  // Calculate engagement level
  const engagementScore = toolsUsed * 10 + coursesCompleted * 20;
  const isHighEngagement = engagementScore >= 70;
  const isMediumEngagement = engagementScore >= 40 && engagementScore < 70;

  const milestones = [
    { completed: daysActive >= 14, text: '2 weken actief', icon: '📅' },
    { completed: toolsUsed >= 5, text: '5+ tools gebruikt', icon: '🎯' },
    { completed: coursesCompleted >= 1, text: 'Cursus afgerond', icon: '📚' },
  ];

  const nextSteps = [];
  if (toolsUsed < 8) {
    nextSteps.push({
      icon: '🎯',
      title: 'Probeer meer tools',
      description: `Je hebt ${toolsUsed}/10 tools gebruikt. Ontdek de anderen!`,
    });
  }
  if (coursesCompleted < 3) {
    nextSteps.push({
      icon: '📚',
      title: 'Complete een cursus',
      description: 'Gebruikers met 3+ cursussen hebben 5x meer succes!',
    });
  }
  nextSteps.push({
    icon: '💬',
    title: 'Deel je ervaring',
    description: 'Help anderen en krijg 50 extra AI berichten!',
  });

  return (
    <Html>
      <Head />
      <Preview>Je 2-weken check-in - Hoe gaat het? 🎯</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <div style={headerIcon}>🎯</div>
            <Heading style={h1}>Je Bent 2 Weken Bezig!</Heading>
            <Text style={headerSubtext}>
              Tijd voor je voortgang rapportje 📊
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={text}>Hoi {firstName},</Text>

            <Text style={text}>
              Wow, <strong>2 weken</strong> geleden begon je met DatingAssistent! 🎉
            </Text>

            <Text style={text}>
              Laten we even kijken naar jouw voortgang en waar je naartoe gaat...
            </Text>

            {/* Progress Overview */}
            <Section style={progressSection}>
              <Heading as="h2" style={h2}>
                📊 Jouw Voortgang:
              </Heading>

              {/* Stats Grid */}
              <div style={statsGrid}>
                <div style={statCard}>
                  <div style={statIcon}>📅</div>
                  <div style={statValue}>{daysActive}</div>
                  <Text style={statLabel}>Dagen Actief</Text>
                </div>
                <div style={statCard}>
                  <div style={statIcon}>🎯</div>
                  <div style={statValue}>{toolsUsed}/10</div>
                  <Text style={statLabel}>Tools Gebruikt</Text>
                </div>
                <div style={statCard}>
                  <div style={statIcon}>📚</div>
                  <div style={statValue}>{coursesCompleted}</div>
                  <Text style={statLabel}>Cursussen Compleet</Text>
                </div>
              </div>

              {/* Engagement Level */}
              <div style={engagementBox}>
                {isHighEngagement && (
                  <>
                    <div style={engagementBadge('#10b981', '#d1fae5')}>
                      🔥 Power User
                    </div>
                    <Text style={engagementText('#065f46')}>
                      Geweldig! Je gebruikt DatingAssistent optimaal. Blijf zo doorgaan! 💪
                    </Text>
                  </>
                )}
                {isMediumEngagement && (
                  <>
                    <div style={engagementBadge('#f59e0b', '#fef3c7')}>
                      ⚡ Actieve Gebruiker
                    </div>
                    <Text style={engagementText('#92400e')}>
                      Goed bezig! Er zijn nog meer features die je kunnen helpen.
                    </Text>
                  </>
                )}
                {!isHighEngagement && !isMediumEngagement && (
                  <>
                    <div style={engagementBadge('#3b82f6', '#dbeafe')}>
                      🌱 Beginnende Gebruiker
                    </div>
                    <Text style={engagementText('#1e40af')}>
                      Je bent goed begonnen! Laten we je helpen nog meer uit de app te halen.
                    </Text>
                  </>
                )}
              </div>
            </Section>

            {/* Milestones */}
            <Section style={milestonesSection}>
              <Heading as="h3" style={h3}>
                🏆 Milestones Bereikt:
              </Heading>
              <div style={milestonesList}>
                {milestones.map((milestone, index) => (
                  <div key={index} style={milestoneItem(milestone.completed)}>
                    <span style={milestoneIcon}>{milestone.icon}</span>
                    <Text style={milestoneText}>{milestone.text}</Text>
                    <span style={milestoneCheck}>
                      {milestone.completed ? '✓' : '○'}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Next Steps */}
            <Section style={nextStepsSection}>
              <Heading as="h3" style={h3}>
                🎯 Volgende Stappen:
              </Heading>
              {nextSteps.map((step, index) => (
                <div key={index} style={nextStepCard}>
                  <span style={nextStepIcon}>{step.icon}</span>
                  <div style={nextStepContent}>
                    <Text style={nextStepTitle}>{step.title}</Text>
                    <Text style={nextStepDescription}>{step.description}</Text>
                  </div>
                </div>
              ))}
            </Section>

            {/* Success Story */}
            <Section style={successSection}>
              <div style={successBox}>
                <Text style={successTitle}>💡 Did You Know?</Text>
                <Text style={successText}>
                  Gebruikers die in de eerste 2 weken <strong>minimaal 5 tools gebruiken en 1 cursus afmaken</strong> hebben:
                </Text>
                <div style={successStats}>
                  <div style={successStat}>
                    <div style={successNumber}>3x</div>
                    <Text style={successStatLabel}>Meer matches</Text>
                  </div>
                  <div style={successStat}>
                    <div style={successNumber}>5x</div>
                    <Text style={successStatLabel}>Meer dates</Text>
                  </div>
                  <div style={successStat}>
                    <div style={successNumber}>89%</div>
                    <Text style={successStatLabel}>Blijft abonnee</Text>
                  </div>
                </div>
              </div>
            </Section>

            {/* Upgrade Hint (if not Premium) */}
            {subscriptionType !== 'premium' && (
              <Section style={upgradeSection}>
                <div style={upgradeBox}>
                  <div style={upgradeBadge}>⭐ Upgrade Voordeel</div>
                  <Heading as="h3" style={upgradeTitle}>
                    Klaar voor Meer?
                  </Heading>
                  <Text style={upgradeText}>
                    Je maakt goed gebruik van de {subscriptionType === 'sociaal' ? 'Sociaal' : 'Core'} features.
                    Upgrade naar <strong>{subscriptionType === 'sociaal' ? 'Core of Pro' : 'Pro of Premium'}</strong> voor:
                  </Text>
                  <div style={upgradeFeatures}>
                    {subscriptionType === 'sociaal' && (
                      <>
                        <div style={upgradeFeature}>✓ 2x meer AI chat berichten</div>
                        <div style={upgradeFeature}>✓ Alle cursussen unlocked</div>
                        <div style={upgradeFeature}>✓ Premium support</div>
                      </>
                    )}
                    {subscriptionType === 'core' && (
                      <>
                        <div style={upgradeFeature}>✓ Onbeperkte AI chat</div>
                        <div style={upgradeFeature}>✓ Priority support</div>
                        <div style={upgradeFeature}>✓ Exclusieve features</div>
                      </>
                    )}
                  </div>
                  <Button style={upgradeButton} href={`${dashboardUrl}/upgrade`}>
                    Bekijk Upgrade Opties
                  </Button>
                  <Text style={upgradeSubtext}>
                    🎁 Eerste maand 20% korting met code: <strong>UPGRADE20</strong>
                  </Text>
                </div>
              </Section>
            )}

            {/* CTA */}
            <Section style={ctaSection}>
              <Button style={button} href={dashboardUrl}>
                Ga Naar Dashboard
              </Button>
              <Text style={ctaSubtext}>
                Laten we jouw dating succes naar het volgende level brengen! 🚀
              </Text>
            </Section>

            {/* Testimonial */}
            <Section style={testimonialSection}>
              <div style={testimonial}>
                <Text style={testimonialQuote}>
                  "Na 2 weken DatingAssistent had ik al mijn eerste date! De tools en cursussen maken echt het verschil."
                </Text>
                <Text style={testimonialAuthor}>- Mark, 31 jaar, Pro gebruiker</Text>
              </div>
            </Section>

            <Hr style={hr} />

            <Text style={text}>
              Vragen of feedback? Ik hoor het graag!
            </Text>

            <Text style={signature}>
              Keep crushing it!<br />
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

export default MidTrialCheckEmail;

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
  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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

const progressSection = {
  margin: '32px 0',
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '12px',
  marginTop: '20px',
  marginBottom: '24px',
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
  color: '#8b5cf6',
  marginBottom: '4px',
};

const statLabel = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
  fontWeight: '500',
};

const engagementBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
};

const engagementBadge = (bgColor: string, textBg: string) => ({
  backgroundColor: bgColor,
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '8px 16px',
  borderRadius: '20px',
  display: 'inline-block',
  marginBottom: '12px',
});

const engagementText = (color: string) => ({
  fontSize: '15px',
  color: color,
  margin: '0',
  lineHeight: '22px',
});

const milestonesSection = {
  margin: '32px 0',
};

const milestonesList = {
  margin: '16px 0',
};

const milestoneItem = (completed: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: completed ? '#f0fdf4' : '#f9fafb',
  border: completed ? '2px solid #86efac' : '2px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
});

const milestoneIcon = {
  fontSize: '24px',
  flexShrink: 0,
};

const milestoneText = {
  fontSize: '15px',
  color: '#111827',
  margin: '0',
  flex: 1,
  fontWeight: '500',
};

const milestoneCheck = {
  fontSize: '24px',
  color: '#10b981',
  flexShrink: 0,
};

const nextStepsSection = {
  margin: '32px 0',
};

const nextStepCard = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
};

const nextStepIcon = {
  fontSize: '28px',
  flexShrink: 0,
};

const nextStepContent = {
  flex: 1,
};

const nextStepTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 4px 0',
};

const nextStepDescription = {
  fontSize: '14px',
  color: '#78350f',
  margin: '0',
  lineHeight: '20px',
};

const successSection = {
  margin: '32px 0',
};

const successBox = {
  backgroundColor: '#dbeafe',
  border: '2px solid #60a5fa',
  borderRadius: '12px',
  padding: '24px',
};

const successTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
};

const successText = {
  fontSize: '15px',
  color: '#1e3a8a',
  margin: '0 0 20px 0',
  lineHeight: '22px',
  textAlign: 'center' as const,
};

const successStats = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '16px',
};

const successStat = {
  textAlign: 'center' as const,
};

const successNumber = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#1e40af',
  marginBottom: '4px',
};

const successStatLabel = {
  fontSize: '12px',
  color: '#1e3a8a',
  margin: '0',
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
  marginBottom: '16px',
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

const upgradeFeatures = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
  textAlign: 'left' as const,
};

const upgradeFeature = {
  fontSize: '14px',
  color: '#374151',
  padding: '6px 0',
  fontWeight: '500',
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

const upgradeSubtext = {
  fontSize: '13px',
  color: '#92400e',
  margin: '12px 0 0 0',
  fontWeight: '600',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#8b5cf6',
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
};

const testimonialAuthor = {
  fontSize: '14px',
  color: '#047857',
  margin: '0',
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
  color: '#8b5cf6',
  fontSize: '12px',
  textDecoration: 'none',
};

const footerSeparator = {
  color: '#d1d5db',
  fontSize: '12px',
};
