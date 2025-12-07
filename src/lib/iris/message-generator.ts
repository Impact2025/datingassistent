/**
 * Iris Message Generator
 * Creates personalized, context-aware coaching messages
 */

import {
  type IrisMessage,
  type IrisMessageType,
  type IrisContext,
  IRIS_MESSAGE_TEMPLATES,
} from '@/types/iris.types';
import { ACHIEVEMENTS } from '@/types/achievement.types';

export class IrisMessageGenerator {
  private static instance: IrisMessageGenerator;

  private constructor() {}

  public static getInstance(): IrisMessageGenerator {
    if (!this.instance) {
      this.instance = new IrisMessageGenerator();
    }
    return this.instance;
  }

  /**
   * Generate a personalized welcome message for a day
   */
  public generateWelcomeMessage(context: IrisContext, dayTopic: string): IrisMessage {
    const templates = IRIS_MESSAGE_TEMPLATES.welcome;
    const template = this.selectTemplate(templates);

    const message = template.message
      .replace('{day}', context.dayNumber.toString())
      .replace('{topic}', dayTopic);

    const title = template.title.replace('{day}', context.dayNumber.toString());

    return {
      id: `iris-welcome-${context.dayNumber}-${Date.now()}`,
      type: 'welcome',
      tone: template.tone,
      title,
      message,
      emoji: '👋',
      timestamp: new Date(),
      context: { dayNumber: context.dayNumber, topic: dayTopic },
    };
  }

  /**
   * Generate streak celebration message
   */
  public generateStreakCelebration(context: IrisContext): IrisMessage | null {
    if (!context.streakData || context.streakData.currentStreak < 3) {
      return null;
    }

    const templates = IRIS_MESSAGE_TEMPLATES.streak_celebration;
    const template = this.selectTemplate(templates);

    const streak = context.streakData.currentStreak;
    const message = template.message.replace(/{streak}/g, streak.toString());
    const title = template.title.replace('{streak}', streak.toString());

    return {
      id: `iris-streak-${streak}-${Date.now()}`,
      type: 'streak_celebration',
      tone: template.tone,
      title,
      message,
      emoji: '🔥',
      actionPrompt: streak >= 7 ? 'Dit verdient een extra challenge!' : undefined,
      timestamp: new Date(),
      context: { streak },
    };
  }

  /**
   * Generate milestone celebration message
   */
  public generateMilestoneCelebration(context: IrisContext): IrisMessage | null {
    const completedDays = context.streakData?.totalDaysCompleted || 0;

    // Check if it's a milestone (end of week 1, 2, or 3)
    const milestoneWeeks = [7, 14, 21];
    if (!milestoneWeeks.includes(completedDays)) {
      return null;
    }

    const week = completedDays / 7;
    const templates = IRIS_MESSAGE_TEMPLATES.milestone;
    const template = this.selectTemplate(templates);

    const message = template.message
      .replace('{week}', week.toString())
      .replace('{completedDays}', completedDays.toString());

    const title = template.title.replace('{week}', week.toString());

    return {
      id: `iris-milestone-w${week}-${Date.now()}`,
      type: 'milestone',
      tone: template.tone,
      title,
      message,
      emoji: week === 3 ? '🎓' : '🎉',
      timestamp: new Date(),
      context: { week, completedDays },
    };
  }

  /**
   * Generate comeback message (user returning after break)
   */
  public generateComebackMessage(context: IrisContext): IrisMessage | null {
    if (!context.lastCompletedDay || context.dayNumber - context.lastCompletedDay < 3) {
      return null;
    }

    const templates = IRIS_MESSAGE_TEMPLATES.comeback;
    const template = this.selectTemplate(templates);

    const message = template.message
      .replace('{lastDay}', context.lastCompletedDay.toString())
      .replace('{currentDay}', context.dayNumber.toString());

    return {
      id: `iris-comeback-${Date.now()}`,
      type: 'comeback',
      tone: template.tone,
      title: template.title,
      message,
      emoji: '👋',
      timestamp: new Date(),
      context: { dayNumber: context.dayNumber, lastDay: context.lastCompletedDay },
    };
  }

