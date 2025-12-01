"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Heart,
  Shield,
  Flame,
  Zap,
  CheckCircle,
  AlertTriangle,
  Star,
  MessageCircle,
  User,
  Target,
  RefreshCw,
  Download,
  Share2,
  ArrowRight
} from 'lucide-react';
import { AssessmentData, DatingStyle } from './dating-style-flow';

interface DatingStyleResultsProps {
  data: AssessmentData;
  onRestart: () => void;
  styleIcon: (style: DatingStyle) => React.ReactNode;
  styleColor: (style: DatingStyle) => string;
}

export function DatingStyleResults({ data, onRestart, styleIcon, styleColor }: DatingStyleResultsProps) {
  const getStyleName = (style: DatingStyle) => {
    switch (style) {
      case 'initiator': return 'De Initiator';
      case 'planner': return 'De Voorzichtige Planner';
      case 'adventurer': return 'De Spontane Avonturier';
      case 'pleaser': return 'De Pleaser';
      case 'selector': return 'De Strategische Selector';
      case 'distant': return 'De Afstandelijke';
      case 'over_sharer': return 'De Overdeler';
      case 'ghost_prone': return 'De Ghost-prone';
      default: return style;
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 85) return { label: 'Zeer Betrouwbaar', color: 'text-green-600 bg-green-50' };
    if (confidence >= 70) return { label: 'Betrouwbaar', color: 'text-blue-600 bg-blue-50' };
    if (confidence >= 50) return { label: 'Redelijk', color: 'text-yellow-600 bg-yellow-50' };
    return { label: 'Beperkt', color: 'text-orange-600 bg-orange-50' };
  };

  const confidenceInfo = getConfidenceLabel(data.confidence);

  return (
    <div className="space-y-6">
      {/* Primary Result Card */}
      <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
        <CardContent className="p-8">
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${styleColor(data.primaryStyle)}`}>
              {styleIcon(data.primaryStyle)}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {data.aiInsights.headline}
            </h2>

            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
              {data.aiInsights.oneLiner}
            </p>

            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge className={`px-4 py-2 ${confidenceInfo.color}`}>
                Betrouwbaarheid: {data.confidence}%
              </Badge>
              {data.secondaryStyles.length > 0 && (
                <Badge variant="outline" className="px-4 py-2">
                  Secundair: {getStyleName(data.secondaryStyles[0].style)}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scores Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-pink-600" />
            Gedetailleerde Scores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(data.scores).map(([style, score]) => (
            <div key={style} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {styleIcon(style as DatingStyle)}
                  <span className="font-medium">{getStyleName(style as DatingStyle)}</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">{score}%</span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strong Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Jouw Sterke Punten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {data.aiInsights.strongPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{point}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blind Spots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Blinde Vlekken
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {data.aiInsights.blindSpots.map((spot, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{spot}</span>
              </div>
            ))}
          </div>
          {data.blindspotIndex > 50 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Let op:</strong> Je blindspot-index is {data.blindspotIndex}%.
                Dit betekent dat bepaalde patronen je dating succes kunnen belemmeren.
                De tips hieronder helpen je hiermee om te gaan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Scripts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Direct Toepasbare Chat Scripts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Openers</h4>
            <div className="space-y-3">
              {data.aiInsights.chatScripts.openers.map((script, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-900 italic">"{script}"</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Grenzen Stellen</h4>
            <div className="space-y-3">
              {data.aiInsights.chatScripts.boundaries.map((script, index) => (
                <div key={index} className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-purple-900 italic">"{script}"</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Follow-ups</h4>
            <div className="space-y-3">
              {data.aiInsights.chatScripts.followups.map((script, index) => (
                <div key={index} className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-900 italic">"{script}"</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Micro Exercises */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Micro-Interventies (7-14 dagen)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {data.aiInsights.microExercises.map((exercise, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-purple-600">{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900">{exercise.title}</h4>
                  <p className="text-purple-800 text-sm mt-1">{exercise.description}</p>
                  <p className="text-purple-600 text-xs mt-2">Duur: {exercise.duration} dagen</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Match Filters & Date Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Match Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Waarden</h4>
                <div className="flex flex-wrap gap-2">
                  {data.aiInsights.matchFilters.values.map((value, index) => (
                    <Badge key={index} variant="outline">{value}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Gedragingen</h4>
                <div className="flex flex-wrap gap-2">
                  {data.aiInsights.matchFilters.behaviors.map((behavior, index) => (
                    <Badge key={index} variant="outline">{behavior}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Date Aanbevelingen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-green-900 mb-2">Goede Date Formats</h4>
                <ul className="space-y-1">
                  {data.aiInsights.recommendedDates.map((date, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-green-800">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {date}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-900 mb-2">Vermijd Deze</h4>
                <ul className="space-y-1">
                  {data.aiInsights.avoidDates.map((date, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-red-800">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      {date}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tool Integrations */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-pink-600" />
            Geïntegreerde Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-white"
              onClick={() => window.location.href = '/dashboard?tab=communicatie-matching'}
            >
              <MessageCircle className="w-6 h-6 text-pink-600" />
              <span className="font-semibold">Chat Coach</span>
              <span className="text-sm text-gray-600">Scripts op maat</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-white"
              onClick={() => window.location.href = '/dashboard?tab=profiel-persoonlijkheid'}
            >
              <User className="w-6 h-6 text-pink-600" />
              <span className="font-semibold">Profiel Coach</span>
              <span className="text-sm text-gray-600">Bio optimalisatie</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-white"
              onClick={() => window.location.href = '/dashboard?tab=leren-ontwikkelen'}
            >
              <Target className="w-6 h-6 text-pink-600" />
              <span className="font-semibold">Cursus</span>
              <span className="text-sm text-gray-600">Diepgaande training</span>
            </Button>
          </div>

          <div className="mt-6 p-4 bg-white/50 rounded-lg">
            <p className="text-sm text-gray-700">
              💡 <strong>Pro tip:</strong> Je dating stijl data wordt automatisch gebruikt door al onze tools
              om persoonlijk advies te geven. Ga naar je dashboard voor tools die perfect aansluiten bij jouw stijl!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onRestart}
          variant="outline"
          className="flex-1 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Opnieuw Doen
        </Button>

        <Button
          variant="outline"
          className="flex-1 flex items-center gap-2"
          onClick={() => {
            alert('Resultaat opgeslagen in je voortgang!');
          }}
        >
          <Download className="w-4 h-4" />
          Opslaan
        </Button>

        <Button
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white flex items-center gap-2"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Mijn Dating Stijl Resultaat',
                text: `Mijn datingstijl is ${getStyleName(data.primaryStyle)}. Ontdek de jouwe op DatingAssistent!`,
                url: window.location.href
              });
            } else {
              navigator.clipboard.writeText(`${window.location.href} - Mijn datingstijl: ${getStyleName(data.primaryStyle)}`);
              alert('Link gekopieerd naar klembord!');
            }
          }}
        >
          <Share2 className="w-4 h-4" />
          Delen
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p className="mb-2">
          <strong>Belangrijke noot:</strong> Deze scan geeft praktische inzichten voor betere dating.
        </p>
        <p>
          Resultaten zijn gebaseerd op je antwoorden en kunnen veranderen naarmate je groeit.
        </p>
      </div>
    </div>
  );
}