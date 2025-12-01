'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X } from 'lucide-react';
import { IrisChatPanel } from './IrisChatPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/providers/user-provider';

export function IrisFloatingButton() {
  const { user } = useUser();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Only show button for logged-in users (registered members)
  if (!user) {
    return null;
  }

  // Show on course pages (/cursus and /cursussen)
  const isCursusPage = pathname?.startsWith('/cursus') || pathname?.startsWith('/cursussen');
  if (!isCursusPage) {
    return null;
  }

  return (
    <>
      {/* Floating Button - Dashboard Style */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40
                   bg-pink-500 hover:bg-pink-600
                   text-white px-4 py-3 rounded-full shadow-lg
                   flex items-center gap-2
                   hover:shadow-xl transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Iris Insights</span>
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