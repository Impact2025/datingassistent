import * as React from 'react';
import { AchievementEmailTemplate } from '@/components/emails';

interface MilestoneAchievementEmailProps {
  firstName: string;
  milestoneType: 'first_match' | 'first_date' | 'streak_7' | 'streak_30' | 'tools_mastery' | 'course_expert' | 'community_star';
  milestoneData?: {
    value?: number;
    description?: string;
  };
  dashboardUrl: string;
}

const milestoneContent = {
  first_match: {
    icon: '💕',
    title: 'Je Eerste Match!',
    description: 'Je hebt je eerste match gescoord! Een belangrijke stap in je dating journey.',
    rarity: 'rare' as const,
    tips: [
      'Start met een persoonlijke opener die refereert aan hun profiel',
      'Stel open vragen om het gesprek gaande te houden',
      'Wees jezelf - authenticiteit werkt het beste!',
    ],
  },
  first_date: {
    icon: '🎉',
    title: 'Je Eerste Date Gepland!',
    description: 'Je hebt een date afgesproken - geweldig! Van online chat naar echte ontmoeting.',
    rarity: 'epic' as const,
    tips: [
      'Kies een ontspannen locatie waar je goed kunt praten',
      'Wees op tijd en blijf jezelf',
      'Stel veel vragen en toon oprechte interesse',
    ],
  },
  streak_7: {
    icon: '🔥',
    title: '7-Dag Streak Behaald!',
    description: '7 dagen achter elkaar actief geweest! Consistentie is de sleutel tot succes.',
    rarity: 'common' as const,
    tips: [
      'Blijf deze consistentie vasthouden - het werkt!',
      'Elke dag 5-10 minuten is genoeg voor resultaat',
      'Gebruik onze daily challenges om gemotiveerd te blijven',
    ],
  },
  streak_30: {
    icon: '⚡',
    title: '30-Dag Streak Champion!',
    description: '30 dagen onafgebroken actief - ongelooflijk! Elite status bereikt.',
    rarity: 'legendary' as const,
    tips: [
      'Je bent nu officieel een Power User! 💪',
      'Je discipline is inspirerend voor anderen',
      'Deel je ervaring in de community',
    ],
  },
  tools_mastery: {
    icon: '🎯',
    title: 'Tools Master!',
    description: 'Je hebt alle DatingAssistent tools gebruikt! Alle 10 tools gebruikt.',
    rarity: 'epic' as const,
    tips: [
      'Je weet nu precies welke tools het beste bij jou werken',
      'Blijf experimenteren met verschillende combinaties',
      'Help anderen door tips te delen in de community',
    ],
  },
  course_expert: {
    icon: '🎓',
    title: 'Cursus Expert!',
    description: 'Je hebt 5 of meer cursussen voltooid! Expert-level kennis van dating.',
    rarity: 'rare' as const,
    tips: [
      'Je hebt nu expert-level kennis van dating!',
      'Pas al deze technieken toe in de praktijk',
      'Overweeg een testimonial te delen',
    ],
  },
  community_star: {
    icon: '⭐',
    title: 'Community Star!',
    description: 'Je bent een van de meest actieve community members! Top contributor status.',
    rarity: 'rare' as const,
    tips: [
      'Je bijdragen helpen anderen enorm!',
      'Blijf je ervaringen delen',
      'Je bent een inspiratie voor de community',
    ],
  },
};

export const MilestoneAchievementEmail = ({
  firstName = 'Dating Expert',
  milestoneType = 'first_match',
  milestoneData,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: MilestoneAchievementEmailProps) => {
  const milestone = milestoneContent[milestoneType];

  // Calculate progress for next goal based on milestone type
  const getNextGoal = () => {
    switch (milestoneType) {
      case 'streak_7':
        return {
          title: 'Bouw door naar 30 dagen!',
          description: 'Nog 23 dagen tot je elite status bereikt.',
          progress: 23, // 7/30 = ~23%
        };
      case 'first_match':
        return {
          title: 'Plan je eerste date!',
          description: 'Van match naar echte ontmoeting.',
          progress: 50,
        };
      case 'tools_mastery':
        return {
          title: 'Word community mentor!',
          description: 'Deel je kennis met anderen.',
          progress: 75,
        };
      default:
        return undefined;
    }
  };

  return (
    <AchievementEmailTemplate
      userName={firstName}
      achievement={{
        title: milestone.title,
        description: milestone.description,
        icon: milestone.icon,
        rarity: milestone.rarity,
      }}
      stats={[
        {
          icon: '🏆',
          value: milestoneData?.value?.toString() || '1',
          label: 'Milestone',
        },
        {
          icon: '⭐',
          value: milestone.rarity === 'legendary' ? '5' :
                 milestone.rarity === 'epic' ? '4' :
                 milestone.rarity === 'rare' ? '3' : '2',
          label: 'Zeldzaamheid',
        },
        {
          icon: '🎯',
          value: '100%',
          label: 'Voltooid',
        },
      ]}
      nextGoal={getNextGoal()}
      dashboardUrl={dashboardUrl}
    />
  );
};

export default MilestoneAchievementEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
};

