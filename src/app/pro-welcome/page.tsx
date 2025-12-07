"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Play, SkipForward, ArrowRight, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

type QuestionStep = 'video' | 'writing-style' | 'dating-apps' | 'gender-preference' | 'reminders' | 'complete';

interface ProWelcomeData {
  writingStyle: string;
  datingApps: string[];
  genderPreference: string;
  reminderPreference: string;
}

export default function ProWelcomePage() {
  const { user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<QuestionStep>('video');
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [writingStyle, setWritingStyle] = useState('');
  const [datingApps, setDatingApps] = useState<string[]>([]);
  const [genderPreference, setGenderPreference] = useState('');
  const [reminderPreference, setReminderPreference] = useState('');

  // Redirect if no user
  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/login');
    }
  }, [user, router, isLoading]);

  const handleVideoComplete = () => {
    console.log('🎥 DEBUG: Welcome video completed successfully');
    setVideoCompleted(true);
    setCurrentStep('writing-style');
  };

  const handleSkipVideo = () => {
    console.log('⏭️ DEBUG: User skipped welcome video');
    setVideoCompleted(true);
    setCurrentStep('writing-style');
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'writing-style':
        setCurrentStep('dating-apps');
        break;
      case 'dating-apps':
        setCurrentStep('gender-preference');
        break;
      case 'gender-preference':
        setCurrentStep('reminders');
        break;
      case 'reminders':
        handleComplete();
        break;
    }
  };

  const handlePrevious = () => {
    switch (currentStep) {
      case 'writing-style':
        setCurrentStep('video');
        break;
      case 'dating-apps':
        setCurrentStep('writing-style');
        break;
      case 'gender-preference':
        setCurrentStep('dating-apps');
        break;
      case 'reminders':
        setCurrentStep('gender-preference');
        break;
    }
  };

  const handleComplete = async () => {
    if (!user?.id) {
      console.log('❌ DEBUG: No user ID available for pro-welcome completion');
      return;
    }

    console.log('💾 DEBUG: Saving pro-welcome data for user:', user.id);
    console.log('💾 DEBUG: Data to save:', {
      writingStyle,
      datingApps,
      genderPreference,
      reminderPreference
    });

    setIsLoading(true);
    try {
      const token = localStorage.getItem('datespark_auth_token');
      console.log('🔐 DEBUG: Auth token available:', !!token);

      const response = await fetch('/api/pro-welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({
          writingStyle,
          datingApps,
          genderPreference,
          reminderPreference
        })
      });

      console.log('💾 DEBUG: Pro-welcome API response status:', response.status, 'ok:', response.ok);

      if (response.ok) {
        console.log('✅ DEBUG: Pro-welcome data saved successfully');
        setCurrentStep('complete');
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        console.error('❌ DEBUG: Failed to save pro welcome data - status:', response.status);
        const errorText = await response.text();
        console.error('❌ DEBUG: Error response:', errorText);
        // Still redirect to dashboard on error
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('❌ DEBUG: Error saving pro welcome data:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = () => {
    const steps = ['writing-style', 'dating-apps', 'gender-preference', 'reminders'];
    const currentIndex = steps.indexOf(currentStep);
    return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'writing-style':
        return 'Jouw schrijfstijl';
      case 'dating-apps':
        return 'Jouw datingapps';
      case 'gender-preference':
        return 'Op wie val jij?';
      case 'reminders':
        return 'Doelen reminders';
      default:
        return '';
    }
  };

  const getStepNumber = () => {
    const steps = ['writing-style', 'dating-apps', 'gender-preference', 'reminders'];
    const currentIndex = steps.indexOf(currentStep);
    return currentIndex >= 0 ? currentIndex + 1 : 0;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'writing-style':
        return writingStyle !== '';
      case 'dating-apps':
        return datingApps.length > 0;
      case 'gender-preference':
        return genderPreference !== '';
      case 'reminders':
        return reminderPreference !== '';
      default:
        return false;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Progress Bar */}
      {currentStep !== 'video' && currentStep !== 'complete' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Stap {getStepNumber()} van 4</span>
                <span className="text-muted-foreground">{getStepTitle()}</span>
              </div>
              <Progress value={getStepProgress()} className="h-2" />
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">

          {/* Video Step */}
          {currentStep === 'video' && (
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Welkom bij DatingAssistent Pro! 🎉
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Voordat we beginnen, wil ik je graag persoonlijk welkom heten.
                  </p>
                </div>

                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <video
                    src="/videos/Welkom-dashboard.mp4"
                    controls
                    autoPlay
                    className="w-full h-auto"
                    onEnded={handleVideoComplete}
                    poster="/images/video-poster.jpg"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleSkipVideo}
                    variant="outline"
                    className="gap-2"
                  >
                    <SkipForward className="w-4 h-4" />
                    Overslaan
                  </Button>
                  <Button
                    onClick={handleVideoComplete}
                    className="gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-purple-600"
                  >
                    <Play className="w-4 h-4" />
                    Verder naar vragen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Writing Style Question */}
          {currentStep === 'writing-style' && (
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Hoe wil je dat ik voor jou schrijf?</h2>
                  <p className="text-muted-foreground">
                    Ik pas hiermee al jouw berichten, profielteksten en adviezen aan op jouw stijl.
                  </p>
                </div>

                <RadioGroup value={writingStyle} onValueChange={setWritingStyle} className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <RadioGroupItem value="informeel_speels" id="informeel_speels" />
                    <Label htmlFor="informeel_speels" className="flex-1 cursor-pointer">
                      <div className="font-medium">Informeel & speels</div>
                      <div className="text-sm text-muted-foreground">Leuke, vrolijke berichten met emoji's</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <RadioGroupItem value="warm_empathisch" id="warm_empathisch" />
                    <Label htmlFor="warm_empathisch" className="flex-1 cursor-pointer">
                      <div className="font-medium">Warm & empathisch</div>
                      <div className="text-sm text-muted-foreground">Attente, zorgzame en invoelende berichten</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <RadioGroupItem value="zelfverzekerd_direct" id="zelfverzekerd_direct" />
                    <Label htmlFor="zelfverzekerd_direct" className="flex-1 cursor-pointer">
                      <div className="font-medium">Zelfverzekerd & direct</div>
                      <div className="text-sm text-muted-foreground">Kort, krachtig en zelfbewust</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <RadioGroupItem value="rustig_duidelijk" id="rustig_duidelijk" />
                    <Label htmlFor="rustig_duidelijk" className="flex-1 cursor-pointer">
                      <div className="font-medium">Rustig & duidelijk</div>
                      <div className="text-sm text-muted-foreground">Kalm, helder en weloverwogen</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-pink-200 dark:border-pink-700 bg-pink-50/50 dark:bg-pink-900/20">
                    <RadioGroupItem value="neutraal" id="neutraal" />
                    <Label htmlFor="neutraal" className="flex-1 cursor-pointer">
                      <div className="font-medium">Neutraal <span className="text-xs text-pink-600">(aanbevolen)</span></div>
                      <div className="text-sm text-muted-foreground">Balans tussen alle stijlen, past zich aan</div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Vorige
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-purple-600"
                  >
                    Volgende
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dating Apps Question */}
          {currentStep === 'dating-apps' && (
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Op welke apps werk ik straks met je samen?</h2>
                  <p className="text-muted-foreground">
                    Elke app heeft andere strategieën. Ik optimaliseer per platform.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'tinder', label: 'Tinder' },
                    { id: 'bumble', label: 'Bumble' },
                    { id: 'hinge', label: 'Hinge' },
                    { id: 'inner_circle', label: 'Inner Circle' },
                    { id: 'lexa', label: 'Lexa' },
                    { id: 'andere', label: 'Andere' }
                  ].map((app) => (
                    <div key={app.id} className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <Checkbox
                        id={app.id}
                        checked={datingApps.includes(app.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDatingApps([...datingApps, app.id]);
                          } else {
                            setDatingApps(datingApps.filter(id => id !== app.id));
                          }
                        }}
                      />
                      <Label htmlFor={app.id} className="flex-1 cursor-pointer font-medium">
                        {app.label}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Vorige
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-purple-600"
                  >
                    Volgende
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gender Preference Question */}
          {currentStep === 'gender-preference' && (
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Op wie val jij?</h2>
                  <p className="text-muted-foreground">
                    Dan kan ik mijn advies daarop afstemmen. Voor dynamiek, openingszinnen, profielopbouw en matchselectie.
                  </p>
                </div>

                <RadioGroup value={genderPreference} onValueChange={setGenderPreference} className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <RadioGroupItem value="mannen" id="mannen" />
                    <Label htmlFor="mannen" className="flex-1 cursor-pointer">
                      <div className="font-medium">Mannen</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <RadioGroupItem value="vrouwen" id="vrouwen" />
                    <Label htmlFor="vrouwen" className="flex-1 cursor-pointer">
                      <div className="font-medium">Vrouwen</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <RadioGroupItem value="iedereen" id="iedereen" />
                    <Label htmlFor="iedereen" className="flex-1 cursor-pointer">
                      <div className="font-medium">Iedereen</div>
                      <div className="text-sm text-muted-foreground">Geen voorkeur, alle opties open</div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Vorige
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-purple-600"
                  >
                    Volgende
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reminders Question */}
          {currentStep === 'reminders' && (
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Wil je dat ik jou af en toe help herinneren aan je doelen?</h2>
                  <p className="text-muted-foreground">
                    Activeert micro-coaching (zonder push of druk).
                  </p>
                </div>

                <RadioGroup value={reminderPreference} onValueChange={setReminderPreference} className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <RadioGroupItem value="ja_graag" id="ja_graag" />
                    <Label htmlFor="ja_graag" className="flex-1 cursor-pointer">
                      <div className="font-medium">Ja graag</div>
                      <div className="text-sm text-muted-foreground">Ik vind het fijn om af en toe een reminder te krijgen</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <RadioGroupItem value="nee" id="nee" />
                    <Label htmlFor="nee" className="flex-1 cursor-pointer">
                      <div className="font-medium">Nee</div>
                      <div className="text-sm text-muted-foreground">Ik regel mijn eigen reminders wel</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <RadioGroupItem value="later_beslissen" id="later_beslissen" />
                    <Label htmlFor="later_beslissen" className="flex-1 cursor-pointer">
                      <div className="font-medium">Later beslissen</div>
                      <div className="text-sm text-muted-foreground">Ik wil eerst even kijken hoe het bevalt</div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Vorige
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={!canProceed() || isLoading}
                    className="flex-1 gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-purple-600"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        Opslaan...
                      </>
                    ) : (
                      <>
                        Naar Dashboard
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complete Step */}
          {currentStep === 'complete' && (
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Perfect! Je setup is compleet 🎉
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Ik heb al jouw voorkeuren opgeslagen. Vanaf nu stem ik al mijn adviezen en berichten af op jouw persoonlijke stijl.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Je wordt over 3 seconden doorgestuurd naar je dashboard...
                  </p>
                </div>

                <Button
                  onClick={() => router.push('/dashboard')}
                  className="gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-purple-600"
                >
                  Direct naar Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}