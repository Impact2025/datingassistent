"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BioAnalyzer } from "@/components/quiz/bio-analyzer";
import { ClicheTransformer } from "@/components/quiz/cliche-transformer";
import { PersonalityProfileBuilder } from "@/components/quiz/personality-profile-builder";
import { Sparkles, Zap, Trophy, User } from "lucide-react";

export default function TestProfileComponents() {
  const [bioAnalyzerSaves, setBioAnalyzerSaves] = useState(0);
  const [transformerCompleted, setTransformerCompleted] = useState(0);
  const [transformerScore, setTransformerScore] = useState(0);
  const [profilesCompleted, setProfilesCompleted] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-coral-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-100 to-blue-100">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              Profile Text Course - Component Testing
            </CardTitle>
            <CardDescription className="text-lg">
              Interactive Bio Transformation Tools - Ready to Deploy! 🚀
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{bioAnalyzerSaves}</div>
                <div className="text-sm text-muted-foreground">Bio Analyzer Saves</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{transformerCompleted}</div>
                <div className="text-sm text-muted-foreground">Clichés Transformed</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {transformerCompleted > 0 ? Math.round(transformerScore / transformerCompleted) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Tabs */}
        <Tabs defaultValue="analyzer" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="analyzer" className="flex flex-col gap-2 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Bio Analyzer</span>
              </div>
              <Badge variant="secondary" className="text-xs">Real-time analysis</Badge>
            </TabsTrigger>
            <TabsTrigger value="transformer" className="flex flex-col gap-2 py-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span className="font-semibold">Cliché Transformer</span>
              </div>
              <Badge variant="secondary" className="text-xs">10 interactive exercises</Badge>
            </TabsTrigger>
            <TabsTrigger value="personality" className="flex flex-col gap-2 py-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-semibold">Personality Builder</span>
              </div>
              <Badge variant="secondary" className="text-xs">15 questions quiz</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Bio Analyzer - Live Demo
                </CardTitle>
                <CardDescription>
                  Test de real-time bio analysis tool. Analyseert 6 metrics terwijl je typt!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BioAnalyzer
                  onSave={(bio, analysis) => {
                    console.log('Bio saved:', { bio, analysis });
                    setBioAnalyzerSaves(prev => prev + 1);
                  }}
                  onAIEnhance={(bio) => {
                    console.log('AI enhance requested for:', bio);
                    alert('AI Enhancement zou hier geactiveerd worden (komt in volgende sprint!)');
                  }}
                />
              </CardContent>
            </Card>

            {/* Features List */}
            <Card className="mt-6 border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">✨ Bio Analyzer Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Real-time Analysis:</strong> 500ms debounce voor smooth UX</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>6 Metrics:</strong> Specificity, Clichés, Length, Hooks, Tone, Authenticity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>15+ Clichés Detected:</strong> Met percentage usage data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Smart Suggestions:</strong> Top 3 prioritized improvements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Highlighted Issues:</strong> Met tooltips en alternatives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Before/After Examples:</strong> Per metric</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Score Visualization:</strong> Animated circular progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Copy/Save Actions:</strong> Easy workflow</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transformer" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-blue-600" />
                  Cliché Transformer - Live Demo
                </CardTitle>
                <CardDescription>
                  Test de 4-step transformation exercise. 10 clichés om te transformeren!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClicheTransformer
                  onComplete={(completed, totalScore) => {
                    console.log('Transformer completed:', { completed, totalScore });
                    setTransformerCompleted(completed);
                    setTransformerScore(totalScore);
                  }}
                />
              </CardContent>
            </Card>

            {/* Features List */}
            <Card className="mt-6 border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg">⚡ Cliché Transformer Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>10 Common Clichés:</strong> Travel, Food, Spontaneous, Fitness, etc.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>4-Step Wizard:</strong> Identify → Meaning → Detail → Write</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Smart Scoring:</strong> 4 dimensions (Specificity, Creativity, Authenticity, Impact)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Instant Feedback:</strong> Met concrete verbeterpunten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Examples:</strong> Bad, Good, en Exceptional voorbeelden</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Progress Tracking:</strong> Overall completion percentage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Achievement System:</strong> "Cliché Crusher" bij 8/10</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Retry Option:</strong> Improve score op slechte attempts</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personality" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-6 h-6 text-green-600" />
                  Personality Profile Builder - Live Demo
                </CardTitle>
                <CardDescription>
                  Test de 15-vraag personality quiz. Genereert custom bio suggestions op basis van jouw type!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PersonalityProfileBuilder
                  onComplete={(profile, answers) => {
                    console.log('Profile completed:', { profile, answers });
                    setProfilesCompleted(prev => prev + 1);
                  }}
                />
              </CardContent>
            </Card>

            {/* Features List */}
            <Card className="mt-6 border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg">👤 Personality Profile Builder Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>5 Dimensions:</strong> Adventure, Social Energy, Communication, Values, Passion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>15 Questions:</strong> 3 per dimensie, multiple choice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Archetype Detection:</strong> 15+ verschillende personality types</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Dimension Scores:</strong> 0-100 scale per dimensie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Custom Bio Suggestions:</strong> Gebaseerd op jouw antwoorden</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Writing Tips:</strong> Do/Don&apos;t voorbeelden per archetype</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Tone Recommendations:</strong> Welke tone past bij jou</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span><strong>Strength Tags:</strong> Jouw top 5 personality strengths</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status Card */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Trophy className="w-6 h-6" />
              Development Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-green-600">COMPLETED</Badge>
                <span className="font-semibold">Database Schema (15 tables, 3 functions, 2 views)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-green-600">COMPLETED</Badge>
                <span className="font-semibold">Bio Analyzer Core Logic (6 metrics, 15+ clichés)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-green-600">COMPLETED</Badge>
                <span className="font-semibold">Bio Analyzer Component (Full UI with animations)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-green-600">COMPLETED</Badge>
                <span className="font-semibold">Cliché Data (10 exercises with scoring)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-green-600">COMPLETED</Badge>
                <span className="font-semibold">Cliché Transformer Component (4-step wizard)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-green-600">COMPLETED</Badge>
                <span className="font-semibold">Personality Profile Builder (15 questions, 5 dimensions)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">READY TO BUILD</Badge>
                <span>AI Bio Coach (Conversational)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">READY TO BUILD</Badge>
                <span>Smart Bio Checklist (12 criteria)</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border-2 border-green-300">
              <h4 className="font-bold text-green-900 mb-2">🎉 Sprint Progress: 60% Complete!</h4>
              <p className="text-sm text-green-800">
                Drie krachtige components zijn nu live! Bio Analyzer, Cliché Transformer, én Personality Profile Builder
                geven gebruikers een complete toolkit om hun dating profile te optimaliseren. Database schema volledig opgezet.
              </p>
              <div className="mt-3 text-sm text-green-700">
                <strong>Volgende stappen:</strong> AI Bio Coach bouwen, Smart Bio Checklist, API endpoints,
                en integreren in cursus modules.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
