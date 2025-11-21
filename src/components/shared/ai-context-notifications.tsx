"use client";

import { useState, useEffect } from 'react';
import { useAIContext } from '@/hooks/use-ai-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Sparkles, TrendingUp, MessageSquare } from 'lucide-react';
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

  // Generate notifications based on AI context changes
  useEffect(() => {
    if (!context || loading) return;

    const newNotifications: AIContextNotification[] = [];

    // Check for tool usage milestones
    if (context.toolUsage) {
      const totalUsage = Object.values(context.toolUsage).reduce((sum, count) => sum + count, 0);

      if (totalUsage >= 10 && !notifications.find(n => n.id === 'usage_milestone_10')) {
        newNotifications.push({
          id: 'usage_milestone_10',
          type: 'milestone',
          title: 'AI Expert Status! 🎉',
          message: 'Je hebt al 10 AI tools gebruikt. Je wordt een echte dating expert!',
          icon: <TrendingUp className="w-4 h-4" />,
          timestamp: new Date(),
          dismissible: true
        });
      }

      if (totalUsage >= 5 && !notifications.find(n => n.id === 'usage_milestone_5')) {
        newNotifications.push({
          id: 'usage_milestone_5',
          type: 'milestone',
          title: 'Actief Gebruiker! 🚀',
          message: '5 AI tools gebruikt. Je dating skills groeien snel!',
          icon: <Sparkles className="w-4 h-4" />,
          timestamp: new Date(),
          dismissible: true
        });
      }
    }

    // Check for successful openers
    if (context.successfulOpeners && context.successfulOpeners.length > 0) {
      const openerCount = context.successfulOpeners.length;
      if (openerCount >= 3 && !notifications.find(n => n.id === 'successful_openers')) {
        newNotifications.push({
          id: 'successful_openers',
          type: 'insight_available',
          title: 'Succesvolle Openers! 💬',
          message: `Je hebt ${openerCount} werkende openingszinnen opgeslagen. Check je Chat Coach voor advies!`,
          icon: <MessageSquare className="w-4 h-4" />,
          timestamp: new Date(),
          dismissible: true
        });
      }
    }

    // Add new notifications
    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 5)); // Keep max 5 notifications
    }
  }, [context, loading, notifications]);

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
            "bg-card border rounded-lg p-4 shadow-lg animate-in slide-in-from-right-2 duration-300",
            "border-l-4",
            notification.type === 'milestone' && "border-l-yellow-500 bg-yellow-50/90 dark:bg-yellow-950/20",
            notification.type === 'insight_available' && "border-l-blue-500 bg-blue-50/90 dark:bg-blue-950/20",
            notification.type === 'context_update' && "border-l-green-500 bg-green-50/90 dark:bg-green-950/20",
            notification.type === 'tool_usage' && "border-l-purple-500 bg-purple-50/90 dark:bg-purple-950/20"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {notification.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">
                  {notification.title}
                </h4>
                {notification.dismissible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {notification.type === 'milestone' && 'Mijlpaal'}
                  {notification.type === 'insight_available' && 'Nieuwe Insight'}
                  {notification.type === 'context_update' && 'Update'}
                  {notification.type === 'tool_usage' && 'Gebruik'}
                </Badge>

                <span className="text-xs text-muted-foreground">
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