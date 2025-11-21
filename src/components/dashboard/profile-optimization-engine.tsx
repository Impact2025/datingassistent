'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToolCompletion } from '@/hooks/use-tool-completion';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import {
  Brain,
  Target,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Zap,
  Star,
  Award,
  Lightbulb,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Heart,
  MessageCircle,
  Camera,
  Edit3,
  BarChart3
} from 'lucide-react';

interface ProfileAnalysis {
  overallScore: number;
  sections: {
    bio: SectionAnalysis;
    photos: SectionAnalysis;
    interests: SectionAnalysis;
    prompts: SectionAnalysis;
    demographics: SectionAnalysis;
  };
  optimizationSuggestions: OptimizationSuggestion[];
  competitorAnalysis: CompetitorAnalysis;
  predictedPerformance: PredictedPerformance;
}

interface SectionAnalysis {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface OptimizationSuggestion {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  expectedImpact: number; // percentage improvement
  effort: 'low' | 'medium' | 'high';
  actionableSteps: string[];
}

interface CompetitorAnalysis {
  percentileRank: number;
  topPerformingElements: string[];
  commonWeaknesses: string[];
  marketPosition: string;
}

interface PredictedPerformance {
  currentMatches: number;
  optimizedMatches: number;
  improvement: number;
  confidence: number;
  timeToResults: string;
}

export function ProfileOptimizationEngine() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('ProfileOptimizationEngine error:', error, errorInfo);
      }}
    >
      <ProfileOptimizationEngineInner />
    </ErrorBoundary>
  );
}

