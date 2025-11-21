"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Copy, RefreshCw, HelpCircle } from "lucide-react";
import { ToolOnboardingOverlay, useOnboardingOverlay } from "@/components/shared/tool-onboarding-overlay";
import { getOnboardingSteps, getToolDisplayName } from "@/lib/tool-onboarding-content";

interface GeneratedIcebreaker {
  question: string;
  category: string;
  difficulty: string;
  explanation: string;
  followUpTip: string;
}

export function IJsbrekerGeneratorTool() {
  const { showOverlay, setShowOverlay } = useOnboardingOverlay('ijsbreker-generator');

  const [loading, setLoading] = useState(false);
  const [generatedIcebreakers, setGeneratedIcebreakers] = useState<GeneratedIcebreaker[]>([]);

  // User input
  const [context, setContext] = useState("");
  const [relationshipStage, setRelationshipStage] = useState("early");
  const [energyLevel, setEnergyLevel] = useState("medium");

  const generateIcebreakers = async () => {
    if (!context.trim()) {
      alert("Vul minimaal context in over het gesprek of de persoon");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/icebreakers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          topic: context,
          relationshipStage: relationshipStage,
          energyLevel: energyLevel
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform the API response to match the expected format
      const transformedIcebreakers = data.icebreakers.map((question: string, index: number) => ({
        question: question,
        category: ['humor', 'diepgaand', 'licht', 'creatief', 'persoonlijk', 'speels'][index % 6],
        difficulty: ['makkelijk', 'gemiddeld', 'moeilijk', 'makkelijk', 'gemiddeld', 'moeilijk'][index % 6],
        explanation: `Deze ijsbreker is effectief omdat hij perfect aansluit bij het ${relationshipStage} stadium van jullie relatie en het ${energyLevel} energie niveau.`,
        followUpTip: `Als ze reageren, vraag dan door op hun antwoord om het gesprek dieper te maken.`
      }));

      setGeneratedIcebreakers(transformedIcebreakers);
    } catch (error) {
      console.error('Error generating icebreakers:', error);
      alert('Er ging iets mis bij het genereren van ijsbrekers. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'humor': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'diepgaand': 'bg-purple-100 text-purple-800 border-purple-300',
      'licht': 'bg-blue-100 text-blue-800 border-blue-300',
      'creatief': 'bg-green-100 text-green-800 border-green-300',
      'persoonlijk': 'bg-pink-100 text-pink-800 border-pink-300',
      'speels': 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'makkelijk': return 'text-green-600';
      case 'gemiddeld': return 'text-blue-600';
      case 'moeilijk': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: { [key: string]: string } = {
      'humor': '😂',
      'diepgaand': '🤔',
      'licht': '☀️',
      'creatief': '🎨',
      'persoonlijk': '💝',
      'speels': '🎪'
    };
    return emojis[category.toLowerCase()] || '💬';
  };

  return (
    <>
      {/* Onboarding Overlay */}
      <ToolOnboardingOverlay
        toolName="ijsbreker-generator"
        displayName={getToolDisplayName('ijsbreker-generator')}
        steps={getOnboardingSteps('ijsbreker-generator')}
        open={showOverlay}
        onOpenChange={setShowOverlay}
        onComplete={() => console.log('IJsbreker Generator onboarding completed!')}
      />

      <div className="space-y-6">
        {/* Header with Help Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">❄️ AI IJsbreker Generator</h2>
            <p className="text-sm text-muted-foreground">
              Genereer perfecte gesprekstarters voor elke situatie
            </p>
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

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Gespreks Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="context">Volledige gesprek context *</Label>
            <Textarea
              id="context"
              placeholder="Vertel me ALLES over deze persoon en jullie gesprek! Hoe hebben jullie elkaar ontmoet? Wat weet je al over ze? Welke interesses delen jullie? Wat voor werk doen ze? Welke hobby's hebben ze? Wat voor persoonlijkheid hebben ze? Hoe lang kennen jullie elkaar? Wat is jullie relatie stadium? Wat is de huidige sfeer van het gesprek? Zijn er onderwerpen die je wilt vermijden? Wat hoop je te bereiken met deze ijsbreker? Wat voor gevoel heb je bij deze persoon? Alles wat relevant is - hoe meer context, hoe beter ik je kan helpen!"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={15}
              className="bg-muted/50 min-h-[250px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Hoe meer je deelt over de persoon en jullie relatie, hoe persoonlijker en effectiever de ijsbrekers worden!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="relationshipStage">Relatie stadium</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: 'early', label: 'Vroeg stadium' },
                  { value: 'developing', label: 'Ontwikkelend' },
                  { value: 'established', label: 'Gevestigd' }
                ].map((stage) => (
                  <button
                    key={stage.value}
                    onClick={() => setRelationshipStage(stage.value)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      relationshipStage === stage.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:border-primary/50'
                    }`}
                  >
                    {stage.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="energyLevel">Energie niveau</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: 'low', label: 'Rustig' },
                  { value: 'medium', label: 'Normaal' },
                  { value: 'high', label: 'Energiek' }
                ].map((energy) => (
                  <button
                    key={energy.value}
                    onClick={() => setEnergyLevel(energy.value)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      energyLevel === energy.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:border-primary/50'
                    }`}
                  >
                    {energy.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={generateIcebreakers}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Genereer ijsbrekers...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Genereer 6 IJsbrekers
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {generatedIcebreakers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg">❄️ Gegeneerde IJsbrekers</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={generateIcebreakers}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Opnieuw genereren
            </Button>
          </div>

          {generatedIcebreakers.map((icebreaker, index) => (
            <Card key={index} className="border-2">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getCategoryEmoji(icebreaker.category)}</div>
                    <div>
                      <Badge className={`mb-1 ${getCategoryColor(icebreaker.category)}`}>
                        {icebreaker.category}
                      </Badge>
                      <div className={`text-xs ${getDifficultyColor(icebreaker.difficulty)}`}>
                        {icebreaker.difficulty}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(icebreaker.question)}
                    className="flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Kopiëren
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-blue-900">"{icebreaker.question}"</p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <strong>Effectiviteit:</strong> {icebreaker.explanation}
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>💡 Follow-up tip:</strong> {icebreaker.followUpTip}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <h5 className="font-semibold text-purple-800 mb-2">🎯 IJsbreker Strategie</h5>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-700">
                <div>
                  <h6 className="font-medium mb-1">Wanneer gebruiken:</h6>
                  <ul className="space-y-1">
                    <li>• Als het gesprek stilvalt</li>
                    <li>• Om van onderwerp te veranderen</li>
                    <li>• Om dieper contact te maken</li>
                  </ul>
                </div>
                <div>
                  <h6 className="font-medium mb-1">Timing tips:</h6>
                  <ul className="space-y-1">
                    <li>• Wacht op natuurlijke pauzes</li>
                    <li>• Gebruik tijdens eerste 3 berichten</li>
                    <li>• Varieer tussen licht en diepgaand</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </>
  );
}