"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/providers/user-provider';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Target,
  Sparkles,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

interface SkillArea {
  id: string;
  title: string;
  description: string;
  icon: any;
  currentScore: number;
  previousScore?: number;
  goals: string[];
}

const PROFILE_SKILLS: Omit<SkillArea, 'currentScore' | 'previousScore' | 'goals'>[] = [
  {
    id: 'self-awareness',
    title: 'Zelfkennis & Authenticiteit',
    description: 'Hoe goed ken je jezelf en kun je dit authentiek overbrengen?',
    icon: Users,
  },
  {
    id: 'target-audience',
    title: 'Doelgroep Begrip',
    description: 'Hoe goed begrijp je wat jouw ideale match zoekt?',
    icon: Target,
  },
  {
    id: 'structure-mastery',
    title: 'Structuur & Opbouw',
    description: 'Hoe vaardig ben je in het opbouwen van een aantrekkelijke tekst?',
    icon: FileText,
  },
  {
    id: 'creativity-originality',
    title: 'Creativiteit & Originaliteit',
    description: 'Hoe goed vermijd je clichés en creëer je unieke content?',
    icon: Sparkles,
  },
  {
    id: 'ai-optimization',
    title: 'AI & Optimalisatie',
    description: 'Hoe effectief gebruik je tools voor tekstverbetering?',
    icon: Lightbulb,
  },
];

