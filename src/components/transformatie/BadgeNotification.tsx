'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Target, Compass, MessageCircle, Mic, Zap, Heart, PenTool,
  BookOpen, Star, CheckCircle2, TrendingUp, Sparkles, Flame, Mountain } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Award, Target, Compass, MessageCircle, Mic, Zap, Heart, PenTool,
  BookOpen, Star, CheckCircle2, TrendingUp, Sparkles, Flame, Mountain,
};

interface Badge {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
}

interface BadgeNotificationProps {
  badges: Badge[];
  onDismiss: () => void;
}

export function BadgeNotification({ badges, onDismiss }: BadgeNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (badges.length === 0) return null;

  const badge = badges[0];
  const IconComponent = ICON_MAP[badge.icon] ?? Award;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-80 max-w-[90vw]"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-yellow-200 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-400 px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              🏅 Badge verdiend!
            </span>
            <button onClick={onDismiss} className="text-white/80 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="px-4 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center shrink-0">
              <IconComponent className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-800 text-sm">{badge.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed mt-0.5 line-clamp-2">{badge.description}</p>
            </div>
          </div>
          {badges.length > 1 && (
            <div className="px-4 pb-3 text-xs text-gray-400 text-center">
              +{badges.length - 1} andere badge{badges.length > 2 ? 's' : ''} verdiend
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
