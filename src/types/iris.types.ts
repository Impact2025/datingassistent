/**
 * Iris AI Personalized Coaching Types
 * Smart, contextual messages based on user progress and achievements
 */

export type IrisMessageType =
  | 'welcome'
  | 'encouragement'
  | 'milestone'
  | 'streak_celebration'
  | 'comeback'
  | 'achievement_unlock'
  | 'tip'
  | 'challenge';

export type IrisTone =
  | 'encouraging'
  | 'celebratory'
  | 'motivational'
  | 'educational'
  | 'playful';

export interface IrisContext {
  userId: number;
  dayNumber: number;
  streakData?: {
    currentStreak: number;
    longestStreak: number;
    totalDaysCompleted: number;
  };
  recentAchievements?: string[];
  completionPercentage?: number;
  lastCompletedDay?: number;
  daysUntilNextMilestone?: number;
  userGoals?: string[];
  challengeLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface IrisMessage {
  id: string;
  type: IrisMessageType;
  tone: IrisTone;
  title: string;
  message: string;
  emoji: string;
  actionPrompt?: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface IrisIntroConfig {
  showOnDayStart: boolean;
  showOnComeback: boolean;
  showOnAchievement: boolean;
  minimumDaysBetween: number;
  maxMessagesPerDay: number;
}

// Pre-defined message templates for different scenarios
export const IRIS_MESSAGE_TEMPLATES = {
  welcome: [
    {
      title: "Welkom bij Dag {day}! 👋",
      message: "Ik ben Iris, je persoonlijke dating coach. Vandaag gaan we werken aan: {topic}. Klaar om je dating game naar het volgende level te tillen?",
      tone: 'encouraging' as IrisTone,
    },
    {
      title: "Hey daar! ✨",
      message: "Leuk dat je er bent voor Dag {day}! We duiken vandaag in {topic}. Ik ga je helpen om dit écht te snappen en toe te passen.",
      tone: 'playful' as IrisTone,
    },
    {
      title: "Goedemorgen! ☕",
      message: "Klaar voor een nieuwe dag? We gaan vandaag focussen op {topic}. Neem er even rustig de tijd voor - het is de moeite waard!",
      tone: 'encouraging' as IrisTone,
    },
  ],

  streak_celebration: [
    {
      title: "🔥 {streak} dagen op rij!",
      message: "Wauw! Je hebt {streak} dagen achter elkaar gewerkt aan je dating skills. Deze consistentie gaat echt verschil maken!",
      tone: 'celebratory' as IrisTone,
    },
    {
      title: "Respect! 💪",
      message: "{streak} dagen streak - dat is next level! Je bent serieus bezig met je groei. Blijf dit vol, het loont echt!",
      tone: 'motivational' as IrisTone,
    },
    {
      title: "Ongelooflijk! 🌟",
      message: "Je bent nu al {streak} dagen consistent bezig. Dit soort discipline is precies wat nodig is om écht resultaat te zien!",
      tone: 'celebratory' as IrisTone,
    },
  ],

  milestone: [
    {
      title: "🎉 Week {week} Voltooid!",
      message: "Je hebt week {week} afgerond! Je hebt al {completedDays} dagen achter de rug. Kijk eens hoever je al bent gekomen!",
      tone: 'celebratory' as IrisTone,
    },
    {
      title: "Mijlpaal bereikt! 🏆",
      message: "Dit is een belangrijk moment - je hebt {completedDays} dagen van de Kickstart afgerond. De verandering die je zoekt begint hier!",
      tone: 'motivational' as IrisTone,
    },
  ],

  comeback: [
    {
      title: "Welkom terug! 👋",
      message: "Hey! Goed om je weer te zien. Je was bij Dag {lastDay}. Geen probleem - we pakken het gewoon weer op waar je was gebleven!",
      tone: 'encouraging' as IrisTone,
    },
    {
      title: "Fijn dat je er weer bent! 😊",
      message: "Life happens, dat snap ik. Het mooie is: je bent er nu weer! Laten we verder gaan met Dag {currentDay}.",
      tone: 'playful' as IrisTone,
    },
  ],

  encouragement: [
    {
      title: "Je doet het geweldig! 💪",
      message: "Je bent nu {percentage}% door de Kickstart. Elke dag brengt je dichter bij de dating skills die je wilt hebben!",
      tone: 'encouraging' as IrisTone,
    },
    {
      title: "Keep going! 🚀",
      message: "Al {completedDays} dagen voltooid - dat is niet niks! De investering die je nu doet, gaat zich uitbetalen.",
      tone: 'motivational' as IrisTone,
    },
  ],

  achievement_unlock: [
    {
      title: "🏅 Nieuw Achievement!",
      message: "Je hebt net '{achievementName}' behaald! Dit laat zien dat je serieus bezig bent met je groei.",
      tone: 'celebratory' as IrisTone,
    },
  ],

  tip: [
    {
      title: "💡 Iris' Tip",
      message: "{tip}",
      tone: 'educational' as IrisTone,
    },
  ],

  challenge: [
    {
      title: "🎯 Uitdaging",
      message: "Klaar voor een challenge? {challenge}",
      tone: 'motivational' as IrisTone,
    },
  ],
};
