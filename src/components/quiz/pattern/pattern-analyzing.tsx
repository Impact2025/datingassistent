'use client';

/**
 * Pattern Quiz Analyzing Screen - WORLD CLASS VERSION
 *
 * Dramatic, suspenseful analyzing animation that builds anticipation.
 * Features: typewriter effect, DNA helix, insight discovery, progress stages.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Heart,
  Shield,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Lock,
} from 'lucide-react';

interface PatternAnalyzingProps {
  onComplete: () => void;
  firstName: string;
}

const ANALYSIS_STAGES = [
  {
    icon: Brain,
    title: 'Neurale Patronen Detecteren',
    insights: [
      'Antwoordpatronen identificeren...',
      'Reactiesnelheid analyseren...',
      'Beslissingslogica in kaart brengen...',
    ],
    duration: 2500,
  },
  {
    icon: Heart,
    title: 'Attachment Dimensies Berekenen',
    insights: [
      'Angst-dimensie meten...',
      'Vermijding-dimensie meten...',
      'Emotionele reacties evalueren...',
    ],
    duration: 2500,
  },
  {
    icon: Shield,
    title: 'Beschermingspatronen Analyseren',
    insights: [
      'Copingmechanismen identificeren...',
      'Relationele triggers detecteren...',
      'Veiligheidsstrategieën evalueren...',
    ],
    duration: 2500,
  },
  {
    icon: Sparkles,
    title: 'Persoonlijk Profiel Genereren',
    insights: [
      'Uniek patroon samenstellen...',
      'Gepersonaliseerde inzichten creëren...',
      'Actieplan voorbereiden...',
    ],
    duration: 2000,
  },
];

// Typewriter hook
function useTypewriter(text: string, speed: number = 30) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
}

// DNA Helix Animation Component
function DNAHelix() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-pink-500"
          style={{
            left: `${50 + Math.sin(i * 0.5) * 30}%`,
            top: `${i * 5}%`,
          }}
          animate={{
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`b-${i}`}
          className="absolute w-2 h-2 rounded-full bg-purple-500"
          style={{
            left: `${50 - Math.sin(i * 0.5) * 30}%`,
            top: `${i * 5}%`,
          }}
          animate={{
            x: [0, -Math.sin(i) * 20, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

// Floating particles
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-pink-400"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, 20],
            x: [-10, 10],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

// Insight Line Component
function InsightLine({ text, isActive, isComplete }: { text: string; isActive: boolean; isComplete: boolean }) {
  const { displayText } = useTypewriter(isActive ? text : '', 20);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 text-sm"
    >
      <motion.div
        className={`w-1.5 h-1.5 rounded-full ${
          isComplete ? 'bg-green-500' : isActive ? 'bg-pink-500' : 'bg-gray-300'
        }`}
        animate={isActive && !isComplete ? { scale: [1, 1.5, 1] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
      <span className={isComplete ? 'text-green-600' : isActive ? 'text-gray-700' : 'text-gray-400'}>
        {isComplete ? text : isActive ? displayText : text}
        {isActive && !isComplete && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            |
          </motion.span>
        )}
        {isComplete && ' ✓'}
      </span>
    </motion.div>
  );
}

export function PatternAnalyzing({ onComplete, firstName }: PatternAnalyzingProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [currentInsight, setCurrentInsight] = useState(0);
  const [completedInsights, setCompletedInsights] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const stage = ANALYSIS_STAGES[currentStage];
  const CurrentIcon = stage?.icon || Sparkles;

  // Progress and stage management
  useEffect(() => {
    if (currentStage >= ANALYSIS_STAGES.length) {
      setIsFinishing(true);
      setTimeout(onComplete, 1000);
      return;
    }

    const stageData = ANALYSIS_STAGES[currentStage];
    const insightDuration = stageData.duration / stageData.insights.length;

    // Insight progression
    const insightTimer = setInterval(() => {
      setCurrentInsight((prev) => {
        const insightKey = `${currentStage}-${prev}`;
        setCompletedInsights((set) => new Set([...set, insightKey]));

        if (prev >= stageData.insights.length - 1) {
          clearInterval(insightTimer);
          setTimeout(() => {
            setCurrentStage((s) => s + 1);
            setCurrentInsight(0);
          }, 500);
          return prev;
        }
        return prev + 1;
      });
    }, insightDuration);

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const targetProgress = ((currentStage + 1) / ANALYSIS_STAGES.length) * 100;
        const increment = 0.5;
        if (prev >= targetProgress - increment) return targetProgress;
        return prev + increment;
      });
    }, 50);

    return () => {
      clearInterval(insightTimer);
      clearInterval(progressInterval);
    };
  }, [currentStage, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <DNAHelix />
      <FloatingParticles />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full relative z-10"
      >
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Animated Icon Container */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-pink-500/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              {/* Middle ring */}
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-purple-500/30"
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
              {/* Inner pulsing glow */}
              <motion.div
                className="absolute inset-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-600"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 20px rgba(236,72,153,0.5)',
                    '0 0 40px rgba(236,72,153,0.8)',
                    '0 0 20px rgba(236,72,153,0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Icon */}
              <div className="absolute inset-4 rounded-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStage}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                  >
                    <CurrentIcon className="w-8 h-8 text-white" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Greeting */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white mb-2"
            >
              {isFinishing ? `${firstName}, je analyse is klaar!` : `Analyseren, ${firstName}...`}
            </motion.h2>

            {/* Stage Title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-pink-300 font-medium"
              >
                {stage?.title || 'Afronden...'}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Section */}
          <div className="space-y-6">
            {/* Main Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/60">
                <span>Voortgang</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full"
                  style={{ backgroundSize: '200% 100%' }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${progress}%`,
                    backgroundPosition: ['0% 0%', '100% 0%'],
                  }}
                  transition={{
                    width: { duration: 0.3 },
                    backgroundPosition: { duration: 2, repeat: Infinity },
                  }}
                />
              </div>
            </div>

            {/* Current Insights */}
            {stage && (
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Live Analyse
                </div>
                {stage.insights.map((insight, idx) => {
                  const insightKey = `${currentStage}-${idx}`;
                  const isComplete = completedInsights.has(insightKey);
                  const isActive = idx === currentInsight && !isComplete;

                  return (
                    <InsightLine
                      key={insightKey}
                      text={insight}
                      isActive={isActive}
                      isComplete={isComplete}
                    />
                  );
                })}
              </div>
            )}

            {/* Stage Indicators */}
            <div className="flex justify-center gap-3">
              {ANALYSIS_STAGES.map((s, idx) => (
                <motion.div
                  key={idx}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    idx < currentStage
                      ? 'bg-green-500 border-green-500'
                      : idx === currentStage
                        ? 'bg-pink-500/20 border-pink-500'
                        : 'bg-white/5 border-white/20'
                  }`}
                  animate={idx === currentStage ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {idx < currentStage ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-white text-sm"
                    >
                      ✓
                    </motion.span>
                  ) : (
                    <s.icon className={`w-4 h-4 ${idx === currentStage ? 'text-pink-400' : 'text-white/40'}`} />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-white/40 text-xs mt-6"
          >
            Gebaseerd op ECR-R attachment theory • 10.000+ analyses
          </motion.p>
        </div>

        {/* Finishing Animation */}
        <AnimatePresence>
          {isFinishing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl"
            >
              <div className="text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-6xl mb-4"
                >
                  ✨
                </motion.div>
                <h3 className="text-2xl font-bold">Analyse Compleet!</h3>
                <p className="text-white/80 mt-2">Je resultaat wordt geladen...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
