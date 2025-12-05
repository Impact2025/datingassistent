/**
 * Milestone Achievement Email
 */
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  AchievementBadge,
  StatsGrid,
  ProgressBar,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface MilestoneAchievementEmailProps {
  firstName: string;
  milestoneName: string;
  milestoneDescription?: string;
  milestoneIcon?: string;
  milestoneRarity?: 'common' | 'rare' | 'epic' | 'legendary';
  progressPercentage?: string;
  currentGoal?: string;
  achievementScore?: string;
  nextMilestone?: string;
  nextGoalProgress?: number;
  dashboardUrl?: string;
}

export default function MilestoneAchievementEmail({
  firstName,
  milestoneName,
  milestoneDescription = 'Gefeliciteerd met deze belangrijke stap!',
  milestoneIcon = '🏆',
  milestoneRarity = 'rare',
  progressPercentage = '75%',
  currentGoal = 'Volgende mijlpaal',
  achievementScore = 'Uitstekend',
  nextMilestone,
  nextGoalProgress = 0,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: MilestoneAchievementEmailProps) {
  return (
    <BaseEmail preview={`${milestoneName} - Gefeliciteerd!`}>
      <HeroHeader
        emoji={milestoneIcon}
        title="Nieuwe Mijlpaal Bereikt!"
        subtitle="Je dating journey wordt steeds sterker"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          <strong>Wat geweldig!</strong> Je hebt een belangrijke mijlpaal bereikt
          in je dating journey. Dit verdient een moment van erkenning!
        </Text>

        <AchievementBadge
          icon={milestoneIcon}
          title={milestoneName}
          rarity={milestoneRarity}
        />

        <Text style={styles.paragraph}>
          {milestoneDescription}
        </Text>

        <StatsGrid
          stats={[
            { value: progressPercentage, label: 'Voortgang', icon: '📊' },
            { value: currentGoal, label: 'Doel', icon: '🎯' },
            { value: achievementScore, label: 'Score', icon: '⭐' },
          ]}
        />

        {nextMilestone && (
          <>
            <Text style={{ ...styles.heading2, marginTop: '32px' }}>
              Volgende doel: {nextMilestone}
            </Text>
            <ProgressBar progress={nextGoalProgress} label="Voortgang naar volgende mijlpaal" />
          </>
        )}

        <CTAButton href={dashboardUrl}>
          Bekijk je achievements
        </CTAButton>

        <InfoBox type="tip" title="Blijf groeien">
          Elke mijlpaal brengt je dichter bij dating succes. Blijf de tools
          gebruiken en cursussen volgen!
        </InfoBox>
      </Section>

      <EmailFooter preferencesUrl={`${dashboardUrl}/settings/email-preferences`} />
    </BaseEmail>
  );
}
