import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { emailColors } from '../styles/colors';
import { emailTypography } from '../styles/typography';
import { emailLayout } from '../styles/layout';

interface StepItem {
  number: number;
  title: string;
  description: string;
}

interface EmailStepIndicatorProps {
  steps: StepItem[];
  currentStep?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function EmailStepIndicator({
  steps,
  currentStep,
  style,
  className
}: EmailStepIndicatorProps) {
  return (
    <Section style={{ ...stepContainerStyle, ...style }} className={className}>
      {steps.map((step, index) => (
        <div key={step.number} style={stepItemStyle}>
          <div style={stepHeaderStyle}>
            <div style={{
              ...stepNumberStyle,
              ...(currentStep === step.number ? stepNumberActiveStyle : {}),
            }}>
              {step.number}
            </div>
            <Text style={stepTitleStyle}>{step.title}</Text>
          </div>
          <Text style={stepDescriptionStyle}>{step.description}</Text>
        </div>
      ))}
    </Section>
  );
}

// Styles
const stepContainerStyle = {
  display: 'grid',
  gap: '20px',
};

const stepItemStyle = {
  padding: '20px',
  backgroundColor: emailColors.background.secondary,
  borderRadius: emailLayout.borderRadius.lg,
  border: `1px solid ${emailColors.border.light}`,
};

const stepHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '8px',
};

const stepNumberStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: 'transparent',
  color: emailColors.primary,
  border: `2px solid ${emailColors.primary}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: emailTypography.fontSize.sm,
  fontWeight: emailTypography.fontWeight.bold,
  fontFamily: emailTypography.fontFamily,
  flexShrink: 0,
};

const stepNumberActiveStyle = {
  backgroundColor: emailColors.primary,
  color: emailColors.text.inverse,
};

const stepTitleStyle = {
  fontSize: emailTypography.fontSize.base,
  fontWeight: emailTypography.fontWeight.semibold,
  color: emailColors.primary,
  fontFamily: emailTypography.fontFamily,
  margin: '0',
  lineHeight: '1.4',
};

const stepDescriptionStyle = {
  fontSize: emailTypography.fontSize.sm,
  fontWeight: emailTypography.fontWeight.normal,
  color: emailColors.text.secondary,
  fontFamily: emailTypography.fontFamily,
  margin: '0',
  lineHeight: '1.5',
};

// Predefined step configurations
export function EmailWelcomeSteps({ style }: { style?: React.CSSProperties }) {
  const steps = [
    {
      number: 1,
      title: 'Profiel compleet maken',
      description: 'Vul je persoonlijke gegevens in voor betere AI-advies (30 seconden)',
    },
    {
      number: 2,
      title: 'AI Coach ontmoeten',
      description: 'Start je eerste gesprek met je persoonlijke dating coach',
    },
    {
      number: 3,
      title: 'Foto analyse',
      description: 'Upload je beste foto voor professionele analyse en tips',
    },
  ];

  return <EmailStepIndicator steps={steps} style={style} />;
}

export function EmailOnboardingSteps({ currentStep, style }: { currentStep?: number; style?: React.CSSProperties }) {
  const steps = [
    {
      number: 1,
      title: 'Account aanmaken',
      description: 'Stel je profiel in en kies je voorkeuren',
    },
    {
      number: 2,
      title: 'Persoonlijkheid scan',
      description: 'Beantwoord vragen voor je AI dating coach',
    },
    {
      number: 3,
      title: 'Profiel optimaliseren',
      description: 'Laat AI je profiel verbeteren voor betere matches',
    },
    {
      number: 4,
      title: 'Start daten!',
      description: 'Gebruik je tools om succesvol te daten',
    },
  ];

  return <EmailStepIndicator steps={steps} currentStep={currentStep} style={style} />;
}