"use client";

import { WifiOff, Wifi } from 'lucide-react';
import { usePWAStore } from '@/stores/pwa-store';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const { isOnline } = usePWAStore();
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      // Show "back online" message briefly
      setShowOnlineMessage(true);
      const timer = setTimeout(() => {
        setShowOnlineMessage(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Show offline banner
  if (!isOnline) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 shadow-lg"
        >
          <WifiOff className="w-4 h-4" />
          Je bent offline - Sommige functies zijn beperkt
        </motion.div>
      </AnimatePresence>
    );
  }

  // Show "back online" message
  if (showOnlineMessage) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[60] bg-emerald-500 text-white py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 shadow-lg"
        >
          <Wifi className="w-4 h-4" />
          Je bent weer online!
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}

// Small badge version for status display
export function OnlineStatusBadge() {
  const { isOnline } = usePWAStore();

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
      isOnline
        ? 'bg-emerald-50 text-emerald-600'
        : 'bg-amber-50 text-amber-600'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
      }`} />
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
}
