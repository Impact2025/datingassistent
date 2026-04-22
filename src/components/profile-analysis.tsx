'use client';

import { useState } from 'react';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  MessageCircle,
  Star,
  Award,
  BarChart3,
} from 'lucide-react';

interface ProfileAnalysisProps {
  onAnalysisComplete?: (results: any) => void;
}

const DATING_APPS = [
  { id: 'tinder', name: 'Tinder', color: 'bg-red-500', description: 'Swipe-based, bio max 500 tekens' },
  { id: 'hinge', name: 'Hinge', color: 'bg-purple-600', description: 'Prompts & foto-comments, diepgaander' },
  { id: 'bumble', name: 'Bumble', color: 'bg-yellow-500', description: 'Vrouwen beginnen, bio max 300 tekens' },
  { id: 'lexa', name: 'Lexa', color: 'bg-pink-500', description: 'Nederlandstalig, serieuze relaties' },
  { id: 'relatieplanet', name: 'Relatieplanet', color: 'bg-blue-600', description: 'Uitgebreid profiel, serieus' },
  { id: 'other', name: 'Anders', color: 'bg-gray-500', description: 'Andere app of algemeen advies' },
];

const HINGE_PROMPTS = [
  'Mijn leven eist dat jij...',
  'De manier waarop mijn vrienden mij omschrijven...',
  'Twee waarheden en een leugen...',
  'Mijn perfecte zondag...',
  'De sleutel tot mijn hart is...',
  'Ik ga altijd praten over...',
  'Mijn meest controversiële mening...',
];

interface AnalysisResult {
  overallScore: number;
  sections: {
    bio: SectionResult;
    interests: SectionResult;
    prompts: SectionResult;
    demographics: SectionResult;
    photos: SectionResult;
  };
  bioRewrite: {
    original: string;
    rewritten: string;
    explanation: string;
  };
  openingLines: string[];
  optimizationSuggestions: Array<{
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedImpact: number;
    actionableSteps: string[];
  }>;
  competitorAnalysis: {
    percentileRank: number;
    marketPosition: string;
  };
  predictedPerformance: {
    currentMatches: number;
    optimizedMatches: number;
    improvement: number;
  };
  appSpecificTips: string[];
}

interface SectionResult {
  score: number;
  grade: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export function ProfileAnalysis({ onAnalysisComplete }: ProfileAnalysisProps) {
  const { user, userProfile } = useUser();
  const [step, setStep] = useState<'app' | 'input' | 'analyzing' | 'results'>('app');
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [age, setAge] = useState(userProfile?.age?.toString() || '');
  const [interests, setInterests] = useState(userProfile?.interests?.join(', ') || '');
  const [prompts, setPrompts] = useState<{ question: string; answer: string }[]>([{ question: '', answer: '' }]);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedRewrite, setCopiedRewrite] = useState(false);

  const selectedAppData = DATING_APPS.find(a => a.id === selectedApp);
  const isHinge = selectedApp === 'hinge';

  const handleAnalyze = async () => {
    setStep('analyzing');
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/profile-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          profileData: {
            bio,
            age,
            interests,
            app: selectedApp,
            prompts: isHinge ? prompts.filter(p => p.answer.trim()) : [],
            photos: [],
            location: userProfile?.location || '',
            occupation: '',
            education: '',
          }
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Analyse mislukt');
      }

