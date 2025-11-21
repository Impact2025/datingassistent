"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Heart,
  Sparkles,
  Clock,
  X,
  CheckCircle
} from 'lucide-react';
import { DatingWeekLogger } from './dating-week-logger';

interface DatingWeekNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: any) => void;
}

export function DatingWeekNotificationModal({
  isOpen,
  onClose,
  onComplete
}: DatingWeekNotificationModalProps) {
  const { user } = useUser();
  const [showLogger, setShowLogger] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastLogDate, setLastLogDate] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user?.id) {
      checkLastLogDate();
    }
  }, [isOpen, user?.id]);

  const checkLastLogDate = async () => {
    try {
      const response = await fetch('/api/dating-log/last-log', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLastLogDate(data.lastLogDate);
      }
    } catch (error) {
      console.error('Error checking last log date:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLogger = () => {
    setShowLogger(true);
  };

  const handleLoggerComplete = (data: any) => {
    setShowLogger(false);
    onComplete?.(data);
    onClose();
  };

  const handleLoggerCancel = () => {
    setShowLogger(false);
  };

  const getMotivationalMessage = () => {
    const messages = [
      "🌟 Tijd om je dating voortgang bij te houden!",
      "💫 Hoe was je dating week? Iris wil het graag weten!",
      "🎯 Jouw dating verhaal ontwikkelt zich — deel het met Iris!",
      "✨ Een korte reflectie kan je dating leven transformeren!",
      "💪 Kleine stapjes leiden tot grote veranderingen!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getDaysSinceLastLog = () => {
    if (!lastLogDate) return null;
    const lastLog = new Date(lastLogDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastLog.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (showLogger) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DatingWeekLogger
            onComplete={handleLoggerComplete}
            onCancel={handleLoggerCancel}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-lg">Mijn Dating Week</DialogTitle>
                <DialogDescription className="text-sm">
                  {getMotivationalMessage()}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Card */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-purple-900">
                    Maandag Check-in
                  </div>
                  <div className="text-xs text-purple-700">
                    {lastLogDate
                      ? `${getDaysSinceLastLog()} dagen geleden`
                      : 'Nog geen log deze week'
                    }
                  </div>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  PRO
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Waarom dit helpt:
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Heart className="w-3 h-3 text-pink-500 mt-1 flex-shrink-0" />
                <span>Persoonlijke AI inzichten van Iris</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="w-3 h-3 text-purple-500 mt-1 flex-shrink-0" />
                <span>Patronen ontdekken in je dating gedrag</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                <span>30 seconden voor betere resultaten</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleStartLogger}
              className="flex-1 bg-pink-500 hover:bg-pink-600"
              disabled={isLoading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Mijn Week
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Later
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Deze herinnering verschijnt elke maandag om 9:00
            <br />
            Je kunt dit uitschakelen in je instellingen
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}