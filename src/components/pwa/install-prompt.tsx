"use client";

import { useState, useEffect, useCallback } from 'react';
import { X, Download, Smartphone, Zap, Bell, Wifi, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { useShowInstallPrompt, usePWAStore } from '@/stores/pwa-store';
import { useUser } from '@/providers/user-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

// ============================================
// WORLD-CLASS PWA INSTALL PROMPT
// Only for authenticated users with smart triggers
// ============================================

const INSTALL_TRIGGER_KEY = 'pwa-install-trigger-shown';
const IRIS_CHAT_COUNT_KEY = 'iris-chat-count';

// Smart trigger conditions
interface TriggerCondition {
  name: string;
  check: () => boolean;
  message: string;
  icon: React.ReactNode;
}

export function InstallPrompt() {
  const showPrompt = useShowInstallPrompt();
  const { promptInstall, setInstallDismissed, isInstalled } = usePWAStore();
  const { user } = useUser();
  const pathname = usePathname();

  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [triggerContext, setTriggerContext] = useState<{
    message: string;
    icon: React.ReactNode;
  } | null>(null);

  // Check if user has interacted with Iris
  const hasIrisInteraction = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const chatCount = parseInt(localStorage.getItem(IRIS_CHAT_COUNT_KEY) || '0', 10);
    return chatCount >= 1;
  }, []);

  // Check if already shown this session
  const hasShownThisSession = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(INSTALL_TRIGGER_KEY) === 'true';
  }, []);

  // Mark as shown this session
  const markAsShown = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(INSTALL_TRIGGER_KEY, 'true');
    }
  }, []);

  // Smart trigger conditions
  const triggerConditions: TriggerCondition[] = [
    {
      name: 'after-iris-chat',
      check: () => pathname === '/chat' && hasIrisInteraction(),
      message: 'Neem Iris overal mee naartoe',
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      name: 'on-dashboard',
      check: () => pathname === '/dashboard',
      message: 'Je voortgang altijd bij de hand',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      name: 'after-tool-use',
      check: () => pathname?.startsWith('/tools/') || pathname === '/waarden-kompas',
      message: 'Toegang tot alle tools, ook offline',
      icon: <Heart className="w-5 h-5" />,
    },
    {
      name: 'on-profile',
      check: () => pathname === '/profiel',
      message: 'Je profiel tips direct ontvangen',
      icon: <Bell className="w-5 h-5" />,
    },
  ];

  // Determine if and when to show the prompt
  useEffect(() => {
    // Prerequisites check
    if (!showPrompt || !user || isInstalled || hasShownThisSession()) {
      return;
    }

    // Find matching trigger
    const matchingTrigger = triggerConditions.find(t => t.check());

    if (matchingTrigger) {
      // Delay to not interrupt user flow
      const timer = setTimeout(() => {
        setTriggerContext({
          message: matchingTrigger.message,
          icon: matchingTrigger.icon,
        });
        setIsVisible(true);
        markAsShown();
      }, 3000); // Show after 3 seconds on relevant page

      return () => clearTimeout(timer);
    }

    // Fallback: show after 45 seconds on any authenticated page
    const fallbackTimer = setTimeout(() => {
      if (user && showPrompt && !isInstalled) {
        setTriggerContext({
          message: 'De volledige app-ervaring',
          icon: <Smartphone className="w-5 h-5" />,
        });
        setIsVisible(true);
        markAsShown();
      }
    }, 45000);

    return () => clearTimeout(fallbackTimer);
  }, [showPrompt, user, isInstalled, pathname, hasShownThisSession, markAsShown, hasIrisInteraction, triggerConditions]);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await promptInstall();
    setIsInstalling(false);

    if (success) {
      setIsVisible(false);
      // Track successful install
      if (typeof window !== 'undefined') {
        localStorage.setItem('pwa-installed-at', new Date().toISOString());
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setInstallDismissed(true);
  };

  // Don't render if not visible or user not logged in
  if (!isVisible || !user) return null;

  const userName = user.name?.split(' ')[0] || 'daar';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-pink-100 overflow-hidden">
          {/* Animated gradient header */}
          <div className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 p-5 text-white overflow-hidden">
            {/* Animated background shapes */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"
              />
              <motion.div
                animate={{
                  rotate: [360, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -bottom-5 -left-5 w-24 h-24 bg-white/10 rounded-full"
              />
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/20 transition-colors z-10"
              aria-label="Sluiten"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header content */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
                >
                  {triggerContext?.icon || <Smartphone className="w-8 h-8" />}
                </motion.div>
                <div>
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-bold text-lg"
                  >
                    Hey {userName}!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-white/90"
                  >
                    {triggerContext?.message || 'Krijg de volledige app-ervaring'}
                  </motion.p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits with staggered animation */}
          <div className="p-4 space-y-2.5">
            {[
              { icon: <Zap className="w-4 h-4 text-pink-500" />, text: "Direct openen vanaf je homescreen" },
              { icon: <Bell className="w-4 h-4 text-pink-500" />, text: "Coaching tips & reminders ontvangen" },
              { icon: <Wifi className="w-4 h-4 text-pink-500" />, text: "Werkt ook zonder internet" },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 text-gray-700"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center flex-shrink-0 border border-pink-100">
                  {benefit.icon}
                </div>
                <span className="text-sm font-medium">{benefit.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-4 pt-2 flex gap-3">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={handleDismiss}
              className="flex-1 py-3 px-4 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Misschien later
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isInstalling ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Installeren
                </>
              )}
            </motion.button>
          </div>

          {/* Trust indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="px-4 pb-4"
          >
            <p className="text-xs text-center text-gray-400">
              Gratis en neemt minder dan 1MB ruimte in
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Compact version for header/navbar - also only for logged in users
export function InstallButton() {
  const showPrompt = useShowInstallPrompt();
  const { promptInstall } = usePWAStore();
  const { user } = useUser();
  const [isInstalling, setIsInstalling] = useState(false);

  // Only show for logged in users
  if (!showPrompt || !user) return null;

  const handleInstall = async () => {
    setIsInstalling(true);
    await promptInstall();
    setIsInstalling(false);
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={handleInstall}
      disabled={isInstalling}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
    >
      {isInstalling ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
        />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">App installeren</span>
    </motion.button>
  );
}

// Hook to track Iris interactions (call this from chat component)
export function useTrackIrisChat() {
  const incrementChatCount = useCallback(() => {
    if (typeof window === 'undefined') return;
    const current = parseInt(localStorage.getItem(IRIS_CHAT_COUNT_KEY) || '0', 10);
    localStorage.setItem(IRIS_CHAT_COUNT_KEY, String(current + 1));
  }, []);

  return { incrementChatCount };
}
