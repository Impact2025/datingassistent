'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Sparkles,
  ArrowRight,
  Target,
  Crown,
  TrendingUp
} from 'lucide-react';

interface Assessment {
  recommended_program: string;
  recommendation_confidence: number;
  question_1: string;
  question_2: string;
  question_3: string;
  question_4: string;
  question_5: string;
  question_6: string;
  question_7: string;
}

interface ProgramData {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  transformation_promise: string;
  price_regular: number;
  price_beta: number | null;
  duration_days: number;
  tangible_proof: string;
  tier: string;
  outcomes: string[];
  features: { text: string; type: string }[];
}

const programIcons: Record<string, any> = {
  kickstart: Target,
  transformatie: Sparkles,
  'vip-reis': Crown
};

const programColors: Record<string, string> = {
  kickstart: 'from-blue-500 to-blue-600',
  transformatie: 'from-pink-500 to-purple-600',
  'vip-reis': 'from-purple-500 to-indigo-600'
};

export default function AssessmentResultPage() {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [program, setProgram] = useState<ProgramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        // Get assessment
        const assessmentRes = await fetch('/api/assessment/save');
        if (!assessmentRes.ok) {
          throw new Error('Assessment not found');
        }
        const assessmentData = await assessmentRes.json();
        setAssessment(assessmentData);

        // Get recommended program details
        const programRes = await fetch(`/api/programs?slug=${assessmentData.recommended_program}`);
        if (!programRes.ok) {
          throw new Error('Program not found');
        }
        const programData = await programRes.json();
        setProgram(programData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, []);

  const handleContinue = () => {
    if (program) {
      router.push(`/checkout/${program.slug}`);
    }
  };

  const handleViewOtherPrograms = () => {
    router.push('/#programmas');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Berekenen van jouw perfecte programma...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment || !program) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-red-500 text-5xl">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900">Er ging iets mis</h2>
            <p className="text-gray-600">
              {error || 'Kon je assessment niet laden.'}
            </p>
            <Button onClick={() => router.push('/assessment/1')} className="w-full">
              Opnieuw beginnen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = programIcons[program.tier] || Sparkles;
  const gradientColor = programColors[program.tier] || 'from-pink-500 to-purple-600';
  const showBetaPrice = program.price_beta && program.price_beta < program.price_regular;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-2xl mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Perfect! We hebben jouw ideale programma gevonden
          </h1>
          <p className="text-xl text-gray-600">
            Op basis van jouw antwoorden is dit het beste programma voor jou
          </p>
        </motion.div>

        {/* Confidence Badge */}
        <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 text-lg">
            <TrendingUp className="w-5 h-5 mr-2" />
            {assessment.recommendation_confidence}% match met jouw situatie
          </Badge>
        </div>

        {/* Recommended Program Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-pink-500 shadow-2xl bg-white">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center mx-auto mb-4">
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2">
                  ⭐ Aanbevolen voor jou
                </Badge>
              </div>

              <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${gradientColor} flex items-center justify-center shadow-lg mb-4`}>
                <Icon className="w-10 h-10 text-white" />
              </div>

              <CardTitle className="text-3xl font-bold text-gray-900">
                {program.name}
              </CardTitle>
              <p className="text-gray-600 italic text-lg mt-2">"{program.tagline}"</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Pricing */}
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                {showBetaPrice && (
                  <div className="mb-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      🎉 Beta Launch Korting!
                    </Badge>
                  </div>
                )}
                <div className="flex items-baseline justify-center gap-3">
                  {showBetaPrice && (
                    <span className="text-2xl text-gray-400 line-through">
                      €{program.price_regular}
                    </span>
                  )}
                  <span className="text-5xl font-bold text-gray-900">
                    €{showBetaPrice ? program.price_beta : program.price_regular}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">
                  {program.duration_days} dagen programma
                </p>
                {showBetaPrice && (
                  <p className="text-green-600 font-semibold mt-2">
                    Je bespaart €{program.price_regular - (program.price_beta || 0)}!
                  </p>
                )}
              </div>

              {/* Transformation Promise */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  Jouw transformatie:
                </h3>
                <p className="text-gray-700 font-medium">
                  {program.transformation_promise}
                </p>
              </div>

              {/* Why This Program */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-3">
                  💡 Waarom dit programma perfect bij je past:
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {assessment.question_2.includes('profiel') && (
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Je profiel verbeteren is een focus in dit programma</span>
                    </li>
                  )}
                  {assessment.question_3.includes('5-10u') && (
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Het tijdsinvestment past bij jouw beschikbaarheid</span>
                    </li>
                  )}
                  {assessment.question_5.includes('ai-hulp') && (
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>24/7 AI begeleiding zoals jij wilt</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>Budget past bij jouw investering</span>
                  </li>
                </ul>
              </div>

              {/* Outcomes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Wat je bereikt:
                </h3>
                <ul className="space-y-2">
                  {program.outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-2 justify-center text-green-700 bg-green-50 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{program.tangible_proof}</span>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleContinue}
                  className={`w-full bg-gradient-to-r ${gradientColor} hover:opacity-90 text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all`}
                >
                  Start met {program.name}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  onClick={handleViewOtherPrograms}
                  variant="outline"
                  className="w-full border-2 border-gray-300 hover:border-pink-500 hover:text-pink-500"
                >
                  Bekijk andere programma's
                </Button>
              </div>

              {/* Guarantee */}
              <div className="text-center text-sm text-gray-600 pt-4 border-t">
                <p>✅ 30 dagen geld-terug garantie</p>
                <p className="text-xs mt-1">100% risicovrij uitproberen</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
