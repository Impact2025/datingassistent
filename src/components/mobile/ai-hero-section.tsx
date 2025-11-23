"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play, Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AIHeroSectionProps {
  onStartGuidedFlow: () => void;
  className?: string;
}

export function AIHeroSection({ onStartGuidedFlow, className }: AIHeroSectionProps) {
  const { user } = useUser();
  const [currentGreeting, setCurrentGreeting] = useState(0);
  const [showObjectives, setShowObjectives] = useState(false);

  const greetings = [
    "Goedemorgen",
    "Goedemiddag",
    "Goedenavond"
  ];

  // Dynamic greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setCurrentGreeting(0);
    else if (hour < 18) setCurrentGreeting(1);
    else setCurrentGreeting(2);

    // Show objectives after greeting animation
    const timer = setTimeout(() => setShowObjectives(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getPersonalizedObjectives = () => {
    // This would be calculated based on user's current progress and AI analysis
    const userStreak = 7; // Would come from user data
    const timeOfDay = new Date().getHours();

    if (timeOfDay < 12) {
      return [
        "Profiel foto optimaliseren",
        "Ontbijt date plannen",
        "Nieuwe matches bekijken"
      ];
    } else if (timeOfDay < 18) {
      return [
        "Chat responses verbeteren",
        "Date voor vanavond plannen",
        `${userStreak}-dagen streak behouden`
      ];
    } else {
      return [
        "Avond date evalueren",
        "Morgen doelen stellen",
        "Week voortgang bekijken"
      ];
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className={cn(
        "relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50 border-0 shadow-lg",
        className
      )}>
        {/* Animated Background */}
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-pink-200/20 rounded-full blur-xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.2, 0.4]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <div className="relative p-6">
          {/* AI Coach Avatar with Advanced Animations */}
          <motion.div
            className="flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="relative w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 10px 25px -5px rgba(236, 72, 153, 0.3)",
                  "0 10px 25px -5px rgba(236, 72, 153, 0.5)",
                  "0 10px 25px -5px rgba(236, 72, 153, 0.3)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Breathing ring effect */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-pink-300/50"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />

              <motion.div
                className="text-2xl"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              >
                🤖
              </motion.div>

              {/* Active indicator with pulse */}
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </motion.div>

          {/* Personalized Greeting with Typewriter Effect */}
          <motion.div
            className="text-center mb-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="text-xl font-bold text-gray-900 mb-1"
              variants={itemVariants}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentGreeting}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {greetings[currentGreeting]}, {user?.name?.split(' ')[0] || 'Dating Expert'}!
                </motion.span>
              </AnimatePresence>
            </motion.h1>
            <motion.p
              className="text-gray-600 text-sm"
              variants={itemVariants}
            >
              Ik help je vandaag met je dating succes
            </motion.p>
          </motion.div>

          {/* Daily Objectives with Stagger Animation */}
          <AnimatePresence>
            {showObjectives && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="flex items-center justify-center gap-2 mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 1
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-pink-500" />
                  </motion.div>
                  <span className="text-sm font-medium text-gray-700">Vandaag focus op:</span>
                </motion.div>

                <motion.div
                  className="space-y-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {getPersonalizedObjectives().map((objective, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 bg-white/60 rounded-lg p-3 hover:bg-white/80 transition-colors cursor-pointer"
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0"
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.5
                        }}
                      />
                      <span className="text-sm text-gray-700">{objective}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Primary CTA with Hover Effects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onStartGuidedFlow}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
                size="lg"
              >
                {/* Button shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />

                <motion.div
                  className="relative flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start met mijn advies
                </motion.div>
              </Button>
            </motion.div>

            {/* Subtle hint with fade in */}
            <motion.p
              className="text-center text-xs text-gray-500 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Persoonlijke guided flow • 5 minuten
            </motion.p>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}