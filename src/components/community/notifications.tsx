"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as Lucide from 'lucide-react';
import { useUser } from '@/providers/user-provider';

interface Notification {
  reply_id: number;
  reply_content: string;
  reply_created_at: string;
  post_id: number;
  post_title: string;
  replier_name: string;
  follow_created_at: string;
}

export function NotificationsPanel() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/community/notifications?userId=${user.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications);
    } catch (err) {
      setError('Kon notificaties niet laden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Zojuist';
    if (diffInHours < 24) return `${diffInHours}u geleden`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d geleden`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Lucide.Loader className="h-6 w-6 animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Notificaties laden...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Lucide.AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchNotifications} variant="outline" className="mt-4">
            Opnieuw proberen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lucide.Bell className="h-5 w-5" />
          Notificaties
          {notifications.length > 0 && (
            <Badge variant="secondary">{notifications.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Lucide.BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Geen notificaties</h3>
            <p className="text-sm text-muted-foreground">
              Volg posts om notificaties te ontvangen wanneer er nieuwe reacties zijn.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={`${notification.reply_id}-${notification.post_id}`}
                className="flex gap-3 p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lucide.MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{notification.replier_name}</span>
                    {' reageerde op '}
                    <a
                      href={`/community/forum/post/${notification.post_id}`}
                      className="text-primary hover:underline font-medium"
                    >
                      "{notification.post_title}"
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    "{notification.reply_content.length > 100
                      ? notification.reply_content.substring(0, 100) + '...'
                      : notification.reply_content}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatTimeAgo(notification.reply_created_at)}
                  </p>
                </div>
              </div>
            ))}

            {notifications.length >= 20 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  Meer notificaties laden
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}