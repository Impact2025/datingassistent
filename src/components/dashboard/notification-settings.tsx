"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Clock,
  Calendar,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Settings as SettingsIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  mondayRemindersEnabled: boolean;
  reminderTime: string;
  lastReminderSent: string | null;
  reminderCount: number;
}

export function NotificationSettings() {
  const { user } = useUser();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    mondayRemindersEnabled: true,
    reminderTime: '09:00',
    lastReminderSent: null,
    reminderCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load current preferences
  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/dating-log/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences({
          mondayRemindersEnabled: data.mondayRemindersEnabled,
          reminderTime: data.reminderTime ? data.reminderTime.substring(0, 5) : '09:00',
          lastReminderSent: data.lastReminderSent,
          reminderCount: data.reminderCount
        });
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      toast({
        title: 'Fout',
        description: 'Kon notificatievoorkeuren niet laden',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/dating-log/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        },
        body: JSON.stringify({
          mondayRemindersEnabled: preferences.mondayRemindersEnabled,
          reminderTime: preferences.reminderTime + ':00' // Add seconds
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(prev => ({
          ...prev,
          ...data.preferences
        }));
        setHasChanges(false);
        toast({
          title: 'Succes',
          description: 'Notificatievoorkeuren opgeslagen!'
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: 'Fout',
        description: 'Kon notificatievoorkeuren niet opslaan',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastReminder = (dateString: string | null) => {
    if (!dateString) return 'Nog nooit';
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          <Bell className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Notificatie Instellingen</h2>
          <p className="text-muted-foreground">
            Beheer je voorkeuren voor dating log herinneringen
          </p>
        </div>
      </div>

      {/* Monday Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Maandag Herinneringen
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              PRO
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Weekly Dating Check-in</div>
              <div className="text-sm text-muted-foreground">
                Krijg elke maandag een vriendelijke herinnering om je dating week te loggen
              </div>
            </div>
            <Switch
              checked={preferences.mondayRemindersEnabled}
              onCheckedChange={(checked) => handlePreferenceChange('mondayRemindersEnabled', checked)}
            />
          </div>

          {preferences.mondayRemindersEnabled && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <label className="text-sm font-medium">Herinnering tijd</label>
                    <div className="text-xs text-muted-foreground">
                      Wanneer wil je de herinnering ontvangen?
                    </div>
                  </div>
                  <Input
                    type="time"
                    value={preferences.reminderTime}
                    onChange={(e) => handlePreferenceChange('reminderTime', e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Notificatie Statistieken
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Totaal ontvangen</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {preferences.reminderCount}
              </div>
              <div className="text-xs text-muted-foreground">
                herinneringen verstuurd
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Laatste herinnering</span>
              </div>
              <div className="text-sm font-medium">
                {formatLastReminder(preferences.lastReminderSent)}
              </div>
              <div className="text-xs text-muted-foreground">
                meest recente notificatie
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 mt-1" />
            <div className="space-y-3">
              <h3 className="font-semibold text-purple-900">Waarom weekly check-ins?</h3>
              <div className="space-y-2 text-sm text-purple-800">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-purple-600 mt-1 flex-shrink-0" />
                  <span>Persoonlijke AI inzichten van Iris elke week</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-purple-600 mt-1 flex-shrink-0" />
                  <span>Blijf consistent in je dating journey</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-purple-600 mt-1 flex-shrink-0" />
                  <span>Ontdek patronen en verbeter je strategie</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-purple-600 mt-1 flex-shrink-0" />
                  <span>Motivatie en accountability voor betere resultaten</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button
            onClick={savePreferences}
            disabled={isSaving}
            className="bg-pink-500 hover:bg-pink-600"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Opslaan...
              </>
            ) : (
              <>
                <SettingsIcon className="w-4 h-4 mr-2" />
                Voorkeuren Opslaan
              </>
            )}
          </Button>
        </div>
      )}

      {/* Info Footer */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Notificaties verschijnen alleen op maandagen als je nog niet hebt gelogd</span>
        </div>
        <div>
          Je kunt deze instellingen altijd aanpassen in je account instellingen
        </div>
      </div>

      {/* Test Mode Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="w-5 h-5" />
            Test Modus - Ontwikkeling
          </CardTitle>
          <CardDescription>
            Test de Monday notificatie functionaliteit zonder te wachten tot maandag
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Voor ontwikkelaars:</strong> Voeg <code className="bg-orange-100 px-1 rounded">?test-notifications=true</code> toe aan de URL om de notificatie modal te testen op elke dag.
              </p>
            </div>

            <Button
              onClick={() => {
                const currentUrl = window.location.href;
                const separator = currentUrl.includes('?') ? '&' : '?';
                const testUrl = currentUrl + separator + 'test-notifications=true';
                window.location.href = testUrl;
              }}
              variant="outline"
              className="w-full"
            >
              🚀 Test Notificatie Modal Nu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}