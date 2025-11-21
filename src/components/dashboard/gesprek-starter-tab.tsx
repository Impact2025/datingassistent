"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { useUser } from "@/providers/user-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { AIResultCard } from "@/components/shared/ai-result-card";
import { DATING_PLATFORMS } from "@/lib/data";
import { Search, Lightbulb, HelpCircle, CheckCircle2, MessageSquare } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useCoachingTracker } from "@/hooks/use-coaching-tracker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ToolOnboardingOverlay, useOnboardingOverlay } from "@/components/shared/tool-onboarding-overlay";
import { getOnboardingSteps, getToolDisplayName } from "@/lib/tool-onboarding-content";
import { ContextualTooltip } from "@/components/shared/contextual-tooltip";
import { useToolCompletion } from "@/hooks/use-tool-completion";


export function GesprekStarterTab() {
  const [activeSubTab, setActiveSubTab] = useState("openers");
  const { toast } = useToast();
  const { userProfile } = useUser();
  const { trackCustomEvent, isFirstTime, isFromOnboarding } = useCoachingTracker('gesprek-starter');
  const { showOverlay, setShowOverlay } = useOnboardingOverlay('gesprek-starter');
  const {
    isCompleted: isActionCompleted,
    markAsCompleted: markCompleted,
    completedActions,
    progressPercentage,
    isLoading: progressLoading
  } = useToolCompletion('gesprek-starter');
  
  // Create progress object for backward compatibility
  const progress = {
    completedActions: completedActions.length,
    progressPercentage
  };

  // Opener Lab State
  const [profileText, setProfileText] = useState("");
  const [isGeneratingOpeners, startGeneratingOpeners] = useTransition();
  const [openers, setOpeners] = useState<string[] | null>(null);

  // Safety Check State
  const [conversationLog, setConversationLog] = useState("");
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [safetyAnalysis, setSafetyAnalysis] = useState<string | null>(null);

  // Matchmaker State
  const [platformPref, setPlatformPref] = useState("Mobiele App");
  const [costPref, setCostPref] = useState("gratis");
  const [timePref, setTimePref] = useState("snel en dagelijks");
  const [techComfort, setTechComfort] = useState("hoog");
  const [isMatching, startMatching] = useTransition();
  const [matchmakerResults, setMatchmakerResults] = useState<any[] | null>(null);

  // Icebreaker State
  const [icebreakerTopic, setIcebreakerTopic] = useState("");
  const [icebreakers, setIcebreakers] = useState<string[] | null>(null);
  const [isGeneratingIcebreakers, startGeneratingIcebreakers] = useTransition();

  const handleFindMatches = () => {
    if (!userProfile) return;
    startMatching(async () => {
        try {
            const token = localStorage.getItem('datespark_auth_token');
            const response = await fetch('/api/platform-match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    age: userProfile.age || 25,
                    gender: userProfile.gender,
                    seekingGender: userProfile.seekingGender,
                    seekingType: userProfile.seekingType || 'relatie',
                    identityGroup: userProfile.identityGroup || 'algemeen',
                    interests: userProfile.interests,
                    location: userProfile.location,
                    platformPref,
                    costPref,
                    timePref,
                    techComfort,
                    availablePlatforms: DATING_PLATFORMS,
                })
            });

            if (!response.ok) {
                throw new Error('Failed to find platform matches');
            }

            const data = await response.json();
            setMatchmakerResults(data.suggestions);

            // Track completion in database
            await markCompleted('platform_matched', {
              platforms: data.suggestions?.length || 0,
              timestamp: new Date().toISOString()
            });
        } catch(error) {
            console.error(error);
            toast({ title: "Fout", description: "Kon geen platformen vinden.", variant: "destructive" });
        }
    })
  }

  const generateAIOpeners = async (profileText: string): Promise<string[]> => {
    const token = localStorage.getItem('datespark_auth_token');
    const response = await fetch('/api/openers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ profileText })
    });

    if (!response.ok) {
      throw new Error('Failed to generate openers');
    }

    const data = await response.json();
    return data.openers;
  };

  const generateAIIcebreakers = async (topic: string): Promise<string[]> => {
    const token = localStorage.getItem('datespark_auth_token');
    const response = await fetch('/api/icebreakers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ topic })
    });

    if (!response.ok) {
      throw new Error('Failed to generate icebreakers');
    }

    const data = await response.json();
    return data.icebreakers;
  };

  const handleGenerateOpeners = () => {
    if (!profileText.trim()) {
      toast({ title: "Fout", description: "Plak eerst de profieltekst van je match.", variant: "destructive" });
      return;
    }
    startGeneratingOpeners(async () => {
      try {
        const results = await generateAIOpeners(profileText);
        setOpeners(results);

        // Track completion in database
        await markCompleted('opener_generated', {
          starterType: 'profile_based',
          count: results.length,
          timestamp: new Date().toISOString()
        });

        // Track opener generation
        await trackCustomEvent('openers_generated', {
          starterType: 'profile_based',
          count: results.length
        });

        toast({
          title: "Openingszinnen klaar",
          description: "Drie creatieve, persoonlijke suggesties staan voor je klaar.",
        });
      } catch (error) {
        console.error('Error generating openers:', error);
        toast({
          title: "Fout",
          description: "Kon geen openingszinnen genereren. Probeer het opnieuw.",
          variant: "destructive"
        });
      }
    });
  };

  const handleAnalyzeConversation = () => {
    if (!conversationLog.trim()) {
      toast({ title: "Fout", description: "Plak eerst een (deel van een) gesprek om te analyseren.", variant: "destructive" });
      return;
    }
    startAnalyzing(async () => {
        try {
            const token = localStorage.getItem('datespark_auth_token');
            const response = await fetch('/api/safety-check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ conversationLog })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze conversation');
            }

            const data = await response.json();
            setSafetyAnalysis(data.analysis);

            // Track completion in database
            await markCompleted('safety_checked', {
              safetyScore: data.analysis.overall_safety_score,
              timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error(error);
            toast({ title: "Fout", description: "Kon het gesprek niet analyseren.", variant: "destructive" });
        }
    });
  };

  const handleGenerateIcebreakers = () => {
    if (!icebreakerTopic.trim()) {
      toast({ title: "Fout", description: "Vul eerst een hobby of interesse van je match in.", variant: "destructive" });
      return;
    }

    startGeneratingIcebreakers(async () => {
      try {
        const results = await generateAIIcebreakers(icebreakerTopic);
        setIcebreakers(results);

        // Track icebreaker generation
        await trackCustomEvent('icebreakers_generated', {
          topic: icebreakerTopic,
          count: results.length
        });

        toast({
          title: "IJsbrekers klaar",
          description: "Drie creatieve openingszinnen staan voor je klaar.",
        });
      } catch (error) {
        console.error('Error generating icebreakers:', error);
        toast({
          title: "Fout",
          description: "Kon geen ijsbrekers genereren. Probeer het opnieuw.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <>
      {/* Onboarding Overlay */}
      <ToolOnboardingOverlay
        toolName="gesprek-starter"
        displayName={getToolDisplayName('gesprek-starter')}
        steps={getOnboardingSteps('gesprek-starter')}
        open={showOverlay}
        onOpenChange={setShowOverlay}
        onComplete={() => console.log('Gesprek Starters onboarding completed!')}
      />

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                Gesprek Starters
              </CardTitle>
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
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Genereer openers, vind platforms & check veiligheid voor betere gesprekken.
            </p>
            {progress?.completedActions > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">
                  {progress.progressPercentage}% voltooid ({progress.completedActions} acties)
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {isFirstTime && !showOverlay && (
          <Alert className="border-primary bg-primary/5">
            <Lightbulb className="w-4 h-4" />
            <AlertTitle>Eerste keer Gesprek Starters?</AlertTitle>
            <AlertDescription>
              Leer hoe je boeiende gesprekken start en vind het perfecte platform voor jouw dating stijl!
            </AlertDescription>
          </Alert>
        )}

        {isFromOnboarding && !isFirstTime && (
          <Alert className="border-l-4 border-l-primary bg-primary/5">
            <AlertDescription>
              <strong>💡 Tip van je coach:</strong> Begin met de Platform Match om te ontdekken waar je het beste kunt daten!
            </AlertDescription>
          </Alert>
        )}

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-background/50 p-1">
          <TabsTrigger value="matchmaker">Platform Match</TabsTrigger>
          <TabsTrigger value="openers">Openingszinnen</TabsTrigger>
          <TabsTrigger value="icebreakers">IJsbreker Generator</TabsTrigger>
          <TabsTrigger value="veiligheid">Veiligheidscheck</TabsTrigger>
        </TabsList>

       <TabsContent value="matchmaker" className="mt-6">
        <h3 className="text-xl font-bold">✨ Wat past het beste bij mij om te daten?</h3>
        <p className="mb-6 text-muted-foreground">
          Beantwoord een paar vragen en ontdek welke datingsite of -app het beste bij jou past.
        </p>
        <div className="space-y-6 rounded-lg bg-secondary/50 p-6">
            <RadioGroup defaultValue={platformPref} onValueChange={setPlatformPref}>
                <Label>Wat is je voorkeur?</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="Mobiele App" id="p-app" /><Label htmlFor="p-app">Mobiele App</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="Website" id="p-website" /><Label htmlFor="p-website">Website</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="Evenementen" id="p-events" /><Label htmlFor="p-events">Evenementen</Label></div>
                </div>
            </RadioGroup>
            <RadioGroup defaultValue={costPref} onValueChange={setCostPref}>
                <Label>Wat is je budget?</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="gratis" id="c-gratis" /><Label htmlFor="c-gratis">Voorkeur voor gratis</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="betaald" id="c-betaald" /><Label htmlFor="c-betaald">Ik wil best betalen</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="geen voorkeur" id="c-geen" /><Label htmlFor="c-geen">Maakt niet uit</Label></div>
                </div>
            </RadioGroup>
            <RadioGroup defaultValue={timePref} onValueChange={setTimePref}>
                <Label>Hoeveel tijd wil je besteden?</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="snel en dagelijks" id="t-snel" /><Label htmlFor="t-snel">Dagelijks swipen</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="rustig en af en toe" id="t-rustig" /><Label htmlFor="t-rustig">Rustig contact</Label></div>
                </div>
            </RadioGroup>
            <RadioGroup defaultValue={techComfort} onValueChange={setTechComfort}>
                <Label>Hoe comfortabel ben je met technologie?</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="hoog" id="tech-ja" /><Label htmlFor="tech-ja">Prima, AI-advies is fijn!</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="laag" id="tech-nee" /><Label htmlFor="tech-nee">Liever old-school profielen</Label></div>
                </div>
            </RadioGroup>
        </div>
        <Button onClick={handleFindMatches} disabled={isMatching} className="mt-6 w-full bg-green-600 hover:bg-green-700">
            {isMatching ? <LoadingSpinner /> : <Search className="mr-2 h-4 w-4" />} Vind mijn beste match!
        </Button>
        <div className="mt-6 space-y-4">
            {isMatching && <div className="flex justify-center p-4"><LoadingSpinner /></div>}
            {matchmakerResults?.map((result, index) => (
                <div key={index} className="rounded-lg border bg-card p-5">
                    <h4 className="text-lg font-semibold mb-3 text-primary">{result.name}</h4>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                p: ({ children }) => <p className="mb-3 last:mb-0 text-foreground">{children}</p>,
                                ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-foreground">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                            }}
                        >
                            {result.rationale}
                        </ReactMarkdown>
                    </div>
                </div>
            ))}
        </div>
      </TabsContent>


      <TabsContent value="openers" className="mt-6">
        <h3 className="mb-4 text-xl font-bold">✨ Opener lab</h3>
        <p className="mb-4 text-muted-foreground">
          Plak hieronder de profieltekst van je match. De AI-coach genereert 3-5 persoonlijke en respectvolle openingszinnen.
        </p>
        <Textarea
          value={profileText}
          onChange={(e) => setProfileText(e.target.value)}
          rows={5}
          placeholder="'Reislustige fotograaf met een liefde voor Italiaans eten en slechte woordgrappen...'"
          className="mb-4 bg-pink-50/50 border-pink-200 focus:border-pink-300 focus:ring-pink-300"
        />
        <Button onClick={handleGenerateOpeners} disabled={isGeneratingOpeners} className="w-full">
          {isGeneratingOpeners ? <LoadingSpinner /> : "Genereer Openingszinnen"}
        </Button>
        <div className="mt-6 space-y-3">
          {isGeneratingOpeners && <div className="flex justify-center"><LoadingSpinner/></div>}
          {openers?.map((opener, index) => (
            <AIResultCard key={index} content={opener} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="icebreakers" className="mt-6">
        <h3 className="mb-3 text-xl font-bold">✨ Ijsbreker generator</h3>
        <p className="mb-4 text-muted-foreground">
          Vul een hobby van je match in en ontvang 3 unieke openingszinnen die je direct kunt gebruiken. Uiteraard door onze AI.
        </p>
        <Input
          value={icebreakerTopic}
          onChange={(e) => setIcebreakerTopic(e.target.value)}
          placeholder="Bijvoorbeeld: ze houdt van boulderen en specialty coffee"
          className="mb-4 bg-pink-50/50 border-pink-200 focus:border-pink-300 focus:ring-pink-300"
        />
        <Button onClick={handleGenerateIcebreakers} disabled={isGeneratingIcebreakers} className="w-full">
          {isGeneratingIcebreakers ? <LoadingSpinner /> : "Genereer ijsbrekers"}
        </Button>
        <div className="mt-6 space-y-3">
          {isGeneratingIcebreakers && <div className="flex justify-center"><LoadingSpinner /></div>}
          {icebreakers?.map((item, index) => (
            <AIResultCard key={index} content={item} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="veiligheid" className="mt-6">
        <h3 className="mb-4 text-xl font-bold">✨ Gespreks-EHBO (Eerste hulp bij ongemak)</h3>
        <p className="mb-4 text-muted-foreground">
          Voelt een gesprek niet helemaal goed? Plak een deel van de chat hieronder. De AI-coach analyseert de tekst op mogelijke 'rode vlaggen' en geeft je discreet advies.
        </p>
        <Textarea
          value={conversationLog}
          onChange={(e) => setConversationLog(e.target.value)}
          rows={5}
          placeholder="Kopieer hier het (deel van het) gesprek dat je wilt laten checken..."
          className="mb-4 bg-pink-50/50 border-pink-200 focus:border-pink-300 focus:ring-pink-300"
        />
        <Button onClick={handleAnalyzeConversation} disabled={isAnalyzing} className="w-full bg-amber-600 hover:bg-amber-700">
          {isAnalyzing ? <LoadingSpinner /> : "Analyseer Gesprek"}
        </Button>
         <div className="mt-6">
          {isAnalyzing && <div className="flex justify-center"><LoadingSpinner/></div>}
          {safetyAnalysis && (
            <div className="rounded-lg border bg-card p-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                  }}
                >
                  {safetyAnalysis}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
      </div>
    </>
  );
}
