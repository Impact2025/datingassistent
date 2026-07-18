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
  // Background Colors - Neutral
  lightGray: '#e5e7eb',
  cream: '#f9fafb',
  white: '#ffffff',
  background: '#efefef',
};

// Shared Styles
export const styles = {
  main: {
    backgroundColor: colors.background,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: '0',
    padding: '48px 40px',
  },
  container: {
    backgroundColor: colors.white,
    margin: '0 auto',
    maxWidth: '520px',
    borderRadius: '4px',
    overflow: 'hidden' as const,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
  },
  header: {
    backgroundColor: colors.white,
    padding: '32px 56px 24px 56px',
    textAlign: 'center' as const,
    borderBottom: `1px solid ${colors.lightGray}`,
  },
  heroGradient: {
    backgroundColor: colors.white,
    padding: '32px 56px 24px 56px',
    textAlign: 'center' as const,
    borderBottom: `1px solid ${colors.lightGray}`,
  },
  content: {
    padding: '40px 56px',
  },
  footer: {
    backgroundColor: colors.white,
    padding: '28px 56px',
    textAlign: 'center' as const,
    borderTop: `1px solid ${colors.lightGray}`,
  },
  heading1: {
    color: colors.dark,
    fontSize: '26px',
    fontWeight: '700',
    lineHeight: '1.3',
    margin: '0 0 16px 0',
  },
  heading2: {
    color: colors.dark,
    fontSize: '20px',
    fontWeight: '600',
    lineHeight: '1.3',
    margin: '0 0 16px 0',
  },
  paragraph: {
    color: '#4B5563',
    fontSize: '15px',
    lineHeight: '1.75',
    margin: '0 0 20px 0',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: '4px',
    color: colors.white,
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: '600',
    padding: '13px 28px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    letterSpacing: '0.01em',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    border: `1.5px solid ${colors.lightGray}`,
    borderRadius: '4px',
    color: colors.dark,
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: '500',
    padding: '11px 24px',
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
  card: {
    backgroundColor: colors.white,
    border: `1px solid ${colors.lightGray}`,
    borderRadius: '4px',
    padding: '20px 24px',
    margin: '20px 0',
  },
  statBox: {
    textAlign: 'center' as const,
    padding: '16px',
  },
  statValue: {
    color: colors.primary,
    fontSize: '30px',
    fontWeight: '700',
    margin: '0',
  },
  statLabel: {
    color: colors.gray,
    fontSize: '13px',
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
    borderRadius: '3px',
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-block',
  },
  footerText: {
    color: colors.grayLight,
    fontSize: '13px',
    margin: '0 0 8px 0',
  },
  footerLink: {
    color: colors.grayLight,
    fontSize: '13px',
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
  showText?: boolean;
}

export function EmailLogo({ size = 'md', showText = false }: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 48 };
  const textSizes = { sm: '14px', md: '17px', lg: '20px' };
  const logoSize = sizes[size];

  return (
    <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
      <tr>
        <td style={{ verticalAlign: 'middle' }}>
          <Img
            src="https://www.datingassistent.nl/images/LogoDA.png"
            alt="DatingAssistent"
            width={logoSize}
            height={logoSize}
            style={{ display: 'block' }}
          />
        </td>
        {showText && (
          <td style={{ verticalAlign: 'middle', paddingLeft: '8px' }}>
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

// HeroHeader — white background, title below logo
interface HeroHeaderProps {
  title: string;
  subtitle?: string;
}

export function HeroHeader({ title, subtitle }: HeroHeaderProps) {
  return (
    <Section style={styles.heroGradient}>
      <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto 20px' }}>
        <tr>
          <td style={{ verticalAlign: 'middle' }}>
            <Img
              src="https://www.datingassistent.nl/images/LogoDA.png"
              alt="DatingAssistent"
              width={32}
              height={32}
              style={{ display: 'block' }}
            />
          </td>
          <td style={{ verticalAlign: 'middle', paddingLeft: '8px' }}>
            <span style={{
              fontSize: '15px',
              fontFamily: '"Inter", Arial, sans-serif',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              color: colors.dark,
            }}>
              DatingAssistent
            </span>
          </td>
        </tr>
      </table>
      <Text style={{ ...styles.heading1, color: colors.dark, margin: '0' }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ ...styles.paragraph, color: colors.gray, margin: '8px 0 0', fontSize: '13px' }}>
          {subtitle}
        </Text>
      )}
    </Section>
  );
}

// PinkHeader — now renders as clean white header, same as HeroHeader
interface PinkHeaderProps {
  title: string;
  subtitle?: string;
}

export function PinkHeader({ title, subtitle }: PinkHeaderProps) {
  return (
    <Section style={{
      backgroundColor: colors.white,
      padding: '32px 56px 24px 56px',
      textAlign: 'center' as const,
      borderBottom: `1px solid ${colors.lightGray}`,
    }}>
      <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto 20px' }}>
        <tr>
          <td style={{ verticalAlign: 'middle' }}>
            <Img
              src="https://www.datingassistent.nl/images/LogoDA.png"
              alt="DatingAssistent"
              width={32}
              height={32}
              style={{ display: 'block' }}
            />
          </td>
          <td style={{ verticalAlign: 'middle', paddingLeft: '8px' }}>
            <span style={{
              fontSize: '15px',
              fontFamily: '"Inter", Arial, sans-serif',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              color: colors.dark,
            }}>
              DatingAssistent
            </span>
          </td>
        </tr>
      </table>
      <Text style={{ ...styles.heading1, color: colors.dark, margin: '0' }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ ...styles.paragraph, color: colors.gray, margin: '8px 0 0', fontSize: '13px' }}>
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
      <Column style={{ width: '40px', verticalAlign: 'top' }}>
        <Text style={{ fontSize: '20px', margin: '0' }}>{icon}</Text>
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
            {stat.icon && <Text style={{ fontSize: '20px', margin: '0 0 6px 0' }}>{stat.icon}</Text>}
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Column>
        ))}
      </Row>
    </Section>
  );
}

