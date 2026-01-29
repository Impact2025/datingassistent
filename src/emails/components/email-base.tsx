/**
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

// Brand Colors - "Warm Vertrouwen" Design System
export const colors = {
  // Primary - Warm Coral
  primary: '#FF7B54',
  primaryDark: '#E66A43',
  primaryLight: '#FF9676',
  // Secondary - Deep Purple (Headers, Logo)
  secondary: '#722F37',
  secondaryLight: '#8B4249',
  secondaryDark: '#5C262D',
  // Gradient - Brand consistent
  gradient: 'linear-gradient(135deg, #FF7B54 0%, #722F37 100%)',
  gradientSoft: 'linear-gradient(135deg, #FFF8F3 0%, #F5E6E8 100%)',
  // Status Colors
  success: '#A8B5A0', // Sage Green
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  // Text Colors
  dark: '#2D3142', // Charcoal (not pure black)
  gray: '#6b7280',
  grayLight: '#9ca3af',
  // Background Colors - Warm tinted
  lightGray: '#F5E6E8', // Soft Blush
  cream: '#FFF8F3',
  white: '#ffffff',
  background: '#FFF8F3', // Cream background
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
    borderBottom: `1px solid ${colors.lightGray}`,
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #FF7B54 0%, #722F37 100%)',
    padding: '32px 32px 28px 32px', // Compact header
    textAlign: 'center' as const,
  },
  content: {
    padding: '32px',
  },
  footer: {
    backgroundColor: colors.cream, // Cream - brand consistent
    padding: '24px 32px',
    textAlign: 'center' as const,
    borderTop: `1px solid ${colors.lightGray}`,
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
    border: `2px solid ${colors.primary}`,
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

// Logo Component - Updated to new brand logo
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function EmailLogo({ size = 'md', showText = false }: LogoProps) {
  const sizes = { sm: 32, md: 48, lg: 64 };
  const textSizes = { sm: '16px', md: '20px', lg: '24px' };
  const logoSize = sizes[size];

  return (
    <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
      <tr>
        <td style={{ verticalAlign: 'middle' }}>
          <Img
            src="https://datingassistent.nl/images/LogoDA.png"
            alt="DatingAssistent"
            width={logoSize}
            height={logoSize}
            style={{ display: 'block' }}
          />
        </td>
        {showText && (
          <td style={{ verticalAlign: 'middle', paddingLeft: '10px' }}>
            <span style={{
              fontSize: textSizes[size],
              fontFamily: '"Inter", Arial, sans-serif',
              fontWeight: '700',
              letterSpacing: '-0.02em',
            }}>
              <span style={{ color: colors.secondary }}>Dating</span>
              <span style={{ color: colors.dark }}>Assistent</span>
            </span>
          </td>
        )}
      </tr>
    </table>
  );
}

// Header with gradient background - Brand "Warm Vertrouwen" gradient
interface HeroHeaderProps {
  title: string;
  subtitle?: string;
}

export function HeroHeader({ title, subtitle }: HeroHeaderProps) {
  return (
    <Section style={{
      ...styles.heroGradient,
      padding: '32px 32px 28px 32px', // Reduced padding
    }}>
      {/* Logo with brand text */}
      <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
        <tr>
          <td style={{ verticalAlign: 'middle' }}>
            <Img
              src="https://datingassistent.nl/images/LogoDA.png"
              alt="DatingAssistent"
              width={44}
              height={44}
              style={{ display: 'block' }}
            />
          </td>
          <td style={{ verticalAlign: 'middle', paddingLeft: '10px' }}>
            <span style={{
              fontSize: '22px',
              fontFamily: '"Inter", Arial, sans-serif',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              color: colors.white,
            }}>
              DatingAssistent
            </span>
          </td>
        </tr>
      </table>
      <Text style={{ ...styles.heading1, color: colors.white, marginTop: '16px', marginBottom: '0' }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ ...styles.paragraph, color: 'rgba(255,255,255,0.9)', margin: '8px 0 0 0', fontSize: '15px' }}>
          {subtitle}
        </Text>
      )}
    </Section>
  );
}

// Header with solid Warm Coral background (brand style - no gradient)
interface PinkHeaderProps {
  title: string;
  subtitle?: string;
}

