'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Zap, Crown, ArrowRight } from 'lucide-react';
import { useUser } from '@/providers/user-provider';

interface TrialProgressProps {
  userId: number;
}

export function TrialProgress({ userId }: TrialProgressProps) {
  const [trialData, setTrialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const loadTrialProgress = async () => {
      try {
        const response = await fetch(`/api/trial/progress?userId=${userId}`);
        const data = await response.json();

        if (data.success) {
          setTrialData(data.progress);
        }
      } catch (error) {
        console.error('Error loading trial progress:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadTrialProgress();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trialData || trialData.currentDay === 0) {
    return null; // No active trial
  }

  const getDayIcon = (day: number) => {
    switch (day) {
      case 1: return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 2: return <Zap className="w-5 h-5 text-purple-500" />;
      case 3: return <Crown className="w-5 h-5 text-yellow-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDayColor = (day: number) => {
    switch (day) {
      case 1: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 2: return 'bg-purple-100 text-purple-800 border-purple-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress <= 33) return 'bg-blue-500';
    if (progress <= 66) return 'bg-purple-500';
    return 'bg-yellow-500';
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getDayIcon(trialData.currentDay)}
            <CardTitle className="text-xl font-bold text-gray-900">
              Pro Trial - Dag {trialData.currentDay}
            </CardTitle>
          </div>
          <Badge className={`${getDayColor(trialData.currentDay)} font-semibold`}>
            {trialData.daysRemaining} dagen resterend
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span>Trial Voortgang</span>
            <span>{Math.round(trialData.progress)}%</span>
          </div>
          <Progress
            value={trialData.progress}
            className="h-3"
            // Custom styling for progress bar color
            style={{
              '--progress-background': getProgressColor(trialData.progress)
            } as React.CSSProperties}
          />
        </div>

        {/* Current Day Features */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            {getDayIcon(trialData.currentDay)}
            {trialData.message}
          </h4>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>AI Chat Coach</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Profiel Optimalisatie</span>
            </div>
            {trialData.currentDay >= 2 && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Date Planner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Response Assistant</span>
                </div>
              </>
            )}
            {trialData.currentDay >= 3 && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Live Coaching</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>VIP Support</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Next Day Preview */}
        {trialData.nextUnlock && (
          <div className="bg-gradient-to-r from-purple-50 to-coral-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Morgen unlock: {trialData.nextUnlock}
            </h4>
            <p className="text-sm text-purple-700">
              Nog meer AI power om je dating success te boosten!
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-900 mb-1">
                Trial Bevalt? Upgrade Nu!
              </h4>
              <p className="text-sm text-green-700">
                Behoud al je unlocked features voor €395/jaar
              </p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Upgrade Nu
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Trial Days Overview */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((day) => (
            <div
              key={day}
              className={`text-center p-3 rounded-lg border-2 ${
                day <= trialData.currentDay
                  ? 'bg-green-50 border-green-200'
                  : day === trialData.currentDay + 1
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-center mb-2">
                {day <= trialData.currentDay ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : day === trialData.currentDay + 1 ? (
                  <Clock className="w-6 h-6 text-blue-500" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <div className="text-xs font-medium text-gray-900">Dag {day}</div>
              <div className="text-xs text-gray-600">
                {day === 1 && 'Core'}
                {day === 2 && 'Pro'}
                {day === 3 && 'Premium'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}