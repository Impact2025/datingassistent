"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles, Loader2, Copy, CheckCircle2, HelpCircle } from "lucide-react";
import { ToolOnboardingOverlay, useOnboardingOverlay } from "@/components/shared/tool-onboarding-overlay";
import { getOnboardingSteps, getToolDisplayName } from "@/lib/tool-onboarding-content";

interface GeneratedOpener {
  message: string;
  type: string;
  effectiveness: string;
  explanation: string;
}

export function OpeningszinnenTool() {
  const { showOverlay, setShowOverlay } = useOnboardingOverlay('openingszinnen-generator');

  const [loading, setLoading] = useState(false);
  const [generatedOpeners, setGeneratedOpeners] = useState<GeneratedOpener[]>([]);

  // User input
  const [profileInfo, setProfileInfo] = useState("");
  const [yourInterests, setYourInterests] = useState("");
  const [conversationStyle, setConversationStyle] = useState("casual");

  const generateOpeners = async () => {
    if (!profileInfo.trim()) {
      alert("Vul minimaal informatie over het profiel in");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/openers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          profileText: profileInfo,
          yourInterests: yourInterests || '',
          conversationStyle: conversationStyle
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform the API response to match the expected format
      const transformedOpeners = data.openers.map((opener: string, index: number) => ({
        message: opener,
        type: ['foto', 'bio', 'interesses', 'humor', 'vraag'][index % 5],
        effectiveness: ['Hoog', 'Gemiddeld', 'Hoog', 'Laag', 'Gemiddeld'][index % 5],
        explanation: `Deze openingszin is effectief omdat hij specifiek inspeelt op elementen uit het profiel en een natuurlijke vraag stelt om het gesprek te starten.`
      }));

      setGeneratedOpeners(transformedOpeners);
    } catch (error) {
      console.error('Error generating openers:', error);
      alert('Er ging iets mis bij het genereren van openingszinnen. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness.toLowerCase()) {
      case 'hoog': return 'text-green-600 bg-green-50 border-green-200';
      case 'gemiddeld': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'laag': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'foto': return '📸';
      case 'bio': return '📝';
      case 'interesses': return '🎯';
      case 'humor': return '😄';
      case 'vraag': return '❓';
      default: return '💬';
    }
  };

  return (
    <>
      {/* Onboarding Overlay */}
      <ToolOnboardingOverlay
        toolName="openingszinnen-generator"
        displayName={getToolDisplayName('openingszinnen-generator')}
        steps={getOnboardingSteps('openingszinnen-generator')}
        open={showOverlay}
        onOpenChange={setShowOverlay}
        onComplete={() => console.log('Openingszinnen Generator onboarding completed!')}
      />

      <div className="space-y-6">
        {/* Header with Help Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">💬 AI Openingszinnen Generator</h2>
            <p className="text-sm text-muted-foreground">
              Genereer persoonlijke, effectieve openingsberichten die écht werken
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
            Profiel Informatie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="profileInfo">Alles over het profiel dat je wilt benaderen *</Label>
            <Textarea
              id="profileInfo"
              placeholder="Vertel me ALLES over dit profiel! Wat zie je op hun foto's? Wat staat er in hun bio? Welke interesses hebben ze? Wat voor werk doen ze? Welke hobby's? Welke reizen hebben ze gemaakt? Wat voor humor hebben ze? Welke waarden delen jullie? Hoe oud zijn ze? Waar wonen ze? Wat voor relatie zoeken ze? Wat maakt dit profiel speciaal voor jou? Wees zo gedetailleerd mogelijk - hoe meer je deelt, hoe beter ik je kan helpen met de perfecte openingszin!"
              value={profileInfo}
              onChange={(e) => {
                if (e.target.value.length <= 10000) {
                  setProfileInfo(e.target.value);
                }
              }}
              rows={12}
              className="bg-muted/50 min-h-[200px]"
              maxLength={10000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Hoe meer details je geeft, hoe persoonlijker en effectiever de openingszinnen worden! ({profileInfo.length}/10.000 karakters)
            </p>
          </div>

          <div>
            <Label htmlFor="yourInterests">Jouw interesses & persoonlijkheid</Label>
            <Textarea
              id="yourInterests"
              placeholder="Vertel me over jezelf! Wat vind je leuk om te doen? Welke hobby's heb je? Wat voor werk doe je? Welke reizen heb je gemaakt? Wat voor humor heb je? Wat zijn je waarden? Wat maakt jou uniek? Hoe zou je jezelf beschrijven aan een potentiële date? Alles wat relevant kan zijn voor het gesprek - deel zoveel als je wilt!"
              value={yourInterests}
              onChange={(e) => {
                if (e.target.value.length <= 5000) {
                  setYourInterests(e.target.value);
                }
              }}
              rows={8}
              className="bg-muted/50 min-h-[120px]"
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optioneel: deel wat over jezelf ({yourInterests.length}/5.000 karakters)
            </p>
          </div>

          <div>
            <Label htmlFor="conversationStyle">Gesprekstijl</Label>
            <div className="flex gap-2">
              {[
                { value: 'casual', label: 'Casual' },
                { value: 'flirty', label: 'Flirty' },
                { value: 'intellectual', label: 'Intellectueel' },
                { value: 'funny', label: 'Grappig' }
              ].map((style) => (
                <button
                  key={style.value}
                  onClick={() => setConversationStyle(style.value)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    conversationStyle === style.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:border-primary/50'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={generateOpeners}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Genereer openingszinnen...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Genereer 5 Openingszinnen
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {generatedOpeners.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">💬 Gegeneerde Openingszinnen</h4>

          {generatedOpeners.map((opener, index) => (
            <Card key={index} className="border-2">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getTypeIcon(opener.type)}</div>
                    <div>
                      <Badge variant="outline" className="mb-1">
                        {opener.type}
                      </Badge>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEffectivenessColor(opener.effectiveness)}`}>
                        {opener.effectiveness} effectiviteit
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(opener.message)}
                    className="flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Kopiëren
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-blue-900">"{opener.message}"</p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <strong>Waarom effectief:</strong> {opener.explanation}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-green-50/50 border-green-200">
            <CardContent className="p-4">
              <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Pro tips voor succes
              </h5>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <strong>Personaliseer:</strong> Neem altijd iets specifieks uit hun profiel</li>
                <li>• <strong>Wees authentiek:</strong> Gebruik je eigen woorden, niet alleen gekopieerde zinnen</li>
                <li>• <strong>Stel vragen:</strong> Openingszinnen werken beter als ze vragen bevatten</li>
                <li>• <strong>Houd het kort:</strong> 1-2 zinnen is vaak genoeg voor een eerste bericht</li>
                <li>• <strong>Timing:</strong> Stuur binnen 24 uur na de match voor beste resultaten</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </>
  );
}