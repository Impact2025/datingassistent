"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Loader2, Shield, HelpCircle } from "lucide-react";
import { getOpenRouterClient, OPENROUTER_MODELS } from "@/lib/openrouter";
import { ToolOnboardingOverlay, useOnboardingOverlay } from "@/components/shared/tool-onboarding-overlay";
import { getOnboardingSteps, getToolDisplayName } from "@/lib/tool-onboarding-content";

interface SafetyAnalysis {
  overallRisk: 'low' | 'medium' | 'high';
  riskScore: number;
  redFlags: string[];
  greenFlags: string[];
  recommendations: string[];
  summary: string;
  detailedAnalysis: {
    pressure: string;
    consistency: string;
    informationSharing: string;
    boundaryRespect: string;
  };
}

export function VeiligheidscheckTool() {
  const { showOverlay, setShowOverlay } = useOnboardingOverlay('veiligheidscheck');

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SafetyAnalysis | null>(null);

  // User input
  const [conversationText, setConversationText] = useState("");
  const [context, setContext] = useState("");

  const analyzeSafety = async () => {
    if (!conversationText.trim()) {
      alert("Vul minimaal de gespreksinhoud in");
      return;
    }

    setLoading(true);
    try {
      const prompt = `Je bent een veiligheidsexpert voor online dating. Analyseer dit gesprek op veiligheid en geef een gedetailleerde beoordeling.

Gespreksinhoud:
${conversationText}

Context: ${context || 'Geen extra context opgegeven'}

Analyseer op:
1. Druk uitoefenen of manipulatie
2. Consistentie in verhaal
3. Geschikte informatie deling
4. Respect voor grenzen
5. Rode vlaggen en groene vlaggen

Geef terug in JSON format:
{
  "overallRisk": "low/medium/high",
  "riskScore": 1-10 (waar 1 = zeer veilig, 10 = zeer riskant),
  "redFlags": ["lijst van rode vlaggen"],
  "greenFlags": ["lijst van groene vlaggen"],
  "recommendations": ["concrete aanbevelingen"],
  "summary": "Korte samenvatting van de veiligheid",
  "detailedAnalysis": {
    "pressure": "Analyse van druk uitoefenen",
    "consistency": "Analyse van verhaal consistentie",
    "informationSharing": "Analyse van informatie deling",
    "boundaryRespect": "Analyse van grens respect"
  }
}`;

      const openRouter = getOpenRouterClient();
      const response = await openRouter.createChatCompletion(
        OPENROUTER_MODELS.CLAUDE_35_HAIKU,
        [{ role: 'user', content: prompt }],
        { temperature: 0.3, max_tokens: 2000 }
      );

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        setAnalysis(data);
      } else {
        throw new Error('Kon geen geldige JSON response krijgen');
      }
    } catch (error) {
      console.error('Error analyzing safety:', error);
      alert('Er ging iets mis bij de veiligheidsanalyse. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'high': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'Laag risico';
      case 'medium': return 'Gemiddeld risico';
      case 'high': return 'Hoog risico';
      default: return 'Onbekend risico';
    }
  };

  return (
    <>
      {/* Onboarding Overlay */}
      <ToolOnboardingOverlay
        toolName="veiligheidscheck"
        displayName={getToolDisplayName('veiligheidscheck')}
        steps={getOnboardingSteps('veiligheidscheck')}
        open={showOverlay}
        onOpenChange={setShowOverlay}
        onComplete={() => console.log('Veiligheidscheck onboarding completed!')}
      />

      <div className="space-y-6">
        {/* Header with Help Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">🛡️ AI Veiligheidscheck</h2>
            <p className="text-sm text-muted-foreground">
              Analyseer gesprekken op veiligheid en rode vlaggen
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
            <Shield className="w-5 h-5" />
            Gespreksanalyse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="conversationText">Volledige gespreksgeschiedenis *</Label>
            <Textarea
              id="conversationText"
              placeholder="Plak HIER ALLE berichten van jullie gesprek! Kopieer alles vanaf het eerste bericht tot het laatste. Hoe meer berichten je deelt, hoe accurater de analyse wordt. Neem alle berichten op - zowel jouw berichten als die van de ander. Inclusief hoe jullie elkaar hebben ontmoet, wat jullie hebben besproken, hoe het gesprek is verlopen, enzovoort. Wees volledig - dit helpt bij het detecteren van patronen en rode vlaggen!"
              value={conversationText}
              onChange={(e) => setConversationText(e.target.value)}
              rows={20}
              className="bg-muted/50 min-h-[300px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Hoe meer berichten je deelt, hoe nauwkeuriger de veiligheidsanalyse wordt!
            </p>
          </div>

          <div>
            <Label htmlFor="context">Achtergrond informatie & gevoelens</Label>
            <Textarea
              id="context"
              placeholder="Vertel me alles wat relevant is! Hoe hebben jullie elkaar ontmoet? Hoe lang kennen jullie elkaar? Waar hebben jullie elkaar ontmoet (app, vrienden, werk, etc.)? Wat is jullie relatie stadium? Wat is je gevoel bij deze persoon? Zijn er dingen die je opvallen? Heb je eerder vreemde ervaringen gehad? Wat maakt je bezorgd? Wat geeft je een goed gevoel? Alles wat je denkt dat belangrijk kan zijn voor de veiligheid - deel zoveel als je wilt!"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={12}
              className="bg-muted/50 min-h-[180px]"
            />
          </div>

          <Button
            onClick={analyzeSafety}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyseer veiligheid...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Start Veiligheidscheck
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Risk Assessment */}
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {getRiskIcon(analysis.overallRisk)}
                  <div>
                    <h4 className="text-2xl font-bold">Risico Score: {analysis.riskScore}/10</h4>
                    <Badge className={`text-sm ${getRiskColor(analysis.overallRisk)}`}>
                      {getRiskLabel(analysis.overallRisk)}
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">{analysis.summary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Red Flags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-5 h-5" />
                  Rode Vlaggen
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.redFlags.length > 0 ? (
                  <ul className="space-y-3">
                    {analysis.redFlags.map((flag, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-red-800">{flag}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-700">Geen rode vlaggen gedetecteerd ✅</p>
                )}
              </CardContent>
            </Card>

            {/* Green Flags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  Groene Vlaggen
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.greenFlags.length > 0 ? (
                  <ul className="space-y-3">
                    {analysis.greenFlags.map((flag, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-green-800">{flag}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Geen duidelijke groene vlaggen gevonden</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Gedetailleerde Analyse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold mb-2">Druk Uitoefenen</h5>
                  <p className="text-sm text-muted-foreground">{analysis.detailedAnalysis.pressure}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold mb-2">Verhaal Consistentie</h5>
                  <p className="text-sm text-muted-foreground">{analysis.detailedAnalysis.consistency}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold mb-2">Informatie Delen</h5>
                  <p className="text-sm text-muted-foreground">{analysis.detailedAnalysis.informationSharing}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold mb-2">Grens Respect</h5>
                  <p className="text-sm text-muted-foreground">{analysis.detailedAnalysis.boundaryRespect}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Aanbevelingen</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Safety Reminder */}
          <Card className={`border-2 ${analysis.overallRisk === 'high' ? 'border-red-300 bg-red-50/50' : 'border-blue-300 bg-blue-50/50'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-blue-800 mb-1">Veiligheid Eerst</h5>
                  <p className="text-sm text-blue-700">
                    {analysis.overallRisk === 'high'
                      ? 'Dit gesprek vertoont meerdere rode vlaggen. Overweeg het gesprek te stoppen en neem contact op met vertrouwde personen.'
                      : 'Blijf altijd waakzaam bij online ontmoetingen. Deel nooit persoonlijke informatie te snel en vertrouw op je intuïtie.'
                    }
                  </p>
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