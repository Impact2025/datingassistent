"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Target,
  Heart,
  Zap,
  Trophy,
  Star,
  CheckCircle,
  X,
  RotateCcw,
  Download,
  Share2,
  Eye,
  Edit3,
  Lightbulb
} from 'lucide-react';
import { AIResultCard } from '@/components/shared/ai-result-card';

interface ProfileElement {
  id: string;
  type: 'hook' | 'bridge' | 'benefit' | 'cta' | 'personality';
  content: string;
  score: number;
  category: string;
  emoji: string;
}

interface ProfileBuilderProps {
  onComplete?: (profile: string, score: number) => void;
  initialProfile?: string;
}

const SAMPLE_ELEMENTS: ProfileElement[] = [
  // Hooks
  { id: 'hook-1', type: 'hook', content: 'Ik ben die ene persoon die...', score: 85, category: 'Intrigerend', emoji: '🎣' },
  { id: 'hook-2', type: 'hook', content: 'Mijn favoriete guilty pleasure is...', score: 90, category: 'Kwetsbaar', emoji: '😅' },
  { id: 'hook-3', type: 'hook', content: 'Ik heb net mijn droom verwezenlijkt door...', score: 88, category: 'Ambitieus', emoji: '🚀' },

  // Bridges
  { id: 'bridge-1', type: 'bridge', content: 'Maar tegelijkertijd ben ik...', score: 82, category: 'Balans', emoji: '⚖️' },
  { id: 'bridge-2', type: 'bridge', content: 'Wat mensen niet verwachten is dat...', score: 87, category: 'Verrassing', emoji: '😲' },
  { id: 'bridge-3', type: 'bridge', content: 'Mijn vrienden zeggen altijd dat...', score: 85, category: 'Sociaal Bewijs', emoji: '👥' },

  // Benefits
  { id: 'benefit-1', type: 'benefit', content: 'Ik zoek iemand die kan lachen om...', score: 83, category: 'Humor', emoji: '😂' },
  { id: 'benefit-2', type: 'benefit', content: 'Samen kunnen we avonturen beleven zoals...', score: 89, category: 'Avontuur', emoji: '🗺️' },
  { id: 'benefit-3', type: 'benefit', content: 'Ik bied loyaliteit en steun bij...', score: 86, category: 'Betrouwbaar', emoji: '🤝' },

  // CTAs
  { id: 'cta-1', type: 'cta', content: 'Laten we samen ontdekken...', score: 84, category: 'Uitnodigend', emoji: '🤔' },
  { id: 'cta-2', type: 'cta', content: 'Vertel me jouw verhaal over...', score: 88, category: 'Betrokken', emoji: '💬' },
  { id: 'cta-3', type: 'cta', content: 'Wie durft er mee op avontuur?', score: 87, category: 'Speels', emoji: '🎯' },

  // Personality
  { id: 'personality-1', type: 'personality', content: 'Ik ben een ochtendmens die...', score: 81, category: 'Levensstijl', emoji: '🌅' },
  { id: 'personality-2', type: 'personality', content: 'Mijn passie ligt bij...', score: 90, category: 'Drive', emoji: '❤️' },
  { id: 'personality-3', type: 'personality', content: 'Ik geloof dat het leven leuker wordt met...', score: 85, category: 'Optimistisch', emoji: '✨' },
];