export function PinkHeader({ title, subtitle }: PinkHeaderProps) {
  return (
    <Section style={{
      backgroundColor: colors.primary,
      padding: '32px 32px 28px 32px', // Reduced padding
      textAlign: 'center' as const,
    }}>
      {/* Logo with brand text */}
      <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
        <tr>
          <td style={{ verticalAlign: 'middle' }}>
            <Img
              src="https://datingassistent.nl/images/LogoDA.png"
              alt="DatingAssistent"
              width={44}
              height={44}
              style={{ display: 'block' }}
            />
          </td>
          <td style={{ verticalAlign: 'middle', paddingLeft: '10px' }}>
            <span style={{
              fontSize: '22px',
              fontFamily: '"Inter", Arial, sans-serif',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              color: colors.white,
            }}>
              DatingAssistent
            </span>
          </td>
        </tr>
      </table>
      <Text style={{ ...styles.heading1, color: colors.white, marginTop: '16px', marginBottom: '0' }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ ...styles.paragraph, color: 'rgba(255,255,255,0.9)', margin: '8px 0 0 0', fontSize: '15px' }}>
          {subtitle}
        </Text>
      )}
    </Section>
  );
}

// Simple header with logo and brand text
export function SimpleHeader() {
  return (
    <Section style={styles.header}>
      <EmailLogo size="md" showText={true} />
      <Text style={{
        color: colors.gray,
        fontSize: '12px',
        margin: '12px 0 0 0',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: '500',
      }}>
        Durf te daten, durf jezelf te zijn
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
      borderLeft: `4px solid ${config.border}`,
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
              background: 'linear-gradient(135deg, #FF7B54 0%, #722F37 100%)',
              borderRadius: '10px',
              height: '10px',
              width: `${Math.min(100, Math.max(0, progress))}%`,
            }} />
          </td>
        </tr>
      </table>
    </Section>
  );
}

// Email Footer - Updated with brand styling
interface EmailFooterProps {
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}

export function EmailFooter({ unsubscribeUrl, preferencesUrl }: EmailFooterProps) {
  const baseUrl = 'https://datingassistent.nl';

  return (
    <Section style={{
      ...styles.footer,
      backgroundColor: colors.cream,
      borderTop: `1px solid ${colors.lightGray}`,
    }}>
      <EmailLogo size="sm" showText={true} />

      <Text style={{ ...styles.footerText, marginTop: '20px', color: colors.gray }}>
        © {new Date().getFullYear()} DatingAssistent. Alle rechten voorbehouden.
      </Text>

      <Text style={{ ...styles.footerText, marginTop: '12px' }}>
        <Link href={`${baseUrl}/privacy`} style={styles.footerLink}>Privacy</Link>
        {' | '}
        <Link href={`${baseUrl}/algemene-voorwaarden`} style={styles.footerLink}>Voorwaarden</Link>
        {' | '}
        <Link href={`${baseUrl}/help`} style={styles.footerLink}>Help</Link>
      </Text>

      {(unsubscribeUrl || preferencesUrl) && (
        <Text style={{ ...styles.footerText, marginTop: '16px', fontSize: '12px', color: colors.grayLight }}>
          {preferencesUrl && (
            <Link href={preferencesUrl} style={{ ...styles.footerLink, fontSize: '12px', color: colors.grayLight }}>
              Email voorkeuren aanpassen
            </Link>
          )}
          {preferencesUrl && unsubscribeUrl && ' | '}
          {unsubscribeUrl && (
            <Link href={unsubscribeUrl} style={{ ...styles.footerLink, fontSize: '12px', color: colors.grayLight }}>
              Uitschrijven
            </Link>
          )}
        </Text>
      )}

      <Text style={{ ...styles.footerText, marginTop: '16px', fontSize: '11px', color: colors.grayLight }}>
        DatingAssistent B.V. - Nederland
      </Text>
    </Section>
  );
}

// Greeting
interface GreetingProps {
  name: string;
}

export function Greeting({ name }: GreetingProps) {
  return (
    <Text style={{ ...styles.heading2, color: colors.primary }}>
      Hoi {name}!
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
                  background: 'linear-gradient(135deg, #FF7B54 0%, #722F37 100%)',
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
      border: `2px solid ${config.border}`,
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
