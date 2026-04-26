'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  Sparkles,
  Copy,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  Heart,
  Star,
  Zap,
  Save,
  AlertCircle,
  Briefcase,
  Eye,
  MessageCircle,
} from 'lucide-react';
import { TutorialModal, TutorialStep, useTutorialCompletion } from '@/components/ui/tutorial-modal';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { getValidToken } from '@/lib/client-auth';

interface BioSuggestion {
  id: string;
  content: string;
  score: number;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'introduction',
    title: 'Welkom bij AI Bio Generator',
    description: 'Leer hoe je professionele, aantrekkelijke dating profielen maakt met AI hulp.',
    tip: 'Gebruik altijd je echte interesses - authenticiteit werkt het beste!'
  },
  {
    id: 'input-basics',
    title: 'Jouw informatie invoeren',
    description: 'Vertel ons over jezelf: je hobbies, werk, persoonlijkheid en wat je zoekt in een relatie.',
    content: (
      <div className="space-y-2 text-sm">
        <div><strong>Goede input bevat:</strong></div>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>3-5 hobby's of interesses</li>
          <li>Jouw persoonlijkheid (extravert/introvert, avontuurlijk/relaxed)</li>
          <li>Wat je belangrijk vindt in een relatie</li>
          <li>Een unieke eigenschap van jou</li>
        </ul>
      </div>
    ),
    example: {
      before: 'Ik hou van sport en reizen.',
      after: 'Avontuurlijke sportliefhebber die van bergbeklimmen houdt en altijd op zoek is naar de volgende bestemming. Zoek iemand om samen nieuwe plekken te ontdekken en quality time door te brengen.',
      explanation: 'Specifieker en persoonlijker maakt je profiel veel aantrekkelijker!'
    },
    interactive: true
  },
  {
    id: 'style-selection',
    title: 'Bio stijlen kiezen',
    description: 'Kies de juiste toon voor je bio gebaseerd op je persoonlijkheid.',
    content: (
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="p-3 bg-coral-50 rounded-lg">
          <div className="font-medium text-coral-800">🎉 Fun</div>
          <div className="text-coral-600">Energie, humor, speels</div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="font-medium text-blue-800">💼 Serious</div>
          <div className="text-blue-600">Betrouwbaar, ambitieus, stabiel</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="font-medium text-purple-800">😘 Flirty</div>
          <div className="text-purple-600">Speels, charmant, flirterig</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="font-medium text-gray-800">🔮 Mysterious</div>
          <div className="text-gray-600">Intrigerend, mysterieus, subtiel</div>
        </div>
      </div>
    ),
    tip: 'Test verschillende stijlen om te zien wat het beste bij je past!'
  },
  {
    id: 'review-edit',
    title: 'Bio\'s beoordelen en opslaan',
    description: 'Bekijk de gegenereerde bio\'s en sla de beste op in je profiel.',
    content: (
      <div className="space-y-2 text-sm">
        <div><strong>Let op deze elementen:</strong></div>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li><strong>Authenticiteit:</strong> Voelt het als jou?</li>
          <li><strong>Specifiek:</strong> Unieke details maken je interessant</li>
          <li><strong>Balans:</strong> Mix van serieus en leuk</li>
          <li><strong>Lengte:</strong> 80-120 karakters werkt het beste</li>
        </ul>
      </div>
    ),
    example: {
      before: 'Ik ben een leuke persoon die van reizen houdt.',
      after: 'Bergbeklimmer en koffieliefhebber die altijd op zoek is naar het volgende avontuur. Zoek iemand om samen de wereld te verkennen ☕🏔️',
      explanation: 'Specifieke interesses en een emoji maken het persoonlijk en visueel aantrekkelijk!'
    }
  },
  {
    id: 'best-practices',
    title: 'Pro tips voor succes',
    description: 'Geheimen voor een bio die matches oplevert.',
    content: (
      <div className="space-y-3 text-sm">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="font-medium text-green-800 mb-1">✅ Do's</div>
          <ul className="text-green-700 space-y-1">
            <li>• Gebruik actieve taal ("ik klim bergen" vs "ik hou van bergen")</li>
            <li>• Voeg 1-2 emoji's toe voor visuele interesse</li>
            <li>• Vermeld wat je zoekt in een partner</li>
            <li>• Update regelmatig voor versheid</li>
          </ul>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="font-medium text-red-800 mb-1">❌ Don'ts</div>
          <ul className="text-red-700 space-y-1">
            <li>• Vermijd negatieve taal</li>
            <li>• Niet te lang of te kort</li>
            <li>• Geen lijstjes van eisen</li>
            <li>• Niet kopiëren van anderen</li>
          </ul>
        </div>
      </div>
    ),
    tip: 'Een goede bio levert 3x meer matches op!'
  }
];

