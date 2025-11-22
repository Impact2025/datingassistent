"use client";

import { useState, useEffect, useRef } from 'react';
import { useAIContext } from '@/hooks/use-ai-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Star, Target, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIContextNotification {
  id: string;
  type: 'context_update' | 'insight_available' | 'tool_usage' | 'milestone';
  title: string;
  message: string;
  icon: React.ReactNode;
  timestamp: Date;
  dismissible: boolean;
}

export function AIContextNotifications() {
  const { context, loading } = useAIContext();
  const [notifications, setNotifications] = useState<AIContextNotification[]>([]);
  const shownNotificationsRef = useRef<Set<string>>(new Set());

  // Generate notifications based on AI context changes
  useEffect(() => {
    if (!context || loading) return;

    const newNotifications: AIContextNotification[] = [];

    // Check for tool usage milestones
    if (context.toolUsage) {
      const totalUsage = Object.values(context.toolUsage).reduce((sum, count) => sum + count, 0);

      if (totalUsage >= 10 && !shownNotificationsRef.current.has('usage_milestone_10')) {
        shownNotificationsRef.current.add('usage_milestone_10');
        newNotifications.push({
          id: 'usage_milestone_10',
          type: 'milestone',
          title: 'AI Expert Status!',
          message: 'Je hebt al 10 AI tools gebruikt. Je wordt een echte dating expert!',
          icon: <Star className="w-4 h-4 text-pink-500" />,
          timestamp: new Date(),
          dismissible: true
        });
      }

      if (totalUsage >= 5 && !shownNotificationsRef.current.has('usage_milestone_5')) {
        shownNotificationsRef.current.add('usage_milestone_5');
        newNotifications.push({
          id: 'usage_milestone_5',
          type: 'milestone',
          title: 'Actief Gebruiker!',
          message: '5 AI tools gebruikt. Je dating skills groeien snel!',
          icon: <Target className="w-4 h-4 text-pink-500" />,
          timestamp: new Date(),
          dismissible: true
        });
      }
    }

    // Check for successful openers
    if (context.successfulOpeners && context.successfulOpeners.length > 0) {
      const openerCount = context.successfulOpeners.length;
      if (openerCount >= 3 && !shownNotificationsRef.current.has('successful_openers')) {
        shownNotificationsRef.current.add('successful_openers');
        newNotifications.push({
          id: 'successful_openers',
          type: 'insight_available',
          title: 'Succesvolle Openers!',
          message: `Je hebt ${openerCount} werkende openingszinnen opgeslagen. Check je Chat Coach voor advies!`,
          icon: <Heart className="w-4 h-4 text-pink-500" />,
          timestamp: new Date(),
          dismissible: true
        });
      }
    }

    // Add new notifications
    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 5)); // Keep max 5 notifications
    }
  }, [context, loading]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "bg-white/95 backdrop-blur-sm border border-pink-200 rounded-lg p-4 shadow-lg animate-in slide-in-from-right-2 duration-300",
            "border-l-4 border-l-pink-400"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 p-1 bg-pink-50 rounded-full">
              {notification.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">
                  {notification.title}
                </h4>
                {notification.dismissible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-pink-50 text-pink-600 hover:text-pink-700"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700 border-pink-200">
                  {notification.type === 'milestone' && 'Mijlpaal'}
                  {notification.type === 'insight_available' && 'Nieuwe Insight'}
                  {notification.type === 'context_update' && 'Update'}
                  {notification.type === 'tool_usage' && 'Gebruik'}
                </Badge>

                <span className="text-xs text-gray-500">
                  {notification.timestamp.toLocaleTimeString('nl-NL', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}