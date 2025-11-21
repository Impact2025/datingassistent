"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Check, X, RotateCcw, Loader2 } from 'lucide-react';

const EMAIL_TYPES = [
  { id: 'verification', name: '0. Email Verification', description: 'Account verificatie code' },
  { id: 'welcome', name: '1. Welcome Email', description: 'Nieuwe gebruiker onboarding' },
  { id: 'profile_optimization_reminder', name: '2. Profile Optimization', description: 'Herinnering profiel optimalisatie' },
  { id: 'first_win', name: '3. First Win', description: 'Eerste succes ervaring' },
  { id: 'course_introduction', name: '4. Course Introduction', description: 'Nieuwe cursus introductie' },
  { id: 'weekly_checkin', name: '5. Weekly Check-in', description: 'Wekelijkse voortgang check' },
  { id: 'feature_deepdive_chat', name: '6. Feature Deep Dive - Chat', description: 'Chat functie uitleg' },
  { id: 'mid_trial_check', name: '7. Mid-Trial Check', description: 'Halverwege proefperiode' },
  { id: 'course_completion', name: '8. Course Completion', description: 'Cursus voltooiing' },
  { id: 'weekly_digest', name: '9. Weekly Digest', description: 'Wekelijkse samenvatting' },
  { id: 'feature_discovery', name: '10. Feature Discovery', description: 'Nieuwe functie ontdekken' },
  { id: 'milestone_achievement', name: '11. Milestone Achievement', description: 'Mijlpaal bereikt' },
  { id: 'course_unlock', name: '12. Course Unlock', description: 'Nieuwe cursus beschikbaar' },
  { id: 'weekly_limit_reminder', name: '13. Weekly Limit Reminder', description: 'Wekelijkse limiet reminder' },
  { id: 'monthly_progress', name: '14. Monthly Progress Report', description: 'Maandelijkse voortgang' },
  { id: 'inactivity_3days', name: '15. Inactivity Alert (3 days)', description: 'Inactiviteit na 3 dagen' },
  { id: 'inactivity_7days', name: '16. Inactivity Alert (7 days)', description: 'Inactiviteit na 7 dagen' },
  { id: 'inactivity_14days', name: '17. Inactivity Alert (14 days)', description: 'Inactiviteit na 14 dagen' },
  { id: 'exit_survey', name: '18. Exit Survey', description: 'Vertrek enquête' },
  { id: 'dating_success', name: '19. Dating Success', description: 'Dating succes viering' },
  { id: 'streak_achievement', name: '20. Streak Achievement', description: 'Streak mijlpaal' },
  { id: 'annual_anniversary', name: '21. Annual Anniversary', description: 'Jaarlijkse verjaardag' },
  { id: 'subscription_renewal', name: '22. Subscription Renewal', description: 'Abonnement verlenging' },
  { id: 'payment_failed', name: '23. Payment Failed', description: 'Betaling mislukt' },
  { id: 'downgrade_warning', name: '24. Downgrade Warning', description: 'Downgrade waarschuwing' },
  { id: 'cancellation_intent', name: '25. Cancellation Intent', description: 'Annulerings intentie' },
  { id: 'feature_limit_reached', name: '26. Feature Limit Reached', description: 'Functie limiet bereikt' },
  { id: 'upgrade_suggestion', name: '27. Upgrade Suggestion', description: 'Upgrade suggestie' },
  { id: 'seasonal_promotion', name: '28. Seasonal Promotion', description: 'Seizoensgebonden aanbieding' },
  { id: 'referral_reward', name: '29. Referral Reward', description: 'Verwijs beloning' },
];

export default function TestAllEmailsPage() {
  const [email, setEmail] = useState("");
  const [results, setResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const testEmail = async (emailType: string) => {
    setResults(prev => ({ ...prev, [emailType]: 'pending' }));

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailType,
          testEmail: email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(prev => ({ ...prev, [emailType]: 'success' }));
        toast({
          title: "Success",
          description: `${EMAIL_TYPES.find(e => e.id === emailType)?.name} sent successfully!`,
        });
      } else {
        setResults(prev => ({ ...prev, [emailType]: 'error' }));
        toast({
          title: "Error",
          description: data.error || `Failed to send ${emailType}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setResults(prev => ({ ...prev, [emailType]: 'error' }));
      toast({
        title: "Error",
        description: `Network error for ${emailType}`,
        variant: "destructive",
      });
    }
  };

  const testAllEmails = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setResults({});

    // Test emails sequentially with delay
    for (const emailType of EMAIL_TYPES) {
      await testEmail(emailType.id);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    }

    setIsRunning(false);
    toast({
      title: "Complete",
      description: "All email tests completed!",
    });
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error' | undefined) => {
    switch (status) {
      case 'pending':
        return <RotateCcw className="h-4 w-4 animate-spin text-blue-300" />;
      case 'success':
        return <Check className="h-4 w-4 text-emerald-400" />;
      case 'error':
        return <X className="h-4 w-4 text-rose-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-grow p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Test All Email Templates</CardTitle>
              <CardDescription>
                Send all 30 email templates to test email rendering and delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="email">Test Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={testAllEmails}
                    disabled={isRunning || !email}
                    className="px-8"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Testing...
                      </>
                    ) : (
                      'Test All Emails'
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground mb-4">
                <p><strong>Note:</strong> Emails are sent sequentially with 2-second delays to avoid rate limiting.</p>
                <p>Check your spam folder if emails don't arrive in your inbox.</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            {EMAIL_TYPES.map((emailType) => (
              <Card key={emailType.id} className="transition-all">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(results[emailType.id])}
                    <div>
                      <h3 className="font-medium">{emailType.name}</h3>
                      <p className="text-sm text-muted-foreground">{emailType.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testEmail(emailType.id)}
                    disabled={isRunning}
                  >
                    Test Individual
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {Object.keys(results).length > 0 && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Test Results</h3>
                  <div className="flex justify-center gap-6 text-sm">
                    <span className="flex items-center gap-1">
                      <Check className="h-4 w-4 text-emerald-400" />
                      {Object.values(results).filter(r => r === 'success').length} Success
                    </span>
                    <span className="flex items-center gap-1">
                      <X className="h-4 w-4 text-rose-400" />
                      {Object.values(results).filter(r => r === 'error').length} Failed
                    </span>
                    <span className="flex items-center gap-1">
                      <RotateCcw className="h-4 w-4 text-blue-300" />
                      {Object.values(results).filter(r => r === 'pending').length} Pending
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}