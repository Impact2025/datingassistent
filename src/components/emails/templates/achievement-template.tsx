import * as React from 'react';
import { Text } from '@react-email/components';
import { BaseEmailTemplate, EmailHeader, EmailContent, EmailFooter } from '../base-email-template';
import {
  EmailCard,
  EmailHeroCard,
  EmailPrimaryButton,
  EmailBadge,
  EmailStatsGrid,
  EmailLogo,
  emailColors,
  createTextStyle
} from '../components';

interface AchievementEmailProps {
  userName: string;
  achievement: {
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  stats: Array<{
    icon: string;
    value: string;
    label: string;
  }>;
  nextGoal?: {
    title: string;
    description: string;
    progress: number;
  };
  dashboardUrl: string;
}

export function AchievementEmailTemplate({
  userName,
  achievement,
  stats,
  nextGoal,
  dashboardUrl
}: AchievementEmailProps) {
  const rarityColors = {
    common: emailColors.text.secondary,
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#f59e0b',
  };

  return (
    <BaseEmailTemplate previewText={`Gefeliciteerd ${userName}! ${achievement.title}`}>
      <EmailHeader
        title={`Gefeliciteerd ${userName}!`}
        subtitle="Nieuwe mijlpaal bereikt"
      />

      <EmailContent>
        {/* Achievement Hero */}
        <EmailHeroCard>
          <div style={{
            textAlign: 'center',
            marginBottom: '24px',
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '16px',
            }}>
              {achievement.icon}
            </div>
            <Text style={createTextStyle('h1')}>
              {achievement.title}
            </Text>
            <Text style={{
              ...createTextStyle('body'),
              fontSize: '18px',
              marginBottom: '16px',
            }}>
              {achievement.description}
            </Text>
            <EmailBadge
              variant="secondary"
              style={{
                backgroundColor: rarityColors[achievement.rarity],
                color: 'white',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {achievement.rarity}
            </EmailBadge>
          </div>
        </EmailHeroCard>

        {/* Stats Section */}
        {stats.length > 0 && (
          <EmailCard>
            <Text style={createTextStyle('h3')}>
              Jouw voortgang
            </Text>
            <EmailStatsGrid
              stats={stats.map(stat => ({
                ...stat,
                color: emailColors.success,
              }))}
              columns={stats.length as 2 | 3 | 4}
            />
          </EmailCard>
        )}

        {/* Next Goal Section */}
        {nextGoal && (
          <EmailCard style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
          }}>
            <Text style={createTextStyle('h3')}>
              🎯 Volgende doel
            </Text>
            <Text style={createTextStyle('body')}>
              {nextGoal.title}
            </Text>
            <Text style={{
              ...createTextStyle('bodySmall'),
              marginBottom: '16px',
            }}>
              {nextGoal.description}
            </Text>

            {/* Progress Bar */}
            <div style={{
              backgroundColor: '#e0f2fe',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}>
                <Text style={{
                  ...createTextStyle('caption'),
                  fontWeight: '600',
                  margin: '0',
                }}>
                  Voortgang
                </Text>
                <Text style={{
                  ...createTextStyle('caption'),
                  fontWeight: '600',
                  margin: '0',
                }}>
                  {nextGoal.progress}%
                </Text>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#cbd5e1',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${nextGoal.progress}%`,
                  height: '100%',
                  backgroundColor: emailColors.primary,
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          </EmailCard>
        )}

        {/* CTA Section */}
        <EmailCard style={{
          backgroundColor: emailColors.background.accent,
          border: `1px solid #e9d5ff`,
          textAlign: 'center',
        }}>
          <Text style={createTextStyle('h3')}>
            Blijf je momentum houden!
          </Text>
          <Text style={createTextStyle('body')}>
            Gebruik je dashboard om door te gaan met je dating succes.
            Nieuwe achievements wachten op je!
          </Text>
          <div style={{ marginTop: '24px' }}>
            <EmailPrimaryButton href={dashboardUrl}>
              Naar Mijn Dashboard
            </EmailPrimaryButton>
          </div>
        </EmailCard>

        {/* Encouragement */}
        <EmailCard style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
        }}>
          <div style={{
            textAlign: 'center',
          }}>
            <Text style={{
              ...createTextStyle('body'),
              fontWeight: '600',
              color: emailColors.success,
              margin: '0 0 8px 0',
            }}>
              💪 Je bent op de goede weg!
            </Text>
            <Text style={{
              ...createTextStyle('bodySmall'),
              color: '#166534',
              margin: '0',
            }}>
              Consistentie is de sleutel tot dating succes. Blijf doorgaan met je dagelijkse routines
              en je zult zien dat de resultaten blijven komen!
            </Text>
          </div>
        </EmailCard>
      </EmailContent>

      <EmailFooter />
    </BaseEmailTemplate>
  );
}

// Legacy export for backward compatibility
export const AchievementEmail = AchievementEmailTemplate;