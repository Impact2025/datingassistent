'use client';

/**
 * Achievement Toast Test Page
 * Sprint 4: Integration & UX Enhancement
 *
 * This page is for testing the achievement toast notification system.
 * Only accessible in development mode.
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAchievementNotifications } from '@/hooks/use-achievement-notifications';
import type { Achievement } from '@/lib/achievements/achievement-tracker';

export default function TestAchievementsPage() {
  const { showAchievement } = useAchievementNotifications();

  const testAchievements: Achievement[] = [
    {
      id: 1,
      achievement_id: 'test_common',
      name: 'Eerste Stap',
      description: 'Je hebt je eerste actie ondernomen in je dating journey!',
      category: 'journey',
      badge_icon: 'Star',
      badge_color: '#6B7280',
      points: 10,
      rarity: 'common',
      unlock_criteria: {}
    },
    {
      id: 2,
      achievement_id: 'test_uncommon',
      name: 'Quick Learner',
      description: 'Je hebt je eerste les voltooid binnen 10 minuten!',
      category: 'learning',
      badge_icon: 'Zap',
      badge_color: '#10B981',
      points: 25,
      rarity: 'uncommon',
      unlock_criteria: {}
    },
    {
      id: 3,
      achievement_id: 'test_rare',
      name: 'Perfectionist',
      description: 'Je hebt een quiz voltooid met 100% score!',
      category: 'mastery',
      badge_icon: 'Award',
      badge_color: '#3B82F6',
      points: 50,
      rarity: 'rare',
      unlock_criteria: {}
    },
    {
      id: 4,
      achievement_id: 'test_epic',
      name: 'Master Student',
      description: 'Je hebt 10 lessen op rij voltooid zonder fouten!',
      category: 'mastery',
      badge_icon: 'Trophy',
      badge_color: '#8B5CF6',
      points: 100,
      rarity: 'epic',
      unlock_criteria: {}
    },
    {
      id: 5,
      achievement_id: 'test_legendary',
      name: 'Dating Legend',
      description: 'Je hebt alle 5 fases van je dating journey voltooid! Je bent een echte dating expert!',
      category: 'completion',
      badge_icon: 'Crown',
      badge_color: '#F59E0B',
      points: 500,
      rarity: 'legendary',
      unlock_criteria: {}
    }
  ];

  const showRandomAchievement = () => {
    const random = testAchievements[Math.floor(Math.random() * testAchievements.length)];
    showAchievement(random);
  };

  const showMultipleAchievements = () => {
    testAchievements.slice(0, 3).forEach((achievement, index) => {
      setTimeout(() => {
        showAchievement(achievement);
      }, index * 600);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🏆 Achievement Toast Notification Test</CardTitle>
            <p className="text-gray-600">
              Test het achievement toast notification systeem door op de buttons hieronder te klikken.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Test Buttons */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Snelle Tests</h3>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={showRandomAchievement} variant="outline">
                  🎲 Random Achievement
                </Button>
                <Button onClick={showMultipleAchievements} variant="outline">
                  🎯 Meerdere Achievements (3)
                </Button>
              </div>
            </div>

            {/* Individual Achievement Tests */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Test per Rarity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testAchievements.map((achievement) => (
                  <Button
                    key={achievement.id}
                    onClick={() => showAchievement(achievement)}
                    variant="outline"
                    className={`justify-start ${
                      achievement.rarity === 'legendary'
                        ? 'border-yellow-400 bg-yellow-50'
                        : achievement.rarity === 'epic'
                        ? 'border-purple-400 bg-purple-50'
                        : achievement.rarity === 'rare'
                        ? 'border-blue-400 bg-blue-50'
                        : achievement.rarity === 'uncommon'
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{achievement.name}</div>
                      <div className="text-xs text-gray-600 capitalize">
                        {achievement.rarity} • {achievement.points}pts
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Tip:</strong> De toasts verschijnen rechtsboven in het scherm en verdwijnen automatisch na 5 seconden.
                Je kunt meerdere toasts tegelijk testen om te zien hoe ze gestapeld worden.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
