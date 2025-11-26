import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Star,
  Target,
  CheckCircle,
  Award,
  Sparkles,
  X,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  toolName?: string;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case 'rare': return <Star className="w-4 h-4 text-blue-500" />;
      case 'epic': return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'legendary': return <Trophy className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <Card className={`${getRarityColor(achievement.rarity)} border-2 shadow-lg`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {achievement.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{achievement.title}</h3>
                  {getRarityIcon(achievement.rarity)}
                </div>
                <p className="text-sm text-gray-700 mb-2">{achievement.description}</p>
                <Badge variant="secondary" className="text-xs">
                  {achievement.rarity.toUpperCase()}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Celebration effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 right-2 animate-bounce">
                🎉
              </div>
              <div className="absolute bottom-2 left-2 animate-pulse">
                ✨
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

interface AchievementShowcaseProps {
  achievements: Achievement[];
  className?: string;
}

export function AchievementShowcase({ achievements, className }: AchievementShowcaseProps) {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className={className}>
      <Card className="bg-white border-0 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Jouw Prestaties
          </CardTitle>
          <p className="text-sm text-gray-600">
            {unlockedAchievements.length} van {achievements.length} achievements ontgrendeld
          </p>
        </CardHeader>
        <CardContent>
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Ontgrendeld</h4>
              <div className="grid grid-cols-2 gap-3">
                {unlockedAchievements.map((achievement) => (
                  <Card key={achievement.id} className="border-green-200 bg-green-50">
                    <CardContent className="p-3 text-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        {achievement.icon}
                      </div>
                      <h5 className="font-medium text-green-800 text-sm mb-1">
                        {achievement.title}
                      </h5>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        {achievement.rarity}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Nog te ontgrendelen</h4>
              <div className="grid grid-cols-2 gap-3">
                {lockedAchievements.slice(0, 4).map((achievement) => (
                  <Card key={achievement.id} className="border-gray-200 bg-gray-50 opacity-60">
                    <CardContent className="p-3 text-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                      </div>
                      <h5 className="font-medium text-gray-500 text-sm mb-1">
                        {achievement.title}
                      </h5>
                      <Badge variant="outline" className="text-xs">
                        {achievement.rarity}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface AchievementSystemProps {
  toolId?: string;
  className?: string;
}

export function AchievementSystem({ toolId, className }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notification, setNotification] = useState<Achievement | null>(null);

  useEffect(() => {
    loadAchievements();
  }, [toolId]);

  const loadAchievements = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) return;

      // Get tool completion data
      const response = await fetch('/api/tool-completion/progress', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userAchievements = generateAchievements(data.tools || [], data.overall);
        setAchievements(userAchievements);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const generateAchievements = (tools: any[], overall: any): Achievement[] => {
    const achievements: Achievement[] = [
      {
        id: 'first-tool',
        title: 'Eerste Stap',
        description: 'Je eerste dating tool voltooid!',
        icon: <Target className="w-5 h-5 text-blue-500" />,
        unlocked: overall?.totalCompletions > 0,
        rarity: 'common',
        unlockedAt: overall?.startedAt ? new Date(overall.startedAt) : undefined
      },
      {
        id: 'tool-master',
        title: 'Tool Meester',
        description: '5 verschillende tools voltooid',
        icon: <Award className="w-5 h-5 text-purple-500" />,
        unlocked: overall?.toolsUsed >= 5,
        rarity: 'epic'
      },
      {
        id: 'consistency-king',
        title: 'Consistentie Koning',
        description: '10 tools in totaal voltooid',
        icon: <Trophy className="w-5 h-5 text-yellow-500" />,
        unlocked: overall?.totalCompletions >= 10,
        rarity: 'legendary'
      },
      {
        id: 'profile-pro',
        title: 'Profiel Pro',
        description: 'Alle profiel tools voltooid',
        icon: <Star className="w-5 h-5 text-green-500" />,
        unlocked: tools.some(t => t.toolName === 'profiel-coach' && t.progressPercentage >= 100),
        rarity: 'rare',
        toolName: 'Profile Tools'
      },
      {
        id: 'communication-expert',
        title: 'Communicatie Expert',
        description: 'Chat en gesprek tools onder de knie',
        icon: <Sparkles className="w-5 h-5 text-indigo-500" />,
        unlocked: tools.some(t => t.toolName === 'chat-coach' && t.progressPercentage >= 100),
        rarity: 'rare',
        toolName: 'Communication Tools'
      },
      {
        id: 'values-discoverer',
        title: 'Waarden Ontdekker',
        description: 'Waarden Kompas volledig doorlopen',
        icon: <Gift className="w-5 h-5 text-pink-500" />,
        unlocked: tools.some(t => t.toolName === 'waarden-kompas' && t.progressPercentage >= 100),
        rarity: 'epic',
        toolName: 'Waarden Kompas'
      }
    ];

    return achievements;
  };

  // Check for newly unlocked achievements
  useEffect(() => {
    const newlyUnlocked = achievements.filter(a => a.unlocked && !a.unlockedAt);
    if (newlyUnlocked.length > 0) {
      // Show notification for the first newly unlocked achievement
      setNotification(newlyUnlocked[0]);
    }
  }, [achievements]);

  return (
    <>
      <AchievementShowcase achievements={achievements} className={className} />

      {/* Achievement Notification */}
      {notification && (
        <AchievementNotification
          achievement={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}

// Hook for checking achievement unlocks
export function useAchievementCheck() {
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);

  const checkForNewAchievements = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) return;

      const response = await fetch('/api/tool-completion/progress', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const achievements = generateAchievements(data.tools || [], data.overall);
        const newlyUnlocked = achievements.filter(a => a.unlocked && !a.unlockedAt);

        if (newlyUnlocked.length > 0) {
          setPendingAchievements(newlyUnlocked);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const generateAchievements = (tools: any[], overall: any): Achievement[] => {
    // Same logic as in AchievementSystem
    return [
      {
        id: 'first-tool',
        title: 'Eerste Stap',
        description: 'Je eerste dating tool voltooid!',
        icon: <Target className="w-5 h-5 text-blue-500" />,
        unlocked: overall?.totalCompletions > 0,
        rarity: 'common'
      },
      // ... other achievements
    ];
  };

  return { pendingAchievements, checkForNewAchievements };
}