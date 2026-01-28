'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button-system';
import { CheckCircle, Lightbulb } from 'lucide-react';

/**
 * InsightSectie Component
 *
 * Handles insight-based sectie types:
 * - insight: Rich insights with contrast and key points
 * - wetenschap: Scientific explanations
 * - analyse: Analysis sections
 * - uitleg: Explanations
 * - regel: Rules
 *
 * Supports nested content with multiple block types:
 * - contrast blocks (two-column comparisons)
 * - kernpunt blocks (key takeaways)
 * - text blocks
 */

interface InsightSectieProps {
  sectie: any;
  isCompleted: boolean;
  onComplete: () => void;
}

export function InsightSectie({ sectie, isCompleted, onComplete }: InsightSectieProps) {
  const content = sectie.inhoud || {};

  // Check if content is an array (nested blocks) or object (simple structure)
  const isNestedContent = Array.isArray(content) ||
    (Object.keys(content).some(key => !isNaN(Number(key))));

  // Convert numbered keys to array if needed
  const contentBlocks = isNestedContent
    ? (Array.isArray(content) ? content : Object.values(content))
    : null;

  // Helper to render array of strings as list
  const renderList = (items: string[], color: string = 'pink') => {
    if (!items || !Array.isArray(items)) return null;
    return (
      <ul className="space-y-2">
        {items.map((item: string, idx: number) => (
          <li key={idx} className="text-sm text-gray-800 dark:text-gray-200 flex items-start gap-2">
            <span className={`text-${color}-500 mt-1`}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className="shadow-lg border-coral-100 dark:border-gray-700 dark:bg-gray-800 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{sectie.titel}</h3>
          </div>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Simple structure (object with intro, conclusie, etc.) */}
        {!isNestedContent && (
          <>
            {content.intro && (
              <p className="text-gray-700 dark:text-gray-200 mb-6 leading-relaxed">{content.intro}</p>
            )}

            {content.fases && Array.isArray(content.fases) && (
              <div className="space-y-4 mb-6">
                {content.fases.map((fase: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-lg border-2 border-coral-200 dark:border-coral-700 bg-gradient-to-r from-coral-50 to-coral-100 dark:from-coral-900/30 dark:to-coral-800/30">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-coral-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {fase.nummer || idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{fase.naam}</h4>
                        {fase.timing && <p className="text-xs text-coral-600 dark:text-coral-400 mb-2">{fase.timing}</p>}
                        {fase.basis && <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">{fase.basis}</p>}
                        {fase.probleem && (
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded border border-amber-200 dark:border-amber-700">
                            ⚠️ {fase.probleem}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {content.conclusie && (
              <div className="p-5 rounded-lg bg-gradient-to-r from-coral-100 to-coral-200 dark:from-coral-900/40 dark:to-coral-800/40 border-2 border-coral-300 dark:border-coral-700 mb-6">
                <p className="text-gray-900 dark:text-white font-semibold leading-relaxed">{content.conclusie}</p>
              </div>
            )}

            {/* Flexible rendering for common insight fields */}
            {content.wat && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700 mb-4">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Wat is dit?</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">{content.wat}</p>
              </div>
            )}

            {content.regel && (
              <div className="p-5 bg-gradient-to-r from-coral-100 to-coral-200 dark:from-coral-900/40 dark:to-coral-800/40 rounded-lg border-2 border-coral-300 dark:border-coral-700 mb-4">
                <p className="font-bold text-coral-900 dark:text-coral-300 text-lg mb-2">📜 De Regel:</p>
                <p className="text-gray-900 dark:text-white">{content.regel}</p>
              </div>
            )}

            {content.vraag && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border-l-4 border-purple-500 mb-4">
                <p className="text-gray-900 dark:text-white font-medium">{content.vraag}</p>
              </div>
            )}

            {content.probleem && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700 mb-4">
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 mb-2">⚠️ Het probleem:</p>
                <p className="text-sm text-amber-800 dark:text-amber-200">{content.probleem}</p>
              </div>
            )}

            {content.oplossing && (
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700 mb-4">
                <p className="text-xs font-semibold text-green-900 dark:text-green-300 mb-2">✅ De oplossing:</p>
                <p className="text-sm text-green-800 dark:text-green-200">{content.oplossing}</p>
              </div>
            )}

            {/* Render arrays */}
            {content.kenmerken && (
              <div className="mb-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Kenmerken:</p>
                {renderList(content.kenmerken)}
              </div>
            )}

            {content.waarom_drie && (
              <div className="mb-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Waarom 3 dates?</p>
                {renderList(content.waarom_drie)}
              </div>
            )}

            {content.waarom_vaak_beter && (
              <div className="mb-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Waarom dit vaak beter is:</p>
                {renderList(content.waarom_vaak_beter)}
              </div>
            )}

            {content.effecten && (
              <div className="mb-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Effecten:</p>
                {renderList(content.effecten)}
              </div>
            )}

            {content.uitzonderingen && (
              <div className="mb-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Uitzonderingen:</p>
                {renderList(content.uitzonderingen, 'amber')}
              </div>
            )}

            {content.niet_van_toepassing && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700 mb-4">
                <p className="text-xs font-semibold text-red-900 dark:text-red-300 mb-1">❌ Niet van toepassing als:</p>
                <p className="text-sm text-red-800 dark:text-red-200">{content.niet_van_toepassing}</p>
              </div>
            )}

            {content.beroemde_voorbeelden && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700 mb-4">
                <p className="text-xs font-semibold text-purple-900 dark:text-purple-300 mb-1">🎬 Voorbeelden:</p>
                <p className="text-sm text-purple-800 dark:text-purple-200">{content.beroemde_voorbeelden}</p>
              </div>
            )}
          </>
        )}

        {/* Nested content blocks (array with different block types) */}
        {isNestedContent && contentBlocks && (
          <div className="space-y-6 mb-6">
            {contentBlocks.map((block: any, idx: number) => {
              // Contrast block (two columns)
              if (block.type === 'contrast' && block.links && block.rechts) {
                return (
                  <div key={idx} className="grid md:grid-cols-2 gap-4">
                    {/* Links column */}
                    <div className="p-4 rounded-lg border-2 border-gray-300 bg-gray-50">
                      <h5 className="font-semibold text-gray-900 mb-3">{block.links.label}</h5>
                      {block.links.items && Array.isArray(block.links.items) && (
                        <ul className="space-y-2">
                          {block.links.items.map((item: string, iidx: number) => (
                            <li key={iidx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-gray-400 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Rechts column */}
                    <div className="p-4 rounded-lg border-2 border-green-300 bg-green-50">
                      <h5 className="font-semibold text-gray-900 mb-3">{block.rechts.label}</h5>
                      {block.rechts.items && Array.isArray(block.rechts.items) && (
                        <ul className="space-y-2">
                          {block.rechts.items.map((item: string, iidx: number) => (
                            <li key={iidx} className="text-sm text-green-800 flex items-start gap-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              }

              // Kernpunt block (key takeaway)
              if (block.type === 'kernpunt') {
                return (
                  <div key={idx} className="p-5 rounded-lg bg-gradient-to-r from-coral-100 to-coral-200 border-l-4 border-coral-500">
                    <p className="text-gray-900 font-bold text-lg mb-2">{block.tekst}</p>
                    {block.toelichting && (
                      <p className="text-gray-700 text-sm leading-relaxed">{block.toelichting}</p>
                    )}
                  </div>
                );
              }

              // Text block
              if (typeof block === 'string') {
                return (
                  <p key={idx} className="text-gray-700 leading-relaxed">{block}</p>
                );
              }

              // Fallback for unknown block types
              return (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(block, null, 2)}
                  </pre>
                </div>
              );
            })}
          </div>
        )}

        {/* Complete button */}
        {!isCompleted && (
          <PrimaryButton
            onClick={onComplete}
            className="bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Begrepen!
          </PrimaryButton>
        )}
      </CardContent>
    </Card>
  );
}
