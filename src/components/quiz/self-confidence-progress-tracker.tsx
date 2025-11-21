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
  Heart,
  MessageCircle,
  Camera,
  Calendar,
  Star,
  TrendingUp,
  Target,
  Award,
  CheckCircle
} from 'lucide-react';

interface ConfidenceArea {
  id: string;
  title: string;
  description: string;
  icon: any;
  currentScore: number;
  previousScore?: number;
  goals: string[];
}

const CONFIDENCE_AREAS: Omit<ConfidenceArea, 'currentScore' | 'previousScore' | 'goals'>[] = [
  {
    id: 'approach-confidence',
    title: 'Benaderen & Initiëren',
    description: 'Hoe zeker voel je je bij het starten van gesprekken en het nemen van initiatief?',
    icon: MessageCircle,
  },
  {
    id: 'appearance-confidence',
    title: 'Uiterlijk & Presentatie',
    description: 'Hoe comfortabel ben je met je foto\'s, kleding en algemene presentatie?',
    icon: Camera,
  },
  {
    id: 'conversation-confidence',
    title: 'Gespreksvaardigheden',
    description: 'Hoe goed kun je gesprekken voeren en connecties maken?',
    icon: Heart,
  },
  {
    id: 'date-confidence',
    title: 'Date Situaties',
    description: 'Hoe zeker ben je tijdens dates en sociale ontmoetingen?',
    icon: Calendar,
  },
  {
    id: 'rejection-confidence',
    title: 'Afwijzing Verwerken',
    description: 'Hoe goed ga je om met afwijzing en teleurstellingen?',
    icon: Star,
  },
];

export function SelfConfidenceProgressTracker() {
  const { user } = useUser();
  const { toast } = useToast();
  const [areas, setAreas] = useState<ConfidenceArea[]>([]);
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
      const storageKey = `self_confidence_tracker_${user.id}`;
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setAreas(parsedData.areas || []);
        setImprovementGoals(parsedData.improvementGoals || '');
        setLastUpdated(parsedData.lastUpdated || null);
      } else {
        // Initialize with default values
        const initialAreas = CONFIDENCE_AREAS.map(area => ({
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
      const storageKey = `self_confidence_tracker_${user.id}`;
      const dataToSave = {
        areas,
        improvementGoals,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      setLastUpdated(dataToSave.lastUpdated);

      toast({
        title: 'Voortgang opgeslagen',
        description: 'Je zelfvertrouwen scores zijn bijgewerkt.',
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
    return 'Verbetering nodig';
  };

  const getImprovementSuggestions = (area: ConfidenceArea) => {
    const suggestions: Record<string, string[]> = {
      'approach-confidence': [
        'Oefen met het starten van gesprekken met vreemden in dagelijkse situaties',
        'Gebruik de IJsbreker Generator voor inspiratie',
        'Stel jezelf ten doel om 3 mensen per dag aan te spreken'
      ],
      'appearance-confidence': [
        'Maak een fotosessie met een vriend(in) als fotograaf',
        'Vraag feedback op je profielfoto\'s via de Foto Analyse tool',
        'Kies kleding waarin je je comfortabel voelt'
      ],
      'conversation-confidence': [
        'Oefen actief luisteren in dagelijkse gesprekken',
        'Gebruik de Conversatie Starter voor nieuwe gespreksonderwerpen',
        'Stel open vragen in plaats van gesloten vragen'
      ],
      'date-confidence': [
        'Plan kleine, low-pressure dates eerst',
        'Bereid gespreksonderwerpen voor via de Date Planner',
        'Focus op het proces in plaats van het resultaat'
      ],
      'rejection-confidence': [
        'Herinner jezelf dat afwijzing niet persoonlijk is',
        'Focus op wat je kunt leren van elke ervaring',
        'Vier kleine successen en positieve interacties'
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
            <Target className="text-primary" />
            Jouw Dating Zelfvertrouwen Tracker
          </CardTitle>
          <p className="text-muted-foreground">
            Meet en volg je vooruitgang in verschillende aspecten van dating zelfvertrouwen.
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
              Gemiddelde score over alle gebieden
            </p>
          </div>

          {/* Progress Areas */}
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
                            <Label className="text-sm font-medium">Huidige score</Label>
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
                            <span>1 - Zeer onzeker</span>
                            <span>10 - Volledig zelfverzekerd</span>
                          </div>
                        </div>

                        {/* Improvement Suggestions */}
                        {area.currentScore < 7 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-yellow-800 mb-2">
                              Verbeteringssuggesties:
                            </h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
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
                          <Label className="text-sm font-medium">Persoonlijke doelen voor dit gebied:</Label>
                          <Textarea
                            placeholder="Wat wil je bereiken op dit gebied? Bijv: 'Elke week 2 mensen aanspreken' of 'Nieuwe outfit kopen voor dates'"
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
            <Label className="text-sm font-medium">Algemene verbeterdoelen:</Label>
            <Textarea
              placeholder="Wat zijn je belangrijkste doelen voor de komende periode? Bijv: 'Meer dates plannen', 'Betere gesprekken voeren', 'Comfortabeler voelen in sociale situaties'"
              value={improvementGoals}
              onChange={(e) => setImprovementGoals(e.target.value)}
              rows={3}
            />
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-center">
            <Button onClick={saveProgressData} className="px-8">
              <Award className="w-4 h-4 mr-2" />
              Voortgang Opslaan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Tips voor zelfvertrouwen</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Focus op kleine dagelijkse successen</li>
                <li>• Vergelijk jezelf niet met anderen</li>
                <li>• Zie afwijzing als data, niet als falen</li>
                <li>• Vier elke stap vooruit, hoe klein ook</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}