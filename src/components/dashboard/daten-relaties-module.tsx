"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RatingStars } from "@/components/ui/rating-stars";
import { CalendarHeart, Users, Heart, CheckCircle2, Calendar, MessageCircle, Sparkles, BarChart3, User, Calendar as CalendarIcon, MessageSquare, Target, Zap, TrendingUp, Loader2 } from "lucide-react";
import { DateIdeasProForm } from "./date-ideas-pro-form";
import { cn } from "@/lib/utils";

// Import existing components
import { DatePlannerTab } from "./date-planner-tab";
import { CommunityTab } from "./community-tab";
import { DatingActivityLogger } from "../engagement/dating-activity-logger";
import { DatingWeekLogger } from "./dating-week-logger";

interface DatenRelatiesModuleProps {
  onTabChange?: (tab: string) => void;
}

export function DatenRelatiesModule({ onTabChange }: DatenRelatiesModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState("date-planner");
  const [dateAnalysis, setDateAnalysis] = useState({
    partnerName: '',
    dateDate: '',
    comfortRating: 5,
    attractionRating: 5,
    atmosphereRating: 5,
    goodAspects: '',
    highlights: '',
    improvements: '',
    notes: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [followUpMessages, setFollowUpMessages] = useState<any>(null);

  const handleInputChange = (field: string, value: string | number) => {
    setDateAnalysis(prev => ({ ...prev, [field]: value }));
  };

  const handleAICoaching = async () => {
    if (!dateAnalysis.partnerName.trim()) {
      alert('Vul eerst de naam van je date partner in.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setFollowUpMessages(null);

    // Simulate PRO AI analysis (in development mode)
    setTimeout(() => {
      // Generate comprehensive PRO analysis
      const analysis = {
        overallScore: Math.floor((dateAnalysis.comfortRating + dateAnalysis.attractionRating + dateAnalysis.atmosphereRating) / 3),
        insights: [
          dateAnalysis.comfortRating >= 7 ? "Je voelde je comfortabel - een goed teken voor chemistry!" : "Comfort was gemiddeld - overweeg volgende keer een rustigere setting",
          dateAnalysis.attractionRating >= 7 ? "Er was duidelijke aantrekkingskracht - bouw hierop voort!" : "Aantrekkingskracht was subtiel - geef het tijd om te groeien",
          dateAnalysis.atmosphereRating >= 7 ? "De sfeer was perfect voor jullie connectie" : "De sfeer had beter gekund - locatie keuze is belangrijk"
        ],
        improvements: [
          "Wees iets directer in je communicatie om intenties duidelijker te maken",
          "Stel meer open vragen om dieper te leren kennen",
          "Plan een vervolg date als de chemistry er is"
        ],
        patterns: {
          communication: dateAnalysis.goodAspects.toLowerCase().includes('gesprek') ? 'sterk' : 'ontwikkelen',
          tempo: dateAnalysis.comfortRating > dateAnalysis.attractionRating ? 'comfort-first' : 'attraction-first',
          chemistry: (dateAnalysis.comfortRating + dateAnalysis.attractionRating + dateAnalysis.atmosphereRating) / 3 > 7 ? 'hoog' : 'gemiddeld'
        }
      };

      // Generate follow-up messages
      const messages = {
        playful: `Hey ${dateAnalysis.partnerName}! 😄 Die ene grap die je vertelde over surfen blijft me bij... Nog een koffie-date om meer verhalen uit te wisselen? ☕️`,
        warm: `Hoi ${dateAnalysis.partnerName}! Ik vond ons gesprek echt fijn en voelde me op mijn gemak bij je. Lijkt me leuk om elkaar nog een keer te zien — wat denk je? 💕`,
        direct: `Hoi ${dateAnalysis.partnerName}! Ik heb genoten van onze date en zou je graag nog een keer willen zien. Ben je ook benieuwd naar een vervolg? 😉`
      };

      setAnalysisResult(analysis);
      setFollowUpMessages(messages);
      setIsAnalyzing(false);
    }, 3000);
  };

  const subModules = [
    {
      id: "levensvisie",
      label: "🧭 Levensvisie & Toekomstkompas PRO",
      icon: Target,
      description: "Ontdek jullie toekomst compatibility en levensdoelen alignment",
      component: <div className="p-6 text-center">
        <h3 className="text-xl font-bold mb-4">Levensvisie & Toekomstkompas PRO</h3>
        <p className="text-muted-foreground mb-6">
          Wetenschappelijke analyse van jullie toekomst compatibility en gedeelde levensvisie.
        </p>
        <Button
          onClick={() => window.location.href = '/levensvisie'}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        >
          Start Toekomst Analyse
        </Button>
      </div>,
      badge: "AI-PRO"
    },
    {
      id: "date-planner",
      label: "Date Planner",
      icon: CalendarHeart,
      description: "Plan geslaagde dates met checklists en ideeën",
      component: <DatePlannerTab />,
      badge: null
    },
    {
      id: "date-ideeen",
      label: "Date Ideeën",
      icon: Sparkles,
      description: "Krijg inspiratie voor unieke en leuke dates",
      component: <DateIdeasProForm />,
      badge: "Nieuw"
    },
    {
      id: "checklist",
      label: "Checklist",
      icon: CheckCircle2,
      description: "Voorbereidingschecklist voor geslaagde dates",
      component: (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <h2 className="text-2xl font-bold text-green-600">Date Voorbereiding Checklist</h2>
                <p className="text-sm text-muted-foreground">
                  Zorg dat je goed voorbereid aan je date begint
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <input type="checkbox" className="w-4 h-4 text-primary" />
              <div>
                <h4 className="font-medium">Persoonlijke verzorging</h4>
                <p className="text-sm text-muted-foreground">Haar, kleding, geur - eerste indruk telt</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <input type="checkbox" className="w-4 h-4 text-primary" />
              <div>
                <h4 className="font-medium">Onderzoek locatie</h4>
                <p className="text-sm text-muted-foreground">Route, parkeren, sfeer, prijzen checken</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <input type="checkbox" className="w-4 h-4 text-primary" />
              <div>
                <h4 className="font-medium">Gespreksonderwerpen</h4>
                <p className="text-sm text-muted-foreground">3-5 interessante topics voorbereiden</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <input type="checkbox" className="w-4 h-4 text-primary" />
              <div>
                <h4 className="font-medium">Backup plan</h4>
                <p className="text-sm text-muted-foreground">Plan B voor als het weer tegenzit</p>
              </div>
            </div>
          </div>
        </div>
      ),
      badge: null
    },
    {
      id: "date-analyse",
      label: "Date Analyse",
      icon: BarChart3,
      description: "Analyseer je dates en leer van ervaringen",
      component: (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-blue-600">Date Analyse Tool</h2>
                <p className="text-sm text-muted-foreground">
                  Laat je complete date analyseren door Iris. Ontdek patronen, krijg persoonlijke inzichten en bouw aan betere connecties.
                </p>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">PRO</span>
          </div>

          {/* Date Details Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-600" />
              Date Details
            </h4>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Naam van je date
                  </label>
                  <Input
                    value={dateAnalysis.partnerName}
                    onChange={(e) => handleInputChange('partnerName', e.target.value)}
                    placeholder="bijv. Sarah, Mike..."
                    className="bg-gray-50 border-gray-200 focus:border-gray-300 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Datum van de date
                  </label>
                  <Input
                    type="date"
                    value={dateAnalysis.dateDate}
                    onChange={(e) => handleInputChange('dateDate', e.target.value)}
                    className="bg-gray-50 border-gray-200 focus:border-gray-300 focus:bg-white"
                  />
                </div>
              </div>

              {/* Ratings Section */}
              <div className="space-y-6">
                <h4 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-600" />
                  Beoordeel jullie date (1-10)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <RatingStars
                    value={dateAnalysis.comfortRating}
                    onChange={(value) => handleInputChange('comfortRating', value)}
                    label="Comfort"
                    size="lg"
                  />
                  <RatingStars
                    value={dateAnalysis.attractionRating}
                    onChange={(value) => handleInputChange('attractionRating', value)}
                    label="Aantrekkingskracht"
                    size="lg"
                  />
                  <RatingStars
                    value={dateAnalysis.atmosphereRating}
                    onChange={(value) => handleInputChange('atmosphereRating', value)}
                    label="Sfeer/Ambiance"
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reflection Questions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              Jouw reflectie
            </h4>
            <div className="space-y-6">
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Wat voelde goed tijdens de date?</h5>
                <Textarea
                  value={dateAnalysis.goodAspects}
                  onChange={(e) => handleInputChange('goodAspects', e.target.value)}
                  placeholder="Beschrijf wat goed ging, waar je je comfortabel voelde..."
                  className="w-full min-h-[100px] bg-gray-50 border-gray-200 focus:border-gray-300 focus:bg-white resize-none"
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Wat waren de hoogtepunten?</h5>
                <Textarea
                  value={dateAnalysis.highlights}
                  onChange={(e) => handleInputChange('highlights', e.target.value)}
                  placeholder="De beste momenten, grappige verhalen, diepe gesprekken..."
                  className="w-full min-h-[100px] bg-gray-50 border-gray-200 focus:border-gray-300 focus:bg-white resize-none"
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Wat kan beter volgende keer?</h5>
                <Textarea
                  value={dateAnalysis.improvements}
                  onChange={(e) => handleInputChange('improvements', e.target.value)}
                  placeholder="Waar liep het stroef? Wat zou je anders doen?"
                  className="w-full min-h-[100px] bg-gray-50 border-gray-200 focus:border-gray-300 focus:bg-white resize-none"
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Notities (optioneel)</h5>
                <Textarea
                  value={dateAnalysis.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Extra gedachten, plannen voor vervolg..."
                  className="w-full min-h-[80px] bg-gray-50 border-gray-200 focus:border-gray-300 focus:bg-white resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* AI Analysis Button */}
          <div className="text-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <Button
              onClick={handleAICoaching}
              disabled={isAnalyzing || !dateAnalysis.partnerName.trim()}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 font-medium"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iris analyseert je date...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Krijg AI Coaching van Iris
                </>
              )}
            </Button>
            {!dateAnalysis.partnerName.trim() && (
              <p className="text-sm text-gray-500 mt-3">
                Vul eerst de naam van je date partner in
              </p>
            )}
          </div>

          {/* PRO Analysis Results */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{analysisResult.overallScore}/10</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Date Score</h3>
                <p className="text-gray-600">
                  {analysisResult.overallScore >= 8 ? '🌟 Uitstekende date!' :
                   analysisResult.overallScore >= 6 ? '💫 Goede date met potentie' :
                   '🤔 Date had verbetering nodig'}
                </p>
              </div>

              {/* Insights */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-600" />
                  3 Persoonlijke Inzichten
                </h4>
                <div className="space-y-3">
                  {analysisResult.insights.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  3 Praktische Verbeterpunten
                </h4>
                <div className="space-y-3">
                  {analysisResult.improvements.map((improvement: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700">{improvement}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up Messages */}
              {followUpMessages && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                    Follow-up Bericht Suggesties
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    3 versies om {dateAnalysis.partnerName} een bericht te sturen
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">🎯 Speels</h5>
                      <p className="text-sm text-gray-700 italic">"{followUpMessages.playful}"</p>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">💕 Warm</h5>
                      <p className="text-sm text-gray-700 italic">"{followUpMessages.warm}"</p>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">💬 Direct & Duidelijk</h5>
                      <p className="text-sm text-gray-700 italic">"{followUpMessages.direct}"</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pattern Recognition */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  Jouw Dating Patronen
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg mb-2">
                      {analysisResult.patterns.communication === 'sterk' ? '💬' : '🤔'}
                    </div>
                    <div className="text-sm font-medium text-gray-900">Communicatie</div>
                    <div className="text-xs text-gray-600">
                      {analysisResult.patterns.communication === 'sterk' ? 'Sterk' : 'Ontwikkelen'}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg mb-2">
                      {analysisResult.patterns.tempo === 'comfort-first' ? '🐢' : '🐇'}
                    </div>
                    <div className="text-sm font-medium text-gray-900">Tempo</div>
                    <div className="text-xs text-gray-600">
                      {analysisResult.patterns.tempo === 'comfort-first' ? 'Comfort eerst' : 'Aantrekkingskracht eerst'}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg mb-2">
                      {analysisResult.patterns.chemistry === 'hoog' ? '✨' : '🔍'}
                    </div>
                    <div className="text-sm font-medium text-gray-900">Chemistry</div>
                    <div className="text-xs text-gray-600">
                      {analysisResult.patterns.chemistry === 'hoog' ? 'Hoog' : 'Gemiddeld'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
      badge: "Insights"
    },
    {
      id: "dating-week-log",
      label: "Mijn Dating Week",
      icon: Calendar,
      description: "Wekelijkse check-in met AI insights",
      component: <DatingWeekLogger onComplete={async (data) => {
        try {
          const response = await fetch('/api/dating-log/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
            },
            body: JSON.stringify(data)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Weekly log saved:', result);
            // Show success message or redirect
            setActiveSubTab('date-planner');
          } else {
            console.error('Failed to save weekly log');
          }
        } catch (error) {
          console.error('Error saving weekly log:', error);
        }
      }} onCancel={() => setActiveSubTab('date-planner')} />,
      badge: "PRO"
    },
    {
      id: "community",
      label: "Community",
      icon: Users,
      description: "Deel ervaringen en leer van anderen",
      component: <CommunityTab />,
      badge: null
    },
    {
      id: "activity-log",
      label: "Dating Log",
      icon: Heart,
      description: "Log je dates en leer van ervaringen",
      component: <DatingActivityLogger userId={0} />, // Will be passed from parent
      badge: "Nieuw"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarHeart className="w-6 h-6 text-primary" />
            Daten & Relaties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Van eerste dates tot betekenisvolle relaties. Plan, log en leer van je dating ervaringen.
          </p>

          {/* Progress Overview - Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            <div className="text-center p-2 bg-primary/5 rounded-md">
              <div className="text-sm font-bold text-primary">5</div>
              <div className="text-xs text-muted-foreground">Tools</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-md">
              <CheckCircle2 className="w-3 h-3 mx-auto mb-0.5 text-green-600" />
              <div className="text-xs text-muted-foreground">Int</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-md">
              <div className="text-sm font-bold text-blue-600">∞</div>
              <div className="text-xs text-muted-foreground">Ideeën</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-md">
              <div className="text-sm font-bold text-purple-600">24/7</div>
              <div className="text-xs text-muted-foreground">Online</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-module Navigation - Compact Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Kies je dating tool</h3>
            <p className="text-sm text-muted-foreground">Selecteer de tool die je nu wilt gebruiken</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {subModules.map((module) => {
              const Icon = module.icon;
              const isActive = activeSubTab === module.id;

              return (
                <Card
                  key={module.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                    isActive
                      ? "border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 ring-2 ring-pink-500/20"
                      : "border-border hover:border-pink-300 hover:bg-pink-50/30 dark:hover:bg-pink-950/10"
                  )}
                  onClick={() => setActiveSubTab(module.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="space-y-3">
                      <div className={cn(
                        "w-12 h-12 mx-auto rounded-full flex items-center justify-center transition-colors",
                        isActive
                          ? "bg-pink-500 text-white"
                          : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <h4 className={cn(
                          "font-semibold text-xs leading-tight",
                          isActive ? "text-pink-700 dark:text-pink-300" : "text-foreground"
                        )}>
                          {module.label}
                        </h4>

                        <p className="text-xs text-muted-foreground leading-tight">
                          {module.description}
                        </p>

                        {module.badge && (
                          <Badge
                            variant={isActive ? "default" : "secondary"}
                            className="text-xs mt-1"
                          >
                            {module.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Active Module Content */}
          <Card className="border-t-4 border-t-pink-500">
            <CardContent className="p-6">
              {(() => {
                const activeModule = subModules.find(m => m.id === activeSubTab);
                if (!activeModule) return null;

                return (
                  <div className="space-y-6">
                    {activeModule.component}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Date Planning Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Date Planning Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-700">✅ Goede gewoontes</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Plan minimaal 3 dagen van tevoren</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Kies een locatie waar je je comfortabel voelt</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Heb een backup plan voor slecht weer</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-700">💭 Reflectie vragen</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Wat wil je over jezelf leren?</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Wat zijn je deal-breakers?</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Hoe herken je goede chemistry?</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Snelle Acties</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setActiveSubTab("date-planner")}
            >
              <CalendarHeart className="w-5 h-5" />
              <span className="font-medium">Date Plannen</span>
              <span className="text-xs text-muted-foreground">Ideeën & checklists</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => setActiveSubTab("activity-log")}
            >
              <Heart className="w-5 h-5" />
              <span className="font-medium">Date Loggen</span>
              <span className="text-xs text-muted-foreground">Leer van ervaringen</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}