"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Star,
  Flame,
  Target,
  Award,
  Zap,
  Heart,
  Crown,
  Medal,
  Gift,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Edit3
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface GamificationData {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experience: number;
  experienceToNext: number;
  achievements: Achievement[];
  dailyGoals: {
    completed: number;
    total: number;
    tasks: Array<{
      id: string;
      title: string;
      completed: boolean;
      points: number;
    }>;
  };
}

interface GamificationSystemProps {
  userId?: string;
  courseId?: string;
  onPointsEarned?: (points: number, reason: string) => void;
}

const ACHIEVEMENT_DATA: Omit<Achievement, 'unlocked' | 'progress'>[] = [
  {
    id: 'first-profile',
    title: 'Eerste Profiel',
    description: 'Maak je eerste profieltekst',
    icon: <Star className="w-5 h-5" />,
    points: 50,
    maxProgress: 1,
    rarity: 'common'
  },
  {
    id: 'profile-master',
    title: 'Profiel Meester',
    description: 'Maak 5 verschillende profielteksten',
    icon: <Crown className="w-5 h-5" />,
    points: 200,
    maxProgress: 5,
    rarity: 'rare'
  },
  {
    id: 'streak-warrior',
    title: 'Streak Krijger',
    description: 'Behoud een streak van 7 dagen',
    icon: <Flame className="w-5 h-5" />,
    points: 150,
    maxProgress: 7,
    rarity: 'epic'
  },
  {
    id: 'ai-expert',
    title: 'AI Expert',
    description: 'Gebruik AI-tools 10 keer',
    icon: <Zap className="w-5 h-5" />,
    points: 100,
    maxProgress: 10,
    rarity: 'common'
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Haal een score van 95+ op een profiel',
    icon: <Trophy className="w-5 h-5" />,
    points: 300,
    maxProgress: 1,
    rarity: 'legendary'
  },
  {
    id: 'social-butterfly',
    title: 'Sociale Vlinder',
    description: 'Deel 3 profielen met vrienden',
    icon: <Heart className="w-5 h-5" />,
    points: 120,
    maxProgress: 3,
    rarity: 'rare'
  },
  {
    id: 'consistency-king',
    title: 'Consistentie Koning',
    description: 'Complete dagelijkse doelen 30 dagen',
    icon: <Calendar className="w-5 h-5" />,
    points: 500,
    maxProgress: 30,
    rarity: 'legendary'
  },
  {
    id: 'feedback-champion',
    title: 'Feedback Kampioen',
    description: 'Geef feedback op 5 profielen',
    icon: <Award className="w-5 h-5" />,
    points: 80,
    maxProgress: 5,
    rarity: 'common'
  }
];

const DAILY_TASKS = [
  { id: 'read-lesson', title: 'Lees een les', points: 10 },
  { id: 'write-profile', title: 'Schrijf aan je profiel', points: 20 },
  { id: 'share-insight', title: 'Deel een inzicht', points: 15 },
  { id: 'practice-reflection', title: 'Doe een reflectie oefening', points: 25 }
];

