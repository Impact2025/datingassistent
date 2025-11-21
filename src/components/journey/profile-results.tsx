"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Camera,
  MessageSquare,
  Users,
  Calendar,
  TrendingUp
} from "lucide-react";

interface ProfileResultsProps {
  profileData: any;
  onComplete: () => void;
}

export function ProfileResults({ profileData, onComplete }: ProfileResultsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Simulated AI results
  const results = {
    overallScore: 72,
    photoScore: 65,
    bioScore: 78,
    improvements: [
      {
        icon: '📸',
        title: 'Gebruik foto #2 als hoofdfoto',
        impact: '+35% meer matches',
        category: 'photos'
      },
      {
        icon: '✨',
        title: 'Voeg een actie foto toe (sport/hobby)',
        impact: '+22% meer gesprekken',
        category: 'photos'
      },
      {
        icon: '💬',
        title: 'Maak je bio 30% korter en punchier',
        impact: '+18% meer profiel views',
        category: 'bio'
      }
    ],
    newBio: `Hey! 👋 Ik ben iemand die houdt van spontane avonturen en goede gesprekken.

🎸 Muziek liefhebber | 🏃 Hardloper | 📚 Boekenw

orm

Zoek naar iemand die kan lachen om slechte grappen en niet bang is voor een laatste date-idee.

Eerste date: koffie, wandeling of iets anders dat we samen bedenken?`,
    topPhotos: [
      { id: 1, reason: 'Natuurlijk licht, echte glimlach, goede achtergrond' },
      { id: 3, reason: 'Actie shot, laat hobby zien, dynamisch' },
      { id: 5, reason: 'Groepsfoto, sociale connectie, gezellig' }
    ],
    openers: [
      "Hey! Zag dat je ook van [hobby] houdt. Wat is je favoriete...?",
      "Je profiel straalt [kwaliteit] uit! Vertel eens, wat...",
      "[Compliment over bio detail]. Ik ben benieuwd..."
    ],
    matchTips: [
      "Swipe tussen 18:00-21:00 voor beste kans op matches",
      "Kijk naar shared interests en common ground",
      "Wacht niet te lang met het eerste bericht (max 24u)"
    ],
    dateTips: [
      "Kies een locatie die gesprekken mogelijk maakt (geen bioscoop!)",
      "Stel open vragen en laat je interesse zien",
      "Plan binnen 1 week na goed gesprek"
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* WOW Header */}
      <Card className="border-2 shadow-xl bg-gradient-to-br from-green-50 to-blue-50">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3">
            WOW! Ik zie instant verbeteringen! 🚀
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Jouw profiel scoort nu <Badge variant="secondary" className="text-xl px-3 py-1">{results.overallScore}/100</Badge>
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Met deze optimalisaties kun je <strong>2-3x meer quality matches</strong> verwachten.
            Ik heb alles klaar gezet voor je!
          </p>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Je Profiel Optimalisatie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">📊 Overzicht</TabsTrigger>
              <TabsTrigger value="bio">✍️ Bio</TabsTrigger>
              <TabsTrigger value="photos">📸 Foto's</TabsTrigger>
              <TabsTrigger value="openers">💬 Openers</TabsTrigger>
              <TabsTrigger value="tips">🎯 Tips</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6 text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-3xl font-bold text-blue-900">{results.photoScore}</div>
                    <div className="text-sm text-blue-700">Foto Score</div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6 text-center">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-3xl font-bold text-green-900">{results.bioScore}</div>
                    <div className="text-sm text-green-700">Bio Score</div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6 text-center">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-3xl font-bold text-purple-900">{results.improvements.length}</div>
                    <div className="text-sm text-purple-700">Quick Wins</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Direct Toepasbare Verbeteringen
                </h3>
                {results.improvements.map((improvement, i) => (
                  <Card key={i} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{improvement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{improvement.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {improvement.impact}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Bio Tab */}
            <TabsContent value="bio" className="space-y-4 pt-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Jouw Geoptimaliseerde Bio
                </h3>
                <div className="bg-white rounded-lg p-4 border whitespace-pre-wrap font-medium text-gray-800">
                  {results.newBio}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Korter en punchier (42% verbetering)
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Clear call-to-action toegevoegd
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Persoonlijkheid komt beter naar voren
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="space-y-4 pt-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Jouw Top 3 Foto's (in deze volgorde):</h3>
                {results.topPhotos.map((photo, i) => (
                  <Card key={i} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-green-600">#{i + 1}</Badge>
                        <div>
                          <h4 className="font-semibold mb-1">Foto {photo.id}</h4>
                          <p className="text-sm text-gray-600">{photo.reason}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Openers Tab */}
            <TabsContent value="openers" className="space-y-4 pt-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Ideale Eerste Berichten voor jou:</h3>
                {results.openers.map((opener, i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline">Template {i + 1}</Badge>
                        <p className="text-gray-700 flex-1 italic">"{opener}"</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Pro tip:</strong> Personaliseer deze templates met details uit hun profiel voor max impact!
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Tips Tab */}
            <TabsContent value="tips" className="space-y-6 pt-4">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Welke Matches te Kiezen
                </h3>
                <div className="space-y-2">
                  {results.matchTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Eerste Date Tips
                </h3>
                <div className="space-y-2">
                  {results.dateTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg p-6 text-center">
        <h3 className="text-2xl font-bold mb-2">
          Holy shit, ik heb nu al resultaat! 🎉
        </h3>
        <p className="mb-6 text-green-50">
          Al je optimalisaties zijn klaar. Tijd om je journey te starten!
        </p>
        <Button
          onClick={onComplete}
          size="lg"
          className="bg-white text-blue-600 hover:bg-gray-100 font-bold"
        >
          Naar mijn Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
