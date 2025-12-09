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

  // Show on course overview pages, but NOT on lesson detail pages (which have inline chat)
  const isCursusPage = pathname?.startsWith('/cursus') || pathname?.startsWith('/cursussen');

  // Detect lesson detail pages: /cursussen/[slug]/[lesSlug] (3 segments after /cursussen)
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const isLessonDetailPage = pathSegments[0] === 'cursussen' && pathSegments.length >= 3;

  // Don't show floating button on lesson detail pages (they have inline IrisChatPanel)
  if (!isCursusPage || isLessonDetailPage) {
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