const fs = require('fs');
const path = require('path');

const emailsDir = path.join(__dirname, 'src', 'emails');
const componentsDir = path.join(emailsDir, 'components');

// Ensure directories exist
if (!fs.existsSync(emailsDir)) fs.mkdirSync(emailsDir, { recursive: true });
if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir, { recursive: true });

console.log('Created directories:', emailsDir, componentsDir);

// Base email components
const emailBaseContent = `/**
 * Base Email Components - Shared across all email templates
 * DatingAssistent World-Class Email System
 */

import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
  Hr,
  Button,
  Row,
  Column,
  Preview,
} from '@react-email/components';

// Brand Colors
export const colors = {
  primary: '#E14874',
  primaryDark: '#c73d64',
  secondary: '#f97316',
  gradient: 'linear-gradient(135deg, #E14874 0%, #f97316 100%)',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  dark: '#1a1a1a',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  white: '#ffffff',
  background: '#f8f9fa',
};

// Shared Styles
export const styles = {
  main: {
    backgroundColor: colors.background,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: '0',
    padding: '40px 20px',
  },
  container: {
    backgroundColor: colors.white,
    margin: '0 auto',
    maxWidth: '600px',
    borderRadius: '16px',
    overflow: 'hidden' as const,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  header: {
    backgroundColor: colors.white,
    padding: '32px',
    textAlign: 'center' as const,
    borderBottom: \`1px solid \${colors.lightGray}\`,
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #E14874 0%, #f97316 100%)',
    padding: '48px 32px',
    textAlign: 'center' as const,
  },
  content: {
    padding: '32px',
  },
  footer: {
    backgroundColor: '#fafafa',
    padding: '24px 32px',
    textAlign: 'center' as const,
    borderTop: \`1px solid \${colors.lightGray}\`,
  },
  heading1: {
    color: colors.dark,
    fontSize: '28px',
    fontWeight: '700',
    lineHeight: '1.3',
    margin: '0 0 16px 0',
  },
  heading2: {
    color: colors.dark,
    fontSize: '22px',
    fontWeight: '600',
    lineHeight: '1.3',
    margin: '0 0 12px 0',
  },
  paragraph: {
    color: colors.gray,
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: '12px',
    color: colors.white,
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: '600',
    padding: '14px 28px',
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    border: \`2px solid \${colors.primary}\`,
    borderRadius: '12px',
    color: colors.primary,
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: '600',
    padding: '12px 26px',
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
  card: {
    backgroundColor: colors.lightGray,
    borderRadius: '12px',
    padding: '24px',
    margin: '24px 0',
  },
  statBox: {
    textAlign: 'center' as const,
    padding: '16px',
  },
  statValue: {
    color: colors.primary,
    fontSize: '32px',
    fontWeight: '700',
    margin: '0',
  },
  statLabel: {
    color: colors.gray,
    fontSize: '14px',
    margin: '4px 0 0 0',
  },
  link: {
    color: colors.primary,
    textDecoration: 'none',
    fontWeight: '500',
  },
  divider: {
    borderColor: colors.lightGray,
    margin: '24px 0',
  },
  badge: {
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  footerText: {
    color: colors.gray,
    fontSize: '14px',
    margin: '0 0 8px 0',
  },
  footerLink: {
    color: colors.primary,
    fontSize: '14px',
    textDecoration: 'none',
  },
};

// Base Email Wrapper
interface BaseEmailProps {
  preview: string;
  children: React.ReactNode;
}

export function BaseEmail({ preview, children }: BaseEmailProps) {
  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          {children}
        </Container>
      </Body>
    </Html>
  );
}

// Logo Component
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function EmailLogo({ size = 'md' }: LogoProps) {
  const sizes = { sm: 40, md: 60, lg: 80 };
  return (
    <Img
      src="https://datingassistent.nl/images/LogoDatingAssistent.png"
      alt="DatingAssistent"
      width={sizes[size]}
      height={sizes[size]}
      style={{ margin: '0 auto' }}
    />
  );
}

// Header with gradient background
interface HeroHeaderProps {
  emoji?: string;
  title: string;
  subtitle?: string;
}

export function HeroHeader({ emoji, title, subtitle }: HeroHeaderProps) {
  return (
    <Section style={styles.heroGradient}>
      <EmailLogo size="md" />
      {emoji && (
        <Text style={{ fontSize: '48px', margin: '16px 0 8px 0' }}>{emoji}</Text>
      )}
      <Text style={{ ...styles.heading1, color: colors.white, marginTop: '16px' }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ ...styles.paragraph, color: 'rgba(255,255,255,0.9)', margin: '0' }}>
          {subtitle}
        </Text>
      )}
    </Section>
  );
}

// Simple header with logo
export function SimpleHeader() {
  return (
    <Section style={styles.header}>
      <EmailLogo size="md" />
      <Text style={{ color: colors.gray, fontSize: '14px', margin: '12px 0 0 0' }}>
        De dating coach die altijd beschikbaar is
      </Text>
    </Section>
  );
}

// Primary CTA Button
interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function CTAButton({ href, children, variant = 'primary' }: CTAButtonProps) {
  return (
    <Section style={{ textAlign: 'center', margin: '32px 0' }}>
      <Button
        href={href}
        style={variant === 'primary' ? styles.primaryButton : styles.secondaryButton}
      >
        {children}
      </Button>
    </Section>
  );
}

// Feature/Benefit Card
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Row style={{ marginBottom: '16px' }}>
      <Column style={{ width: '48px', verticalAlign: 'top' }}>
        <Text style={{ fontSize: '24px', margin: '0' }}>{icon}</Text>
      </Column>
      <Column>
        <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark, marginBottom: '4px' }}>
          {title}
        </Text>
        <Text style={{ ...styles.paragraph, fontSize: '14px', margin: '0' }}>
          {description}
        </Text>
      </Column>
    </Row>
  );
}

// Stats Grid
interface Stat {
  value: string;
  label: string;
  icon?: string;
}

interface StatsGridProps {
  stats: Stat[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <Section style={styles.card}>
      <Row>
        {stats.map((stat, index) => (
          <Column key={index} style={styles.statBox}>
            {stat.icon && <Text style={{ fontSize: '24px', margin: '0 0 8px 0' }}>{stat.icon}</Text>}
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Column>
        ))}
      </Row>
    </Section>
  );
}

// Info Box / Callout
interface InfoBoxProps {
  type?: 'info' | 'success' | 'warning' | 'tip';
  title?: string;
  children: React.ReactNode;
}

export function InfoBox({ type = 'info', title, children }: InfoBoxProps) {
  const typeColors = {
    info: { bg: '#eff6ff', border: colors.info, icon: 'info' },
    success: { bg: '#f0fdf4', border: colors.success, icon: 'check' },
    warning: { bg: '#fefce8', border: colors.warning, icon: 'warning' },
    tip: { bg: '#fef3f3', border: colors.primary, icon: 'tip' },
  };

  const config = typeColors[type];

  return (
    <Section style={{
      backgroundColor: config.bg,
      borderLeft: \`4px solid \${config.border}\`,
      borderRadius: '8px',
      padding: '20px',
      margin: '24px 0',
    }}>
      {title && (
        <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark, marginBottom: '8px' }}>
          {title}
        </Text>
      )}
      <Text style={{ ...styles.paragraph, margin: '0', fontSize: '15px' }}>
        {children}
      </Text>
    </Section>
  );
}

// Progress Bar
interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <Section style={{ margin: '16px 0' }}>
      {label && (
        <Text style={{ ...styles.paragraph, fontSize: '14px', marginBottom: '8px' }}>
          {label}
        </Text>
      )}
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse' }}>
        <tr>
          <td style={{
            backgroundColor: colors.lightGray,
            borderRadius: '10px',
            height: '10px',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #E14874 0%, #f97316 100%)',
              borderRadius: '10px',
              height: '10px',
              width: \`\${Math.min(100, Math.max(0, progress))}%\`,
            }} />
          </td>
        </tr>
      </table>
    </Section>
  );
}

// Email Footer
interface EmailFooterProps {
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}

export function EmailFooter({ unsubscribeUrl, preferencesUrl }: EmailFooterProps) {
  const baseUrl = 'https://datingassistent.nl';

  return (
    <Section style={styles.footer}>
      <EmailLogo size="sm" />

      <Text style={{ ...styles.footerText, marginTop: '16px' }}>
        © {new Date().getFullYear()} DatingAssistent. Alle rechten voorbehouden.
      </Text>

      <Text style={styles.footerText}>
        <Link href={\`\${baseUrl}/privacy\`} style={styles.footerLink}>Privacy</Link>
        {' | '}
        <Link href={\`\${baseUrl}/algemene-voorwaarden\`} style={styles.footerLink}>Voorwaarden</Link>
        {' | '}
        <Link href={\`\${baseUrl}/help\`} style={styles.footerLink}>Help</Link>
      </Text>

      {(unsubscribeUrl || preferencesUrl) && (
        <Text style={{ ...styles.footerText, marginTop: '16px', fontSize: '12px', color: '#9ca3af' }}>
          {preferencesUrl && (
            <Link href={preferencesUrl} style={{ ...styles.footerLink, fontSize: '12px', color: '#9ca3af' }}>
              Email voorkeuren aanpassen
            </Link>
          )}
          {preferencesUrl && unsubscribeUrl && ' | '}
          {unsubscribeUrl && (
            <Link href={unsubscribeUrl} style={{ ...styles.footerLink, fontSize: '12px', color: '#9ca3af' }}>
              Uitschrijven
            </Link>
          )}
        </Text>
      )}

      <Text style={{ ...styles.footerText, marginTop: '16px', fontSize: '11px', color: '#9ca3af' }}>
        DatingAssistent B.V. - Nederland
      </Text>
    </Section>
  );
}

// Greeting
interface GreetingProps {
  name: string;
  emoji?: string;
}

export function Greeting({ name, emoji }: GreetingProps) {
  return (
    <Text style={{ ...styles.heading2, color: colors.primary }}>
      Hoi {name}! {emoji}
    </Text>
  );
}

// Numbered Steps List
interface Step {
  title: string;
  description: string;
}

interface StepsListProps {
  steps: Step[];
}

export function StepsList({ steps }: StepsListProps) {
  return (
    <Section style={{ margin: '24px 0' }}>
      {steps.map((step, index) => (
        <Row key={index} style={{ marginBottom: '20px' }}>
          <Column style={{ width: '40px', verticalAlign: 'top' }}>
            <table cellPadding="0" cellSpacing="0">
              <tr>
                <td style={{
                  background: 'linear-gradient(135deg, #E14874 0%, #f97316 100%)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  textAlign: 'center',
                  color: colors.white,
                  fontWeight: '700',
                  fontSize: '14px',
                }}>
                  {index + 1}
                </td>
              </tr>
            </table>
          </Column>
          <Column>
            <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark, marginBottom: '4px' }}>
              {step.title}
            </Text>
            <Text style={{ ...styles.paragraph, fontSize: '14px', margin: '0' }}>
              {step.description}
            </Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

// Achievement Badge
interface AchievementBadgeProps {
  icon: string;
  title: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export function AchievementBadge({ icon, title, rarity = 'common' }: AchievementBadgeProps) {
  const rarityColors = {
    common: { bg: '#f3f4f6', border: '#d1d5db' },
    rare: { bg: '#dbeafe', border: '#3b82f6' },
    epic: { bg: '#f3e8ff', border: '#9333ea' },
    legendary: { bg: '#fef3c7', border: '#f59e0b' },
  };

  const config = rarityColors[rarity];

  return (
    <Section style={{
      backgroundColor: config.bg,
      border: \`2px solid \${config.border}\`,
      borderRadius: '16px',
      padding: '24px',
      textAlign: 'center',
      margin: '24px 0',
    }}>
      <Text style={{ fontSize: '48px', margin: '0 0 12px 0' }}>{icon}</Text>
      <Text style={{ ...styles.heading2, margin: '0' }}>{title}</Text>
      <Text style={{
        ...styles.badge,
        backgroundColor: config.border,
        marginTop: '12px',
        textTransform: 'uppercase',
        fontSize: '11px',
        letterSpacing: '0.5px',
      }}>
        {rarity}
      </Text>
    </Section>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'email-base.tsx'), emailBaseContent);
console.log('Created: email-base.tsx');

// Welcome Email
const welcomeEmailContent = `/**
 * Welcome Email - Sent after email verification
 * DatingAssistent World-Class Email System
 */

