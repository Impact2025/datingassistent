'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles, Crown, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Program {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  transformation_promise: string;
  price_regular: number;
  price_beta: number | null;
  duration_days: number;
  outcome_category: string | null;
  target_audience: string;
  tangible_proof: string;
  tier: string;
  outcomes: string[];
  features: {
    text: string;
    type: string;
  }[];
}

const tierIcons: Record<string, React.ComponentType<any>> = {
  kickstart: Target,
  transformatie: Sparkles,
  vip: Crown,
};

const tierColors: Record<string, string> = {
  kickstart: 'from-blue-500 to-blue-600',
  transformatie: 'from-pink-500 to-purple-600',
  vip: 'from-purple-500 to-indigo-600',
};

export function ProgramCards() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/programs');
        if (!response.ok) {
          throw new Error('Failed to fetch programs');
        }
        const data = await response.json();

        // Filter to only show the 3 main programs (exclude alumni)
        const mainPrograms = data.filter((p: Program) =>
          ['kickstart', 'transformatie', 'vip'].includes(p.tier)
        );

        setPrograms(mainPrograms);
      } catch (err) {
        console.error('Error loading programs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load programs');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleSelectProgram = (program: Program) => {
    // Navigate to registration with program slug
    window.location.href = `/register?program=${program.slug}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (error || programs.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 max-w-2xl mx-auto">
        <p className="text-gray-500">
          {error || 'Geen programma\'s beschikbaar op dit moment.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {programs.map((program, index) => {
        const Icon = tierIcons[program.tier] || Target;
        const gradientColor = tierColors[program.tier] || 'from-pink-500 to-purple-600';
        const isFeatured = program.tier === 'transformatie';
        const showBetaPrice = program.price_beta && program.price_beta < program.price_regular;

        return (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`relative transition-all hover:shadow-xl ${
                isFeatured
                  ? 'border-2 border-pink-500 shadow-lg scale-105'
                  : 'border border-gray-200 hover:border-pink-300'
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-1 shadow-md">
                    ⭐ Meest Gekozen
                  </Badge>
                </div>
              )}

              <CardContent className="p-6 space-y-6">
                {/* Icon & Title */}
                <div className="text-center space-y-3">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${gradientColor} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{program.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 italic">"{program.tagline}"</p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="text-center py-4 bg-gray-50 rounded-xl">
                  {showBetaPrice && (
                    <div className="mb-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        🎉 Beta Launch Aanbieding
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-baseline justify-center gap-2">
                    {showBetaPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        €{program.price_regular}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-gray-900">
                      €{showBetaPrice ? program.price_beta : program.price_regular}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {program.duration_days} dagen programma
                  </p>
                </div>

                {/* Transformation Promise */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
                  <p className="text-sm font-semibold text-gray-900 text-center">
                    {program.transformation_promise}
                  </p>
                </div>

                {/* Tangible Proof */}
                <div className="flex items-center gap-2 justify-center text-sm text-green-700 bg-green-50 rounded-lg p-3">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{program.tangible_proof}</span>
                </div>

                {/* Outcomes */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Wat je bereikt:
                  </p>
                  <ul className="space-y-2">
                    {program.outcomes.slice(0, 3).map((outcome, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Inclusief:
                  </p>
                  <ul className="space-y-2">
                    {program.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{feature.text}</span>
                      </li>
                    ))}
                    {program.features.length > 4 && (
                      <li className="text-xs text-gray-500 italic pl-4">
                        + {program.features.length - 4} meer features
                      </li>
                    )}
                  </ul>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectProgram(program)}
                  className={`w-full ${
                    isFeatured
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  } text-white shadow-lg hover:shadow-xl transition-all group`}
                >
                  {isFeatured ? 'Start je transformatie' : 'Kies dit programma'}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                {/* Target Audience */}
                <p className="text-xs text-gray-500 text-center italic">
                  Perfect voor: {program.target_audience}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