  /**
   * Generate encouragement message
   */
  public generateEncouragement(context: IrisContext): IrisMessage {
    const templates = IRIS_MESSAGE_TEMPLATES.encouragement;
    const template = this.selectTemplate(templates);

    const completedDays = context.streakData?.totalDaysCompleted || 0;
    const percentage = context.completionPercentage || Math.round((completedDays / 21) * 100);

    const message = template.message
      .replace('{percentage}', percentage.toString())
      .replace('{completedDays}', completedDays.toString());

    return {
      id: `iris-encouragement-${Date.now()}`,
      type: 'encouragement',
      tone: template.tone,
      title: template.title,
      message,
      emoji: '💪',
      timestamp: new Date(),
      context: { percentage, completedDays },
    };
  }

  /**
   * Generate achievement unlock message
   */
  public generateAchievementUnlock(achievementSlug: string): IrisMessage {
    const achievement = ACHIEVEMENTS.find((a) => a.slug === achievementSlug);
    const achievementName = achievement?.title || achievementSlug;

    const templates = IRIS_MESSAGE_TEMPLATES.achievement_unlock;
    const template = templates[0];

    const message = template.message.replace('{achievementName}', achievementName);

    return {
      id: `iris-achievement-${achievementSlug}-${Date.now()}`,
      type: 'achievement_unlock',
      tone: template.tone,
      title: template.title,
      message,
      emoji: achievement?.icon || '🏅',
      timestamp: new Date(),
      context: { achievementSlug, achievementName },
    };
  }

  /**
   * Generate contextual tip based on day number
   */
  public generateContextualTip(context: IrisContext): IrisMessage | null {
    const tips = this.getTipsForDay(context.dayNumber);
    if (tips.length === 0) return null;

    const tip = tips[Math.floor(Math.random() * tips.length)];
    const template = IRIS_MESSAGE_TEMPLATES.tip[0];

    return {
      id: `iris-tip-${context.dayNumber}-${Date.now()}`,
      type: 'tip',
      tone: template.tone,
      title: template.title,
      message: template.message.replace('{tip}', tip),
      emoji: '💡',
      timestamp: new Date(),
      context: { dayNumber: context.dayNumber },
    };
  }

  /**
   * Select best message based on context priority
   */
  public selectBestMessage(context: IrisContext, dayTopic: string): IrisMessage {
    // Priority order: comeback > milestone > streak > welcome/encouragement

    const comebackMessage = this.generateComebackMessage(context);
    if (comebackMessage) return comebackMessage;

    const milestoneMessage = this.generateMilestoneCelebration(context);
    if (milestoneMessage) return milestoneMessage;

    const streakMessage = this.generateStreakCelebration(context);
    if (streakMessage && context.streakData!.currentStreak >= 7) {
      return streakMessage;
    }

    // Default to welcome or encouragement
    const completedDays = context.streakData?.totalDaysCompleted || 0;
    if (completedDays > 5 && Math.random() > 0.5) {
      return this.generateEncouragement(context);
    }

    return this.generateWelcomeMessage(context, dayTopic);
  }

  /**
   * Helper: Select random template
   */
  private selectTemplate<T>(templates: T[]): T {
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Helper: Get contextual tips for specific day
   */
  private getTipsForDay(dayNumber: number): string[] {
    const allTips: Record<number, string[]> = {
      1: [
        "Neem vandaag de tijd om de video écht te laten bezinken. De basis die je hier legt is super belangrijk!",
        "Pro tip: Maak aantekeningen tijdens de video. Het helpt je om de belangrijkste punten te onthouden.",
      ],
      3: [
        "Je zit nu in de flow! Dit is vaak het moment waar het echt begint te klikken.",
        "Probeer vandaag de oefening echt toe te passen - actie is waar de echte groei zit!",
      ],
      7: [
        "Een week voltooid! Neem even de tijd om terug te kijken: wat zijn je belangrijkste inzichten tot nu toe?",
        "Week 1 done! De skills die je nu leert, gaan de komende weken alleen maar sterker worden.",
      ],
      14: [
        "Halverwege! Je bent nu echt op de goede weg. De tweede helft gaat nog meer impact hebben.",
        "2 weken consistency - dat is waar echte verandering begint. Keep it up!",
      ],
      21: [
        "Final day! Neem de tijd om te reflecteren op je hele reis. Wat ga je meenemen?",
        "Laatste dag! Dit is niet het einde, maar het begin van je nieuwe dating approach.",
      ],
    };

    return allTips[dayNumber] || [];
  }
}

// Export singleton instance
export const irisMessageGenerator = IrisMessageGenerator.getInstance();
