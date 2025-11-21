import * as React from 'react';
import { Text } from '@react-email/components';
import { BaseEmailTemplate, EmailHeader, EmailContent, EmailFooter } from '../base-email-template';
import {
  EmailCard,
  EmailAlertCard,
  EmailPrimaryButton,
  EmailSecondaryButton,
  EmailBadge,
  EmailLogo,
  emailColors,
  createTextStyle
} from '../components';

interface NotificationEmailProps {
  userName: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  action?: {
    primary: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
  details?: Array<{
    label: string;
    value: string;
  }>;
  tips?: string[];
}

export function NotificationEmailTemplate({
  userName,
  type,
  title,
  message,
  action,
  details,
  tips
}: NotificationEmailProps) {
  const typeConfig = {
    info: {
      color: emailColors.communication,
      bgColor: '#eff6ff',
      borderColor: '#dbeafe',
      icon: 'ℹ️',
    },
    warning: {
      color: '#f59e0b',
      bgColor: '#fffbeb',
      borderColor: '#fed7aa',
      icon: '⚠️',
    },
    success: {
      color: emailColors.success,
      bgColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      icon: '✅',
    },
    error: {
      color: '#ef4444',
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
      icon: '❌',
    },
  };

  const config = typeConfig[type];

  return (
    <BaseEmailTemplate previewText={`${title} - ${userName}`}>
      <EmailHeader title={title} />

      <EmailContent>
        {/* Main Notification */}
        <EmailCard style={{
          backgroundColor: config.bgColor,
          border: `1px solid ${config.borderColor}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
          }}>
            <div style={{
              fontSize: '32px',
              flexShrink: 0,
            }}>
              {config.icon}
            </div>
            <div style={{ flex: 1 }}>
              <Text style={{
                ...createTextStyle('h2'),
                color: config.color,
                marginBottom: '8px',
              }}>
                Hallo {userName}
              </Text>
              <Text style={createTextStyle('body')}>
                {message}
              </Text>
            </div>
          </div>
        </EmailCard>

        {/* Details Section */}
        {details && details.length > 0 && (
          <EmailCard>
            <Text style={createTextStyle('h4')}>
              Details
            </Text>
            <div style={{
              backgroundColor: emailColors.background.secondary,
              borderRadius: '8px',
              padding: '16px',
            }}>
              {details.map((detail, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < details.length - 1 ? '1px solid #e5e7eb' : 'none',
                }}>
                  <Text style={{
                    ...createTextStyle('bodySmall'),
                    fontWeight: '600',
                    margin: '0',
                  }}>
                    {detail.label}
                  </Text>
                  <Text style={{
                    ...createTextStyle('bodySmall'),
                    margin: '0',
                  }}>
                    {detail.value}
                  </Text>
                </div>
              ))}
            </div>
          </EmailCard>
        )}

        {/* Action Buttons */}
        {action && (
          <EmailCard style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <EmailPrimaryButton href={action.primary.url}>
                {action.primary.text}
              </EmailPrimaryButton>
              {action.secondary && (
                <EmailSecondaryButton href={action.secondary.url}>
                  {action.secondary.text}
                </EmailSecondaryButton>
              )}
            </div>
          </EmailCard>
        )}

        {/* Tips Section */}
        {tips && tips.length > 0 && (
          <EmailAlertCard>
            <Text style={createTextStyle('h4')}>
              💡 Tips
            </Text>
            <div style={{ marginTop: '12px' }}>
              {tips.map((tip, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: index < tips.length - 1 ? '8px' : '0',
                }}>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: config.color,
                    marginTop: '8px',
                    flexShrink: 0,
                  }} />
                  <Text style={{
                    ...createTextStyle('bodySmall'),
                    margin: '0',
                    lineHeight: '1.5',
                  }}>
                    {tip}
                  </Text>
                </div>
              ))}
            </div>
          </EmailAlertCard>
        )}

        {/* Footer Note */}
        <EmailCard style={{
          backgroundColor: emailColors.background.secondary,
          textAlign: 'center',
        }}>
          <Text style={{
            ...createTextStyle('bodySmall'),
            color: emailColors.text.secondary,
            margin: '0',
          }}>
            Ontvang je te veel emails? Pas je voorkeuren aan in je account instellingen.
          </Text>
        </EmailCard>
      </EmailContent>

      <EmailFooter />
    </BaseEmailTemplate>
  );
}

// Specialized notification templates
export function TrialExpiryEmail({ userName, daysLeft, dashboardUrl }: {
  userName: string;
  daysLeft: number;
  dashboardUrl: string;
}) {
  return (
    <NotificationEmailTemplate
      userName={userName}
      type="warning"
      title="Je proefperiode loopt bijna af"
      message={`Nog ${daysLeft} dagen tot het einde van je gratis proefperiode. Upgrade nu om onbeperkt toegang te houden tot alle AI dating tools.`}
      action={{
        primary: {
          text: 'Nu Upgraden',
          url: `${dashboardUrl}/select-package`,
        },
        secondary: {
          text: 'Meer Informatie',
          url: `${dashboardUrl}/prijzen`,
        },
      }}
      tips={[
        'Alle premium features blijven werken tijdens je upgrade',
        'Geen automatische verlenging - je behoudt controle',
        '30 dagen geld-terug-garantie op alle abonnementen',
      ]}
    />
  );
}

export function FeatureLimitEmail({ userName, feature, dashboardUrl }: {
  userName: string;
  feature: string;
  dashboardUrl: string;
}) {
  return (
    <NotificationEmailTemplate
      userName={userName}
      type="info"
      title="Feature limiet bereikt"
      message={`Je hebt de limiet voor ${feature} bereikt in je gratis account. Upgrade naar premium voor onbeperkt gebruik.`}
      action={{
        primary: {
          text: 'Upgrade naar Premium',
          url: `${dashboardUrl}/select-package`,
        },
      }}
      details={[
        { label: 'Feature', value: feature },
        { label: 'Gratis limiet', value: 'Bereikt' },
        { label: 'Premium', value: 'Onbeperkt' },
      ]}
    />
  );
}

// Legacy export for backward compatibility
export const NotificationEmail = NotificationEmailTemplate;