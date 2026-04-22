'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FloatingCoachButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

export function FloatingCoachButton({ onClick, isActive }: FloatingCoachButtonProps) {
  if (isActive) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 15 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label="Chat met Iris"
      className="fixed bottom-[76px] right-4 z-40 w-14 h-14 rounded-full bg-coral-500 hover:bg-coral-600 flex items-center justify-center md:hidden"
      style={{ boxShadow: '0 4px 20px rgba(239, 88, 73, 0.4)' }}
    >
      <MessageCircle className="w-6 h-6 text-white" />
      <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
    </motion.button>
  );
}
