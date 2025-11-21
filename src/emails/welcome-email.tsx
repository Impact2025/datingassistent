import {
  Button,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmailTemplate, EmailHeader, EmailContent, EmailFooter } from '@/components/emails/base-email-template';

interface WelcomeEmailProps {
  firstName: string;
  subscriptionType: string;
  dashboardUrl: string;
}

export const WelcomeEmail = ({
  firstName = 'Dating Expert',
  subscriptionType = 'core',
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: WelcomeEmailProps) => {
  const tierNames: Record<string, string> = {
    sociaal: 'Sociaal',
    core: 'Core',
    pro: 'Pro',
    premium: 'Premium'
  };

  // Modern Card-Based Email Styles
  const contentCard = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #f3f4f6',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  };

  const greetingContainer = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  };

  const greetingIcon = {
    flexShrink: 0,
  };

  const greeting = {
    color: '#1a1a1a',
    fontSize: '24px',
    fontFamily: '"Inter", Arial, sans-serif',
    fontWeight: '700',
    margin: '0',
    lineHeight: '1.3',
    letterSpacing: '-0.02em',
  };

  const paragraph = {
    color: '#374151',
    fontSize: '16px',
    fontFamily: '"Inter", Arial, sans-serif',
    lineHeight: '24px',
    margin: '0 0 16px 0',
    fontWeight: '400',
  };

  return (
    <BaseEmailTemplate previewText="🚀 Welkom bij DatingAssistent - Je dating journey begint nu!">
      <EmailHeader
        title="Jouw Dating Journey Begint"
        subtitle="Welkom bij DatingAssistent - je persoonlijke dating coach"
      />

      <EmailContent>
        {/* Personal Greeting Card */}
        <Section style={contentCard}>
          <div style={greetingContainer}>
            <div style={greetingIcon}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="url(#logoGradient)"/>
                <path d="M8 10h10v2H8v-2zm0 4h8v2H8v-2zm0 4h12v2H8v-2z" fill="white"/>
                <circle cx="22" cy="12" r="4" fill="white"/>
                <path d="M19 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" fill="#E14874"/>
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#E14874'}}/>
                    <stop offset="100%" style={{stopColor:'#8B5CF6'}}/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <Text style={greeting}>
              Hoi {firstName}!
            </Text>
          </div>

          <Text style={paragraph}>
            Wat geweldig dat je er bent! Je hebt zojuist de eerste stap gezet naar succesvol en zelfverzekerd daten met je eigen AI-coach.
          </Text>
        </Section>

        {/* Subscription Status Card */}
        <Section style={statusCard}>
          <div style={statusHeader}>
            <div style={statusIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#E14874" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <Text style={statusTitle}>Je abonnement is actief</Text>
          </div>
          <Text style={statusText}>
            <strong>{tierNames[subscriptionType]} pakket</strong> - Alle tools zijn nu beschikbaar voor jou
          </Text>
        </Section>

        {/* Next Steps Card */}
        <Section style={stepsCard}>
          <div style={cardTitleContainer}>
            <div style={cardTitleIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.1459 10.9134L22 4L15.0866 12.8541C14.9521 13.0378 14.7607 13.1679 14.5424 13.224C14.3241 13.2801 14.092 13.2581 13.888 13.162L4 9L8.83797 18.112C8.93391 18.316 8.95595 18.5481 8.89987 18.7664C8.84379 18.9847 8.71369 19.1761 8.52997 19.3106L0.5 25L13.1459 10.9134Z" stroke="#E14874" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <Text style={cardTitle}>Je eerste 3 stappen</Text>
          </div>

          <div style={stepsGrid}>
            <div style={stepCard}>
              <div style={stepHeader}>
                <span style={stepNumberCard}>1</span>
                <Text style={stepTitleCard}>Profiel compleet maken</Text>
              </div>
              <Text style={stepDescCard}>
                Vul je persoonlijke gegevens in voor betere AI-advies (30 seconden)
              </Text>
            </div>

            <div style={stepCard}>
              <div style={stepHeader}>
                <span style={stepNumberCard}>2</span>
                <Text style={stepTitleCard}>AI Coach ontmoeten</Text>
              </div>
              <Text style={stepDescCard}>
                Start je eerste gesprek met je persoonlijke dating coach
              </Text>
            </div>

            <div style={stepCard}>
              <div style={stepHeader}>
                <span style={stepNumberCard}>3</span>
                <Text style={stepTitleCard}>Foto analyse</Text>
              </div>
              <Text style={stepDescCard}>
                Upload je beste foto voor professionele analyse en tips
              </Text>
            </div>
          </div>
        </Section>

        {/* CTA Section */}
        <Section style={ctaSection}>
          <Button style={primaryButton} href={dashboardUrl}>
            <div style={buttonContent}>
              <div style={buttonIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.1459 10.9134L22 4L15.0866 12.8541C14.9521 13.0378 14.7607 13.1679 14.5424 13.224C14.3241 13.2801 14.092 13.2581 13.888 13.162L4 9L8.83797 18.112C8.93391 18.316 8.95595 18.5481 8.89987 18.7664C8.84379 18.9847 8.71369 19.1761 8.52997 19.3106L0.5 25L13.1459 10.9134Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>Start Mijn Dating Journey</span>
            </div>
          </Button>
          <Text style={ctaText}>
            Direct toegang tot al je tools en je persoonlijke AI-coach
          </Text>
        </Section>

        {/* Benefits Grid */}
        <Section style={benefitsCard}>
          <div style={benefitsTitleContainer}>
            <div style={benefitsTitleIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="#E14874" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="#E14874" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="#E14874" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <Text style={benefitsTitle}>Wat je kunt verwachten</Text>
          </div>

          <div style={benefitsGrid}>
            <div style={benefitItem}>
              <div style={benefitIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 10H9.01M15 10H15.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="#10b981" strokeWidth="1.5"/>
                </svg>
              </div>
              <Text style={benefitText}>24/7 AI coaching</Text>
            </div>
            <div style={benefitItem}>
              <div style={benefitIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 14L16 10H13V4H11V10H8L12 14Z" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 14H22V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V14Z" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <Text style={benefitText}>Expert cursussen</Text>
            </div>
            <div style={benefitItem}>
              <div style={benefitIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <Text style={benefitText}>Direct advies</Text>
            </div>
            <div style={benefitItem}>
              <div style={benefitIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12C2 10.8954 2.89543 10 4 10H20C21.1046 10 22 10.8954 22 12V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V12Z" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V17" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <Text style={benefitText}>89% meer matches</Text>
            </div>
          </div>
        </Section>

        {/* Feature Block - Key Statistics */}
        <Section style={featureBlockCard}>
          <div style={featureBlockTitleContainer}>
            <Text style={featureBlockTitle}>Waarom DatingAssistent?</Text>
          </div>

          <div style={featureGrid}>
            <div style={featureItem}>
              <div style={{...featureIconBackground, backgroundColor: '#E14874'}}>
                <div style={featureIconCircle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.7 6.3C15.1 5.9 15.1 5.3 14.7 4.9C14.3 4.5 13.7 4.5 13.3 4.9L10 8.2L8.7 6.9C8.3 6.5 7.7 6.5 7.3 6.9C6.9 7.3 6.9 7.9 7.3 8.3L9.3 10.3C9.7 10.7 10.3 10.7 10.7 10.3L14.7 6.3Z" fill="white"/>
                  </svg>
                </div>
              </div>
              <Text style={featureText}>89% meer matches</Text>
            </div>

            <div style={featureItem}>
              <div style={{...featureIconBackground, backgroundColor: '#10b981'}}>
                <div style={featureIconCircle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="white"/>
                  </svg>
                </div>
              </div>
              <Text style={featureText}>AI-gedreven advies</Text>
            </div>

            <div style={featureItem}>
              <div style={{...featureIconBackground, backgroundColor: '#3b82f6'}}>
                <div style={featureIconCircle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" fill="white"/>
                  </svg>
                </div>
              </div>
              <Text style={featureText}>24/7 ondersteuning</Text>
            </div>

            <div style={featureItem}>
              <div style={{...featureIconBackground, backgroundColor: '#8b5cf6'}}>
                <div style={featureIconCircle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2"/>
                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
              <Text style={featureText}>Wetenschappelijk bewezen</Text>
            </div>
          </div>
        </Section>

        {/* Support Section */}
        <Section style={supportCard}>
          <div style={supportContent}>
            <div style={supportIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <Text style={supportText}>
              <strong>Vragen?</strong> Antwoord gewoon op deze email of chat met ons support team.
              We helpen je graag op weg!
            </Text>
          </div>
        </Section>

        {/* Signature */}
        <Section style={signatureSection}>
          <Text style={signature}>
            Veel plezier en succes met daten!<br />
            <strong>Groetjes, Team DatingAssistent</strong>
          </Text>
        </Section>
      </EmailContent>

      <EmailFooter />
    </BaseEmailTemplate>
  );
};

export default WelcomeEmail;

// Modern Card-Based Email Styles
const contentCard = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #f3f4f6',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
};

const greetingContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
};

const greetingIcon = {
  flexShrink: 0,
};

const greeting = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontFamily: '"Inter", Arial, sans-serif',
  fontWeight: '700',
  margin: '0 0 16px 0',
  lineHeight: '1.3',
  letterSpacing: '-0.02em',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  fontFamily: '"Inter", Arial, sans-serif',
  lineHeight: '24px',
  margin: '0 0 16px 0',
  fontWeight: '400',
};

const cardTitleContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginBottom: '20px',
};

const cardTitleIcon = {
  flexShrink: 0,
};

const cardTitle = {
  color: '#E14874',
  fontSize: '20px',
  fontFamily: '"Inter", Arial, sans-serif',
  fontWeight: '600',
  margin: '0',
  lineHeight: '1.4',
  textAlign: 'center' as const,
};

const statusCard = {
  backgroundColor: '#fef7ff',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #e9d5ff',
};

const statusHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '12px',
};

const statusIcon = {
  fontSize: '24px',
};

const statusTitle = {
  color: '#E14874',
  fontSize: '18px',
  fontFamily: '"Inter", Arial, sans-serif',
  fontWeight: '600',
  margin: '0',
  lineHeight: '1.4',
};

const statusText = {
  color: '#6b7280',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0',
  lineHeight: '1.5',
};

const stepsCard = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #f3f4f6',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
};


const stepsGrid = {
  display: 'grid',
  gap: '16px',
};

const stepCard = {
  backgroundColor: '#fafafa',
  borderRadius: '12px',
  padding: '16px',
  border: '1px solid #f3f4f6',
};

const stepHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '8px',
};

const stepNumberCard = {
  backgroundColor: 'transparent',
  color: '#E14874',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '600',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  flexShrink: 0,
};

const stepTitleCard = {
  color: '#E14874',
  fontSize: '16px',
  fontWeight: '600',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0',
  lineHeight: '1.4',
};

const stepDescCard = {
  color: '#6b7280',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0',
  lineHeight: '1.5',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const buttonContent = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};

const buttonIcon = {
  flexShrink: 0,
};

const primaryButton = {
  backgroundColor: 'transparent',
  borderRadius: '12px',
  color: '#E14874',
  fontSize: '16px',
  fontWeight: '600',
  fontFamily: '"Inter", Arial, sans-serif',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  border: 'none',
  marginBottom: '12px',
};

const ctaText = {
  color: '#6b7280',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0',
  lineHeight: '1.5',
};

const benefitsCard = {
  backgroundColor: '#f8fffe',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #b8f5e8',
};

const benefitsTitleContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginBottom: '20px',
};

const benefitsTitleIcon = {
  flexShrink: 0,
};

const benefitsTitle = {
  color: '#E14874',
  fontSize: '18px',
  fontFamily: '"Inter", Arial, sans-serif',
  fontWeight: '600',
  margin: '0',
  lineHeight: '1.4',
  textAlign: 'center' as const,
};


const benefitsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};

const benefitItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #f0fdf9',
};

const benefitIcon = {
  fontSize: '20px',
};

const benefitText = {
  color: '#374151',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0',
  fontWeight: '500',
  lineHeight: '1.4',
};

const supportCard = {
  backgroundColor: '#fffbeb',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '24px',
  border: '1px solid #fed7aa',
};

const supportContent = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
};

const supportIcon = {
  flexShrink: 0,
  marginTop: '2px',
};

const supportText = {
  color: '#92400e',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  margin: '0',
  lineHeight: '1.5',
  textAlign: 'center' as const,
};

const signatureSection = {
  textAlign: 'center' as const,
  marginTop: '24px',
};

const signature = {
  color: '#374151',
  fontSize: '16px',
  fontFamily: '"Inter", Arial, sans-serif',
  lineHeight: '24px',
  margin: '0',
  fontWeight: '500',
};

// Feature Block Styles
const featureBlockCard = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #f3f4f6',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
};

const featureBlockTitleContainer = {
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const featureBlockTitle = {
  color: '#E14874',
  fontSize: '18px',
  fontFamily: '"Inter", Arial, sans-serif',
  fontWeight: '600',
  margin: '0',
  lineHeight: '1.4',
};

const featureGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};

const featureItem = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '8px',
  padding: '16px',
  backgroundColor: '#fafafa',
  borderRadius: '12px',
  border: '1px solid #f3f4f6',
};

const featureIconBackground = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const featureIconCircle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const featureText = {
  color: '#374151',
  fontSize: '14px',
  fontFamily: '"Inter", Arial, sans-serif',
  fontWeight: '500',
  margin: '0',
  lineHeight: '1.4',
  textAlign: 'center' as const,
};

