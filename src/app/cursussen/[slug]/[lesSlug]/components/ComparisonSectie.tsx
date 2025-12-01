'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button-system';
import { CheckCircle, ArrowRight } from 'lucide-react';

/**
 * ComparisonSectie Component
 *
 * Handles multiple comparison-based sectie types:
 * - framework: Two-column comparison (e.g., "Eenzaamheid vs. Verlangen")
 * - contrast: Side-by-side contrast
 * - transformatie: From → To transformation
 * - myth-bust: Myth vs. Reality
 * - mindset: Mindset shifts
 */

interface ComparisonSectieProps {
  sectie: any;
  isCompleted: boolean;
  onComplete: () => void;
}

export function ComparisonSectie({ sectie, isCompleted, onComplete }: ComparisonSectieProps) {
  const content = sectie.inhoud || {};

  // Detect which type of comparison structure we have
  const hasVergelijking = content.vergelijking && Array.isArray(content.vergelijking);
  const hasVanNaar = content.van_naar && Array.isArray(content.van_naar);
  const hasLinksRechts = content.links && content.rechts;

  return (
    <Card className="shadow-lg border-pink-100 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{sectie.titel}</h3>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Intro text */}
        {content.intro && (
          <p className="text-gray-700 mb-6 leading-relaxed">{content.intro}</p>
        )}

        {/* Type 1: Vergelijking (framework) */}
        {hasVergelijking && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {content.vergelijking.map((item: any, idx: number) => {
              const kleurClass = item.kleur === 'warning'
                ? 'border-amber-300 bg-amber-50'
                : item.kleur === 'success'
                ? 'border-green-300 bg-green-50'
                : 'border-pink-300 bg-pink-50';

              return (
                <div key={idx} className={`p-5 rounded-lg border-2 ${kleurClass}`}>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">{item.type}</h4>

                  {item.kenmerken && Array.isArray(item.kenmerken) && (
                    <ul className="space-y-2 mb-4">
                      {item.kenmerken.map((kenmerk: string, kidx: number) => (
                        <li key={kidx} className="text-sm text-gray-800 flex items-start gap-2">
                          <span className="text-pink-500 mt-1">•</span>
                          <span>{kenmerk}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.gevolg && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Gevolg:</p>
                      <p className="text-sm text-gray-800 italic">{item.gevolg}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Type 2: Van → Naar (transformatie) */}
        {hasVanNaar && (
          <div className="space-y-4 mb-6">
            {content.van_naar.map((item: any, idx: number) => (
              <div key={idx} className="flex items-start gap-4 p-5 rounded-lg border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium mb-1">Van:</p>
                      <p className="text-gray-800 line-through opacity-70">{item.van}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-pink-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-green-600 font-medium mb-1">Naar:</p>
                      <p className="text-gray-900 font-semibold">{item.naar}</p>
                    </div>
                  </div>
                  {item.waarom && (
                    <p className="text-sm text-gray-600 mt-3 pl-4 border-l-2 border-pink-300">
                      <span className="font-medium">Waarom:</span> {item.waarom}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Type 3: Links vs Rechts (contrast) */}
        {hasLinksRechts && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Links */}
            <div className="p-5 rounded-lg border-2 border-gray-300 bg-gray-50">
              <h4 className="font-bold text-gray-900 mb-3 text-lg">
                {content.links.label || 'Links'}
              </h4>

              {content.links.kenmerken && Array.isArray(content.links.kenmerken) && (
                <ul className="space-y-2 mb-4">
                  {content.links.kenmerken.map((kenmerk: string, kidx: number) => (
                    <li key={kidx} className="text-sm text-gray-800 flex items-start gap-2">
                      <span className="text-gray-500 mt-1">•</span>
                      <span>{kenmerk}</span>
                    </li>
                  ))}
                </ul>
              )}

              {content.links.resultaat && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Resultaat:</p>
                  <p className="text-sm text-gray-800 italic">{content.links.resultaat}</p>
                </div>
              )}
            </div>

            {/* Rechts */}
            <div className="p-5 rounded-lg border-2 border-green-300 bg-green-50">
              <h4 className="font-bold text-gray-900 mb-3 text-lg">
                {content.rechts.label || 'Rechts'}
              </h4>

              {content.rechts.kenmerken && Array.isArray(content.rechts.kenmerken) && (
                <ul className="space-y-2 mb-4">
                  {content.rechts.kenmerken.map((kenmerk: string, kidx: number) => (
                    <li key={kidx} className="text-sm text-gray-800 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{kenmerk}</span>
                    </li>
                  ))}
                </ul>
              )}

              {content.rechts.resultaat && (
                <div className="mt-4 pt-4 border-t border-green-300">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Resultaat:</p>
                  <p className="text-sm text-gray-800 italic">{content.rechts.resultaat}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conclusie / Kernboodschap */}
        {(content.conclusie || content.kernboodschap) && (
          <div className="p-5 rounded-lg bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 mb-6">
            <p className="text-gray-900 font-semibold leading-relaxed">
              {content.conclusie || content.kernboodschap}
            </p>
          </div>
        )}

        {/* Complete button */}
        {!isCompleted && (
          <PrimaryButton
            onClick={onComplete}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Begrepen!
          </PrimaryButton>
        )}
      </CardContent>
    </Card>
  );
}