      const data = await response.json();
      setResults(data.analysis);
      setStep('results');
      onAnalysisComplete?.(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis. Probeer opnieuw.');
      setStep('input');
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyRewrite = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRewrite(true);
    setTimeout(() => setCopiedRewrite(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-700';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-700';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-700 border-red-200';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getPriorityLabel = (priority: string) => {
    if (priority === 'high') return 'Hoge prioriteit';
    if (priority === 'medium') return 'Gemiddeld';
    return 'Laag';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <AnimatePresence mode="wait">

        {/* Step 1: App Selector */}
        {step === 'app' && (
          <motion.div
            key="app"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Op welke app ben je actief?</h2>
              <p className="text-gray-600">We geven advies op maat per platform</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DATING_APPS.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    selectedApp === app.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <div className={cn("w-3 h-3 rounded-full mb-2", app.color)} />
                  <div className="font-semibold text-gray-900 text-sm">{app.name}</div>
                  <div className="text-xs text-gray-500 mt-1 leading-tight">{app.description}</div>
                </button>
              ))}
            </div>

            <Button
              onClick={() => setStep('input')}
              disabled={!selectedApp}
              className="w-full bg-coral-500 hover:bg-coral-600"
              size="lg"
            >
              Verder
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Step 2: Profile Input */}
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('app')}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Jouw {selectedAppData?.name} profiel</h2>
                <p className="text-sm text-gray-600">Vul in wat je nu hebt — ook al is het niet perfect</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jouw bio / omschrijving
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={`Plak hier je huidige ${selectedAppData?.name} bio. Heb je nog geen bio? Schrijf dan een eerste versie — hoe meer je invult, hoe beter ons advies.`}
                rows={5}
                className="resize-none"
              />
              <div className="text-xs text-gray-400 mt-1 text-right">{bio.length} tekens</div>
            </div>

            {/* Hinge Prompts */}
            {isHinge && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Hinge prompts (optioneel maar aanbevolen)
                </label>
                {prompts.map((prompt, index) => (
                  <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg space-y-2">
                    <select
                      value={prompt.question}
                      onChange={(e) => {
                        const updated = [...prompts];
                        updated[index].question = e.target.value;
                        setPrompts(updated);
                      }}
                      className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 bg-white"
                    >
                      <option value="">Kies een prompt...</option>
                      {HINGE_PROMPTS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <Textarea
                      value={prompt.answer}
                      onChange={(e) => {
                        const updated = [...prompts];
                        updated[index].answer = e.target.value;
                        setPrompts(updated);
                      }}
                      placeholder="Jouw antwoord..."
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>
                ))}
                {prompts.length < 3 && (
                  <button
                    onClick={() => setPrompts([...prompts, { question: '', answer: '' }])}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    + Prompt toevoegen
                  </button>
                )}
              </div>
            )}

