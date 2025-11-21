import * as React from 'react';
import { Text } from '@react-email/components';
import { BaseEmailTemplate, EmailHeader, EmailContent, EmailFooter } from '../base-email-template';
import {
  EmailCard,
  EmailPrimaryButton,
  EmailStepIndicator,
  EmailFeatureStats,
  EmailLogo,
  emailColors,
  createTextStyle
} from '../components';

interface WelcomeEmailProps {
  firstName: string;
  dashboardUrl: string;
  trialDays?: number;
}

export function WelcomeEmailTemplate({
  firstName,
  dashboardUrl,
  trialDays = 7
}: WelcomeEmailProps) {
  return (
    <BaseEmailTemplate previewText={`Welkom ${firstName}! Ontdek je persoonlijke dating coach`}>
      <EmailHeader title={`Welkom ${firstName}!`} subtitle="Je dating journey begint hier" />

      <EmailContent>
        {/* Hero Section */}
        <EmailCard style={{
          background: `linear-gradient(135deg, ${emailColors.background.accent} 0%, #f8f9fa 100%)`,
          border: `1px solid #e9d5ff`,
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '24px',
          }}>
            <EmailLogo size="lg" style={{ justifyContent: 'center', marginBottom: '16px' }} />
            <Text style={createTextStyle('h2')}>
              Welkom bij DatingAssistent!
            </Text>
            <Text style={createTextStyle('body')}>
              Gefeliciteerd! Je hebt zojuist de eerste stap gezet naar succesvol en zelfverzekerd daten.
              Je persoonlijke AI dating coach staat klaar om je te helpen.
            </Text>
          </div>

          <div style={{
            textAlign: 'center',
            marginBottom: '24px',
          }}>
            <EmailPrimaryButton href={dashboardUrl}>
              Start Mijn Dating Journey
            </EmailPrimaryButton>
          </div>

          {/* Trial Info */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <Text style={{
              ...createTextStyle('bodySmall'),
              fontWeight: '600',
              color: emailColors.primary,
              margin: '0',
            }}>
              🎁 {trialDays} dagen gratis toegang tot alle premium features
            </Text>
          </div>
        </EmailCard>

        {/* Stats Section */}
        <EmailCard>
          <Text style={createTextStyle('h3')}>
            Waarom DatingAssistent werkt
          </Text>
          <EmailFeatureStats />
        </EmailCard>

        {/* Steps Section */}
        <EmailCard>
          <Text style={createTextStyle('h3')}>
            Je eerste 3 stappen naar dating succes
          </Text>
          <EmailStepIndicator
            steps={[
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
            ]}
          />
        </EmailCard>

        {/* CTA Section */}
        <EmailCard style={{
          backgroundColor: emailColors.background.accent,
          border: `1px solid #e9d5ff`,
          textAlign: 'center',
        }}>
          <Text style={createTextStyle('h3')}>
            Klaar om te beginnen?
          </Text>
          <Text style={createTextStyle('body')}>
            Klik op de button hieronder om direct toegang te krijgen tot je dashboard
            en je eerste AI dating coach sessie te starten.
          </Text>
          <div style={{ marginTop: '24px' }}>
            <EmailPrimaryButton href={dashboardUrl}>
              Start Mijn Dating Journey
            </EmailPrimaryButton>
          </div>
        </EmailCard>

        {/* Footer Note */}
        <EmailCard style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fed7aa',
        }}>
          <Text style={{
            ...createTextStyle('bodySmall'),
            textAlign: 'center',
            margin: '0',
            color: '#92400e',
          }}>
            💡 <strong>Pro tip:</strong> Beste resultaten krijg je door consistent je dashboard te gebruiken.
            Plan dagelijks 10 minuten in voor de beste dating resultaten!
          </Text>
        </EmailCard>
      </EmailContent>

      <EmailFooter />
    </BaseEmailTemplate>
  );
}

// Legacy export for backward compatibility
export const WelcomeEmail = WelcomeEmailTemplate;