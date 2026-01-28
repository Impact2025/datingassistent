'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button-system';
import { CheckCircle } from 'lucide-react';

/**
 * ExamplesSectie Component
 *
 * Handles example-based sectie types:
 * - praktijk: Practical examples (vaag vs concreet)
 * - voorbeelden: Good vs bad examples
 * - skill: Skill demonstrations
 * - techniek: Technique examples
 *
 * Supports different comparison patterns:
 * - vaag vs concreet
 * - niet vs wel
 * - fout vs goed
 */

interface ExamplesSectieProps {
  sectie: any;
  isCompleted: boolean;
  onComplete: () => void;
}

export function ExamplesSectie({ sectie, isCompleted, onComplete }: ExamplesSectieProps) {
  const content = sectie.inhoud || {};

  // Detect which type of examples structure we have
  const voorbeelden = content.voorbeelden || {};
  const hasVaagConcreet = voorbeelden.vaag && voorbeelden.concreet;
  const hasNietWel = content.niet && content.wel;
  const hasFoutGoed = content.fout && content.goed;

  return (
    <Card className="shadow-lg border-coral-100 dark:border-gray-700 dark:bg-gray-800 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{sectie.titel}</h3>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Intro text */}
        {content.intro && (
          <p className="text-gray-700 dark:text-gray-200 mb-6 leading-relaxed">{content.intro}</p>
        )}

        {/* Type 1: Vaag vs Concreet */}
        {hasVaagConcreet && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Vaag column */}
            <div className="p-5 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-red-500">❌</span> Vaag
              </h4>
              <ul className="space-y-2">
                {voorbeelden.vaag.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-200 p-2 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Concreet column */}
            <div className="p-5 rounded-lg border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30">
              <h4 className="font-bold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
                <span className="text-green-500">✓</span> Concreet
              </h4>
              <ul className="space-y-2">
                {voorbeelden.concreet.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-green-800 dark:text-green-200 p-2 bg-white dark:bg-green-800/30 rounded border border-green-200 dark:border-green-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Proces examples (if available in voorbeelden) */}
        {voorbeelden.proces && Array.isArray(voorbeelden.proces) && (
          <div className="mt-6 p-5 rounded-lg bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
              <span>🎯</span> Procesdoelen (beter dan resultaatdoelen!)
            </h4>
            <ul className="space-y-2">
              {voorbeelden.proces.map((item: string, idx: number) => (
                <li key={idx} className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Type 2: Niet vs Wel */}
        {hasNietWel && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Niet column */}
            <div className="p-5 rounded-lg border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30">
              <h4 className="font-bold text-red-900 dark:text-red-300 mb-3 flex items-center gap-2">
                <span className="text-red-500">❌</span> Niet doen
              </h4>
              <ul className="space-y-2">
                {content.niet.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-red-800 dark:text-red-200 p-2 bg-white dark:bg-red-800/30 rounded border border-red-200 dark:border-red-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Wel column */}
            <div className="p-5 rounded-lg border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30">
              <h4 className="font-bold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
                <span className="text-green-500">✓</span> Wel doen
              </h4>
              <ul className="space-y-2">
                {content.wel.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-green-800 dark:text-green-200 p-2 bg-white dark:bg-green-800/30 rounded border border-green-200 dark:border-green-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Type 3: Fout vs Goed */}
        {hasFoutGoed && (
          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30">
              <p className="text-xs font-semibold text-red-900 dark:text-red-300 mb-2">❌ Fout:</p>
              <p className="text-sm text-red-800 dark:text-red-200">{content.fout}</p>
            </div>
            <div className="p-4 rounded-lg border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30">
              <p className="text-xs font-semibold text-green-900 dark:text-green-300 mb-2">✓ Goed:</p>
              <p className="text-sm text-green-800 dark:text-green-200">{content.goed}</p>
            </div>
            {content.waarom && (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">Waarom:</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">{content.waarom}</p>
              </div>
            )}
          </div>
        )}

        {/* Tip / Formule */}
        {(content.tip || content.formule) && (
          <div className="p-5 rounded-lg bg-gradient-to-r from-coral-100 to-coral-200 dark:from-coral-900/40 dark:to-coral-800/40 border-l-4 border-coral-500 mb-6">
            <p className="text-sm font-semibold text-coral-900 dark:text-coral-300 mb-2">💡 Tip:</p>
            <p className="text-gray-900 dark:text-white leading-relaxed">{content.tip || content.formule}</p>
          </div>
        )}

        {/* Complete button */}
        {!isCompleted && (
          <PrimaryButton
            onClick={onComplete}
            className="bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Voorbeelden bekeken!
          </PrimaryButton>
        )}
      </CardContent>
    </Card>
  );
}
