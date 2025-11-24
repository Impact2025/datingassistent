"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Sparkles, Loader2, CheckCircle2, HelpCircle, ArrowRight, ArrowLeft, Target, Shield, Clock, DollarSign, MessageSquare, Video, Mic, AlertCircle, XCircle } from "lucide-react";
import { ToolOnboardingOverlay, useOnboardingOverlay } from "@/components/shared/tool-onboarding-overlay";
import { getOnboardingSteps, getToolDisplayName } from "@/lib/tool-onboarding-content";
import { useUser } from "@/providers/user-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthManager } from "@/lib/auth-manager";

interface PlatformRecommendation {
  platform: string;
  matchScore: number;
  reasoning: string;
  targetAudience: string;
  algorithm: string;
  niche: string;
  pros: string[];
  cons: string[];
  strategy: string;
  pricing: string;
  safety: string;
}

interface UserPreferences {
  relationshipGoal: string;
  agePreference: string;
  genderPreference: string;
  locationPreference: string;
  educationImportance: string;
  backgroundImportance: string;
  interestsImportance: string;
  appExpectations: string[];
  meetingSpeed: string;
  budget: string;
  privacyImportance: string;
  pastExperience: string;
  timeInvestment: string;
  aiHelp: string[];
  communicationStyle: string[];
}