import * as React from 'react';
import { Section, Text, Hr } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  FeatureCard,
  StepsList,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface WelcomeEmailProps {
  firstName: string;
  subscriptionType: 'sociaal' | 'core' | 'pro' | 'premium';
  dashboardUrl?: string;
}

const tierFeatures = {
  sociaal: {
    name: 'Sociaal',
    features: ['AI Dating Coach', 'Basis tools', 'Community toegang'],
    aiMessages: 15,
  },
  core: {
    name: 'Core',
    features: ['Onbeperkt AI Coach', 'Alle tools', '8+ cursussen', 'Foto analyse'],
    aiMessages: 50,
  },
  pro: {
    name: 'Pro',
    features: ['Alles van Core', 'Priority support', 'Geavanceerde analytics', 'Exclusieve content'],
    aiMessages: 100,
  },
  premium: {
    name: 'Premium',
    features: ['Alles onbeperkt', '1-op-1 coaching', 'VIP community', 'Eerste toegang nieuwe features'],
    aiMessages: 'Onbeperkt',
  },
};

export default function WelcomeEmail({
  firstName,
  subscriptionType = 'core',
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: WelcomeEmailProps) {
  const tier = tierFeatures[subscriptionType] || tierFeatures.core;
  const preferencesUrl = \`\${dashboardUrl}/settings/email-preferences\`;

  return (
    <BaseEmail preview={\`Welkom \${firstName}! Je dating journey begint nu\`}>
      <HeroHeader
        emoji="🎉"
        title="Welkom bij DatingAssistent!"
        subtitle="Je eerste stap naar succesvol daten"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="👋" />

        <Text style={styles.paragraph}>
          Wat geweldig dat je er bent! Je hebt zojuist de eerste stap gezet naar
          succesvol en zelfverzekerd daten. Met je <strong>{tier.name}</strong> pakket
          heb je toegang tot alles wat je nodig hebt.
        </Text>

        <InfoBox type="success" title="Je pakket is actief">
          Je {tier.name} abonnement is nu actief met {typeof tier.aiMessages === 'number' ? \`\${tier.aiMessages} AI berichten per week\` : 'onbeperkte AI berichten'}.
        </InfoBox>

        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          Je eerste 3 stappen:
        </Text>

        <StepsList
          steps={[
            {
              title: 'Profiel completeren (30 sec)',
              description: 'Vul je profiel aan zodat de AI je beter kan helpen met persoonlijk advies.',
            },
            {
              title: 'Eerste AI chat starten',
              description: 'Stel je eerste vraag aan de Chat Coach en krijg direct advies.',
            },
            {
              title: 'Ontdek de tools',
              description: 'Probeer de profielanalyzer of openingszinnen generator.',
            },
          ]}
        />

        <CTAButton href={dashboardUrl}>
          Start je dating avontuur
        </CTAButton>

        <Hr style={styles.divider} />

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Wat je kunt verwachten:
        </Text>

        <FeatureCard
          icon="🤖"
          title="24/7 AI Dating Coach"
          description="Stel al je dating vragen, dag en nacht. Van profiel tips tot gesprekstechnieken."
        />
        <FeatureCard
          icon="📚"
          title="8+ Expert Cursussen"
          description="Van profieloptimalisatie tot eerste date tips. Leer van dating experts."
        />
        <FeatureCard
          icon="🛠️"
          title="20+ Slimme Tools"
          description="Profiel analyzer, openingszinnen generator, foto check, en meer."
        />
        <FeatureCard
          icon="📈"
          title="89% Meer Matches"
          description="Onze gebruikers zien gemiddeld 89% meer matches na 2 weken."
        />

        <InfoBox type="tip" title="Pro tip">
          Begin met de Chat Coach - vertel over je dating situatie en krijg
          direct persoonlijk advies. Je kunt letterlijk alles vragen!
        </InfoBox>

        <Text style={{ ...styles.paragraph, marginTop: '24px' }}>
          Heb je vragen? Reply gewoon op deze email of mail naar{' '}
          <a href="mailto:support@datingassistent.nl" style={styles.link}>
            support@datingassistent.nl
          </a>
          . We helpen je graag!
        </Text>

        <Text style={styles.paragraph}>
          Succes met je dating journey!
        </Text>

        <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark }}>
          Vincent & het DatingAssistent team
        </Text>
      </Section>

      <EmailFooter preferencesUrl={preferencesUrl} />
    </BaseEmail>
  );
}
`;

fs.writeFileSync(path.join(emailsDir, 'welcome-email.tsx'), welcomeEmailContent);
console.log('Created: welcome-email.tsx');

// Verification Email
const verificationEmailContent = `/**
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
  const codeDigits = verificationCode.split('');

  return (
    <BaseEmail preview={\`Je verificatiecode: \${verificationCode}\`}>
      <SimpleHeader />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="👋" />

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
                    border: \`2px solid \${colors.primary}\`,
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
`;

fs.writeFileSync(path.join(emailsDir, 'verification-email.tsx'), verificationEmailContent);
console.log('Created: verification-email.tsx');

// Profile Optimization Email
const profileOptimizationEmailContent = `/**
 * Profile Optimization Reminder - Sent 24h after registration if profile incomplete
 */

import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  ProgressBar,
  InfoBox,
  FeatureCard,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface ProfileOptimizationEmailProps {
  firstName: string;
  completionPercentage: number;
  missingFields: string[];
  dashboardUrl?: string;
}

export default function ProfileOptimizationEmail({
  firstName,
  completionPercentage = 30,
  missingFields = ['Profielfoto', 'Bio tekst', 'Dating voorkeuren'],
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: ProfileOptimizationEmailProps) {
  const profileUrl = \`\${dashboardUrl}?tab=profile\`;
  const preferencesUrl = \`\${dashboardUrl}/settings/email-preferences\`;

  return (
    <BaseEmail preview={\`\${firstName}, je profiel is \${completionPercentage}% compleet - nog even door!\`}>
      <HeroHeader
        emoji="📝"
        title="Je profiel is bijna klaar!"
        subtitle="Nog een paar stappen naar betere resultaten"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="👋" />

        <Text style={styles.paragraph}>
          Je bent goed op weg! Je profiel is nu <strong>{completionPercentage}%</strong> compleet.
          Met een volledig profiel krijgt de AI Coach een veel beter beeld van jou.
        </Text>

        <Section style={{
          backgroundColor: colors.lightGray,
          borderRadius: '16px',
          padding: '24px',
          margin: '24px 0',
        }}>
          <Row>
            <Column style={{ width: '80px', textAlign: 'center', verticalAlign: 'middle' }}>
              <Text style={{
                fontSize: '36px',
                fontWeight: '700',
                color: colors.primary,
                margin: '0',
              }}>
                {completionPercentage}%
              </Text>
            </Column>
            <Column style={{ paddingLeft: '16px' }}>
              <Text style={{ ...styles.paragraph, fontWeight: '600', marginBottom: '8px', color: colors.dark }}>
                Profiel voortgang
              </Text>
              <ProgressBar progress={completionPercentage} />
            </Column>
          </Row>
        </Section>

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Dit mist nog:
        </Text>

        <Section style={{ margin: '16px 0' }}>
          {missingFields.map((field, index) => (
            <Row key={index} style={{ marginBottom: '12px' }}>
              <Column style={{ width: '32px' }}>
                <Text style={{ fontSize: '18px', margin: '0' }}>⭕</Text>
              </Column>
              <Column>
                <Text style={{ ...styles.paragraph, margin: '0' }}>{field}</Text>
              </Column>
            </Row>
          ))}
        </Section>

        <CTAButton href={profileUrl}>
          Profiel Afronden
        </CTAButton>

        <InfoBox type="tip" title="Wist je dat?">
          Gebruikers met een volledig profiel krijgen <strong>40% betere</strong> AI
          suggesties en halen gemiddeld <strong>2x meer</strong> uit hun abonnement.
        </InfoBox>

        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          Waarom dit belangrijk is:
        </Text>

        <FeatureCard
          icon="🎯"
          title="Persoonlijker advies"
          description="De AI begrijpt jouw unieke situatie en geeft relevantere tips."
        />
        <FeatureCard
          icon="💬"
          title="Betere openingszinnen"
          description="Genereer berichten die echt bij jouw persoonlijkheid passen."
        />
        <FeatureCard
          icon="📊"
          title="Slimmere analyses"
          description="Krijg diepere inzichten gebaseerd op jouw dating doelen."
        />

        <Text style={{ ...styles.paragraph, marginTop: '24px' }}>
          Duurt maar 2 minuten! 🚀
        </Text>
      </Section>

      <EmailFooter preferencesUrl={preferencesUrl} />
    </BaseEmail>
  );
}
`;

fs.writeFileSync(path.join(emailsDir, 'profile-optimization-email.tsx'), profileOptimizationEmailContent);
console.log('Created: profile-optimization-email.tsx');

// First Win Email
const firstWinEmailContent = `/**
 * First Win Email - Sent after user uses their first feature
 */

import * as React from 'react';
import { Section, Text } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  FeatureCard,
  InfoBox,
  AchievementBadge,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface FirstWinEmailProps {
  firstName: string;
  featureUsed?: string;
  dashboardUrl?: string;
}

const featureInfo: Record<string, { title: string; nextFeature: string; nextDescription: string }> = {
  ai_chat: {
    title: 'AI Chat Coach',
    nextFeature: 'Probeer nu de Openingszinnen Generator',
    nextDescription: 'Genereer perfecte eerste berichten gebaseerd op profielen.',
  },
  icebreaker: {
    title: 'Openingszinnen Generator',
    nextFeature: 'Probeer nu de Profiel Analyzer',
    nextDescription: 'Laat AI je dating profiel analyseren voor betere resultaten.',
  },
  photo_analysis: {
    title: 'Foto Analyse',
    nextFeature: 'Probeer nu de AI Chat Coach',
    nextDescription: 'Krijg persoonlijk advies voor elke dating situatie.',
  },
  default: {
    title: 'je eerste tool',
    nextFeature: 'Probeer de AI Chat Coach',
    nextDescription: 'Krijg persoonlijk advies voor elke dating situatie.',
  },
};

export default function FirstWinEmail({
  firstName,
  featureUsed = 'ai_chat',
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: FirstWinEmailProps) {
  const feature = featureInfo[featureUsed] || featureInfo.default;
  const preferencesUrl = \`\${dashboardUrl}/settings/email-preferences\`;

  return (
    <BaseEmail preview={\`\${firstName}, je eerste stap is gezet! Hier is wat je hierna kunt doen.\`}>
      <HeroHeader
        emoji="🎉"
        title="Je eerste stap is gezet!"
        subtitle="Geweldig bezig - hier is je volgende stap"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="🌟" />

        <Text style={styles.paragraph}>
          <strong>Gefeliciteerd!</strong> Je hebt zojuist de <strong>{feature.title}</strong> gebruikt.
          Dit is een belangrijke eerste stap in je dating journey.
        </Text>

        <AchievementBadge
          icon="🏅"
          title="Eerste Stap Achievement"
          rarity="common"
        />

        <Text style={styles.paragraph}>
          Studies tonen aan dat mensen die actief tools gebruiken <strong>3x meer kans</strong> hebben
          op dating succes. Je bent op de goede weg!
        </Text>

        <InfoBox type="tip" title={feature.nextFeature}>
          {feature.nextDescription}
        </InfoBox>

        <CTAButton href={dashboardUrl}>
          Ontdek meer tools
        </CTAButton>

        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          Populair bij andere gebruikers:
        </Text>

        <FeatureCard
          icon="💬"
          title="Chat Coach"
          description="Stel elke dating vraag en krijg direct expert advies."
        />
        <FeatureCard
          icon="✨"
          title="Openingszinnen Generator"
          description="Nooit meer zonder woorden - genereer perfecte openers."
        />
        <FeatureCard
          icon="📸"
          title="Foto Analyse"
          description="Ontdek welke foto's het beste werken op dating apps."
        />
        <FeatureCard
          icon="📚"
          title="Expert Cursussen"
          description="Van match tot date - leer van de beste dating coaches."
        />

        <Text style={{ ...styles.paragraph, marginTop: '24px' }}>
          Blijf ontdekken en experimenteren!
        </Text>

        <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark }}>
          Veel succes!<br />
          Het DatingAssistent team
        </Text>
      </Section>

      <EmailFooter preferencesUrl={preferencesUrl} />
    </BaseEmail>
  );
}
`;

fs.writeFileSync(path.join(emailsDir, 'first-win-email.tsx'), firstWinEmailContent);
console.log('Created: first-win-email.tsx');

// Course Introduction Email
const courseIntroEmailContent = `/**
 * Course Introduction Email - Day 5 after registration
 */
import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  FeatureCard,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface CourseIntroductionEmailProps {
  firstName: string;
  featuredCourseTitle?: string;
  featuredCourseDescription?: string;
  coursesAvailable?: number;
  dashboardUrl?: string;
}

export default function CourseIntroductionEmail({
  firstName,
  featuredCourseTitle = 'De Perfecte Opening',
  featuredCourseDescription = 'Leer hoe je matches omzet in gesprekken',
  coursesAvailable = 8,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: CourseIntroductionEmailProps) {
  return (
    <BaseEmail preview="Ontdek onze dating cursussen - Start vandaag nog!">
      <HeroHeader
        emoji="📚"
        title="Leer van de beste dating experts"
        subtitle="Je cursussen wachten op je"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="👋" />

        <Text style={styles.paragraph}>
          Naast de AI Coach heb je ook toegang tot <strong>{coursesAvailable} professionele cursussen</strong>.
          Van profieloptimalisatie tot gesprekstechnieken - alles wat je nodig hebt.
        </Text>

        <Section style={{
          background: 'linear-gradient(135deg, #fef3f3 0%, #fff5f5 100%)',
          borderRadius: '16px',
          padding: '24px',
          margin: '24px 0',
          border: '1px solid #fecdd3',
        }}>
          <Text style={{ fontSize: '14px', color: colors.primary, fontWeight: '600', margin: '0 0 8px 0' }}>
            AANBEVOLEN VOOR JOU
          </Text>
          <Text style={{ ...styles.heading2, margin: '0 0 8px 0' }}>
            {featuredCourseTitle}
          </Text>
          <Text style={{ ...styles.paragraph, margin: '0' }}>
            {featuredCourseDescription}
          </Text>
        </Section>

        <CTAButton href={\`\${dashboardUrl}?tab=courses\`}>
          Bekijk alle cursussen
        </CTAButton>

        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          Wat je gaat leren:
        </Text>

        <FeatureCard
          icon="💬"
          title="Gesprekstechnieken"
          description="Van match naar date met bewezen strategieen."
        />
        <FeatureCard
          icon="📸"
          title="Profieloptimalisatie"
          description="Maak een profiel dat opvalt en matches aantrekt."
        />
        <FeatureCard
          icon="🎯"
          title="Dating Psychologie"
          description="Begrijp wat werkt en waarom in de dating wereld."
        />
        <FeatureCard
          icon="❤️"
          title="Date Voorbereiding"
          description="Van planning tot perfecte eerste indruk."
        />

        <InfoBox type="tip" title="Pro tip">
          Start met 1 cursus en pas de lessen direct toe. Theorie + praktijk = resultaat!
        </InfoBox>
      </Section>

      <EmailFooter preferencesUrl={\`\${dashboardUrl}/settings/email-preferences\`} />
    </BaseEmail>
  );
}
`;

fs.writeFileSync(path.join(emailsDir, 'course-introduction-email.tsx'), courseIntroEmailContent);
console.log('Created: course-introduction-email.tsx');

// Weekly Check-in Email
const weeklyCheckinEmailContent = `/**
 * Weekly Check-in Email - Day 7 after registration
 */
import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  StatsGrid,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface WeeklyCheckinEmailProps {
  firstName: string;
  daysActive?: number;
  toolsUsed?: number;
  coursesStarted?: number;
  aiMessagesUsed?: number;
  dashboardUrl?: string;
  feedbackUrl?: string;
}

export default function WeeklyCheckinEmail({
  firstName,
  daysActive = 7,
  toolsUsed = 3,
  coursesStarted = 1,
  aiMessagesUsed = 12,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
  feedbackUrl = 'https://datingassistent.nl/feedback',
}: WeeklyCheckinEmailProps) {
  return (
    <BaseEmail preview="Je eerste week is voorbij - Hoe gaat het?">
      <HeroHeader
        emoji="📊"
        title="Je eerste week samengevat"
        subtitle="Kijk wat je allemaal hebt bereikt!"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="🎉" />

        <Text style={styles.paragraph}>
          Een week geleden begon je je dating journey met DatingAssistent.
          Hier is wat je hebt bereikt:
        </Text>

        <StatsGrid
          stats={[
            { value: String(daysActive), label: 'Dagen actief', icon: '📅' },
            { value: String(toolsUsed), label: 'Tools gebruikt', icon: '🛠️' },
            { value: String(aiMessagesUsed), label: 'AI chats', icon: '💬' },
          ]}
        />

        <Text style={styles.paragraph}>
          {toolsUsed >= 3
            ? 'Geweldig! Je bent goed op weg. Blijf zo doorgaan!'
            : 'Er is nog zoveel te ontdekken. Probeer deze week meer tools!'}
        </Text>

        <CTAButton href={dashboardUrl}>
          Ga naar je dashboard
        </CTAButton>

        <InfoBox type="info" title="We horen graag van je">
          Hoe bevalt DatingAssistent tot nu toe? Je feedback helpt ons om
          de ervaring te verbeteren voor iedereen.
        </InfoBox>

        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <a href={feedbackUrl} style={{ ...styles.link, fontSize: '14px' }}>
            Geef feedback (1 minuut)
          </a>
        </Section>
      </Section>

      <EmailFooter preferencesUrl={\`\${dashboardUrl}/settings/email-preferences\`} />
    </BaseEmail>
  );
}
`;

fs.writeFileSync(path.join(emailsDir, 'weekly-checkin-email.tsx'), weeklyCheckinEmailContent);
console.log('Created: weekly-checkin-email.tsx');

// Inactivity 3 Days Email
const inactivity3DaysEmailContent = `/**
 * Inactivity Alert - 3 Days
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import {
  BaseEmail,
  SimpleHeader,
  Greeting,
  CTAButton,
  FeatureCard,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface Inactivity3DaysEmailProps {
  firstName: string;
  lastActiveDate?: string;
  lastToolUsed?: string;
  dashboardUrl?: string;
}

export default function InactivityAlert3DaysEmail({
  firstName,
  lastActiveDate = 'een paar dagen geleden',
  lastToolUsed,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: Inactivity3DaysEmailProps) {
  return (
    <BaseEmail preview="We missen je! Kom je nog langs?">
      <SimpleHeader />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="👋" />

        <Text style={styles.paragraph}>
          We merkten dat je een paar dagen niet bent ingelogd. Alles goed?
        </Text>

        <Text style={styles.paragraph}>
          Je AI Coach staat 24/7 voor je klaar. Of je nu een vraag hebt over
          je profiel, een gesprek, of gewoon even wilt sparren - we zijn er voor je.
        </Text>

        <CTAButton href={dashboardUrl}>
          Terug naar DatingAssistent
        </CTAButton>

        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          Dit gemist je misschien:
        </Text>

        <FeatureCard
          icon="💬"
          title="Nieuwe gesprekstips"
          description="De Chat Coach heeft nieuwe technieken geleerd."
        />
        <FeatureCard
          icon="📚"
          title="Cursus updates"
          description="Nieuwe lessen zijn toegevoegd aan je cursussen."
        />
        <FeatureCard
          icon="🎯"
          title="Persoonlijke tips"
          description="Gebaseerd op je profiel hebben we suggesties."
        />

        <InfoBox type="tip" title="Quick tip">
          Stel de Chat Coach 1 vraag vandaag. Het duurt maar 30 seconden
          en kan je dating leven veranderen!
        </InfoBox>
      </Section>

      <EmailFooter preferencesUrl={\`\${dashboardUrl}/settings/email-preferences\`} />
    </BaseEmail>
  );
}
`;

fs.writeFileSync(path.join(emailsDir, 'inactivity-alert-3days-email.tsx'), inactivity3DaysEmailContent);
console.log('Created: inactivity-alert-3days-email.tsx');

// Course Completion Email
const courseCompletionEmailContent = `/**
 * Course Completion Celebration Email
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  AchievementBadge,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface CourseCompletionEmailProps {
  firstName: string;
  courseTitle: string;
  completionDate?: string;
  nextCourseTitle?: string;
  totalCoursesCompleted?: number;
  dashboardUrl?: string;
}

export default function CourseCompletionEmail({
  firstName,
  courseTitle,
  completionDate = new Date().toLocaleDateString('nl-NL'),
  nextCourseTitle,
  totalCoursesCompleted = 1,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: CourseCompletionEmailProps) {
  return (
    <BaseEmail preview={\`Gefeliciteerd! Je hebt "\${courseTitle}" voltooid!\`}>
      <HeroHeader
        emoji="🎉"
        title="Cursus Voltooid!"
        subtitle="Geweldig gedaan - je groeit als dater!"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="🌟" />

        <Text style={styles.paragraph}>
          <strong>Gefeliciteerd!</strong> Je hebt zojuist de cursus
          "<strong>{courseTitle}</strong>" succesvol afgerond!
        </Text>

        <AchievementBadge
          icon="🎓"
          title={\`Cursus #\${totalCoursesCompleted} Voltooid\`}
          rarity={totalCoursesCompleted >= 5 ? 'epic' : totalCoursesCompleted >= 3 ? 'rare' : 'common'}
        />

        <Text style={styles.paragraph}>
          Je hebt nu waardevolle kennis die je direct kunt toepassen in je
          dating leven. Onthoud: kennis + actie = resultaat!
        </Text>

        {nextCourseTitle && (
          <InfoBox type="tip" title="Aanbevolen volgende cursus">
            <strong>{nextCourseTitle}</strong> - Perfect om verder te bouwen op wat je net hebt geleerd.
          </InfoBox>
        )}

        <CTAButton href={\`\${dashboardUrl}?tab=courses\`}>
          {nextCourseTitle ? 'Start volgende cursus' : 'Bekijk meer cursussen'}
        </CTAButton>

        <Section style={{
          backgroundColor: colors.lightGray,
          borderRadius: '12px',
          padding: '24px',
          margin: '24px 0',
          textAlign: 'center',
        }}>
          <Text style={{ fontSize: '14px', color: colors.gray, margin: '0 0 8px 0' }}>
            Voltooid op
          </Text>
          <Text style={{ ...styles.heading2, margin: '0', color: colors.primary }}>
            {completionDate}
          </Text>
        </Section>

        <Text style={styles.paragraph}>
          Blijf leren en groeien. Elke cursus brengt je dichter bij je dating doelen!
        </Text>
      </Section>

      <EmailFooter preferencesUrl={\`\${dashboardUrl}/settings/email-preferences\`} />
    </BaseEmail>
  );
}
`;

fs.writeFileSync(path.join(emailsDir, 'course-completion-email.tsx'), courseCompletionEmailContent);
console.log('Created: course-completion-email.tsx');

// Weekly Digest Email
const weeklyDigestEmailContent = `/**
 * Weekly Digest Email - Sent every Monday
 */
import * as React from 'react';
import { Section, Text, Row, Column, Hr } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  StatsGrid,
  InfoBox,
  FeatureCard,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface WeeklyDigestEmailProps {
  firstName: string;
  weekNumber?: number;
  stats: {
    toolsUsed: number;
    aiMessagesUsed: number;
    courseLessonsCompleted: number;
    daysActive: number;
  };
  weeklyTip: {
    title: string;
    description: string;
    icon: string;
  };
  featuredContent?: {
    type: string;
    title: string;
    description: string;
    url: string;
  };
  communityHighlight?: string;
  dashboardUrl?: string;
}

export default function WeeklyDigestEmail({
  firstName,
  weekNumber = 1,
  stats,
  weeklyTip,
  featuredContent,
  communityHighlight,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: WeeklyDigestEmailProps) {
  return (
    <BaseEmail preview={\`Je week \${weekNumber} samenvatting - DatingAssistent\`}>
      <HeroHeader
        emoji="📊"
        title={\`Week \${weekNumber} Samenvatting\`}
        subtitle="Jouw dating voortgang in een oogopslag"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="👋" />

        <Text style={styles.paragraph}>
          Hier is je wekelijkse update! Bekijk wat je hebt bereikt en
          ontdek nieuwe mogelijkheden.
        </Text>

        <StatsGrid
          stats={[
            { value: String(stats.daysActive), label: 'Dagen actief', icon: '📅' },
            { value: String(stats.toolsUsed), label: 'Tools', icon: '🛠️' },
            { value: String(stats.aiMessagesUsed), label: 'AI chats', icon: '💬' },
            { value: String(stats.courseLessonsCompleted), label: 'Lessen', icon: '📚' },
          ]}
        />

        <Hr style={styles.divider} />

        <Section style={{
          background: 'linear-gradient(135deg, #fef3f3 0%, #fff5f5 100%)',
          borderRadius: '12px',
          padding: '20px',
          margin: '24px 0',
        }}>
          <Text style={{ fontSize: '24px', margin: '0 0 8px 0' }}>{weeklyTip.icon}</Text>
          <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark, marginBottom: '8px' }}>
            Tip van de week: {weeklyTip.title}
          </Text>
          <Text style={{ ...styles.paragraph, margin: '0', fontSize: '14px' }}>
            {weeklyTip.description}
          </Text>
        </Section>

        {featuredContent && (
          <>
            <Text style={{ ...styles.heading2, marginTop: '24px' }}>
              Aanbevolen voor jou:
            </Text>
            <FeatureCard
              icon="⭐"
              title={featuredContent.title}
              description={featuredContent.description}
            />
          </>
        )}

        <CTAButton href={dashboardUrl}>
          Ga naar dashboard
        </CTAButton>

        {communityHighlight && (
          <InfoBox type="info" title="Community highlight">
            {communityHighlight}
          </InfoBox>
        )}
      </Section>

      <EmailFooter preferencesUrl={\`\${dashboardUrl}/settings/email-preferences\`} />
    </BaseEmail>
  );
}
`;

fs.writeFileSync(path.join(emailsDir, 'weekly-digest-email.tsx'), weeklyDigestEmailContent);
console.log('Created: weekly-digest-email.tsx');

// Milestone Achievement Email
const milestoneAchievementEmailContent = `/**
 * Milestone Achievement Email
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  AchievementBadge,
  StatsGrid,
  ProgressBar,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface MilestoneAchievementEmailProps {
  firstName: string;
  milestoneName: string;
  milestoneDescription?: string;
  milestoneIcon?: string;
  milestoneRarity?: 'common' | 'rare' | 'epic' | 'legendary';
  progressPercentage?: string;
  currentGoal?: string;
  achievementScore?: string;
  nextMilestone?: string;
  nextGoalProgress?: number;
  dashboardUrl?: string;
}

export default function MilestoneAchievementEmail({
  firstName,
  milestoneName,
  milestoneDescription = 'Gefeliciteerd met deze belangrijke stap!',
  milestoneIcon = '🏆',
  milestoneRarity = 'rare',
  progressPercentage = '75%',
  currentGoal = 'Volgende mijlpaal',
  achievementScore = 'Uitstekend',
  nextMilestone,
  nextGoalProgress = 0,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: MilestoneAchievementEmailProps) {
  return (
    <BaseEmail preview={\`\${milestoneName} - Gefeliciteerd!\`}>
      <HeroHeader
        emoji={milestoneIcon}
        title="Nieuwe Mijlpaal Bereikt!"
        subtitle="Je dating journey wordt steeds sterker"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="🌟" />

        <Text style={styles.paragraph}>
          <strong>Wat geweldig!</strong> Je hebt een belangrijke mijlpaal bereikt
          in je dating journey. Dit verdient een moment van erkenning!
        </Text>

        <AchievementBadge
          icon={milestoneIcon}
          title={milestoneName}
          rarity={milestoneRarity}
        />

        <Text style={styles.paragraph}>
          {milestoneDescription}
        </Text>

        <StatsGrid
          stats={[
            { value: progressPercentage, label: 'Voortgang', icon: '📊' },
            { value: currentGoal, label: 'Doel', icon: '🎯' },
            { value: achievementScore, label: 'Score', icon: '⭐' },
          ]}
        />

        {nextMilestone && (
          <>
            <Text style={{ ...styles.heading2, marginTop: '32px' }}>
              Volgende doel: {nextMilestone}
            </Text>
            <ProgressBar progress={nextGoalProgress} label="Voortgang naar volgende mijlpaal" />
          </>
        )}

        <CTAButton href={dashboardUrl}>
          Bekijk je achievements
        </CTAButton>

        <InfoBox type="tip" title="Blijf groeien">
          Elke mijlpaal brengt je dichter bij dating succes. Blijf de tools
          gebruiken en cursussen volgen!
        </InfoBox>
      </Section>

      <EmailFooter preferencesUrl={\`\${dashboardUrl}/settings/email-preferences\`} />
    </BaseEmail>
  );
}
`;

fs.writeFileSync(path.join(emailsDir, 'milestone-achievement-email.tsx'), milestoneAchievementEmailContent);
console.log('Created: milestone-achievement-email.tsx');

// Subscription Renewal Email
const subscriptionRenewalEmailContent = `/**
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
    <BaseEmail preview={\`Je abonnement verlengt over \${daysUntilRenewal} dagen\`}>
      <SimpleHeader />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="📅" />

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

        <CTAButton href={\`\${dashboardUrl}/settings/subscription\`}>
          Abonnement beheren
        </CTAButton>

        <InfoBox type="info" title="Vragen over je abonnement?">
          Je kunt je abonnement op elk moment aanpassen of opzeggen via
          je dashboard. Neem contact op als je hulp nodig hebt.
        </InfoBox>
      </Section>

      <EmailFooter preferencesUrl={\`\${dashboardUrl}/settings/email-preferences\`} />
    </BaseEmail>
  );
}
`;

fs.writeFileSync(path.join(emailsDir, 'subscription-renewal-email.tsx'), subscriptionRenewalEmailContent);
console.log('Created: subscription-renewal-email.tsx');

// Payment Failed Email
const paymentFailedEmailContent = `/**
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
        <Greeting name={firstName} emoji="⚠️" />

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

        <CTAButton href={\`\${dashboardUrl}/settings/billing\`}>
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
`;

fs.writeFileSync(path.join(emailsDir, 'payment-failed-email.tsx'), paymentFailedEmailContent);
console.log('Created: payment-failed-email.tsx');

// Feature Limit Reached Email
const featureLimitReachedEmailContent = `/**
 * Feature Limit Reached - Upsell Email
 */
import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  SimpleHeader,
  Greeting,
  CTAButton,
  FeatureCard,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface FeatureLimitReachedEmailProps {
  firstName: string;
  featureType?: string;
  currentLimit?: number;
  usageThisWeek?: number;
  subscriptionType?: string;
  resetDate?: string;
  dashboardUrl?: string;
}

const featureNames: Record<string, string> = {
  ai_messages: 'AI berichten',
  photo_analysis: 'Foto analyses',
  icebreakers: 'Openingszinnen',
};

export default function FeatureLimitReachedEmail({
  firstName,
  featureType = 'ai_messages',
  currentLimit = 25,
  usageThisWeek = 25,
  subscriptionType = 'Sociaal',
  resetDate,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: FeatureLimitReachedEmailProps) {
  const featureName = featureNames[featureType] || featureType;

  return (
    <BaseEmail preview={\`Je hebt je \${featureName} limiet bereikt\`}>
      <SimpleHeader />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="⚡" />

        <Text style={styles.paragraph}>
          Je hebt je wekelijkse limiet van <strong>{currentLimit} {featureName}</strong> bereikt.
          Dit laat zien dat je actief bezig bent met je dating journey!
        </Text>

        <Section style={{
          backgroundColor: colors.lightGray,
          borderRadius: '12px',
          padding: '24px',
          margin: '24px 0',
          textAlign: 'center',
        }}>
          <Text style={{ ...styles.statValue, marginBottom: '8px' }}>
            {usageThisWeek}/{currentLimit}
          </Text>
          <Text style={{ ...styles.paragraph, margin: '0' }}>
            {featureName} deze week gebruikt
          </Text>
          {resetDate && (
            <Text style={{ ...styles.paragraph, margin: '12px 0 0 0', fontSize: '14px' }}>
              Reset op: {resetDate}
            </Text>
          )}
        </Section>

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Wil je meer?
        </Text>

        <Text style={styles.paragraph}>
          Upgrade naar een hoger pakket voor meer {featureName} en extra features:
        </Text>

        <FeatureCard
          icon="💬"
          title="Core - €19.95/maand"
          description="50 AI berichten per week + alle cursussen"
        />
        <FeatureCard
          icon="⭐"
          title="Pro - €29.95/maand"
          description="100 AI berichten per week + priority support"
        />
        <FeatureCard
          icon="👑"
          title="Premium - €49.95/maand"
          description="Onbeperkt alles + 1-op-1 coaching"
        />

        <CTAButton href={\`\${dashboardUrl}/pricing\`}>
          Bekijk upgrade opties
        </CTAButton>

        <InfoBox type="tip" title="Tip">
          Als je je vragen slim formuleert, kun je meer uit elk AI bericht halen.
          Probeer specifieke, gedetailleerde vragen te stellen.
        </InfoBox>
      </Section>

      <EmailFooter preferencesUrl={\`\${dashboardUrl}/settings/email-preferences\`} />
    </BaseEmail>
  );
}
`;

fs.writeFileSync(path.join(emailsDir, 'feature-limit-reached-email.tsx'), featureLimitReachedEmailContent);
console.log('Created: feature-limit-reached-email.tsx');

// Monthly Progress Report Email
const monthlyProgressReportEmailContent = `/**
 * Monthly Progress Report
 */
import * as React from 'react';
import { Section, Text, Row, Column, Hr } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  StatsGrid,
  ProgressBar,
  AchievementBadge,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface MonthlyProgressReportEmailProps {
  firstName: string;
  monthName?: string;
  stats: {
    toolsUsed: number;
    aiMessages: number;
    coursesCompleted: number;
    lessonsCompleted: number;
    daysActive: number;
    totalDaysInMonth: number;
    streakDays: number;
    communityPosts?: number;
  };
  achievements?: Array<{ icon: string; title: string }>;
  topFeature?: {
    name: string;
    usage: number;
    icon: string;
  };
  comparisonToLastMonth?: {
    improvement: boolean;
    percentage: number;
  };
  dashboardUrl?: string;
}

export default function MonthlyProgressReportEmail({
  firstName,
  monthName = 'November',
  stats,
  achievements = [],
  topFeature,
  comparisonToLastMonth,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: MonthlyProgressReportEmailProps) {
  const activityPercentage = Math.round((stats.daysActive / stats.totalDaysInMonth) * 100);

  return (
    <BaseEmail preview={\`Je \${monthName} in review - DatingAssistent\`}>
      <HeroHeader
        emoji="📊"
        title={\`\${monthName} Rapport\`}
        subtitle="Je maandelijkse dating voortgang"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="🎉" />

        <Text style={styles.paragraph}>
          Wat een maand! Hier is een overzicht van alles wat je hebt bereikt
          in {monthName}.
        </Text>

        {comparisonToLastMonth && (
          <Section style={{
            backgroundColor: comparisonToLastMonth.improvement ? '#f0fdf4' : '#fef3f3',
            borderRadius: '12px',
            padding: '16px 24px',
            margin: '24px 0',
            textAlign: 'center',
          }}>
            <Text style={{
              ...styles.paragraph,
              margin: '0',
              color: comparisonToLastMonth.improvement ? '#10b981' : colors.primary,
              fontWeight: '600',
            }}>
              {comparisonToLastMonth.improvement ? '📈' : '📉'} {comparisonToLastMonth.percentage}%
              {comparisonToLastMonth.improvement ? ' meer' : ' minder'} actief dan vorige maand
            </Text>
          </Section>
        )}

        <StatsGrid
          stats={[
            { value: String(stats.daysActive), label: 'Dagen actief', icon: '📅' },
            { value: String(stats.aiMessages), label: 'AI chats', icon: '💬' },
            { value: String(stats.coursesCompleted), label: 'Cursussen', icon: '📚' },
            { value: String(stats.streakDays), label: 'Dag streak', icon: '🔥' },
          ]}
        />

        <Text style={{ ...styles.heading2, marginTop: '32px' }}>
          Activiteit
        </Text>
        <ProgressBar
          progress={activityPercentage}
          label={\`\${stats.daysActive} van \${stats.totalDaysInMonth} dagen actief (\${activityPercentage}%)\`}
        />

        {topFeature && (
          <>
            <Hr style={styles.divider} />
            <Section style={{
              backgroundColor: colors.lightGray,
              borderRadius: '12px',
              padding: '24px',
              margin: '24px 0',
              textAlign: 'center',
            }}>
              <Text style={{ fontSize: '32px', margin: '0 0 8px 0' }}>{topFeature.icon}</Text>
              <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark, marginBottom: '4px' }}>
                Meest gebruikte tool
              </Text>
              <Text style={{ ...styles.heading2, color: colors.primary, margin: '0' }}>
                {topFeature.name}
              </Text>
              <Text style={{ ...styles.paragraph, margin: '8px 0 0 0', fontSize: '14px' }}>
                {topFeature.usage}x gebruikt deze maand
              </Text>
            </Section>
          </>
        )}

        {achievements.length > 0 && (
          <>
            <Text style={{ ...styles.heading2, marginTop: '24px' }}>
              Behaalde achievements
            </Text>
            <Row>
              {achievements.slice(0, 3).map((achievement, index) => (
                <Column key={index} style={{ textAlign: 'center', padding: '8px' }}>
                  <Text style={{ fontSize: '32px', margin: '0 0 4px 0' }}>{achievement.icon}</Text>
                  <Text style={{ ...styles.paragraph, fontSize: '12px', margin: '0' }}>
                    {achievement.title}
                  </Text>
                </Column>
              ))}
            </Row>
          </>
        )}

        <CTAButton href={\`\${dashboardUrl}/stats\`}>
          Bekijk volledige statistieken
        </CTAButton>

        <Text style={styles.paragraph}>
          Ga zo door! Elke dag dat je investeert in jezelf brengt je dichter
          bij je dating doelen.
        </Text>
      </Section>

      <EmailFooter preferencesUrl={\`\${dashboardUrl}/settings/email-preferences\`} />
    </BaseEmail>
  );
}
`;

fs.writeFileSync(path.join(emailsDir, 'monthly-progress-report-email.tsx'), monthlyProgressReportEmailContent);
console.log('Created: monthly-progress-report-email.tsx');

// Feature Deep Dive Chat Email
const featureDeepDiveChatEmailContent = `/**
 * Feature Deep Dive - Chat Coach
 */
import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  FeatureCard,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface FeatureDeepDiveChatEmailProps {
  firstName: string;
  messagesUsed?: number;
  messagesRemaining?: number;
  dashboardUrl?: string;
}

export default function FeatureDeepDiveChatEmail({
  firstName,
  messagesUsed = 15,
  messagesRemaining = 35,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: FeatureDeepDiveChatEmailProps) {
  return (
    <BaseEmail preview="Chat Coach Deep Dive - Je 24/7 dating assistent">
      <HeroHeader
        emoji="💬"
        title="Chat Coach Deep Dive"
        subtitle="Ontdek alles wat je kunt vragen"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="👋" />

        <Text style={styles.paragraph}>
          De Chat Coach is je persoonlijke dating expert die 24/7 klaarstaat.
          Maar wist je dat je veel meer kunt vragen dan je misschien denkt?
        </Text>

        <Section style={{
          backgroundColor: colors.lightGray,
          borderRadius: '12px',
          padding: '20px 24px',
          margin: '24px 0',
        }}>
          <Row>
            <Column style={{ textAlign: 'center' }}>
              <Text style={{ ...styles.statValue, fontSize: '24px' }}>{messagesUsed}</Text>
              <Text style={{ ...styles.paragraph, fontSize: '12px', margin: '0' }}>Gebruikt</Text>
            </Column>
            <Column style={{ textAlign: 'center' }}>
              <Text style={{ ...styles.statValue, fontSize: '24px' }}>{messagesRemaining}</Text>
              <Text style={{ ...styles.paragraph, fontSize: '12px', margin: '0' }}>Beschikbaar</Text>
            </Column>
          </Row>
        </Section>

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Dit kun je allemaal vragen:
        </Text>

        <FeatureCard
          icon="📝"
          title="Profiel review"
          description="'Kun je mijn Tinder bio reviewen en verbeteren?'"
        />
        <FeatureCard
          icon="💬"
          title="Gesprekshulp"
          description="'Hoe reageer ik op dit bericht?' (plak de tekst erbij)"
        />
        <FeatureCard
          icon="📸"
          title="Foto advies"
          description="'Welke foto moet ik als eerste gebruiken?'"
        />
        <FeatureCard
          icon="🎯"
          title="Date planning"
          description="'Geef me 5 originele date ideeen in Amsterdam'"
        />
        <FeatureCard
          icon="🤔"
          title="Situatie advies"
          description="'Ze reageert niet meer, wat moet ik doen?'"
        />
        <FeatureCard
          icon="❤️"
          title="Relatie tips"
          description="'Hoe maak ik van een date een tweede date?'"
        />

        <CTAButton href={\`\${dashboardUrl}?tab=chat\`}>
          Start een gesprek
        </CTAButton>

        <InfoBox type="tip" title="Pro tip">
          Hoe specifieker je vraag, hoe beter het advies. Geef context over
          je situatie voor de beste resultaten!
        </InfoBox>
      </Section>

      <EmailFooter preferencesUrl={\`\${dashboardUrl}/settings/email-preferences\`} />
    </BaseEmail>
  );
}
`;

fs.writeFileSync(path.join(emailsDir, 'feature-deepdive-chat-email.tsx'), featureDeepDiveChatEmailContent);
console.log('Created: feature-deepdive-chat-email.tsx');

// Mid Trial Check Email
const midTrialCheckEmailContent = `/**
 * Mid Trial Check - 2 weeks review
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  StatsGrid,
  ProgressBar,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface MidTrialCheckEmailProps {
  firstName: string;
  daysActive?: number;
  toolsUsed?: number;
  coursesCompleted?: number;
  subscriptionType?: string;
  dashboardUrl?: string;
}

export default function MidTrialCheckEmail({
  firstName,
  daysActive = 14,
  toolsUsed = 5,
  coursesCompleted = 2,
  subscriptionType = 'core',
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: MidTrialCheckEmailProps) {
  const engagementScore = Math.min(100, (toolsUsed * 10) + (coursesCompleted * 20) + (daysActive * 2));

  return (
    <BaseEmail preview="Je bent 2 weken bezig - Hoe gaat het?">
      <HeroHeader
        emoji="🎯"
        title="2 Weken Check-in"
        subtitle="Halverwege - tijd voor een update!"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} emoji="👋" />

        <Text style={styles.paragraph}>
          Je bent nu 2 weken onderweg met DatingAssistent. Laten we kijken
          hoe je ervoor staat en wat je nog kunt ontdekken.
        </Text>

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Je engagement score:
        </Text>
        <ProgressBar progress={engagementScore} label={\`\${engagementScore}/100 punten\`} />

        <StatsGrid
          stats={[
            { value: String(daysActive), label: 'Dagen actief', icon: '📅' },
            { value: String(toolsUsed), label: 'Tools gebruikt', icon: '🛠️' },
            { value: String(coursesCompleted), label: 'Cursussen klaar', icon: '📚' },
          ]}
        />

        {engagementScore < 50 ? (
          <InfoBox type="warning" title="Je mist nog veel!">
            Je hebt nog niet alle features ontdekt. Er is zoveel meer dat
            je kan helpen met je dating journey. Probeer deze week eens
            een nieuwe tool of cursus!
          </InfoBox>
        ) : engagementScore < 80 ? (
          <InfoBox type="info" title="Goed bezig!">
            Je bent op de goede weg. Blijf zo doorgaan en je zult binnenkort
            resultaten zien in je dating leven.
          </InfoBox>
        ) : (
          <InfoBox type="success" title="Power user!">
            Wow, je haalt echt alles uit je abonnement! Je bent een
            voorbeeld voor andere gebruikers.
          </InfoBox>
        )}

        <CTAButton href={dashboardUrl}>
          Naar mijn dashboard
        </CTAButton>

        <Text style={styles.paragraph}>
          Heb je vragen of feedback? We horen graag van je! Reply gewoon
          op deze email.
        </Text>
      </Section>

      <EmailFooter preferencesUrl={\`\${dashboardUrl}/settings/email-preferences\`} />
    </BaseEmail>
  );
}
`;

fs.writeFileSync(path.join(emailsDir, 'mid-trial-check-email.tsx'), midTrialCheckEmailContent);
console.log('Created: mid-trial-check-email.tsx');

// Create index.ts for easy imports
const indexContent = `/**
 * Email Templates Index
 * DatingAssistent World-Class Email System
 */

// Base components
export * from './components/email-base';

// Email templates
export { default as WelcomeEmail } from './welcome-email';
export { default as VerificationEmail } from './verification-email';
export { default as ProfileOptimizationEmail } from './profile-optimization-email';
export { default as FirstWinEmail } from './first-win-email';
export { default as CourseIntroductionEmail } from './course-introduction-email';
export { default as WeeklyCheckinEmail } from './weekly-checkin-email';
export { default as InactivityAlert3DaysEmail } from './inactivity-alert-3days-email';
export { default as CourseCompletionEmail } from './course-completion-email';
export { default as WeeklyDigestEmail } from './weekly-digest-email';
export { default as MilestoneAchievementEmail } from './milestone-achievement-email';
export { default as SubscriptionRenewalEmail } from './subscription-renewal-email';
export { default as PaymentFailedEmail } from './payment-failed-email';
export { default as FeatureLimitReachedEmail } from './feature-limit-reached-email';
export { default as MonthlyProgressReportEmail } from './monthly-progress-report-email';
export { default as FeatureDeepDiveChatEmail } from './feature-deepdive-chat-email';
export { default as MidTrialCheckEmail } from './mid-trial-check-email';
`;

fs.writeFileSync(path.join(emailsDir, 'index.ts'), indexContent);
console.log('Created: index.ts');

console.log('\\n✅ All 16 email templates created successfully!');
