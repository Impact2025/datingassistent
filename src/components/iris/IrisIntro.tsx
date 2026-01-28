'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronDown } from 'lucide-react';
import type { IrisMessage } from '@/types/iris.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface IrisIntroProps {
  dayNumber: number;
  dayTopic?: string;
  onDismiss?: () => void;
}

export function IrisIntro({ dayNumber, dayTopic, onDismiss }: IrisIntroProps) {
  const [message, setMessage] = useState<IrisMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed in modal
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadMessage();
  }, [dayNumber]);

  const loadMessage = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('datespark_auth_token');

      const params = new URLSearchParams({
        dayNumber: dayNumber.toString(),
        ...(dayTopic && { dayTopic }),
      });

      const response = await fetch(`/api/iris/message?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage(data.message);
        }
      }
    } catch (error) {
      console.error('Error loading Iris message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  if (loading || !message || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.3 }}
        className="mb-6"
      >
        <Card className="relative overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-coral-50 to-coral-100 shadow-lg">
          {/* Animated Background Effect */}
          <div className="absolute inset-0 opacity-30">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-purple-300 to-coral-300 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [90, 0, 90],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br from-coral-300 to-purple-300 blur-3xl"
            />
          </div>

          <div className="relative">
            {/* Header */}
            <div className="flex items-start justify-between p-4 pb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-coral-400 flex items-center justify-center shadow-md"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-purple-900 dark:text-purple-100">Iris</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 font-medium">
                      Je AI Coach
                    </span>
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-300">Persoonlijk bericht voor jou</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 p-0 hover:bg-purple-100"
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-4 h-4 text-purple-600" />
                  </motion.div>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-8 w-8 p-0 hover:bg-purple-100"
                >
                  <X className="w-4 h-4 text-purple-600" />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    {/* Message Content */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl p-4 shadow-sm border border-purple-100 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{message.emoji}</span>
                        <h4 className="font-bold text-gray-900 dark:text-white">{message.title}</h4>
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{message.message}</p>

                      {message.actionPrompt && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="mt-3 pt-3 border-t border-purple-100 dark:border-purple-800"
                        >
                          <p className="text-sm text-purple-700 dark:text-purple-300 font-medium flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            {message.actionPrompt}
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* 🧠 Pattern Insights (Iris Memory Magic!) */}
                    {message.context?.patterns && message.context.patterns.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-3 space-y-2"
                      >
                        {message.context.patterns.map((pattern: any, index: number) => (
                          <div
                            key={index}
                            className={cn(
                              'bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-lg p-3 border-l-4',
                              pattern.color === 'green' && 'border-green-500',
                              pattern.color === 'orange' && 'border-orange-500',
                              pattern.color === 'purple' && 'border-purple-500',
                              pattern.color === 'gray' && 'border-gray-400'
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">{pattern.emoji}</span>
                              <h5 className="font-bold text-sm text-gray-900 dark:text-white">{pattern.title}</h5>
                            </div>
                            <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">{pattern.message}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Quick Stats (if available) */}
                    {message.context && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-3 flex gap-2"
                      >
                        {message.context.streak && (
                          <div className="flex-1 bg-white/60 dark:bg-gray-700/60 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                              {message.context.streak}🔥
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">Streak</div>
                          </div>
                        )}
                        {message.context.completedDays && (
                          <div className="flex-1 bg-white/60 dark:bg-gray-700/60 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {message.context.completedDays}/21
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">Dagen</div>
                          </div>
                        )}
                        {message.context.percentage && (
                          <div className="flex-1 bg-white/60 dark:bg-gray-700/60 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              {message.context.percentage}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">Voltooid</div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
