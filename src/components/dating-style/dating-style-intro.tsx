"use client";

import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, MessageCircle, Heart, ArrowRight, Clock, CheckCircle } from 'lucide-react';

interface DatingStyleIntroProps {
  onStart: () => void;
  loading: boolean;
  hasPreviousAssessment?: boolean;
  canRetake?: boolean;
  totalAssessments?: number;
  nextRetakeDate?: string;
}

export function DatingStyleIntro({
  onStart,
  loading,
  hasPreviousAssessment = false,
  canRetake = true,
  totalAssessments = 0,
  nextRetakeDate
}: DatingStyleIntroProps) {
  return (
    <CardContent className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ontdek Je Dating Stijl & Blinde Vlekken
          </h2>

          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            In slechts 3-6 minuten krijg je diepgaand inzicht in hoe je datet,
            welke patronen je hebt, en waar je vaak tegenaan loopt. Met direct
            toepasbare scripts, oefeningen en strategieën.
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge className="bg-pink-100 text-pink-800 px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              3-6 minuten
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              PRO Tool
            </Badge>
            {hasPreviousAssessment && (
              <Badge className="bg-green-100 text-green-800 px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                {totalAssessments}× gedaan
              </Badge>
            )}
          </div>

          {/* Progress Info */}
          {hasPreviousAssessment && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-blue-900 font-medium">
                    Je hebt deze scan al {totalAssessments} keer gedaan
                  </p>
                  {!canRetake && nextRetakeDate && (
                    <p className="text-blue-700 text-sm">
                      Volgende scan mogelijk vanaf {new Date(nextRetakeDate).toLocaleDateString('nl-NL')}
                    </p>
                  )}
                  {canRetake && (
                    <p className="text-blue-700 text-sm">
                      Je kunt de scan nu opnieuw doen voor bijgewerkte inzichten
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* What You'll Learn */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Jouw Dating Archetype</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              Ontdek of je een Initiator, Planner, Avonturier, Pleaser, Selector,
              Afstandelijke, Overdeler of Ghost-prone bent.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Blinde Vlekken</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              Leer waar je vaak vastloopt en welke patronen je succes saboteren,
              zonder dat je het doorhebt.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Wat Je Krijgt
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Direct toepasbare chat scripts</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">7-14 dagen micro-interventies</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Match filters op maat</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Date format aanbevelingen</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Integratie met Chat & Profiel Coach</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Herhaal na 3 maanden</span>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <Button
            onClick={onStart}
            disabled={loading || (!canRetake && hasPreviousAssessment)}
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Bezig met starten...
              </>
            ) : !canRetake && hasPreviousAssessment ? (
              <>
                Scan niet beschikbaar
                <Clock className="w-5 h-5 ml-2" />
              </>
            ) : hasPreviousAssessment ? (
              <>
                Opnieuw Doen
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Start Dating Stijl Scan
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {!canRetake && hasPreviousAssessment && nextRetakeDate && (
            <p className="text-sm text-orange-600 mt-2">
              Je kunt deze scan opnieuw doen vanaf {new Date(nextRetakeDate).toLocaleDateString('nl-NL')}
            </p>
          )}

          <p className="text-sm text-gray-500 mt-4">
            Geen oordeel, alleen actiegerichte inzichten voor betere dating
          </p>
        </div>
      </div>
    </CardContent>
  );
}