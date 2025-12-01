/**
 * Coach Context Types
 * Definieert alle data die Iris nodig heeft voor personalisatie
 */

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  lookingFor?: string;
  subscriptionType: string;
}

export interface AssessmentResults {
  hechtingsstijl?: {
    type: string;
    score: number;
    completedAt: Date;
  };
  datingStijl?: {
    primary: string;
    secondary?: string;
    blindspots?: string[];
    completedAt: Date;
  };
  emotioneleReadiness?: {
    score: number;
    readyLevel: string;
    completedAt: Date;
  };
  zelfbeeld?: {
    score: number;
    areas: string[];
    completedAt: Date;
  };
}

export interface JourneyProgress {
  currentPhase: string;
  currentStep: string;
  completedSteps: string[];
  progressPercentage: number;
  startedAt: Date;
}

export interface UserGoals {
  yearGoal?: string;
  monthGoals?: string[];
  weekGoals?: string[];
  challenges?: string[];
}

export interface RecentActivity {
  lastLogin?: Date;
  toolsUsed?: string[];
  coursesInProgress?: {
    title: string;
    progress: number;
  }[];
  conversationsCoached?: number;
}

export interface CoachContext {
  user: UserProfile;
  assessments: AssessmentResults;
  journey: JourneyProgress;
  goals: UserGoals;
  activity: RecentActivity;
  timestamp: Date;
}

export interface ToolRoute {
  keywords: string[];
  intent: string;
  toolId: string;
  toolName: string;
  toolDescription: string;
  toolHref: string;
  category: string;
  confidence: number;
}
