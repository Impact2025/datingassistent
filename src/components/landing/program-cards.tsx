'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

// Subtle scarcity (no enrollment numbers, just availability)
const availabilityData: Record<string, { available: boolean; limited: boolean }> = {
  kickstart: { available: true, limited: false },
  transformatie: { available: true, limited: true },
  vip: { available: true, limited: true },
};

export function ProgramCards() {
  const router = useRouter();
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

        // Safe JSON parsing - handle empty or malformed responses
        const text = await response.text();
        if (!text || text.trim() === '') {
          throw new Error('Empty response from server');
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Invalid JSON response');
        }

        // Handle error responses from API
        if (data.error) {
          throw new Error(data.error);
        }

        // Ensure data is an array
        if (!Array.isArray(data)) {
          throw new Error('Unexpected response format');
        }

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
    router.push(`/register?program=${program.slug}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (error || programs.length === 0) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
        <p className="text-gray-500 dark:text-gray-400">
          {error || 'Geen programma\'s beschikbaar op dit moment.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {programs.map((program, index) => {
        const Icon = tierIcons[program.tier] || Target;
        const isTarget = program.tier === 'transformatie';
        const isAnchor = program.tier === 'vip';
        const showBetaPrice = program.price_beta && program.price_beta < program.price_regular;
        const availability = availabilityData[program.tier];

        return (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`relative border-2 h-full flex flex-col transition-all hover:shadow-lg ${
                isTarget
                  ? 'border-gray-900 dark:border-pink-500 shadow-md'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Clean Top Badge */}
              {isTarget && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="outline" className="bg-white dark:bg-gray-900 border-gray-900 dark:border-pink-500 text-gray-900 dark:text-pink-400 px-3 py-1">
                    Populair
                  </Badge>
                </div>
              )}

              {/* Subtle availability indicator */}
              {availability?.limited && (
                <div className="absolute top-4 right-4">
                  <div className="w-2 h-2 rounded-full bg-orange-400 dark:bg-orange-500"></div>
                </div>
              )}

              <CardContent className="p-8 space-y-6 flex flex-col flex-grow">
                {/* Icon & Title */}
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">{program.name}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-400">{program.tagline}</p>
                  </div>
                </div>

                {/* Clean Pricing */}
                <div className="text-center py-4 border-y border-gray-100 dark:border-gray-700">
                  <div className="flex items-baseline justify-center gap-2 mb-1">
                    {showBetaPrice && (
                      <span className="text-lg text-gray-500 dark:text-gray-500 line-through">
                        €{program.price_regular}
                      </span>
                    )}
                    <span className="text-5xl font-bold text-gray-900 dark:text-gray-50">
                      €{showBetaPrice ? program.price_beta : program.price_regular}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-400 mt-2">
                    {program.duration_days} dagen toegang
                  </p>
                  {showBetaPrice && (
                    <Badge variant="outline" className="mt-2 text-xs border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      Bespaar €{program.price_regular - (program.price_beta || 0)}
                    </Badge>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 flex-grow">
                  <ul className="space-y-2.5">
                    {program.features.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Button
                  onClick={() => handleSelectProgram(program)}
                  variant={isTarget ? "default" : "outline"}
                  className={`w-full ${
                    isTarget
                      ? 'bg-gray-900 dark:bg-pink-600 hover:bg-gray-800 dark:hover:bg-pink-700 text-white'
                      : 'border-2 border-gray-200 dark:border-gray-600 hover:border-gray-900 dark:hover:border-pink-500 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {isTarget ? 'Kies dit programma' : 'Meer informatie'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {/* Subtle availability message */}
                {availability?.limited && (
                  <p className="text-xs text-center text-gray-700 dark:text-gray-400">
                    Beperkte beschikbaarheid
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