const header = {
  padding: '40px 24px',
  textAlign: 'center' as const,
};

const celebrationIcon = {
  fontSize: '80px',
  marginBottom: '16px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
};

const headerSubtext = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
  opacity: 0.95,
};

const content = {
  padding: '40px 24px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const h3 = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px 0',
};

const achievementSection = {
  margin: '32px 0',
};

const achievementBadge = {
  border: '4px solid',
  borderRadius: '16px',
  padding: '32px 24px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
};

const achievementIcon = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '48px',
  margin: '0 auto 16px auto',
  color: '#ffffff',
};

const achievementTitle = {
  color: '#111827',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const achievementDescription = {
  fontSize: '16px',
  color: '#374151',
  margin: '0',
  lineHeight: '24px',
};

const achievementValue = {
  fontSize: '56px',
  fontWeight: 'bold',
  margin: '16px 0',
};

const achievementExtra = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '8px 0 0 0',
};

const celebrationSection = {
  margin: '32px 0',
};

const celebrationBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #86efac',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
};

const celebrationText = {
  fontSize: '15px',
  color: '#065f46',
  margin: '0',
  lineHeight: '24px',
};

const tipsSection = {
  margin: '32px 0',
};

const tipsList = {
  margin: '16px 0',
};

const tipItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
};

const tipNumber = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 'bold',
  flexShrink: 0,
};

const tipText = {
  fontSize: '15px',
  color: '#374151',
  margin: '4px 0 0 0',
  lineHeight: '22px',
};

const nextStepSection = {
  margin: '32px 0',
};

const nextStepBox = {
  backgroundColor: '#ffffff',
  border: '3px solid',
  borderRadius: '12px',
  padding: '20px',
};

const nextStepTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 8px 0',
};

const nextStepText = {
  fontSize: '15px',
  color: '#374151',
  margin: '0',
  lineHeight: '22px',
};

const rewardSection = {
  margin: '32px 0',
};

const rewardBox = {
  backgroundColor: '#fdf2f8',
  border: '2px solid #f9a8d4',
  borderRadius: '12px',
  padding: '24px',
};

const rewardTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#9f1239',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const rewardsList = {
  margin: '0',
};

const rewardItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '8px',
};

const rewardIcon = {
  fontSize: '24px',
  flexShrink: 0,
};

const rewardText = {
  fontSize: '15px',
  color: '#111827',
  margin: '0',
  fontWeight: '500',
};

const sharingSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const sharingText = {
  fontSize: '15px',
  color: '#6b7280',
  margin: '0 0 16px 0',
  lineHeight: '22px',
};

const sharingButton = {
  backgroundColor: '#8b5cf6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 24px',
};

const sharingReward = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '12px 0 0 0',
  fontWeight: '600',
};

const upcomingSection = {
  margin: '32px 0',
};

const upcomingList = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '20px',
  margin: '16px 0',
};

const upcomingItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '12px',
};

const upcomingIcon = {
  fontSize: '24px',
  flexShrink: 0,
};

const upcomingText = {
  fontSize: '15px',
  color: '#6b7280',
  margin: '0',
  fontWeight: '500',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const ctaSubtext = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '12px 0 0 0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const signature = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0',
};

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0 0 12px 0',
};

const footerLinks = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
};

const footerLink = {
  color: '#8b5cf6',
  fontSize: '12px',
  textDecoration: 'none',
};

const footerSeparator = {
  color: '#d1d5db',
  fontSize: '12px',
};
