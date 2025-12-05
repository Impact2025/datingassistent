/**
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
    <BaseEmail preview={`Je week ${weekNumber} samenvatting - DatingAssistent`}>
      <HeroHeader
        title={`Week ${weekNumber} Samenvatting`}
        subtitle="Jouw dating voortgang in een oogopslag"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

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

      <EmailFooter preferencesUrl={`${dashboardUrl}/settings/email-preferences`} />
    </BaseEmail>
  );
}
