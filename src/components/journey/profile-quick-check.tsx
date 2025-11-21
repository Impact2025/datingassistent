"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Zap
} from "lucide-react";

interface ProfileQuickCheckProps {
  onComplete: (profileData: any) => void;
  onSkip?: () => void;
}

const DATING_APPS = [
  { id: 'tinder', name: 'Tinder', icon: '🔥' },
  { id: 'bumble', name: 'Bumble', icon: '🐝' },
  { id: 'hinge', name: 'Hinge', icon: '💕' },
  { id: 'happn', name: 'Happn', icon: '❤️' },
  { id: 'other', name: 'Anders', icon: '📱' }
];

export function ProfileQuickCheck({ onComplete, onSkip }: ProfileQuickCheckProps) {
  const [step, setStep] = useState<'intro' | 'input' | 'analyzing'>('intro');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  const handleAppToggle = (appId: string) => {
    setSelectedApps(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleAnalyze = () => {
    setStep('analyzing');

    // Simulate AI analysis
    setTimeout(() => {
      const profileData = {
        selectedApps,
        bio,
        analyzed: true
      };
      onComplete(profileData);
    }, 3000);
  };

  if (step === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="border border-border shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              Profiel Check
            </CardTitle>
            <p className="text-muted-foreground">
              Laten we je dating profiel samenstellen voor betere resultaten
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="border border-border rounded-lg p-6 bg-muted/30">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-2xl">🔍</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Wat we gaan doen:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Bio analyseren op aantrekkelijkheid
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Beste dating app match bepalen
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Persoonlijke tips op maat
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep('input')}
                size="lg"
                className="flex-1"
              >
                Start profiel check
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              {onSkip && (
                <Button
                  onClick={onSkip}
                  variant="outline"
                  size="lg"
                >
                  Later
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (step === 'input') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Vertel ons over jezelf</CardTitle>
            <p className="text-muted-foreground">
              Deze informatie helpt ons om betere tips te geven
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Dating App Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block text-foreground">
                Welke dating app(s) gebruik je?
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DATING_APPS.map((app) => (
                  <Card
                    key={app.id}
                    className={`cursor-pointer transition-all border ${
                      selectedApps.includes(app.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleAppToggle(app.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{app.icon}</div>
                      <div className="font-medium text-foreground">{app.name}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Bio Input */}
            <div>
              <Label htmlFor="bio" className="text-base font-semibold mb-3 block text-foreground">
                Jouw huidige bio (optioneel)
              </Label>
              <Textarea
                id="bio"
                placeholder="Plak hier je dating app bio..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {bio.length}/500 tekens
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAnalyze}
                disabled={selectedApps.length === 0}
                size="lg"
                className="flex-1"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Analyseer mijn profiel
              </Button>
            </div>

            {selectedApps.length === 0 && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Selecteer minimaal 1 dating app om door te gaan
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Analyzing state
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="border border-border shadow-sm">
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">Profiel analyseren...</h3>
          <p className="text-muted-foreground mb-6">
            Dit duurt ongeveer 10 seconden
          </p>
          <div className="space-y-2 text-left max-w-md mx-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Bio analyseren op aantrekkelijkheid
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Beste dating app match bepalen
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Persoonlijke tips genereren
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
