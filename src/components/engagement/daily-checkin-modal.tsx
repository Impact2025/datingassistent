"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Award } from "lucide-react";

interface DailyCheckinModalProps {
  open: boolean;
  onClose: () => void;
  journeyDay: number;
  userId: number;
  onComplete?: () => void;
}

type MoodOption = {
  emoji: string;
  label: string;
  value: number;
  color: string;
};

const MOOD_OPTIONS: MoodOption[] = [
  { emoji: "😄", label: "Goed", value: 8, color: "bg-green-100 hover:bg-green-200 border-green-300" },
  { emoji: "😐", label: "OK", value: 5, color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300" },
  { emoji: "😞", label: "Lastig", value: 3, color: "bg-red-100 hover:bg-red-200 border-red-300" }
];

export function DailyCheckinModal({
  open,
  onClose,
  journeyDay,
  userId,
  onComplete
}: DailyCheckinModalProps) {
  const [step, setStep] = useState<'mood' | 'progress' | 'reflection' | 'success'>('mood');
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [progressRating, setProgressRating] = useState<number | null>(null);
  const [challenges, setChallenges] = useState('');
  const [wins, setWins] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleMoodSelect = (value: number) => {
    setMoodRating(value);

    // For Day 6 (emoji only), go straight to success
    if (journeyDay === 6) {
      submitCheckin(value, 5, '', '');
    } else {
      setStep('progress');
    }
  };

  const handleProgressSelect = (value: number) => {
    setProgressRating(value);
    setStep('reflection');
  };

  const submitCheckin = async (
    mood: number,
    progress: number,
    challengeText: string,
    winText: string
  ) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/engagement/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          journeyDay,
          moodRating: mood,
          progressRating: progress,
          challenges: challengeText,
          wins: winText
        })
      });

      if (response.ok) {
        setStep('success');
        setTimeout(() => {
          if (onComplete) onComplete();
          onClose();
          resetForm();
        }, 2500);
      }
    } catch (error) {
      console.error('Failed to submit check-in:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReflectionSubmit = () => {
    if (moodRating !== null && progressRating !== null) {
      submitCheckin(moodRating, progressRating, challenges, wins);
    }
  };

  const resetForm = () => {
    setStep('mood');
    setMoodRating(null);
    setProgressRating(null);
    setChallenges('');
    setWins('');
  };

  const getTitle = () => {
    if (journeyDay === 3) return "📊 Snelle Voortgangs-Check";
    if (journeyDay === 6) return "💭 Hoe ging deze week?";
    if (journeyDay === 7) return "🎉 Week 1 Check-in";
    return "Daily Check-in";
  };

  const getSubtitle = () => {
    if (journeyDay === 3) return "Deel hoe het gaat (duurt 10 seconden)";
    if (journeyDay === 6) return "Kies je gevoel van deze week";
    if (journeyDay === 7) return "Reflecteer op je eerste week";
    return "Hoe gaat het met je?";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {getTitle()}
          </DialogTitle>
          <p className="text-center text-gray-600">{getSubtitle()}</p>
        </DialogHeader>

        <div className="py-4">
          {/* Step 1: Mood Selection */}
          {step === 'mood' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-center mb-4">
                Hoe voel je je vandaag?
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {MOOD_OPTIONS.map((option) => (
                  <Card
                    key={option.value}
                    className={`cursor-pointer border-2 transition-all hover:scale-105 ${option.color} ${
                      moodRating === option.value ? 'ring-4 ring-blue-400 scale-105' : ''
                    }`}
                    onClick={() => handleMoodSelect(option.value)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-6xl mb-3">{option.emoji}</div>
                      <div className="font-semibold text-lg">{option.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Progress Rating (Day 3 & 7 only) */}
          {step === 'progress' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-center mb-4">
                Hoeveel vooruitgang heb je geboekt?
              </h3>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <Button
                    key={num}
                    onClick={() => handleProgressSelect(num)}
                    variant={progressRating === num ? "default" : "outline"}
                    className={`w-12 h-12 text-lg font-bold transition-all ${
                      progressRating === num
                        ? 'bg-blue-600 hover:bg-blue-700 scale-110'
                        : 'hover:scale-105'
                    }`}
                  >
                    {num}
                  </Button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500">
                1 = Nog niet gestart, 10 = Geweldig gevorderd
              </p>
            </motion.div>
          )}

          {/* Step 3: Reflection (Day 3 & 7 only) */}
          {step === 'reflection' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  💪 Wat ging er goed? (optioneel)
                </label>
                <Textarea
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                  placeholder="Deel je wins, ook de kleine..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  🤔 Waar loop je tegenaan? (optioneel)
                </label>
                <Textarea
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="Deel je uitdagingen, ik help je ermee"
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setStep('progress')}
                  variant="outline"
                  className="flex-1"
                >
                  Terug
                </Button>
                <Button
                  onClick={handleReflectionSubmit}
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? 'Opslaan...' : 'Opslaan & Doorgaan'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                  <Sparkles className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Geweldig! Check-in voltooid! 🎉
              </h3>
              <p className="text-gray-600 mb-4">
                Je hebt <strong>+5 punten</strong> verdiend
              </p>
              <div className="flex items-center justify-center gap-2 text-green-700">
                <Award className="w-5 h-5" />
                <span className="font-medium">Blijf zo doorgaan!</span>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
