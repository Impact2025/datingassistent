"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Shield, Target, ArrowRight, Clock, CheckCircle, Users } from 'lucide-react';

interface RelatiepatronenIntroProps {
  onStart: () => void;
  loading: boolean;
  hasPreviousAssessment: boolean;
  canRetake: boolean;
  totalAssessments: number;
  nextRetakeDate?: string;
}

export function RelatiepatronenIntro({
  onStart,
  loading,
  hasPreviousAssessment,
  canRetake,
  totalAssessments,
  nextRetakeDate
}: RelatiepatronenIntroProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="p-8">
      {/* Main Intro */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-pink-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ontdek je relatiepatronen
        </h2>

        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Herken je dat je steeds dezelfde situaties meemaakt in relaties?
          Deze reflectie helpt je terugkerende patronen te identificeren en geeft concrete handvatten om ze te doorbreken.
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge variant="secondary" className="bg-pink-100 text-pink-700">
            <Clock className="w-3 h-3 mr-1" />
            4-7 minuten
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Evidence-based
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Users className="w-3 h-3 mr-1" />
            AI-gestuurd
          </Badge>
        </div>
      </div>

      {/* What you'll discover */}
      <Card className="bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200 mb-8">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4 text-center">
            Wat je gaat ontdekken
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Primaire patroon</h4>
                <p className="text-sm text-gray-600">Je meest terugkerende relatiegedrag</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Triggers & oorzaken</h4>
                <p className="text-sm text-gray-600">Wanneer en waarom je patroon activeert</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Concrete interventies</h4>
                <p className="text-sm text-gray-600">Direct toepasbare oefeningen</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Tool integraties</h4>
                <p className="text-sm text-gray-600">Koppelingen naar gerelateerde tools</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment info */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">12 Vragen</h4>
            <p className="text-sm text-gray-600">Statements + scenario's voor diepgaand inzicht</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">8 Patronen</h4>
            <p className="text-sm text-gray-600">Idealiseringslus, Conflictvermijding, Self-sabotage, etc.</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">AI Analyse</h4>
            <p className="text-sm text-gray-600">Gepersonaliseerde inzichten en interventies</p>
          </CardContent>
        </Card>
      </div>

      {/* Previous assessment info */}
      {hasPreviousAssessment && (
        <Card className="bg-blue-50 border-blue-200 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  Eerdere reflectie gevonden
                </h4>
                <p className="text-sm text-blue-700 mb-2">
                  Je hebt deze reflectie al {totalAssessments} keer gedaan.
                  {!canRetake && nextRetakeDate && (
                    <span className="block mt-1">
                      Volgende mogelijkheid: {formatDate(nextRetakeDate)}
                    </span>
                  )}
                </p>
                {canRetake && (
                  <p className="text-sm text-blue-600">
                    Je kunt nu een nieuwe reflectie doen voor bijgewerkte inzichten.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start button */}
      <div className="text-center">
        <Button
          onClick={onStart}
          disabled={loading || (hasPreviousAssessment && !canRetake)}
          size="lg"
          className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Bezig met starten...
            </>
          ) : hasPreviousAssessment && !canRetake ? (
            'Op dit moment niet beschikbaar'
          ) : (
            <>
              Start Reflectie
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        <p className="text-sm text-gray-500 mt-4">
          Geen therapie — wel nuttige inzichten voor betere relatiekeuzes
        </p>
      </div>
    </div>
  );
}