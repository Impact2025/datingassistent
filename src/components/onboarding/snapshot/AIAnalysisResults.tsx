'use client';

/**
 * AI Analysis Results Component
 *
 * World-class display of AI-generated Dating Snapshot insights.
 * Shows personalized analysis with beautiful, engaging cards.
 */

import { motion } from 'framer-motion';
import {
  Battery,
  Heart,
  Target,
  Lightbulb,
  ArrowRight,
  Sparkles,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SnapshotAIAnalysis } from '@/lib/ai/snapshot-analysis-types';
import {
  ENERGY_PROFILE_TEXTS,
  ATTACHMENT_STYLE_TEXTS,
  PAIN_POINT_TEXTS,
} from '@/types/dating-snapshot.types';

interface AIAnalysisResultsProps {
  analysis: SnapshotAIAnalysis;
  userName: string;
  onContinue: () => void;
}

export function AIAnalysisResults({ analysis, userName, onContinue }: AIAnalysisResultsProps) {
  const { energyProfileAnalysis, attachmentStyleAnalysis, painPointAnalysis, crossCorrelationInsights, coachingPreview } = analysis;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-coral-100 to-purple-100 rounded-full text-coral-700 text-sm font-medium mb-4"
        >
          <Sparkles className="w-4 h-4" />
          AI Analyse Compleet
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {userName}, hier is wat ik zie
        </h1>

        {coachingPreview.personalizedGreeting && (
          <p className="text-gray-600 max-w-md mx-auto">
            {coachingPreview.personalizedGreeting}
          </p>
        )}
      </motion.div>

      {/* Main insight cards */}
      <div className="space-y-5 mb-8">
        {/* Energy Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg shadow-blue-100/50 border border-blue-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Battery className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Je Energie DNA</h3>
              <p className="text-sm text-gray-500">
                {ENERGY_PROFILE_TEXTS[energyProfileAnalysis.profile]} -{' '}
                {energyProfileAnalysis.score}% introvert
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-4 leading-relaxed">
            {energyProfileAnalysis.nuancedInterpretation}
          </p>

          {/* Strengths & Watch-outs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Je sterke punten
              </h4>
              <ul className="space-y-1.5">
                {energyProfileAnalysis.strengthsInDating.map((strength, i) => (
                  <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">+</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Let hierop
              </h4>
              <ul className="space-y-1.5">
                {energyProfileAnalysis.watchOuts.map((watchOut, i) => (
                  <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">!</span>
                    <span>{watchOut}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Attachment Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg shadow-purple-100/50 border border-purple-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Heart className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">Je Hechtingsstijl</h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                  Voorlopig
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {ATTACHMENT_STYLE_TEXTS[attachmentStyleAnalysis.style]} (
                {attachmentStyleAnalysis.confidence}% match)
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-4 leading-relaxed">
            {attachmentStyleAnalysis.interpretation}
          </p>

          {/* Trigger patterns */}
          {attachmentStyleAnalysis.triggerPatterns.length > 0 && (
            <div className="bg-purple-50 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-semibold text-purple-800 mb-2">
                Wat je mogelijk triggert in dating
              </h4>
              <ul className="space-y-1.5">
                {attachmentStyleAnalysis.triggerPatterns.map((trigger, i) => (
                  <li key={i} className="text-sm text-purple-700 flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>{trigger}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Growth areas */}
          {attachmentStyleAnalysis.growthAreas.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachmentStyleAnalysis.growthAreas.map((area, i) => (
                <span
                  key={i}
                  className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
                >
                  {area}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm text-gray-500 italic border-t border-purple-100 pt-3 mt-1">
            In Module 2 krijg je de volledige hechtingsstijl analyse met concrete tools.
          </p>
        </motion.div>

        {/* Pain Point Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg shadow-orange-100/50 border border-orange-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Je Grootste Uitdaging</h3>
              <p className="text-sm text-gray-500">
                {PAIN_POINT_TEXTS[painPointAnalysis.primary]}
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-3 leading-relaxed">
            {painPointAnalysis.rootCauseAnalysis}
          </p>

          {painPointAnalysis.connectionToProfile && (
            <p className="text-gray-600 mb-4 text-sm bg-orange-50 p-3 rounded-lg">
              <strong className="text-orange-800">Hoe dit samenhangt:</strong>{' '}
              {painPointAnalysis.connectionToProfile}
            </p>
          )}

          {/* Immediate action steps */}
          {painPointAnalysis.immediateActionSteps.length > 0 && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-orange-800 mb-3">
                Dit kun je nu al doen
              </h4>
              <ul className="space-y-2">
                {painPointAnalysis.immediateActionSteps.map((step, i) => (
                  <li key={i} className="text-sm text-orange-700 flex items-start gap-3">
                    <span className="bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-medium">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        {/* Cross-Correlation Insights */}
        {crossCorrelationInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-gradient-to-br from-coral-50 to-purple-50 rounded-2xl p-5 sm:p-6 border border-coral-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-coral-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-coral-200">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Wat Iris Ziet</h3>
                <p className="text-sm text-gray-500">Unieke verbanden in jouw profiel</p>
              </div>
            </div>

            <div className="space-y-4">
              {crossCorrelationInsights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="bg-white/80 backdrop-blur rounded-xl p-4 border border-coral-100"
                >
                  {/* Factors tags */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {insight.factors.map((factor, j) => (
                      <span
                        key={j}
                        className="text-xs bg-coral-100 text-coral-700 px-2 py-0.5 rounded-full"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-800 font-medium mb-1.5">{insight.insight}</p>
                  <p className="text-sm text-gray-600 mb-2">{insight.implication}</p>
                  <p className="text-sm text-coral-700 font-medium flex items-start gap-1.5">
                    <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {insight.recommendation}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* What's Next - Coaching Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-gray-900 text-white rounded-2xl p-5 sm:p-6"
        >
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-coral-400" />
            Waar we aan gaan werken
          </h3>

          {/* What Iris noticed */}
          {coachingPreview.whatIrisNoticed.length > 0 && (
            <div className="mb-5">
              <p className="text-sm text-gray-400 mb-2">Wat mij opviel:</p>
              <ul className="space-y-1.5">
                {coachingPreview.whatIrisNoticed.map((notice, i) => (
                  <li key={i} className="text-gray-300 flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-coral-400 flex-shrink-0 mt-0.5" />
                    {notice}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Focus areas */}
          {coachingPreview.focusAreasForProgram.length > 0 && (
            <div className="mb-5">
              <p className="text-sm text-gray-400 mb-2">Focus gebieden:</p>
              <ul className="space-y-1.5">
                {coachingPreview.focusAreasForProgram.map((area, i) => (
                  <li key={i} className="text-gray-300 flex items-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-coral-400 flex-shrink-0" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Expected breakthroughs */}
          {coachingPreview.expectedBreakthroughs.length > 0 && (
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-coral-300 mb-2">
                Doorbraken die je kunt verwachten:
              </p>
              <ul className="space-y-1">
                {coachingPreview.expectedBreakthroughs.map((breakthrough, i) => (
                  <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-coral-400">•</span>
                    {breakthrough}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* First week focus */}
          {coachingPreview.firstWeekFocus && (
            <p className="text-sm border-t border-white/10 pt-4">
              <span className="text-gray-400">Week 1 focus:</span>{' '}
              <span className="text-white font-medium">{coachingPreview.firstWeekFocus}</span>
            </p>
          )}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white py-6 text-lg font-semibold rounded-2xl shadow-lg shadow-coral-200/50 touch-manipulation active:scale-[0.98] transition-transform"
        >
          Start Module 1
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        {analysis.cached && (
          <p className="text-center text-xs text-gray-400 mt-3">
            Analyse uit cache geladen
          </p>
        )}
      </motion.div>
    </div>
  );
}