            {/* Age + Interests */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Leeftijd</label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="28"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Interesses (optioneel)</label>
                <Input
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="sporten, reizen, koken..."
                />
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!bio.trim()}
              className="w-full bg-coral-500 hover:bg-coral-600"
              size="lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Analyseer mijn profiel
            </Button>
          </motion.div>
        )}

        {/* Analyzing */}
        {step === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 space-y-6"
          >
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Profiel wordt geanalyseerd...</h3>
              <p className="text-gray-600 text-sm">AI bekijkt je bio, schrijft een verbeterde versie en geeft {selectedAppData?.name}-specifiek advies</p>
            </div>
            <div className="flex justify-center gap-2">
              {['Bio analyseren', 'Rewrite genereren', 'Tips samenstellen'].map((label, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                  className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
                >
                  {label}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {step === 'results' && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header met score */}
            <Card className="bg-coral-500 hover:bg-coral-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm mb-1">{selectedAppData?.name} profiel score</p>
                    <div className="text-6xl font-bold">{results.overallScore}</div>
                    <div className="text-purple-200 text-sm">/100</div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="bg-white/20 rounded-lg px-3 py-2">
                      <div className="text-xs text-purple-200">Nu</div>
                      <div className="font-bold">~{results.predictedPerformance?.currentMatches || '?'} matches/week</div>
                    </div>
                    <div className="bg-white/20 rounded-lg px-3 py-2">
                      <div className="text-xs text-purple-200">Na optimalisatie</div>
                      <div className="font-bold text-yellow-300">~{results.predictedPerformance?.optimizedMatches || '?'} matches/week</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-purple-200 mb-1">
                    <span>Profiel sterkte</span>
                    <span>Top {100 - (results.competitorAnalysis?.percentileRank || 50)}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full">
                    <div
                      className="h-2 bg-white rounded-full transition-all"
                      style={{ width: `${results.overallScore}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio Rewrite — het meest waardevolle onderdeel */}
            {results.bioRewrite && (
              <Card className="border-2 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Zap className="w-5 h-5" />
                    AI Bio Rewrite
                  </CardTitle>
                  <p className="text-sm text-gray-600">{results.bioRewrite.explanation}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <div className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Jouw huidige bio
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{results.bioRewrite.original || bio}</p>
                  </div>

                  <div className="flex justify-center">
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <div className="text-xs font-semibold text-green-600 mb-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verbeterde versie
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{results.bioRewrite.rewritten}</p>
                    <button
                      onClick={() => copyRewrite(results.bioRewrite.rewritten)}
                      className="mt-3 text-xs flex items-center gap-1 text-green-700 hover:text-green-800 font-medium"
                    >
                      {copiedRewrite ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedRewrite ? 'Gekopieerd!' : 'Kopieer tekst'}
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Openingszinnen */}
            {results.openingLines && results.openingLines.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    Openingszinnen die werken voor dit profiel
                  </CardTitle>
                  <p className="text-sm text-gray-600">Gebruik deze als iemand jou swipt — kopieer en pas aan</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {results.openingLines.map((line, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <p className="text-sm text-gray-800 flex-1">{line}</p>
                      <button
                        onClick={() => copyToClipboard(line, index)}
                        className="flex-shrink-0 text-blue-600 hover:text-blue-700"
                      >
                        {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* App-specifieke tips */}
            {results.appSpecificTips && results.appSpecificTips.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Star className="w-5 h-5 text-yellow-500" />
                    {selectedAppData?.name}-specifieke tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.appSpecificTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Prioriteiten */}
            {results.optimizationSuggestions && results.optimizationSuggestions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Target className="w-5 h-5 text-purple-600" />
                    Wat moet je als eerste aanpakken
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.optimizationSuggestions.slice(0, 4).map((sug, index) => (
                    <div key={index} className={cn("border rounded-lg p-4", getPriorityColor(sug.priority))}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="font-semibold text-sm">{sug.title}</div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge variant="outline" className="text-xs">
                            +{sug.expectedImpact}% impact
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm opacity-80 mb-3">{sug.description}</p>
                      {sug.actionableSteps && sug.actionableSteps.length > 0 && (
                        <ul className="space-y-1">
                          {sug.actionableSteps.map((step, i) => (
                            <li key={i} className="text-xs flex items-start gap-1.5 opacity-90">
                              <span className="font-bold mt-0.5">{i + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Categorie scores */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  Scores per onderdeel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(results.sections).map(([key, section]) => {
                  const labels: Record<string, string> = {
                    bio: 'Bio',
                    interests: 'Interesses',
                    prompts: 'Prompts',
                    demographics: 'Profiel info',
                    photos: "Foto's (geschat)"
                  };
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700">{labels[key] || key}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-xs", getGradeColor(section.grade))}>
                            {section.grade}
                          </Badge>
                          <span className={cn("text-sm font-bold", getScoreColor(section.score))}>
                            {section.score}/100
                          </span>
                        </div>
                      </div>
                      <Progress value={section.score} className="h-1.5" />
                      {section.recommendations && section.recommendations[0] && (
                        <p className="text-xs text-gray-500 mt-1">{section.recommendations[0]}</p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Opnieuw */}
            <div className="flex gap-3">
              <Button
                onClick={() => { setStep('input'); setResults(null); }}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Nieuwe analyse
              </Button>
              <Button
                onClick={() => { setStep('app'); setResults(null); setBio(''); setInterests(''); setAge(''); }}
                variant="outline"
                className="flex-1"
              >
                Andere app testen
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
