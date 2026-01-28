"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Sparkles, Target, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeScreenProps {
  onStartJourney: () => void;
  userName?: string;
}

const VALUE_PROPS = [
  {
    icon: Heart,
    title: "Persoonlijke Dating Coach",
    description: "AI-powered coaching afgestemd op jouw unieke stijl"
  },
  {
    icon: Sparkles,
    title: "Direct Resultaten",
    description: "Van eerste scan naar betere matches in één dag"
  },
  {
    icon: Target,
    title: "Duidelijke Doelen",
    description: "Stapsgewijze groei van vandaag naar je droomrelatie"
  },
  {
    icon: Users,
    title: "Gemeenschap",
    description: "Deel successen en leer van anderen op dezelfde weg"
  }
];

export function WelcomeScreen({ onStartJourney, userName }: WelcomeScreenProps) {
  const [currentProp, setCurrentProp] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after a brief delay for smooth animation
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-rotate value props every 3 seconds
    const interval = setInterval(() => {
      setCurrentProp((prev) => (prev + 1) % VALUE_PROPS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = VALUE_PROPS[currentProp]?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-coral-25 to-white flex items-center justify-center p-4">
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-2xl mx-auto"
          >
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 md:p-12 text-center space-y-8">

                {/* Hero Section */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-coral-500 to-coral-600 rounded-full mb-6">
                    <Heart className="w-10 h-10 text-white" />
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-coral-600 to-purple-600 bg-clip-text text-transparent">
                    Welkom bij je Dating Journey! {userName && ` ${userName}`}
                  </h1>

                  <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                    Ik ga jouw datingleven slimmer, leuker en succesvoller maken.
                    Laten we beginnen met een mini-scan van jouw stijl en doelen.
                  </p>
                </motion.div>

                {/* Rotating Value Props */}
                <motion.div
                  key={currentProp}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="py-8"
                >
                  <div className="flex flex-col items-center space-y-4">
                    {CurrentIcon && (
                      <div className="p-4 bg-gradient-to-r from-coral-100 to-coral-200 rounded-full">
                        <CurrentIcon className="w-8 h-8 text-coral-600" />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-gray-800">
                      {VALUE_PROPS[currentProp]?.title}
                    </h3>
                    <p className="text-gray-600 max-w-sm">
                      {VALUE_PROPS[currentProp]?.description}
                    </p>
                  </div>
                </motion.div>

                {/* Value Prop Indicators */}
                <div className="flex justify-center space-x-2 py-4">
                  {VALUE_PROPS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentProp(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentProp
                          ? 'bg-coral-500 scale-125'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Bekijk voordeel ${index + 1}`}
                    />
                  ))}
                </div>

                {/* CTA Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="space-y-4"
                >
                  <Button
                    onClick={onStartJourney}
                    size="lg"
                    className="w-full md:w-auto px-12 py-4 text-lg font-semibold bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Start mijn DatingScan 🚀
                  </Button>

                  <p className="text-sm text-gray-500">
                    Het duurt maar 3 minuten en geeft je direct inzichten
                  </p>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="pt-8 border-t border-gray-100"
                >
                  <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>100% Gratis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>AI-Powered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Direct Resultaten</span>
                    </div>
                  </div>
                </motion.div>

              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}