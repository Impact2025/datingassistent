import * as React from 'react';
import { Html, Head, Body, Container, Section, Text, Hr } from '@react-email/components';
import { EmailSocialMediaLinks } from '@/components/shared/social-media-links';
import { EmailLogo } from './components/email-logo';

interface BaseEmailTemplateProps {
  children: React.ReactNode;
  previewText?: string;
  title?: string;
}

export function BaseEmailTemplate({
  children,
  previewText = "DatingAssistent - Jouw dating coach",
  title = "DatingAssistent"
}: BaseEmailTemplateProps) {
  return (
    <Html>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          {`
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; padding: 10px !important; }
              .content { padding: 20px !important; }
            }
          `}
        </style>
      </Head>
      <Body style={main}>
        <Container style={container}>
          {children}
        </Container>
      </Body>
    </Html>
  );
}

// Modern DatingAssistent Email Template Styles
const main = {
  backgroundColor: '#f8f9fa', // Light gray background like dashboard
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: '0',
  padding: '20px 0',
  lineHeight: '1.6',
};

const container = {
  backgroundColor: '#FFFFFF', // Clean white background
  margin: '0 auto',
  padding: '0',
  width: '600px', // Fixed width as requested
  maxWidth: '600px',
  borderRadius: '16px', // More rounded like dashboard cards
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', // Subtle shadow like dashboard
  border: '1px solid #f3f4f6', // Light border like dashboard
};

// Header component for emails
interface EmailHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export function EmailHeader({ title, subtitle, showLogo = true }: EmailHeaderProps) {
  return (
    <Section style={headerSection}>
      {/* Header with Logo and View in Browser */}
      <div style={headerTop}>
        {showLogo && (
          <EmailLogo size="md" />
        )}
        <Text style={viewInBrowser}>Bekijk in browser</Text>
      </div>

      {/* Hero Section */}
      <div style={heroSection}>
        <Text style={headerTitle}>{title}</Text>
        {subtitle && <Text style={headerSubtitle}>{subtitle}</Text>}
      </div>
    </Section>
  );
}

// Content section
interface EmailContentProps {
  children: React.ReactNode;
}

export function EmailContent({ children }: EmailContentProps) {
  return (
    <Section style={contentSection}>
      {children}
    </Section>
  );
}

// Footer component
interface EmailFooterProps {
  showLinks?: boolean;
}

export function EmailFooter({ showLinks = true }: EmailFooterProps) {
  return (
    <Section style={footerSection}>
      <Text style={footerText}>
        © 2025 DatingAssistent. Alle rechten voorbehouden.
      </Text>
      {showLinks && (
        <div style={footerLinks}>
          <a href="https://datingassistent.nl/privacy" style={footerLink}>Privacy Policy</a>
          <span style={footerSeparator}>|</span>
          <a href="https://datingassistent.nl/algemene-voorwaarden" style={footerLink}>Algemene Voorwaarden</a>
          <span style={footerSeparator}>|</span>
          <a href="mailto:support@datingassistent.nl" style={footerLink}>Support</a>
        </div>
      )}

      {/* Social Media Links */}
      <EmailSocialMediaLinks />
    </Section>
  );
}

// Styles
const headerSection = {
  backgroundColor: '#FFFFFF',
  padding: '24px 32px',
  borderBottom: '1px solid #f3f4f6',
};

const headerTop = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
};

const viewInBrowser = {
  color: '#6b7280',
  fontSize: '12px',
  fontFamily: '"Inter", Arial, sans-serif',
  textDecoration: 'underline',
  margin: '0',
};

const heroSection = {
  textAlign: 'center' as const,
};

const logoContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const brandText = {
  fontSize: '18px',
  fontFamily: '"Inter", Arial, sans-serif',
  lineHeight: '1',
  letterSpacing: '-0.02em',
};

const brandContainer = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '2px',
};

const brandSlogan = {
  fontSize: '11px',
  fontFamily: '"Inter", Arial, sans-serif',
  color: '#6b7280',
  fontWeight: '500',
  letterSpacing: '0.02em',
  textTransform: 'uppercase' as const,
};

const headerTitle = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: '700',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0 0 12px 0',
  lineHeight: '1.2',
  letterSpacing: '-0.02em',
};

const headerSubtitle = {
  color: '#6b7280',
  fontSize: '16px',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0',
  lineHeight: '1.5',
  fontWeight: '400',
};

const contentSection = {
  padding: '32px',
};

const footerSection = {
  backgroundColor: '#fafafa',
  padding: '24px 32px',
  textAlign: 'center' as const,
  borderTop: '1px solid #f3f4f6',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0 0 16px 0',
  lineHeight: '1.4',
  fontWeight: '400',
};

const footerLinks = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '16px',
};

const footerLink = {
  color: '#FF7B54',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  textDecoration: 'none',
  fontWeight: '500',
};

const footerSeparator = {
  color: '#d1d5db',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
};