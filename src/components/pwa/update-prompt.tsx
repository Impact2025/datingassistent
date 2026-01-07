"use client";

import { RefreshCw, Sparkles } from 'lucide-react';
import { usePWAStore } from '@/stores/pwa-store';
import { motion, AnimatePresence } from 'framer-motion';

export function UpdatePrompt() {
  const { updateAvailable, applyUpdate } = usePWAStore();

  if (!updateAvailable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed top-4 left-4 right-4 z-50 md:left-1/2 md:-translate-x-1/2 md:max-w-md"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-2xl p-4 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold">Nieuwe versie beschikbaar!</h3>
              <p className="text-sm text-white/90 truncate">
                Update voor de beste ervaring
              </p>
            </div>
            <button
              onClick={applyUpdate}
              className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-white/90 transition-colors flex-shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              Update
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
