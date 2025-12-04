"use client";

import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

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
      <div className="space-y-6">
        {/* Clean description */}
        <div className="text-center space-y-4">
          <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Ontdek je unieke dating stijl en blinde vlekken. Deze scan analyseert je daadwerkelijke dating gedrag en geeft praktische strategieën voor betere matches.
          </p>
        </div>

        {/* What you get - Simple list */}
        <div className="max-w-xl mx-auto">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center">Wat je krijgt</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900">Jouw Dating Archetype</p>
                <p className="text-sm text-gray-600">Initiator, Planner, Avonturier of 5 andere stijlen</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900">Blinde Vlekken</p>
                <p className="text-sm text-gray-600">Patronen die je succes onbewust saboteren</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900">Praktische Strategieën</p>
                <p className="text-sm text-gray-600">Chat scripts, micro-interventies en date tips</p>
              </div>
            </div>
          </div>
        </div>

        {/* Previous assessment info */}
        {hasPreviousAssessment && (
          <div className="text-center text-sm text-gray-600">
            <p>Je hebt deze scan al {totalAssessments}× gedaan</p>
            {!canRetake && nextRetakeDate && (
              <p className="text-orange-600 mt-1">
                Volgende scan mogelijk vanaf {new Date(nextRetakeDate).toLocaleDateString('nl-NL')}
              </p>
            )}
          </div>
        )}

        {/* CTA Button */}
        <div className="text-center pt-4">
          <Button
            onClick={onStart}
            disabled={loading || (!canRetake && hasPreviousAssessment)}
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Bezig...
              </>
            ) : hasPreviousAssessment ? (
              <>
                Opnieuw Doen
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Start Scan
                <Sparkles className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            3-6 minuten · AVG-proof · Direct resultaat
          </p>
        </div>
      </div>
    </CardContent>
  );
}