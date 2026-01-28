'use client';

import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface IrisInlineFeedbackProps {
  feedback: string | null;
  isLoading?: boolean;
}

export function IrisInlineFeedback({ feedback, isLoading }: IrisInlineFeedbackProps) {
  if (!feedback && !isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 bg-gradient-to-r from-coral-50 to-coral-100 dark:from-coral-900/30 dark:to-coral-800/30
                 rounded-xl p-4 border border-coral-100 dark:border-coral-800"
    >
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-coral-500 to-coral-600
                        rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-coral-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-coral-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-coral-400 rounded-full animate-bounce delay-200" />
              </div>
              <span className="text-sm">Iris denkt na...</span>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{feedback}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}