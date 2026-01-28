'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Copy,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  Heart,
  Star,
  Zap
} from 'lucide-react';
import { TutorialModal, TutorialStep, useTutorialCompletion } from '@/components/ui/tutorial-modal';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

interface BioSuggestion {
  id: string;
  content: string;
  style: 'fun' | 'serious' | 'flirty' | 'mysterious';
  length: 'short' | 'medium' | 'long';
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
    title: 'Bio\'s beoordelen en aanpassen',
    description: 'Bekijk de gegenereerde bio\'s en pas ze aan naar je smaak.',
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
          <div className="font-medium text-green-800 mb-1">✅ Do\'s</div>
          <ul className="text-green-700 space-y-1">
            <li>• Gebruik actieve taal ("ik klim bergen" vs "ik hou van bergen")</li>
            <li>• Voeg 1-2 emoji's toe voor visuele interesse</li>
            <li>• Vermeld wat je zoekt in een partner</li>
            <li>• Update regelmatig voor versheid</li>
          </ul>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="font-medium text-red-800 mb-1">❌ Don\'ts</div>
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

export function AiBioGenerator() {
  const [userInput, setUserInput] = useState('');
  const [suggestions, setSuggestions] = useState<BioSuggestion[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<'fun' | 'serious' | 'flirty' | 'mysterious'>('fun');
  const [selectedLength, setSelectedLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const { isCompleted: tutorialCompleted, markCompleted } = useTutorialCompletion('ai-bio-generator');

  // Auto-show tutorial for first-time users
  useEffect(() => {
    if (!tutorialCompleted) {
      const timer = setTimeout(() => setShowTutorial(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [tutorialCompleted]);

  const generateBios = async () => {
    if (!userInput.trim()) return;

    setIsGenerating(true);
    try {
      // Simulate AI generation - in real app this would call an API
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockSuggestions: BioSuggestion[] = [
        {
          id: '1',
          content: 'Avontuurlijke koffieliefhebber die van bergbeklimmen en spontane roadtrips houdt. Zoek iemand om samen nieuwe plekken te ontdekken en quality time door te brengen ☕🏔️',
          style: selectedStyle,
          length: selectedLength,
          score: 92
        },
        {
          id: '2',
          content: 'Creatieve ziel met een passie voor fotografie en goede gesprekken bij kaarslicht. Waardeer authenticiteit en zoek iemand om diepere connecties mee te maken 📸✨',
          style: selectedStyle,
          length: selectedLength,
          score: 88
        },
        {
          id: '3',
          content: 'Fitness enthusiast die geloofd in work-life balance en avontuurlijke vakanties. Zoek een partner om samen sterker te worden, zowel fysiek als mentaal 💪🌅',
          style: selectedStyle,
          length: selectedLength,
          score: 85
        }
      ];

      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error generating bios:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'fun': return '🎉';
      case 'serious': return '💼';
      case 'flirty': return '😘';
      case 'mysterious': return '🔮';
      default: return '📝';
    }
  };

  const getLengthLabel = (length: string) => {
    switch (length) {
      case 'short': return 'Kort (60-80 karakters)';
      case 'medium': return 'Medium (80-120 karakters)';
      case 'long': return 'Lang (120-150 karakters)';
      default: return 'Medium';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Bio Generator</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Professionele bio varianten genereren</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTutorial(true)}
              className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Handleiding
            </Button>
            {suggestions.length > 0 && (
              <Badge className="bg-coral-100 text-coral-700 dark:bg-coral-900/50 dark:text-coral-300 border-coral-200 dark:border-coral-700">
                {suggestions.length} bio's gegenereerd
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Input Section */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl flex items-center gap-3 dark:text-white">
              <div className="w-8 h-8 bg-coral-100 dark:bg-coral-900/50 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-coral-600 dark:text-coral-400" />
              </div>
              Vertel ons over jezelf
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Hoe meer details je geeft, hoe beter de bio's worden
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              placeholder="Bijv: Ik ben een 28-jarige marketeer die van hardlopen houdt, regelmatig reist, en op zoek is naar iemand om diepe gesprekken mee te voeren en samen te lachen..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="min-h-[120px] resize-none"
            />

            {/* Style Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio Stijl</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'fun', label: 'Leuk & Energiek', icon: '🎉' },
                  { value: 'serious', label: 'Serieus & Betrouwbaar', icon: '💼' },
                  { value: 'flirty', label: 'Speels & Flirterig', icon: '😘' },
                  { value: 'mysterious', label: 'Mysterieus & Intrigerend', icon: '🔮' }
                ].map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setSelectedStyle(style.value as any)}
                    className={`p-4 text-left rounded-xl border-2 transition-all ${
                      selectedStyle === style.value
                        ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/30 text-coral-700 dark:text-coral-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{style.icon}</span>
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
                  { value: 'short', label: 'Kort' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'long', label: 'Lang' }
                ].map((length) => (
                  <button
                    key={length.value}
                    onClick={() => setSelectedLength(length.value as any)}
                    className={`p-4 text-center rounded-xl border-2 transition-all ${
                      selectedLength === length.value
                        ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/30 text-coral-700 dark:text-coral-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <span className="text-sm font-medium">{length.label}</span>
                  </button>
                ))}
              </div>
            </div>

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

        {/* Results Section */}
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
                    {getStyleIcon(selectedStyle)} {selectedStyle} • {getLengthLabel(selectedLength)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="bg-gray-50 dark:bg-gray-700 border-0 rounded-xl">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700">
                            <Star className="w-3 h-3 mr-1" />
                            {suggestion.score}% match
                          </Badge>
                          <Badge variant="outline" className="border-gray-300 dark:border-gray-500">
                            {suggestion.length}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(suggestion.content, suggestion.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          {copiedId === suggestion.id ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4 text-sm">
                        {suggestion.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{suggestion.content.length} karakters</span>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(suggestion.content, suggestion.id)}
                            className="border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600"
                          >
                            Kopiëren
                          </Button>
                          <Button
                            size="sm"
                            className="bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                          >
                            <Heart className="w-3 h-3 mr-1" />
                            Gebruiken
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Pro Tip</h3>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      Test verschillende stijlen om te zien welke het beste bij je past.
                      Een goede bio kan je match rate met 300% verhogen!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {suggestions.length === 0 && !isGenerating && (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-coral-100 dark:bg-coral-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-coral-600 dark:text-coral-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Klaar om je bio te verbeteren?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                Vertel ons over jezelf en laat onze AI professionele bio varianten voor je genereren
              </p>
              <Button
                variant="outline"
                onClick={() => setShowTutorial(true)}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-3"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Hoe werkt het?
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tutorial Modal */}
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

      <BottomNavigation />
    </div>
  );
}