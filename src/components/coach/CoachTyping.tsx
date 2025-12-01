'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function CoachTyping() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mb-4"
    >
      <div className="flex gap-3 max-w-[80%]">
        {/* Avatar */}
        <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>

        {/* Typing Bubble */}
        <div className="px-4 py-3 bg-white shadow-sm border border-gray-100 rounded-2xl">
          <div className="flex gap-1.5">
            <motion.span
              className="w-2 h-2 bg-pink-400 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="w-2 h-2 bg-pink-400 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
            <motion.span
              className="w-2 h-2 bg-pink-400 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
