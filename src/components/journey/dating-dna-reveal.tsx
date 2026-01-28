"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Sparkles,
  Target,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp
} from "lucide-react";

interface DatingDNARevealProps {
  dna: {
    personalityType: string;
    coreStrengths: string[];
    growthAreas: string[];
    datingStyle: string;
    communicationStyle: string;
    confidenceLevel: 'low' | 'medium' | 'high';
    recommendedApproach: string;
    keyInsights: string[];
    actionItems: string[];
  };
  onContinue: () => void;
}

const REVEAL_SEQUENCE = [
  { key: 'personalityType', label: 'Jouw Persoonlijkheid', icon: Heart },
  { key: 'coreStrengths', label: 'Jouw Sterktes', icon: Star },
  { key: 'datingStyle', label: 'Jouw Dating Stijl', icon: Users },
  { key: 'communicationStyle', label: 'Communicatie Stijl', icon: Sparkles },
  { key: 'confidenceLevel', label: 'Zelfvertrouwen Level', icon: TrendingUp },
  { key: 'recommendedApproach', label: 'Aanbevolen Aanpak', icon: Target },
  { key: 'keyInsights', label: 'Belangrijke Inzichten', icon: CheckCircle },
  { key: 'actionItems', label: 'Directe Acties', icon: ArrowRight }
];

export function DatingDNAReveal({ dna, onContinue }: DatingDNARevealProps) {
  const [revealedItems, setRevealedItems] = useState<Set<string>>(new Set());
  const [currentReveal, setCurrentReveal] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Auto-reveal items with delays
    const revealNext = (index: number) => {
      if (index < REVEAL_SEQUENCE.length) {
        setTimeout(() => {
          setRevealedItems(prev => new Set([...prev, REVEAL_SEQUENCE[index].key]));
          setCurrentReveal(index + 1);
          revealNext(index + 1);
        }, 800); // 800ms delay between reveals
      } else {
        // All revealed, show continue button after a delay
        setTimeout(() => setShowAll(true), 1000);
      }
    };

    revealNext(0);
  }, []);

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceLabel = (level: string) => {
    switch (level) {
      case 'high': return 'Hoog';
      case 'medium': return 'Gemiddeld';
      case 'low': return 'Laag';
      default: return 'Onbekend';
    }
  };

  const renderDNAItem = (item: typeof REVEAL_SEQUENCE[0]) => {
    const isRevealed = revealedItems.has(item.key);
    const IconComponent = item.icon;

    return (
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
          >
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-gradient-to-r from-coral-500 to-coral-600 rounded-full">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderItemContent(item.key)}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderItemContent = (key: string) => {
    switch (key) {
      case 'personalityType':
        return (
          <div className="text-center py-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-coral-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {dna.personalityType}
            </h3>
            <p className="text-gray-600">
              Dit is jouw unieke dating persoonlijkheid
            </p>
          </div>
        );

      case 'coreStrengths':
        return (
          <div className="space-y-2">
            {dna.coreStrengths.map((strength, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-green-800">{strength}</span>
              </div>
            ))}
          </div>
        );

      case 'datingStyle':
        return (
          <div className="text-center py-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 mb-3">
              {dna.datingStyle}
            </Badge>
            <p className="text-gray-600">
              Jouw natuurlijke manier van daten
            </p>
          </div>
        );

      case 'communicationStyle':
        return (
          <div className="text-center py-4">
            <Badge variant="outline" className="text-lg px-4 py-2 mb-3">
              {dna.communicationStyle}
            </Badge>
            <p className="text-gray-600">
              Hoe je het beste communiceert
            </p>
          </div>
        );

      case 'confidenceLevel':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Zelfvertrouwen Level</span>
              <Badge className={getConfidenceColor(dna.confidenceLevel)}>
                {getConfidenceLabel(dna.confidenceLevel)}
              </Badge>
            </div>
            <Progress
              value={dna.confidenceLevel === 'high' ? 80 : dna.confidenceLevel === 'medium' ? 50 : 25}
              className="h-3"
            />
            <p className="text-sm text-gray-600">
              Dit geeft aan hoe comfortabel je bent in dating situaties
            </p>
          </div>
        );

      case 'recommendedApproach':
        return (
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-blue-800 font-medium">
              {dna.recommendedApproach}
            </p>
          </div>
        );

      case 'keyInsights':
        return (
          <div className="space-y-3">
            {dna.keyInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-purple-800">{insight}</span>
              </div>
            ))}
          </div>
        );

      case 'actionItems':
        return (
          <div className="space-y-3">
            {dna.actionItems.map((action, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-orange-800">{action}</span>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-coral-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-coral-500 to-coral-600 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-coral-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Jouw Dating DNA
          </h1>
          <p className="text-lg text-gray-600">
            Ontdek je unieke dating persoonlijkheid en hoe je succesvoller kunt daten
          </p>
        </motion.div>

        {/* DNA Reveal Cards */}
        <div className="space-y-6 mb-8">
          {REVEAL_SEQUENCE.map((item) => (
            <div key={item.key}>
              {renderDNAItem(item)}
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <AnimatePresence>
          {showAll && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Card className="border-0 shadow-xl bg-gradient-to-r from-coral-500 to-coral-600 text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">
                    Klaar voor de volgende stap?
                  </h3>
                  <p className="text-coral-100 mb-6">
                    Nu gaan we je doelen stellen en direct actie ondernemen
                  </p>
                  <Button
                    onClick={onContinue}
                    size="lg"
                    className="bg-white text-coral-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                  >
                    Start met Doelen Stellen
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {REVEAL_SEQUENCE.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  index < currentReveal
                    ? 'bg-coral-500 scale-125'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}