function ProfileOptimizationEngineInner() {
  const { user, userProfile } = useUser();
  const { markAsCompleted } = useToolCompletion('profile-optimization');

  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');

  // Profile data state
  const [profileData, setProfileData] = useState({
    bio: userProfile?.bio || '',
    interests: userProfile?.interests?.join(', ') || '',
    age: userProfile?.age?.toString() || '',
    location: userProfile?.location || '',
    occupation: '',
    education: '',
    photos: [] as string[],
    prompts: [] as { question: string; answer: string }[]
  });

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        bio: userProfile.bio || '',
        interests: userProfile.interests?.join(', ') || '',
        age: userProfile.age?.toString() || '',
        location: userProfile.location || '',
        occupation: '',
        education: '',
        photos: [],
        prompts: []
      });
    }
  }, [userProfile]);

  const analyzeProfile = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/profile-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        },
        body: JSON.stringify({
          profileData,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysis(result.analysis);

      // Track completion
      await markAsCompleted('profile_optimized', {
        overallScore: result.analysis.overallScore,
        suggestionsCount: result.analysis.optimizationSuggestions.length
      });

    } catch (error) {
      console.error('Profile optimization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'text-green-600 bg-green-100';
      case 'B+':
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C+':
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D':
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🚀 Advanced Profile Optimization Engine</h1>
        <p className="text-muted-foreground">
          AI-gedreven profiel analyse en optimalisatie voor maximale dating success
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input">Profiel Invoeren</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
          <TabsTrigger value="optimization">Optimalisatie</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Jouw Profiel Gegevens</CardTitle>
              <p className="text-sm text-muted-foreground">
                Voer je huidige profiel informatie in voor een gedetailleerde analyse
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Leeftijd</label>
                  <Input
                    type="number"
                    value={profileData.age}
                    onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="28"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Locatie</label>
                  <Input
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Amsterdam"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Beroep</label>
                  <Input
                    value={profileData.occupation}
                    onChange={(e) => setProfileData(prev => ({ ...prev, occupation: e.target.value }))}
                    placeholder="Software Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Opleiding</label>
                  <Input
                    value={profileData.education}
                    onChange={(e) => setProfileData(prev => ({ ...prev, education: e.target.value }))}
                    placeholder="Universiteit van Amsterdam"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Schrijf hier je dating bio..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Interesses & Hobbies</label>
                <Textarea
                  value={profileData.interests}
                  onChange={(e) => setProfileData(prev => ({ ...prev, interests: e.target.value }))}
                  placeholder="Reizen, koken, fotografie, sport..."
                  rows={3}
                />
              </div>

              <Button
                onClick={analyzeProfile}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyseert profiel...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyseer Mijn Profiel
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {analysis ? (
            <>
              {/* Overall Score */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-full bg-white flex items-center justify-center shadow-lg">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${analysis.overallScore >= 80 ? 'text-green-600' : analysis.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {analysis.overallScore}
                        </div>
                        <div className="text-xs text-muted-foreground">/100</div>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold">Profiel Score</h2>
                    <Progress value={analysis.overallScore} className="max-w-md mx-auto" />
                    <p className="text-muted-foreground">
                      {analysis.overallScore >= 85 ? 'Excellent profiel!' :
                       analysis.overallScore >= 70 ? 'Goed profiel met ruimte voor verbetering' :
                       analysis.overallScore >= 50 ? 'Gemiddeld profiel - optimalisatie nodig' :
                       'Profiel heeft significante verbetering nodig'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Section Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysis.sections).map(([key, section]) => (
                  <Card key={key}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg capitalize">{key}</CardTitle>
                        <Badge className={getGradeColor(section.grade)}>
                          {section.grade}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-center">{section.score}/100</div>
                      <Progress value={section.score} className="h-2" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-green-600 mb-1">💪 Sterke punten</h4>
                        <ul className="text-xs space-y-1">
                          {section.strengths.slice(0, 2).map((strength, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-red-600 mb-1">⚠️ Verbeterpunten</h4>
                        <ul className="text-xs space-y-1">
                          {section.weaknesses.slice(0, 2).map((weakness, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Predicted Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Verwachte Prestaties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysis.predictedPerformance.currentMatches}
                      </div>
                      <p className="text-sm text-muted-foreground">Huidige matches/week</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analysis.predictedPerformance.optimizedMatches}
                      </div>
                      <p className="text-sm text-muted-foreground">Na optimalisatie</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        +{analysis.predictedPerformance.improvement}%
                      </div>
                      <p className="text-sm text-muted-foreground">Verbetering</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Verwachte tijd tot resultaten:</strong> {analysis.predictedPerformance.timeToResults}
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      Betrouwbaarheid: {analysis.predictedPerformance.confidence}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Start de analyse</h3>
                <p className="text-muted-foreground mb-4">
                  Voer je profiel gegevens in en klik op "Analyseer Mijn Profiel"
                </p>
                <Button onClick={() => setActiveTab('input')}>
                  Naar profiel invoer
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {analysis ? (
            <>
              {/* Competitor Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Markt Positie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-purple-600">
                      #{analysis.competitorAnalysis.percentileRank}
                    </div>
                    <p className="text-lg">Percentiel ranking</p>
                    <p className="text-muted-foreground">
                      {analysis.competitorAnalysis.marketPosition}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Suggestions */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">🎯 Optimalisatie Suggesties</h3>
                {analysis.optimizationSuggestions
                  .sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                  })
                  .map((suggestion, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getPriorityColor(suggestion.priority)}>
                              {suggestion.priority === 'high' ? 'Hoog' :
                               suggestion.priority === 'medium' ? 'Gemiddeld' : 'Laag'}
                            </Badge>
                            <Badge variant="outline" className={getEffortColor(suggestion.effort)}>
                              {suggestion.effort === 'low' ? 'Makkelijk' :
                               suggestion.effort === 'medium' ? 'Gemiddeld' : 'Moeilijk'}
                            </Badge>
                            <span className="text-sm text-green-600 font-semibold">
                              +{suggestion.expectedImpact}% impact
                            </span>
                          </div>
                          <h4 className="font-semibold mb-1">{suggestion.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                          <div>
                            <h5 className="text-sm font-semibold mb-2">Actiepunten:</h5>
                            <ul className="text-sm space-y-1">
                              {suggestion.actionableSteps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start gap-2">
                                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                                    {stepIndex + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Rapport
                </Button>
                <Button className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Start Optimalisatie
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Optimalisatie beschikbaar na analyse</h3>
                <p className="text-muted-foreground mb-4">
                  Voer eerst een profiel analyse uit om gepersonaliseerde optimalisatie suggesties te krijgen
                </p>
                <Button onClick={() => setActiveTab('input')}>
                  Start analyse
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}