'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface CoachMessageProps {
  type: 'coach' | 'user';
  content: string;
  timestamp?: Date;
}

export function CoachMessage({ type, content, timestamp }: CoachMessageProps) {
  const isCoach = type === 'coach';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isCoach ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`flex gap-3 max-w-[80%] ${!isCoach && 'flex-row-reverse'}`}>
        {/* Avatar */}
        {isCoach && (
          <div className="w-8 h-8 bg-coral-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl ${
            isCoach
              ? 'bg-white shadow-sm border border-gray-100'
              : 'bg-coral-500 text-white'
          }`}
        >
          <p className={`text-sm leading-relaxed ${isCoach ? 'text-gray-800' : 'text-white'}`}>
            {content}
          </p>
          {timestamp && (
            <p className={`text-xs mt-1 ${isCoach ? 'text-gray-400' : 'text-coral-100'}`}>
              {timestamp.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