export function ProfileTextSkillsAssessment() {
  const { user } = useUser();
  const { toast } = useToast();
  const [areas, setAreas] = useState<SkillArea[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [improvementGoals, setImprovementGoals] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, [user?.id]);

  const loadProgressData = async () => {
    if (!user?.id) return;

    try {
      const storageKey = `profile_skills_assessment_${user.id}`;
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setAreas(parsedData.areas || []);
        setImprovementGoals(parsedData.improvementGoals || '');
        setLastUpdated(parsedData.lastUpdated || null);
      } else {
        // Initialize with default values
        const initialAreas = PROFILE_SKILLS.map(area => ({
          ...area,
          currentScore: 5,
          goals: []
        }));
        setAreas(initialAreas);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgressData = async () => {
    if (!user?.id) return;

    try {
      const storageKey = `profile_skills_assessment_${user.id}`;
      const dataToSave = {
        areas,
        improvementGoals,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      setLastUpdated(dataToSave.lastUpdated);

      toast({
        title: 'Voortgang opgeslagen',
        description: 'Je profieltekst vaardigheden zijn bijgewerkt.',
      });
    } catch (error) {
      console.error('Error saving progress data:', error);
      toast({
        title: 'Opslaan mislukt',
        description: 'Er ging iets mis bij het opslaan.',
        variant: 'destructive',
      });
    }
  };

  const updateAreaScore = (areaId: string, score: number) => {
    setAreas(prevAreas =>
      prevAreas.map(area =>
        area.id === areaId
          ? { ...area, currentScore: score }
          : area
      )
    );
  };

  const updateAreaGoals = (areaId: string, goals: string[]) => {
    setAreas(prevAreas =>
      prevAreas.map(area =>
        area.id === areaId
          ? { ...area, goals }
          : area
      )
    );
  };

  useEffect(() => {
    const avgScore = areas.length > 0
      ? Math.round(areas.reduce((sum, area) => sum + area.currentScore, 0) / areas.length)
      : 0;
    setOverallScore(avgScore);
  }, [areas]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Uitstekend';
    if (score >= 6) return 'Goed';
    if (score >= 4) return 'Gemiddeld';
    return 'Ontwikkeling nodig';
  };

  const getImprovementSuggestions = (area: SkillArea) => {
    const suggestions: Record<string, string[]> = {
      'self-awareness': [
        'Vul de zelfkennis workbook volledig in',
        'Schrijf dagelijks 3 woorden die jou beschrijven',
        'Deel je profieltekst met 3 vertrouwde vrienden voor feedback'
      ],
      'target-audience': [
        'Analyseer 10 profielen van mensen die je aanspreken',
        'Gebruik de relatie landscape tool',
        'Stel jezelf de vraag: "Wat zou mijn ideale match willen lezen?"'
      ],
      'structure-mastery': [
        'Oefen de 4-delige structuur op 5 verschillende concepten',
        'Tijd jezelf: schrijf een hook in 30 seconden',
        'Analyseer succesvolle bio\'s op structuur'
      ],
      'creativity-originality': [
        'Vermijd de top 10 dating clichés',
        'Gebruik specifieke details in plaats van algemene uitspraken',
        'Schrijf 10 verschillende versies van dezelfde eigenschap'
      ],
      'ai-optimization': [
        'Experimenteer met alle 4 beschikbare tonen',
        'Gebruik de AI Bio Generator voor minimaal 5 varianten',
        'Test A/B versies van je profieltekst'
      ]
    };

    return suggestions[area.id] || [];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-2 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="text-primary" />
            Jouw Profieltekst Vaardigheden Assessment
          </CardTitle>
          <p className="text-muted-foreground">
            Beoordeel je sterke punten en ontwikkelgebieden in het schrijven van profielteksten.
            {lastUpdated && (
              <span className="block text-sm mt-1">
                Laatst bijgewerkt: {new Date(lastUpdated).toLocaleDateString('nl-NL')}
              </span>
            )}
          </p>
        </CardHeader>
        <CardContent>
          {/* Overall Score */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-primary mb-2">
              {overallScore}/10
            </div>
            <Badge variant="outline" className={getScoreColor(overallScore)}>
              {getScoreLabel(overallScore)}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Gemiddelde score over alle vaardigheden
            </p>
          </div>

          {/* Skills Assessment */}
          <div className="space-y-6">
            {areas.map((area) => {
              const IconComponent = area.icon;
              const improvement = area.previousScore ? area.currentScore - area.previousScore : 0;

              return (
                <Card key={area.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>

                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold">{area.title}</h3>
                          <p className="text-sm text-muted-foreground">{area.description}</p>
                        </div>

                        {/* Score Slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">Huidige vaardigheid</Label>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${getScoreColor(area.currentScore)}`}>
                                {area.currentScore}/10
                              </span>
                              {improvement !== 0 && (
                                <div className={`flex items-center gap-1 text-xs ${
                                  improvement > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  <TrendingUp className="w-3 h-3" />
                                  {improvement > 0 ? '+' : ''}{improvement}
                                </div>
                              )}
                            </div>
                          </div>
                          <Slider
                            value={[area.currentScore]}
                            onValueChange={(value) => updateAreaScore(area.id, value[0])}
                            max={10}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1 - Beginner niveau</span>
                            <span>10 - Expert niveau</span>
                          </div>
                        </div>

                        {/* Improvement Suggestions */}
                        {area.currentScore < 7 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">
                              Ontwikkeltips:
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {getImprovementSuggestions(area).slice(0, 2).map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Personal Goals */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Persoonlijke doelen voor deze vaardigheid:</Label>
                          <Textarea
                            placeholder="Wat wil je verbeteren? Bijv: 'Elke week een nieuwe bio schrijven' of 'AI tools beter leren gebruiken'"
                            value={area.goals.join('\n')}
                            onChange={(e) => updateAreaGoals(area.id, e.target.value.split('\n').filter(g => g.trim()))}
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Overall Goals */}
          <div className="mt-6 space-y-3">
            <Label className="text-sm font-medium">Algemene ontwikkeldoelen:</Label>
            <Textarea
              placeholder="Wat zijn je belangrijkste doelen voor profieltekst schrijven? Bijv: 'Een bio schrijven die 5x meer matches oplevert' of 'Comfortabeler worden met AI tools'"
              value={improvementGoals}
              onChange={(e) => setImprovementGoals(e.target.value)}
              rows={3}
            />
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-center">
            <Button onClick={saveProgressData} className="px-8">
              <Award className="w-4 h-4 mr-2" />
              Assessment Opslaan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-1">Tips voor profieltekst mastery</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Oefen regelmatig met de AI Bio Generator</li>
                <li>• Analyseer succesvolle profielen voor inspiratie</li>
                <li>• Focus op authenticiteit boven perfectie</li>
                <li>• Test verschillende versies en meet resultaten</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}