// Info Box / Callout — all types: neutral, minimal left border only
interface InfoBoxProps {
  type?: 'info' | 'success' | 'warning' | 'tip';
  title?: string;
  children: React.ReactNode;
}

export function InfoBox({ type = 'info', title, children }: InfoBoxProps) {
  return (
    <Section style={{
      backgroundColor: colors.cream,
      borderLeft: `3px solid ${colors.lightGray}`,
      borderRadius: '0 4px 4px 0',
      padding: '16px 20px',
      margin: '24px 0',
    }}>
      {title && (
        <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark, marginBottom: '4px', fontSize: '13px' }}>
          {title}
        </Text>
      )}
      <Text style={{ ...styles.paragraph, margin: '0', fontSize: '13px', lineHeight: '1.65', color: colors.gray }}>
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
        <Text style={{ ...styles.paragraph, fontSize: '13px', marginBottom: '8px' }}>
          {label}
        </Text>
      )}
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse' }}>
        <tr>
          <td style={{
            backgroundColor: colors.lightGray,
            borderRadius: '10px',
            height: '8px',
          }}>
            <div style={{
              backgroundColor: colors.primary,
              borderRadius: '10px',
              height: '8px',
              width: `${Math.min(100, Math.max(0, progress))}%`,
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
  const baseUrl = 'https://www.datingassistent.nl';

  return (
    <Section style={styles.footer}>
      <EmailLogo size="sm" showText={true} />

      <Text style={{ ...styles.footerText, marginTop: '16px', fontSize: '12px' }}>
        © {new Date().getFullYear()} DatingAssistent · Alle rechten voorbehouden
      </Text>

      <Text style={{ ...styles.footerText, marginTop: '10px' }}>
        <Link href={`${baseUrl}/privacy`} style={styles.footerLink}>Privacy</Link>
        {' · '}
        <Link href={`${baseUrl}/algemene-voorwaarden`} style={styles.footerLink}>Voorwaarden</Link>
        {' · '}
        <Link href={`${baseUrl}/help`} style={styles.footerLink}>Help</Link>
      </Text>

      {(unsubscribeUrl || preferencesUrl) && (
        <Text style={{ ...styles.footerText, marginTop: '10px', fontSize: '12px' }}>
          {preferencesUrl && (
            <Link href={preferencesUrl} style={styles.footerLink}>
              Voorkeuren
            </Link>
          )}
          {preferencesUrl && unsubscribeUrl && ' · '}
          {unsubscribeUrl && (
            <Link href={unsubscribeUrl} style={styles.footerLink}>
              Uitschrijven
            </Link>
          )}
        </Text>
      )}

      <Text style={{ ...styles.footerText, marginTop: '10px', fontSize: '11px' }}>
        DatingAssistent B.V. · Nederland
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
    <Text style={{ ...styles.heading2, color: colors.dark, marginBottom: '12px' }}>
      Hoi {name},
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
          <Column style={{ width: '36px', verticalAlign: 'top' }}>
            <table cellPadding="0" cellSpacing="0">
              <tr>
                <td style={{
                  backgroundColor: colors.primary,
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  textAlign: 'center',
                  color: colors.white,
                  fontWeight: '600',
                  fontSize: '12px',
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

// Minimal Feature Item (no emoji - professional)
interface FeatureItemProps {
  title: string;
  description: string;
}

export function FeatureItem({ title, description }: FeatureItemProps) {
  return (
    <Row style={{ marginBottom: '16px' }}>
      <Column style={{ width: '16px', verticalAlign: 'top', paddingTop: '3px' }}>
        <Text style={{ margin: '0', fontSize: '11px', color: colors.primary, lineHeight: '1.7', fontWeight: '700' }}>
          &#x25B8;
        </Text>
      </Column>
      <Column>
        <Text style={{ ...styles.paragraph, fontWeight: '600', color: colors.dark, marginBottom: '2px', fontSize: '14px' }}>
          {title}
        </Text>
        <Text style={{ ...styles.paragraph, fontSize: '13px', margin: '0', color: colors.gray }}>
          {description}
        </Text>
      </Column>
    </Row>
  );
}

// Achievement Badge
interface AchievementBadgeProps {
  icon: string;
  title: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export function AchievementBadge({ icon, title, rarity = 'common' }: AchievementBadgeProps) {
  return (
    <Section style={{
      backgroundColor: colors.cream,
      border: `1px solid ${colors.lightGray}`,
      borderRadius: '4px',
      padding: '24px',
      textAlign: 'center',
      margin: '24px 0',
    }}>
      <Text style={{ fontSize: '40px', margin: '0 0 12px 0' }}>{icon}</Text>
      <Text style={{ ...styles.heading2, margin: '0' }}>{title}</Text>
    </Section>
  );
}
