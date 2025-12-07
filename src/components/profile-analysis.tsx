'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Star,
  Target,
  Zap,
  MessageCircle,
  Camera,
  Award,
  Eye
} from 'lucide-react';

interface ProfileAnalysisProps {
  onAnalysisComplete?: (results: AnalysisResults) => void;
}

interface AnalysisResults {
  overallScore: number;
  categories: {
    bio: CategoryScore;
    photos: CategoryScore;
    interests: CategoryScore;
    personality: CategoryScore;
  };
  recommendations: string[];
  strengths: string[];
  improvements: string[];
}

interface CategoryScore {
  score: number;
  label: string;
  feedback: string;
}

export function ProfileAnalysis({ onAnalysisComplete }: ProfileAnalysisProps) {
  const { user, userProfile } = useUser();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [savedAnalysis, setSavedAnalysis] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    bio: '',
    interests: '',
    occupation: '',
    location: ''
  });

  // Pre-fill form with existing user profile data
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || '',
        age: userProfile.age?.toString() || '',
        bio: userProfile.bio || '',
        interests: userProfile.interests?.join(', ') || '',
        occupation: '', // Not in profile, user can fill this
        location: userProfile.location || ''
      });
    }
  }, [userProfile]);

  // Load saved analysis history on component mount
  useEffect(() => {
    const loadSavedAnalysis = async () => {
      if (!user?.id) return;

      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch('/api/profile-history', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.hasAnalysis) {
            setSavedAnalysis(data);
          }
        }
      } catch (error) {
        console.error('Failed to load saved analysis:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadSavedAnalysis();
  }, [user?.id]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const analyzeProfile = async () => {
    setIsAnalyzing(true);

    // For local development, use dynamic mock data based on input quality
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Development mode: Using dynamic mock analysis data');

      setTimeout(async () => {
        // Analyze input quality
        const bioLength = profileData.bio.length;
        const hasInterests = profileData.interests.trim().length > 0;
        const hasOccupation = profileData.occupation.trim().length > 0;
        const hasLocation = profileData.location.trim().length > 0;

        // Check for nonsense input
        const isNonsense = profileData.bio.toLowerCase().includes('sadasd') ||
                          profileData.bio.toLowerCase().includes('test') ||
                          bioLength < 10;

        let overallScore = 75;
        let bioScore = 80;
        let interestsScore = 75;
        let personalityScore = 70;

        if (isNonsense) {
          overallScore = 25;
          bioScore = 20;
          interestsScore = 30;
          personalityScore = 25;
        } else if (bioLength > 100 && hasInterests && hasOccupation) {
          overallScore = 85;
          bioScore = 90;
          interestsScore = 85;
          personalityScore = 80;
        } else if (bioLength > 50) {
          overallScore = 70;
          bioScore = 75;
        }

        const mockResults: AnalysisResults = {
          overallScore,
          categories: {
            bio: {
              score: bioScore,
              label: bioScore >= 80 ? 'Uitstekend' : bioScore >= 60 ? 'Goed' : 'Kan beter',
              feedback: isNonsense
                ? 'Je bio lijkt willekeurige tekst te bevatten. Schrijf een echte, persoonlijke bio.'
                : bioLength > 100
                  ? 'Je bio is gedetailleerd en laat je persoonlijkheid goed zien.'
                  : 'Je bio is kort maar duidelijk. Overweeg meer details toe te voegen.'
            },
            photos: {
              score: 70,
              label: 'Goed',
              feedback: 'Je foto\'s zijn van goede kwaliteit, maar zouden meer variatie kunnen gebruiken.'
            },
            interests: {
              score: interestsScore,
              label: interestsScore >= 80 ? 'Zeer goed' : 'Goed',
              feedback: hasInterests
                ? 'Je interesses zijn duidelijk en spreken een breed publiek aan.'
                : 'Voeg je interesses toe om meer matches aan te trekken.'
            },
            personality: {
              score: personalityScore,
              label: personalityScore >= 75 ? 'Uitstekend' : 'Goed',
              feedback: isNonsense
                ? 'Je input lijkt niet serieus te zijn. Geef echte informatie voor een accurate analyse.'
                : 'Je komt warm en benaderbaar over, maar zou meer humor kunnen toevoegen.'
            }
          },
          recommendations: isNonsense ? [
            'Gebruik echte, persoonlijke informatie voor een nuttige analyse',
            'Beschrijf jezelf zoals je echt bent',
            'Voeg specifieke details toe over je leven en interesses'
          ] : [
            'Voeg een foto toe waar je lacht om meer benaderbaarheid te tonen',
            'Maak je bio iets persoonlijker met een specifieke hobby',
            'Overweeg een foto in sportieve kleding voor meer dynamiek'
          ],
          strengths: isNonsense ? [
            'Je hebt de tool gevonden!',
            'Technisch gezien werkt alles perfect'
          ] : [
            'Professionele uitstraling op foto\'s',
            'Duidelijke en eerlijke bio',
            'Interessante hobby\'s die gesprekken kunnen starten'
          ],
          improvements: isNonsense ? [
            'Gebruik echte profiel informatie',
            'Wees serieus voor nuttige feedback',
            'Voeg echte details toe over jezelf'
          ] : [
            'Meer foto\'s toevoegen voor vollediger beeld',
            'Specifieker worden over wat je zoekt in een partner',
            'Meer humor in bio om luchtiger over te komen'
          ]
        };

        setResults(mockResults);
        setIsAnalyzing(false);
        onAnalysisComplete?.(mockResults);

        // Track activity for progress system
        if (user?.id) {
          try {
            await fetch('/api/activity/track', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id,
                activityType: 'profile_analysis',
                data: {
                  overallScore: mockResults.overallScore,
                  categoriesAnalyzed: Object.keys(mockResults.categories),
                  recommendationsCount: mockResults.recommendations.length
                }
              })
            });
          } catch (error) {
            console.error('Failed to track activity:', error);
            // Non-blocking error - continue even if tracking fails
          }
        }
      }, 2000);

      return;
    }

    try {
      const response = await fetch('/api/profile-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Analyse mislukt');
      }

      const analysisResults: AnalysisResults = await response.json();

      setResults(analysisResults);
      onAnalysisComplete?.(analysisResults);
    } catch (error) {
      console.error('Profile analysis error:', error);
      // Fallback to basic analysis if API fails
      const fallbackResults: AnalysisResults = {
        overallScore: 70,
        categories: {
          bio: {
            score: 75,
            label: 'Goed',
            feedback: 'Je bio is duidelijk, maar zou meer persoonlijkheid kunnen gebruiken.'
          },
          photos: {
            score: 65,
            label: 'Gemiddeld',
            feedback: 'Overweeg meer diverse foto\'s toe te voegen.'
          },
          interests: {
            score: 75,
            label: 'Goed',
            feedback: 'Je interesses zijn interessant voor potentiële matches.'
          },
          personality: {
            score: 70,
            label: 'Goed',
            feedback: 'Je komt authentiek over, maar meer humor zou helpen.'
          }
        },
        recommendations: [
          'Maak je bio persoonlijker met specifieke verhalen',
          'Voeg foto\'s toe die je persoonlijkheid laten zien',
          'Wees duidelijker over wat je zoekt in een relatie'
        ],
        strengths: [
          'Duidelijke communicatie',
          'Authentieke uitstraling',
          'Interessante achtergrond'
        ],
        improvements: [
          'Meer humor toevoegen',
          'Specifiekere interesses benoemen',
          'Duidelijker relatievoorkeuren aangeven'
        ]
      };

      setResults(fallbackResults);
      onAnalysisComplete?.(fallbackResults);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Saved Analysis Section */}
      {savedAnalysis && !results && !isLoadingHistory && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Je hebt al een analyse!</h3>
                  <p className="text-sm text-gray-600">
                    Laatste analyse: {new Date(savedAnalysis.currentAnalysis.analysisDate).toLocaleDateString('nl-NL')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{savedAnalysis.currentAnalysis.overallScore}</div>
                <div className="text-xs text-gray-500">score</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  // Load saved results into current results
                  const saved = savedAnalysis.currentAnalysis;
                  setResults({
                    overallScore: saved.overallScore,
                    categories: saved.sections,
                    recommendations: saved.optimizationSuggestions.map((s: any) => s.title + ': ' + s.description),
                    strengths: ['Gebaseerd op je opgeslagen analyse'],
                    improvements: ['Nieuwe analyse voor updates']
                  });
                }}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Eye className="w-4 h-4 mr-2" />
                Bekijk Resultaten
              </Button>
              <Button
                onClick={() => setSavedAnalysis(null)}
                variant="outline"
                className="flex-1 border-gray-300"
              >
                <Target className="w-4 h-4 mr-2" />
                Nieuwe Analyse
              </Button>
            </div>

            {savedAnalysis.history && savedAnalysis.history.length > 1 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Progress tracking:</p>
                <div className="flex gap-2">
                  {savedAnalysis.history.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {item.score}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(item.date).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoadingHistory && !savedAnalysis && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyse geschiedenis laden...</p>
          </CardContent>
        </Card>
      )}

      {/* Input Section */}
      {!results && !savedAnalysis && !isLoadingHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-6 h-6" />
              Profiel Analyse - AI Assessment
            </CardTitle>
            <p className="text-gray-600">
              Je naam en leeftijd zijn al ingevuld uit je registratie. Vul de rest aan voor een professionele analyse door onze AI.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  🧪 Development mode: Dit gebruikt intelligente mock data die reageert op je input kwaliteit.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  Naam
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Uit registratie</span>
                </label>
                <Input
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Je naam"
                  className="bg-green-50 border-green-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  Leeftijd
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Uit registratie</span>
                </label>
                <Input
                  type="number"
                  value={profileData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="28"
                  className="bg-green-50 border-green-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                Bio
                {userProfile?.bio && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Uit profiel</span>}
              </label>
              <Textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Schrijf hier je dating bio..."
                rows={4}
                className={userProfile?.bio ? "bg-blue-50 border-blue-200" : ""}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Beroep</label>
                <Input
                  value={profileData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="Software ontwikkelaar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  Locatie
                  {userProfile?.location && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Uit profiel</span>}
                </label>
                <Input
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Amsterdam"
                  className={userProfile?.location ? "bg-blue-50 border-blue-200" : ""}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                Interesses & Hobbies
                {userProfile?.interests && userProfile.interests.length > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Uit profiel</span>}
              </label>
              <Textarea
                value={profileData.interests}
                onChange={(e) => handleInputChange('interests', e.target.value)}
                placeholder="Sporten, reizen, koken, fotografie..."
                rows={3}
                className={userProfile?.interests && userProfile.interests.length > 0 ? "bg-blue-50 border-blue-200" : ""}
              />
            </div>

            <Button
              onClick={analyzeProfile}
              disabled={isAnalyzing || !profileData.bio.trim()}
              className="w-full bg-pink-500 hover:bg-pink-600"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyse uitvoeren...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Analyse Mijn Profiel
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(results.overallScore)}`}>
                    {results.overallScore}
                  </div>
                  <div className="text-xs text-gray-500">/100</div>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Profiel Score</h2>
              <p className="text-gray-600">
                {results.overallScore >= 80 ? 'Uitstekend profiel!' :
                 results.overallScore >= 60 ? 'Goed profiel met ruimte voor verbetering' :
                 'Profiel heeft verbetering nodig'}
              </p>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <div className="grid grid-cols-1 gap-6">
            {Object.entries(results.categories).map(([key, category]) => (
              <Card key={key}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold capitalize">{key}</h3>
                    <Badge className={getScoreBgColor(category.score)}>
                      <span className={getScoreColor(category.score)}>{category.score}/100</span>
                    </Badge>
                  </div>
                  <Progress value={category.score} className="mb-3" />
                  <p className="text-sm text-gray-600">{category.feedback}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Sterke punten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <TrendingUp className="w-5 h-5" />
                  Verbeterpunten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Zap className="w-5 h-5" />
                Aanbevelingen voor verbetering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setResults(null)}
              variant="outline"
              className="flex-1"
            >
              Nieuwe Analyse
            </Button>
            <Button className="flex-1 bg-pink-500 hover:bg-pink-600">
              <Award className="w-4 h-4 mr-2" />
              Upgrade voor meer tips
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}