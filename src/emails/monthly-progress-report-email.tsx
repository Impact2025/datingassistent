/**
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
    <BaseEmail preview={`Je ${monthName} in review - DatingAssistent`}>
      <HeroHeader
        title={`${monthName} Rapport`}
        subtitle="Je maandelijkse dating voortgang"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

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
          label={`${stats.daysActive} van ${stats.totalDaysInMonth} dagen actief (${activityPercentage}%)`}
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

        <CTAButton href={`${dashboardUrl}/stats`}>
          Bekijk volledige statistieken
        </CTAButton>

        <Text style={styles.paragraph}>
          Ga zo door! Elke dag dat je investeert in jezelf brengt je dichter
          bij je dating doelen.
        </Text>
      </Section>

      <EmailFooter preferencesUrl={`${dashboardUrl}/settings/email-preferences`} />
    </BaseEmail>
  );
}