export function InteractiveProfileBuilder({ onComplete, initialProfile = '' }: ProfileBuilderProps) {
  const [selectedElements, setSelectedElements] = useState<ProfileElement[]>([]);
  const [customText, setCustomText] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState('builder');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  // Calculate profile score based on selected elements
  const profileScore = useMemo(() => {
    if (selectedElements.length === 0) return 0;
    const avgScore = selectedElements.reduce((sum, el) => sum + el.score, 0) / selectedElements.length;
    const lengthBonus = Math.min(customText.length / 10, 20); // Bonus for length
    const diversityBonus = new Set(selectedElements.map(el => el.type)).size * 5; // Bonus for variety
    return Math.min(Math.round(avgScore + lengthBonus + diversityBonus), 100);
  }, [selectedElements, customText]);

  // Generate final profile text
  const finalProfile = useMemo(() => {
    const elementTexts = selectedElements.map(el => el.content);
    return elementTexts.length > 0 ? elementTexts.join(' ') : customText;
  }, [selectedElements, customText]);

  const addElement = useCallback((element: ProfileElement) => {
    setSelectedElements(prev => [...prev, { ...element }]);
  }, []);

  const removeElement = useCallback((elementId: string) => {
    setSelectedElements(prev => prev.filter(el => el.id !== elementId));
  }, []);

  const moveElement = useCallback((fromIndex: number, toIndex: number) => {
    setSelectedElements(prev => {
      const newElements = [...prev];
      const [moved] = newElements.splice(fromIndex, 1);
      newElements.splice(toIndex, 0, moved);
      return newElements;
    });
  }, []);

  const analyzeProfile = useCallback(async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        strengths: ['Goede balans tussen humor en diepgang', 'Sterke persoonlijkheid tonen', 'Intrigerende openingszin'],
        improvements: ['Kan specifieker zijn over interesses', 'Meer kwetsbaarheid toevoegen'],
        score: profileScore,
        suggestions: ['Voeg een concrete hobby toe', 'Maak de call-to-action persoonlijker']
      };
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  }, [profileScore]);

  const completeProfile = useCallback(() => {
    onComplete?.(finalProfile, profileScore);
  }, [finalProfile, profileScore, onComplete]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <Trophy className="w-4 h-4" />;
    if (score >= 70) return <Star className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <Card className="bg-gradient-to-r from-purple-50 to-coral-50 border-purple-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Interactive Profile Builder</CardTitle>
                <p className="text-sm text-muted-foreground">Bouw je onweerstaanbare profieltekst</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold flex items-center gap-2 ${getScoreColor(profileScore)}`}>
                {getScoreIcon(profileScore)}
                {profileScore}/100
              </div>
              <Progress value={profileScore} className="w-24 h-2 mt-1" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="elements" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Elementen
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Analyse
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Je Profieltekst
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Elements */}
              {selectedElements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Geselecteerde Elementen:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedElements.map((element, index) => (
                      <Badge
                        key={element.id}
                        variant="secondary"
                        className="cursor-move hover:bg-secondary/80 flex items-center gap-2 pr-1"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                          moveElement(fromIndex, index);
                        }}
                      >
                        <span>{element.emoji}</span>
                        <span className="truncate max-w-32">{element.content.substring(0, 20)}...</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeElement(element.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Text Area */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Of schrijf je eigen tekst:</label>
                <Textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Schrijf hier je profieltekst, of gebruik de elementen hierboven..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              {/* Final Profile Preview */}
              {finalProfile && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Je Profieltekst:</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed">{finalProfile}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elements" className="space-y-4">
          <div className="grid gap-4">
            {['hook', 'bridge', 'benefit', 'cta', 'personality'].map((type) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="text-lg capitalize">{type} Elementen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {SAMPLE_ELEMENTS.filter(el => el.type === type).map((element) => (
                      <div
                        key={element.id}
                        className="p-3 border rounded-lg hover:border-primary cursor-pointer transition-colors"
                        onClick={() => addElement(element)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-lg">{element.emoji}</span>
                          <Badge variant="outline" className="text-xs">
                            {element.score}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{element.content}</p>
                        <Badge variant="secondary" className="text-xs">
                          {element.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Profiel Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md mx-auto">
                {/* Mock Dating App Preview */}
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <h3 className="font-semibold">Jouw Naam</h3>
                      <p className="text-sm text-muted-foreground">26 • Amsterdam</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-3">
                    {finalProfile || 'Je profieltekst verschijnt hier...'}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Heart className="w-4 h-4 mr-1" />
                      Like
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Profile Analyse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!analysis ? (
                <div className="text-center py-8">
                  <Button
                    onClick={analyzeProfile}
                    disabled={isAnalyzing || !finalProfile}
                    className="mb-4"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyseren...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Analyseer Mijn Profiel
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {!finalProfile ? 'Maak eerst een profieltekst om te analyseren' : 'Ontvang professionele feedback op je profiel'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Sterke Punten
                      </h4>
                      <ul className="space-y-1">
                        {analysis.strengths.map((strength: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Verbeteringen
                      </h4>
                      <ul className="space-y-1">
                        {analysis.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <Lightbulb className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Suggesties voor Optimalisatie:</h4>
                    <ul className="space-y-1">
                      {analysis.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <Star className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedElements([])}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <Button
          onClick={completeProfile}
          disabled={!finalProfile}
          className="bg-gradient-to-r from-purple-600 to-coral-600 hover:from-purple-700 hover:to-coral-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Profiel Opslaan ({profileScore} punten)
        </Button>
      </div>
    </div>
  );
}