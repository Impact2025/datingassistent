'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface Suggestion {
  id: string;
  label: string;
  icon?: LucideIcon;
  action: () => void;
}

interface CoachSuggestionsProps {
  suggestions: Suggestion[];
  title?: string;
}

export function CoachSuggestions({ suggestions, title = "Snelle acties" }: CoachSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      {title && (
        <p className="text-xs text-gray-500 mb-2 px-1">{title}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={suggestion.action}
            className="px-4 py-2 bg-white hover:bg-coral-50 border border-gray-200 hover:border-coral-300
                       rounded-full text-sm text-gray-700 hover:text-coral-600
                       transition-all shadow-sm hover:shadow-md
                       flex items-center gap-2"
          >
            {suggestion.icon && <suggestion.icon className="w-4 h-4" />}
            {suggestion.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
