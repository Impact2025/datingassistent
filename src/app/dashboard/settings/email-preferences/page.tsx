'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Bell, TrendingUp, Gift, Shield, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailPreferences {
  // Categories
  onboarding_emails: boolean;
  engagement_emails: boolean;
  educational_emails: boolean;
  marketing_emails: boolean;
  milestone_emails: boolean;
  digest_emails: boolean;

  // Frequency
  frequency: 'none' | 'minimal' | 'normal' | 'all';
  max_emails_per_week: number;

  // Digest settings
  digest_day: string;

  // Global
  unsubscribed_all: boolean;
}

export default function EmailPreferencesPage() {
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      const response = await fetch('/api/user/email-preferences');
      if (!response.ok) throw new Error('Failed to load preferences');

      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      toast({
        title: 'Fout',
        description: 'Kan voorkeuren niet laden',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function savePreferences() {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch('/api/user/email-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast({
        title: 'Opgeslagen!',
        description: 'Je email voorkeuren zijn bijgewerkt',
      });
    } catch (error) {
      toast({
        title: 'Fout',
        description: 'Kan voorkeuren niet opslaan',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  function updatePreference(key: keyof EmailPreferences, value: any) {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  }

  function updateFrequency(frequency: 'none' | 'minimal' | 'normal' | 'all') {
    if (!preferences) return;

    let maxEmails = 5;
    if (frequency === 'minimal') maxEmails = 2;
    if (frequency === 'all') maxEmails = 10;
    if (frequency === 'none') maxEmails = 0;

    setPreferences({
      ...preferences,
      frequency,
      max_emails_per_week: maxEmails,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Kan voorkeuren niet laden. Probeer het later opnieuw.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Voorkeuren</h1>
        <p className="text-muted-foreground">
          Beheer welke emails je wilt ontvangen en hoe vaak.
        </p>
      </div>

      {preferences.unsubscribed_all && (
        <Alert className="mb-6 border-yellow-500 bg-yellow-50">
          <Bell className="h-4 w-4" />
          <AlertDescription>
            Je bent uitgeschreven voor alle emails. Je ontvangt alleen nog essentiële account updates.
          </AlertDescription>
        </Alert>
      )}

      {/* Frequency Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Frequentie
          </CardTitle>
          <CardDescription>
            Kies hoe vaak je emails wilt ontvangen (maximum per week)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={preferences.frequency}
            onValueChange={(value) => updateFrequency(value as any)}
          >
            <div className="flex items-center space-x-3 p-4 border rounded-lg mb-3 hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="flex-1 cursor-pointer">
                <div className="font-semibold">Geen emails</div>
                <div className="text-sm text-muted-foreground">
                  Alleen essentiële account updates (betalingen, security)
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg mb-3 hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="minimal" id="minimal" />
              <Label htmlFor="minimal" className="flex-1 cursor-pointer">
                <div className="font-semibold">Minimaal (max 2/week)</div>
                <div className="text-sm text-muted-foreground">
                  Alleen de belangrijkste updates en milestones
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg mb-3 hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="normal" id="normal" />
              <Label htmlFor="normal" className="flex-1 cursor-pointer">
                <div className="font-semibold">Normaal (max 5/week)</div>
                <div className="text-sm text-muted-foreground">
                  Balans tussen updates en rust
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="flex-1 cursor-pointer">
                <div className="font-semibold">Alles (max 10/week)</div>
                <div className="text-sm text-muted-foreground">
                  Alle tips, tricks en updates - maximale begeleiding
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Email Categories */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Email Categorieën
          </CardTitle>
          <CardDescription>
            Kies welke type emails je wilt ontvangen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Onboarding */}
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <Label className="font-semibold">Onboarding & Welkom</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Startgids, eerste stappen en tips voor nieuwe gebruikers
              </p>
            </div>
            <Switch
              checked={preferences.onboarding_emails}
              onCheckedChange={(checked) => updatePreference('onboarding_emails', checked)}
              disabled={preferences.unsubscribed_all}
            />
          </div>

          {/* Engagement */}
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <Label className="font-semibold">Voortgang & Activiteit</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Weekly digests, inactivity reminders en voortgang updates
              </p>
            </div>
            <Switch
              checked={preferences.engagement_emails}
              onCheckedChange={(checked) => updatePreference('engagement_emails', checked)}
              disabled={preferences.unsubscribed_all}
            />
          </div>

          {/* Educational */}
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <Label className="font-semibold">Educatief & Tips</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Dating tips, cursus updates en expert advies
              </p>
            </div>
            <Switch
              checked={preferences.educational_emails}
              onCheckedChange={(checked) => updatePreference('educational_emails', checked)}
              disabled={preferences.unsubscribed_all}
            />
          </div>

          {/* Milestones */}
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <Label className="font-semibold">Milestones & Successen</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Achievements, streak reminders en successen vieren
              </p>
            </div>
            <Switch
              checked={preferences.milestone_emails}
              onCheckedChange={(checked) => updatePreference('milestone_emails', checked)}
              disabled={preferences.unsubscribed_all}
            />
          </div>

          {/* Marketing */}
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-coral-500" />
                <Label className="font-semibold">Marketing & Aanbiedingen</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Promoties, upgrades en speciale aanbiedingen
              </p>
            </div>
            <Switch
              checked={preferences.marketing_emails}
              onCheckedChange={(checked) => updatePreference('marketing_emails', checked)}
              disabled={preferences.unsubscribed_all}
            />
          </div>

          {/* Digest */}
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-blue-500" />
                <Label className="font-semibold">Weekly Digest</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Wekelijkse samenvatting elke maandag ochtend
              </p>
            </div>
            <Switch
              checked={preferences.digest_emails}
              onCheckedChange={(checked) => updatePreference('digest_emails', checked)}
              disabled={preferences.unsubscribed_all}
            />
          </div>
        </CardContent>
      </Card>

      {/* Unsubscribe All */}
      <Card className="mb-6 border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="w-5 h-5" />
            Uitschrijven van Alle Emails
          </CardTitle>
          <CardDescription>
            Stop met alle marketing en update emails. Je ontvangt alleen nog essentiële account updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
            <Label htmlFor="unsubscribe_all" className="font-semibold">
              Schrijf me uit voor alle emails
            </Label>
            <Switch
              id="unsubscribe_all"
              checked={preferences.unsubscribed_all}
              onCheckedChange={(checked) => updatePreference('unsubscribed_all', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={savePreferences}
          disabled={saving}
          className="flex-1"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Opslaan
        </Button>
        <Button
          variant="outline"
          onClick={loadPreferences}
          disabled={saving}
        >
          Annuleren
        </Button>
      </div>
    </div>
  );
}