export function PlatformMatchTool() {
  const { showOverlay, setShowOverlay } = useOnboardingOverlay('platform-match');
  const { userProfile, user, loading } = useUser();
  const [authManager] = useState(() => new AuthManager());

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<PlatformRecommendation[]>([]);

  // User preferences from questionnaire
  const [preferences, setPreferences] = useState<UserPreferences>({
    relationshipGoal: '',
    agePreference: '',
    genderPreference: '',
    locationPreference: '',
    educationImportance: '',
    backgroundImportance: '',
    interestsImportance: '',
    appExpectations: [],
    meetingSpeed: '',
    budget: '',
    privacyImportance: '',
    pastExperience: '',
    timeInvestment: '',
    aiHelp: [],
    communicationStyle: []
  });

  // Load user profile data on mount
  useEffect(() => {
    if (userProfile) {
      // Pre-fill preferences based on user profile
      setPreferences(prev => ({
        ...prev,
        agePreference: userProfile.age ? `${Math.max(18, userProfile.age - 5)}-${userProfile.age + 5}` : '',
        genderPreference: userProfile.gender || '',
        locationPreference: userProfile.location || ''
      }));
    }
  }, [userProfile]);

  const generateRecommendations = async () => {
    // Validate required fields
    if (!preferences.relationshipGoal || !preferences.agePreference || !preferences.genderPreference) {
      setError("Vul minimaal relatie doel, leeftijd voorkeur en geslacht voorkeur in");
      return;
    }

    // Check if user is still loading
    if (loading) {
      setError("Gebruiker wordt nog geladen. Probeer het over een moment opnieuw.");
      return;
    }

    // Check if user is authenticated
    if (!user) {
      setError('Niet ingelogd. Log opnieuw in.');
      return;
    }

    setLoading(true);
    setError(null);

    try {

      // Use AuthManager for authenticated request with automatic token refresh
      const data = await authManager.authenticatedRequest('/api/platform-match', {
        method: 'POST',
        body: JSON.stringify({
          userProfile: {
            age: userProfile?.age,
            gender: userProfile?.gender,
            location: userProfile?.location,
            name: userProfile?.name
          },
          preferences
        })
      });

      if (data.recommendations && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
        console.log(`✅ Received ${data.recommendations.length} platform recommendations`);
      } else {
        throw new Error('Geen aanbevelingen ontvangen van de server');
      }

    } catch (error) {
      console.error('❌ Error generating platform recommendations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Er ging iets mis. Probeer het opnieuw.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return '🎯';
    if (score >= 6) return '👍';
    if (score >= 4) return '🤔';
    return '❌';
  };

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <>
      {/* Onboarding Overlay */}
      <ToolOnboardingOverlay
        toolName="platform-match"
        displayName={getToolDisplayName('platform-match')}
        steps={getOnboardingSteps('platform-match')}
        open={showOverlay}
        onOpenChange={setShowOverlay}
        onComplete={() => console.log('Platform Match onboarding completed!')}
      />

      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Er ging iets mis</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="h-auto p-1"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header with Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-orange-600" />
                <div>
                  <CardTitle className="text-orange-600">Professionele Platform Match</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Wetenschappelijk onderbouwde platform aanbevelingen gebaseerd op je profiel
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOverlay(true)}
                className="gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Tutorial</span>
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Stap {currentStep} van {totalSteps}</span>
                <span className="text-muted-foreground">{Math.round(progress)}% compleet</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Step Content */}
        <Card className="min-h-[500px] relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Analyseren...</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    We analyseren je profiel en voorkeuren om de beste dating platforms voor jou te vinden
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span>AI is aan het werk</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Wat we al weten uit je registratie</h3>
                  <p className="text-muted-foreground">Deze informatie gebruiken we als basis voor je platform aanbevelingen</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <Label className="text-sm font-medium text-muted-foreground">JE GEGEVENS</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Leeftijd:</span>
                        <span className="font-medium">{userProfile?.age || 'Niet ingevuld'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Geslacht:</span>
                        <span className="font-medium">{userProfile?.gender || 'Niet ingevuld'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Locatie:</span>
                        <span className="font-medium">{userProfile?.location || 'Niet ingevuld'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-blue-50/50">
                    <Label className="text-sm font-medium text-blue-700">BELANGRIJKSTE VRAAG</Label>
                    <div className="mt-2">
                      <Label htmlFor="relationshipGoal" className="text-base font-medium">Waar ben je naar op zoek? *</Label>
                      <RadioGroup
                        value={preferences.relationshipGoal}
                        onValueChange={(value) => updatePreference('relationshipGoal', value)}
                        className="mt-3 space-y-2 bg-muted/30 p-3 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="serious" id="serious" />
                          <Label htmlFor="serious" className="text-sm">Serieuse relatie op lange termijn</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="casual" id="casual" />
                          <Label htmlFor="casual" className="text-sm">Casual daten en avontuur</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="friendship" id="friendship" />
                          <Label htmlFor="friendship" className="text-sm">Nieuwe vrienden maken</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="exploring" id="exploring" />
                          <Label htmlFor="exploring" className="text-sm">Alleen verkennen en kijken</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Partner Voorkeuren</h3>
                  <p className="text-muted-foreground">Vertel ons meer over wat je zoekt in een partner</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Leeftijdscategorie die je interessant vindt *</Label>
                      <Select value={preferences.agePreference} onValueChange={(value) => updatePreference('agePreference', value)}>
                        <SelectTrigger className="mt-2 bg-muted/30">
                          <SelectValue placeholder="Selecteer leeftijdscategorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="18-25">18-25 jaar</SelectItem>
                          <SelectItem value="25-35">25-35 jaar</SelectItem>
                          <SelectItem value="35-45">35-45 jaar</SelectItem>
                          <SelectItem value="45-55">45-55 jaar</SelectItem>
                          <SelectItem value="55+">55+ jaar</SelectItem>
                          <SelectItem value="any">Leeftijd is niet belangrijk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Geslacht voorkeur *</Label>
                      <RadioGroup
                        value={preferences.genderPreference}
                        onValueChange={(value) => updatePreference('genderPreference', value)}
                        className="mt-2 space-y-2 bg-muted/30 p-3 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="men" id="men" />
                          <Label htmlFor="men">Mannen</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="women" id="women" />
                          <Label htmlFor="women">Vrouwen</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id="both" />
                          <Label htmlFor="both">Beide</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Locatie voorkeur</Label>
                      <RadioGroup
                        value={preferences.locationPreference}
                        onValueChange={(value) => updatePreference('locationPreference', value)}
                        className="mt-2 space-y-2 bg-muted/30 p-3 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="local" id="local" />
                          <Label htmlFor="local">Alleen lokale matches</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="regional" id="regional" />
                          <Label htmlFor="regional">Regionaal (zelfde provincie)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="open" id="open" />
                          <Label htmlFor="open">Open voor afstand</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Belang van opleiding/achtergrond</Label>
                      <RadioGroup
                        value={preferences.educationImportance}
                        onValueChange={(value) => updatePreference('educationImportance', value)}
                        className="mt-2 space-y-2 bg-muted/30 p-3 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="very" id="very-ed" />
                          <Label htmlFor="very-ed">Zeer belangrijk</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="somewhat" id="somewhat-ed" />
                          <Label htmlFor="somewhat-ed">Beetje belangrijk</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="not" id="not-ed" />
                          <Label htmlFor="not-ed">Niet belangrijk</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Jouw Dating Voorkeuren</h3>
                  <p className="text-muted-foreground">Help ons begrijpen wat je verwacht van een dating app</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Wat verwacht je van een dating app?</Label>
                      <div className="mt-2 space-y-2 bg-muted/30 p-3 rounded-md">
                        {[
                          { id: 'variety', label: 'Veel keuze aan mensen' },
                          { id: 'matching', label: 'Geavanceerde matching algoritmes' },
                          { id: 'personality', label: 'Persoonlijkheidstests' },
                          { id: 'niche', label: 'Specialistische platforms' }
                        ].map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={option.id}
                              checked={preferences.appExpectations.includes(option.id)}
                              onCheckedChange={(checked) => {
                                const current = preferences.appExpectations;
                                const updated = checked
                                  ? [...current, option.id]
                                  : current.filter(id => id !== option.id);
                                updatePreference('appExpectations', updated);
                              }}
                            />
                            <Label htmlFor={option.id} className="text-sm">{option.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Hoe snel wil je mensen ontmoeten?</Label>
                      <RadioGroup
                        value={preferences.meetingSpeed}
                        onValueChange={(value) => updatePreference('meetingSpeed', value)}
                        className="mt-2 space-y-2 bg-muted/30 p-3 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="immediate" id="immediate" />
                          <Label htmlFor="immediate">Direct (binnen dagen)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="weeks" id="weeks" />
                          <Label htmlFor="weeks">Binnen enkele weken</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="slow" id="slow" />
                          <Label htmlFor="slow">Geen haast, neem de tijd</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Budget voor dating apps</Label>
                      <RadioGroup
                        value={preferences.budget}
                        onValueChange={(value) => updatePreference('budget', value)}
                        className="mt-2 space-y-2 bg-muted/30 p-3 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="free" id="free" />
                          <Label htmlFor="free">Alleen gratis apps</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="basic" id="basic" />
                          <Label htmlFor="basic">Basis premium (€5-15/maand)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="premium" id="premium" />
                          <Label htmlFor="premium">Volledig premium (€15+/maand)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Belang van privacy en veiligheid</Label>
                      <RadioGroup
                        value={preferences.privacyImportance}
                        onValueChange={(value) => updatePreference('privacyImportance', value)}
                        className="mt-2 space-y-2 bg-muted/30 p-3 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="critical" id="critical" />
                          <Label htmlFor="critical">Kritiek belangrijk</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="important" id="important" />
                          <Label htmlFor="important">Belangrijk</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="moderate" id="moderate" />
                          <Label htmlFor="moderate">Gemiddeld</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Laatste Details</h3>
                  <p className="text-muted-foreground">Deze informatie helpt ons je advies te verfijnen</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Dating apps ervaring</Label>
                      <Textarea
                        placeholder="Welke dating apps heb je in het verleden gebruikt? Wat was je ervaring? Wat werkte goed, wat niet? Hoeveel tijd besteedde je eraan?"
                        value={preferences.pastExperience}
                        onChange={(e) => updatePreference('pastExperience', e.target.value)}
                        rows={4}
                        className="mt-2 bg-muted/30"
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium">Tijdsinvestering</Label>
                      <RadioGroup
                        value={preferences.timeInvestment}
                        onValueChange={(value) => updatePreference('timeInvestment', value)}
                        className="mt-2 space-y-2 bg-muted/30 p-3 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="minimal" id="minimal" />
                          <Label htmlFor="minimal">Minimaal (5-15 min/dag)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="moderate" id="moderate" />
                          <Label htmlFor="moderate">Gemiddeld (15-30 min/dag)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="extensive" id="extensive" />
                          <Label htmlFor="extensive">Veel tijd (30+ min/dag)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">AI hulp wensen</Label>
                      <div className="mt-2 space-y-2 bg-muted/30 p-3 rounded-md">
                        {[
                          { id: 'profile', label: 'Profiel foto advies' },
                          { id: 'bio', label: 'Bio schrijven hulp' },
                          { id: 'conversation', label: 'Gesprek starters' },
                          { id: 'matching', label: 'Betere matching' }
                        ].map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`ai-${option.id}`}
                              checked={preferences.aiHelp.includes(option.id)}
                              onCheckedChange={(checked) => {
                                const current = preferences.aiHelp;
                                const updated = checked
                                  ? [...current, option.id]
                                  : current.filter(id => id !== option.id);
                                updatePreference('aiHelp', updated);
                              }}
                            />
                            <Label htmlFor={`ai-${option.id}`} className="text-sm">{option.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Voorkeur communicatie</Label>
                      <div className="mt-2 space-y-2 bg-muted/30 p-3 rounded-md">
                        {[
                          { id: 'text', label: 'Tekst berichten', icon: MessageSquare },
                          { id: 'video', label: 'Video calls', icon: Video },
                          { id: 'voice', label: 'Stem berichten', icon: Mic }
                        ].map((option) => {
                          const Icon = option.icon;
                          return (
                            <div key={option.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`comm-${option.id}`}
                                checked={preferences.communicationStyle.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  const current = preferences.communicationStyle;
                                  const updated = checked
                                    ? [...current, option.id]
                                    : current.filter(id => id !== option.id);
                                  updatePreference('communicationStyle', updated);
                                }}
                              />
                              <Label htmlFor={`comm-${option.id}`} className="text-sm flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {option.label}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Klaar voor analyse!</h4>
                      <p className="text-sm text-blue-700">
                        We hebben nu alle informatie om professionele platform aanbevelingen te genereren.
                        De analyse is gebaseerd op wetenschappelijke inzichten over dating app algoritmes en gebruikersgedrag.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Vorige
              </Button>

              <div className="text-sm text-muted-foreground">
                Stap {currentStep} van {totalSteps}
              </div>

              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !preferences.relationshipGoal) ||
                    (currentStep === 2 && (!preferences.agePreference || !preferences.genderPreference))
                  }
                  className="gap-2"
                >
                  Volgende
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={generateRecommendations}
                  disabled={loading || !user || loading}
                  size="lg"
                  className="gap-2 px-8"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyseert...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      Genereer Aanbevelingen
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {recommendations.length > 0 && (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-6 h-6 text-primary" />
                    Jouw Professionele Platform Aanbevelingen
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Wetenschappelijk onderbouwde aanbevelingen gebaseerd op algoritmes, doelgroepen en gebruikersgedrag
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {recommendations.length} platforms
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {recommendations.map((rec, index) => (
            <Card
              key={index}
              className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg animate-in fade-in-50 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{rec.platform.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">{rec.platform}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {rec.algorithm}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.niche}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.targetAudience}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${getScoreColor(rec.matchScore)}`}>
                      {getScoreIcon(rec.matchScore)} {rec.matchScore}/10 match
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{rec.pricing}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Waarom dit platform bij jou past
                  </h4>
                  <p className="text-sm leading-relaxed">{rec.reasoning}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h5 className="font-semibold text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Sterke punten voor jou
                    </h5>
                    <ul className="space-y-2">
                      {rec.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-semibold text-orange-700 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Belangrijke overwegingen
                    </h5>
                    <ul className="space-y-2">
                      {rec.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Strategie voor succes
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rec.strategy}</p>
                </div>

                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Veiligheid:</span>
                    <span className="text-muted-foreground">{rec.safety}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Professionele Aanbeveling</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Deze aanbevelingen zijn gebaseerd op wetenschappelijk onderzoek naar dating app algoritmes,
                    gebruikersgedrag en succesfactoren. Start met 2 platforms die het beste bij je profiel passen.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Evidence-based matching</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}