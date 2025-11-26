'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { IrisChatPanel } from './IrisChatPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/providers/user-provider';

export function IrisFloatingButton() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  // Only show button for unlogged users
  if (user) {
    return null;
  }

  return (
    <>
      {/* Floating Button - Rechts op scherm zoals in screenshots */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40
                   bg-gradient-to-r from-pink-500 to-pink-600
                   text-white px-4 py-3 rounded-full shadow-lg
                   flex items-center gap-2
                   hover:shadow-xl transition-all hover:scale-105"
        whileHover={{ x: -4 }}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Vraag Iris</span>
          </>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <IrisChatPanel onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}