export function GamificationSystem({ userId, courseId, onPointsEarned }: GamificationSystemProps) {
  const [gamificationData, setGamificationData] = useState<GamificationData>({
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    experience: 0,
    experienceToNext: 100,
    achievements: ACHIEVEMENT_DATA.map(achievement => ({
      ...achievement,
      unlocked: false,
      progress: 0
    })),
    dailyGoals: {
      completed: 0,
      total: DAILY_TASKS.length,
      tasks: DAILY_TASKS.map(task => ({ ...task, completed: false }))
    }
  });

  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);

  // Calculate level from experience
  const calculateLevel = useCallback((exp: number) => {
    return Math.floor(exp / 100) + 1;
  }, []);

  // Calculate experience needed for next level
  const calculateExpToNext = useCallback((exp: number) => {
    const currentLevel = calculateLevel(exp);
    return (currentLevel * 100) - (exp % 100);
  }, [calculateLevel]);

  // Earn points and update achievements
  const earnPoints = useCallback((points: number, reason: string) => {
    setGamificationData(prev => {
      const newTotalPoints = prev.totalPoints + points;
      const newExperience = prev.experience + points;
      const newLevel = calculateLevel(newExperience);
      const newExpToNext = calculateExpToNext(newExperience);

      // Check for level up
      const leveledUp = newLevel > prev.level;

      // Update achievements based on reason
      const updatedAchievements = prev.achievements.map(achievement => {
        let newProgress = achievement.progress;

        switch (reason) {
          case 'profile-created':
            if (achievement.id === 'first-profile' && newProgress < 1) newProgress = 1;
            if (achievement.id === 'profile-master') newProgress = Math.min(newProgress + 1, 5);
            break;
          case 'ai-tool-used':
            if (achievement.id === 'ai-expert') newProgress = Math.min(newProgress + 1, 10);
            break;
          case 'high-score':
            if (achievement.id === 'perfectionist' && points >= 95) newProgress = 1;
            break;
          case 'profile-shared':
            if (achievement.id === 'social-butterfly') newProgress = Math.min(newProgress + 1, 3);
            break;
          case 'feedback-given':
            if (achievement.id === 'feedback-champion') newProgress = Math.min(newProgress + 1, 5);
            break;
        }

        const newlyUnlocked = !achievement.unlocked && newProgress >= achievement.maxProgress;

        return {
          ...achievement,
          progress: newProgress,
          unlocked: achievement.unlocked || newlyUnlocked
        };
      });

      // Check for newly unlocked achievements
      const newAchievements = updatedAchievements.filter(
        achievement => achievement.unlocked && !prev.achievements.find(a => a.id === achievement.id)?.unlocked
      );

      if (newAchievements.length > 0) {
        setTimeout(() => setShowAchievement(newAchievements[0]), 1000);
      }

      return {
        ...prev,
        totalPoints: newTotalPoints,
        experience: newExperience,
        level: newLevel,
        experienceToNext: newExpToNext,
        achievements: updatedAchievements
      };
    });

    onPointsEarned?.(points, reason);
  }, [calculateLevel, calculateExpToNext, onPointsEarned]);

  // Complete daily task
  const completeDailyTask = useCallback((taskId: string) => {
    setGamificationData(prev => {
      const updatedTasks = prev.dailyGoals.tasks.map(task =>
        task.id === taskId ? { ...task, completed: true } : task
      );

      const completedCount = updatedTasks.filter(task => task.completed).length;
      const pointsEarned = updatedTasks.find(task => task.id === taskId)?.points || 0;

      if (pointsEarned > 0) {
        earnPoints(pointsEarned, 'daily-task');
      }

      return {
        ...prev,
        dailyGoals: {
          ...prev.dailyGoals,
          completed: completedCount,
          tasks: updatedTasks
        }
      };
    });
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelProgress = () => {
    const currentLevelExp = (gamificationData.level - 1) * 100;
    const progressInLevel = gamificationData.experience - currentLevelExp;
    return (progressInLevel / 100) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Achievement Notification */}
      {showAchievement && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 animate-in slide-in-from-top-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                {showAchievement.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900">Nieuwe Prestatie!</h4>
                <p className="text-sm text-yellow-800">{showAchievement.title}</p>
                <p className="text-xs text-yellow-700">+{showAchievement.points} punten</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAchievement(null)}
              >
                Sluiten
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{gamificationData.totalPoints.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Totaal Punten</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{gamificationData.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Huidige Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">Level {gamificationData.level}</p>
                <p className="text-xs text-muted-foreground">{gamificationData.experienceToNext} XP nodig</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {gamificationData.achievements.filter(a => a.unlocked).length}
                </p>
                <p className="text-xs text-muted-foreground">van {gamificationData.achievements.length} badges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {gamificationData.level}</span>
              <span>{gamificationData.experienceToNext} XP to Level {gamificationData.level + 1}</span>
            </div>
            <Progress value={getLevelProgress()} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {gamificationData.experience} / {(gamificationData.level) * 100} XP
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Daily Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Dagelijkse Doelen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {gamificationData.dailyGoals.completed} van {gamificationData.dailyGoals.total} voltooid
              </span>
              <Badge variant="outline">
                {Math.round((gamificationData.dailyGoals.completed / gamificationData.dailyGoals.total) * 100)}%
              </Badge>
            </div>
            <Progress
              value={(gamificationData.dailyGoals.completed / gamificationData.dailyGoals.total) * 100}
              className="h-2"
            />
            <div className="space-y-2">
              {gamificationData.dailyGoals.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}>
                      {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      +{task.points} XP
                    </Badge>
                    {!task.completed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => completeDailyTask(task.id)}
                      >
                        Voltooien
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Prestaties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gamificationData.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 border rounded-lg transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-sm ${
                      achievement.unlocked ? 'text-yellow-900' : 'text-gray-600'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-xs mt-1 ${
                      achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </Badge>
                      <span className={`text-xs font-medium ${
                        achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'
                      }`}>
                        +{achievement.points} XP
                      </span>
                    </div>
                    {achievement.maxProgress > 1 && (
                      <div className="mt-2">
                        <Progress
                          value={(achievement.progress / achievement.maxProgress) * 100}
                          className="h-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.progress}/{achievement.maxProgress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Snelle Acties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => earnPoints(10, 'manual-action')}
            >
              <Star className="w-5 h-5" />
              <span className="text-sm">Lees Les</span>
              <Badge variant="secondary" className="text-xs">+10 XP</Badge>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => earnPoints(25, 'manual-action')}
            >
              <Edit3 className="w-5 h-5" />
              <span className="text-sm">Schrijf Profiel</span>
              <Badge variant="secondary" className="text-xs">+25 XP</Badge>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => earnPoints(15, 'manual-action')}
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm">Deel Inzicht</span>
              <Badge variant="secondary" className="text-xs">+15 XP</Badge>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => earnPoints(50, 'manual-action')}
            >
              <Gift className="w-5 h-5" />
              <span className="text-sm">Challenge Voltooi</span>
              <Badge variant="secondary" className="text-xs">+50 XP</Badge>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}