interface AiBioGeneratorProps {
  embedded?: boolean;
}

export function AiBioGenerator({ embedded = false }: AiBioGeneratorProps) {
  const router = useRouter();
  const { user, userProfile } = useUser();
  const { toast } = useToast();

  const [userInput, setUserInput] = useState('');
  const [suggestions, setSuggestions] = useState<BioSuggestion[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<'fun' | 'serious' | 'flirty' | 'mysterious'>('fun');
  const [selectedLength, setSelectedLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isCompleted: tutorialCompleted, markCompleted } = useTutorialCompletion('ai-bio-generator');

  useEffect(() => {
    if (!tutorialCompleted) {
      const timer = setTimeout(() => setShowTutorial(true), 800);
      return () => clearTimeout(timer);
    }
  }, [tutorialCompleted]);

  const generateBios = async () => {
    if (!userInput.trim()) return;
    setIsGenerating(true);
    setError(null);
    setSuggestions([]);

    try {
      const token = getValidToken();
      const res = await fetch('/api/tools/bio-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userInput, style: selectedStyle, length: selectedLength }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Fout ${res.status}`);
      }

      const data = await res.json();
      setSuggestions(data.bios || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Onbekende fout';
      setError(msg);
      toast({ title: 'Generatie mislukt', description: msg, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const useBio = async (suggestion: BioSuggestion) => {
    if (!user?.id) {
      toast({ title: 'Niet ingelogd', description: 'Log opnieuw in om door te gaan.', variant: 'destructive' });
      return;
    }
    setSavingId(suggestion.id);

    try {
      const token = getValidToken();
      const currentProfile = userProfile || {};
      const updatedProfile = { ...currentProfile, bio: suggestion.content };

      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: user.id, profile: updatedProfile }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Fout ${res.status}`);
      }

      setSavedId(suggestion.id);
      toast({
        title: 'Bio opgeslagen!',
        description: 'Je profiel is bijgewerkt. Je bio is nu zichtbaar op je profiel.',
      });
      setTimeout(() => router.push('/dashboard?tab=profiel'), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Opslaan mislukt';
      toast({ title: 'Opslaan mislukt', description: msg, variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: 'Kopiëren mislukt', description: 'Selecteer de tekst handmatig.', variant: 'destructive' });
    }
  };

  const STYLE_CONFIG = [
    { value: 'fun',        label: 'Leuk & Energiek',         icon: <Zap className="w-4 h-4" /> },
    { value: 'serious',    label: 'Serieus & Betrouwbaar',   icon: <Briefcase className="w-4 h-4" /> },
    { value: 'flirty',     label: 'Speels & Flirterig',      icon: <Heart className="w-4 h-4" /> },
    { value: 'mysterious', label: 'Mysterieus & Intrigerend', icon: <Eye className="w-4 h-4" /> },
  ] as const;

  const getStyleLabel = (style: string) => STYLE_CONFIG.find(s => s.value === style)?.label ?? style;

  const getLengthRange = (len: string) => {
    const ranges: Record<string, string> = { short: '60-80', medium: '80-120', long: '120-150' };
    return ranges[len] || '80-120';
  };

  const charCountColor = (len: number) => {
    if (len < 20) return 'text-gray-400';
    if (len < 50) return 'text-amber-500';
    return 'text-green-500';
  };

  return (
    <div className={embedded ? 'pb-6' : 'min-h-screen bg-gray-50 dark:bg-gray-900 pb-20'}>
      {/* Header — only in standalone mode */}
      {!embedded && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Bio Generator</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Genereer bio's die 3× meer matches opleveren</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTutorial(true)}
              className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Handleiding
            </Button>
          </div>
        </div>
      )}

      <div className={`max-w-4xl mx-auto space-y-8 ${embedded ? 'p-0' : 'p-6'}`}>
        {/* Input Section */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-3 dark:text-white">
              <div className="w-8 h-8 bg-coral-100 dark:bg-coral-900/50 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-coral-600 dark:text-coral-400" />
              </div>
              Vertel ons over jezelf
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Hoe meer details je geeft, hoe beter en persoonlijker de bio's worden
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Textarea
                placeholder="Bijv: 28-jarige marketeer, hou van hardlopen en bergen, reist graag naar plekken buiten de toeristische route. Op zoek naar iemand met wie ik diepgaande gesprekken kan voeren én samen kunnen lachen..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <div className={`text-xs text-right ${charCountColor(userInput.length)}`}>
                {userInput.length} karakters{userInput.length < 50 && userInput.length > 0 && ' — voeg meer details toe voor betere resultaten'}
              </div>
            </div>

            {/* Style Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio Stijl</label>
              <div className="grid grid-cols-2 gap-3">
                {STYLE_CONFIG.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setSelectedStyle(style.value as typeof selectedStyle)}
                    className={`p-4 text-left rounded-xl border-2 transition-all ${
                      selectedStyle === style.value
                        ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/30 text-coral-700 dark:text-coral-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={selectedStyle === style.value ? 'text-coral-600 dark:text-coral-400' : 'text-gray-500 dark:text-gray-400'}>
                        {style.icon}
                      </span>
                      <span className="text-sm font-medium">{style.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Length Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio Lengte</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'short', label: 'Kort', desc: '60-80 tekens' },
                  { value: 'medium', label: 'Medium', desc: '80-120 tekens' },
                  { value: 'long', label: 'Lang', desc: '120-150 tekens' },
                ].map((len) => (
                  <button
                    key={len.value}
                    onClick={() => setSelectedLength(len.value as typeof selectedLength)}
                    className={`p-4 text-center rounded-xl border-2 transition-all ${
                      selectedLength === len.value
                        ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/30 text-coral-700 dark:text-coral-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="text-sm font-medium">{len.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{len.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              onClick={generateBios}
              disabled={!userInput.trim() || isGenerating}
              className="w-full bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                  Bio's genereren...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-3" />
                  Genereer Bio Varianten
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {suggestions.length > 0 && (
          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-3 dark:text-white">
                    <div className="w-8 h-8 bg-coral-100 dark:bg-coral-900/50 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-coral-600 dark:text-coral-400" />
                    </div>
                    Jouw Bio Suggesties
                  </CardTitle>
                  <Badge className="bg-coral-100 text-coral-700 dark:bg-coral-900/50 dark:text-coral-300 border-coral-200 dark:border-coral-700">
                    {getStyleLabel(selectedStyle)} · {getLengthRange(selectedLength)} tekens
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="bg-gray-50 dark:bg-gray-700 border-0 rounded-xl">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200">
                            <Star className="w-3 h-3 mr-1" />
                            {suggestion.score}% match kans
                          </Badge>
                          <span className="text-xs text-gray-400">{suggestion.content.length} tekens</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(suggestion.content, suggestion.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                        >
                          {copiedId === suggestion.id ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-5 text-sm">
                        {suggestion.content}
                      </p>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(suggestion.content, suggestion.id)}
                          className="border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 flex-1"
                        >
                          {copiedId === suggestion.id ? (
                            <><CheckCircle className="w-3 h-3 mr-1 text-green-500" /> Gekopieerd</>
                          ) : (
                            <><Copy className="w-3 h-3 mr-1" /> Kopiëren</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => useBio(suggestion)}
                          disabled={savingId === suggestion.id || savedId === suggestion.id}
                          className="bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow hover:shadow-md transition-all flex-1"
                        >
                          {savedId === suggestion.id ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Opgeslagen!</>
                          ) : savingId === suggestion.id ? (
                            <><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Opslaan...</>
                          ) : (
                            <><Save className="w-3 h-3 mr-1" /> Gebruiken</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Tip */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-0 rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Pro Tip</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                      Klik <strong>Gebruiken</strong> om een bio direct in je profiel op te slaan.
                      Of kopieer de tekst en pas hem aan naar je eigen smaak — de AI geeft je een sterke basis.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              onClick={generateBios}
              disabled={isGenerating}
              className="w-full border-gray-200 dark:border-gray-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Nieuwe varianten genereren
            </Button>
          </div>
        )}

        {/* Empty State */}
        {suggestions.length === 0 && !isGenerating && (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-coral-100 dark:bg-coral-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-coral-600 dark:text-coral-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Klaar om je bio te schrijven?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                Vertel iets over jezelf hierboven — de AI genereert 3 unieke bio-varianten op basis van jouw persoonlijkheid en stijl.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowTutorial(true)}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Hoe werkt het?
                </Button>
                <Button
                  onClick={() => document.querySelector('textarea')?.focus()}
                  className="bg-coral-500 hover:bg-coral-600 text-white rounded-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Begin nu
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {!embedded && (
        <TutorialModal
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          onComplete={markCompleted}
          title="AI Bio Generator Handleiding"
          description="Leer hoe je professionele dating bio's maakt in 5 eenvoudige stappen"
          steps={TUTORIAL_STEPS}
          toolId="ai-bio-generator"
          estimatedTime={5}
          difficulty="beginner"
        />
      )}

      <Toaster />
      {!embedded && <BottomNavigation />}
    </div>
  );
}
