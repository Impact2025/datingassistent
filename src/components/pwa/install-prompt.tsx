"use client";

import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Zap, Bell, Wifi } from 'lucide-react';
import { useShowInstallPrompt, usePWAStore } from '@/stores/pwa-store';
import { motion, AnimatePresence } from 'framer-motion';

export function InstallPrompt() {
  const showPrompt = useShowInstallPrompt();
  const { promptInstall, setInstallDismissed } = usePWAStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Delay showing the prompt to not interrupt initial experience
  useEffect(() => {
    if (showPrompt) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [showPrompt]);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await promptInstall();
    setIsInstalling(false);

    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setInstallDismissed(true);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-pink-100 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 text-white relative">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Sluiten"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Installeer DatingAssistent</h3>
                <p className="text-sm text-white/90">Krijg de volledige app-ervaring</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-pink-500" />
              </div>
              <span className="text-sm">Supersnelle laadtijden</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 text-pink-500" />
              </div>
              <span className="text-sm">Push notificaties voor coaching tips</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                <Wifi className="w-4 h-4 text-pink-500" />
              </div>
              <span className="text-sm">Werkt ook offline</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 pt-0 flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-3 px-4 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isInstalling ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Installeren
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Compact version for header/navbar
export function InstallButton() {
  const showPrompt = useShowInstallPrompt();
  const { promptInstall } = usePWAStore();
  const [isInstalling, setIsInstalling] = useState(false);

  if (!showPrompt) return null;

  const handleInstall = async () => {
    setIsInstalling(true);
    await promptInstall();
    setIsInstalling(false);
  };

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
    >
      {isInstalling ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">Installeren</span>
    </button>
  );
}
