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
      "Tijd om je dating voortgang bij te houden",
      "Hoe was je dating week? Iris wil het graag weten",
      "Jouw dating verhaal ontwikkelt zich — deel het met Iris",
      "Een korte reflectie kan je dating leven transformeren",
      "Kleine stapjes leiden tot grote veranderingen"
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
            <div>
              <DialogTitle className="text-lg text-gray-900">Mijn Dating Week</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Kleine stapjes leiden tot grote veranderingen
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-coral-500" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  Maandag Check-in
                </div>
                <div className="text-xs text-gray-600">
                  {lastLogDate
                    ? `${getDaysSinceLastLog()} dagen geleden`
                    : 'Nog geen log deze week'
                  }
                </div>
              </div>
              <Badge variant="secondary" className="bg-coral-50 text-coral-700 border-coral-200">
                PRO
              </Badge>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-900">
              Waarom dit helpt:
            </h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-coral-500 mt-2 flex-shrink-0"></div>
                <span>Persoonlijke AI inzichten van Iris</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-coral-500 mt-2 flex-shrink-0"></div>
                <span>Patronen ontdekken in je dating gedrag</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-coral-500 mt-2 flex-shrink-0"></div>
                <span>30 seconden voor betere resultaten</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleStartLogger}
              className="flex-1 bg-coral-500 hover:bg-coral-600 text-white"
              disabled={isLoading}
            >
              Start Mijn Week
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Later
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
            Deze herinnering verschijnt elke maandag om 9:00
            <br />
            Je kunt dit uitschakelen in je instellingen
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}