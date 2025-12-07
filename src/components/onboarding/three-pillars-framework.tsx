"use client";

/**
 * Three Pillars Framework
 * Visuele intro van de 3 dating pilaren
 * Modern, engaging design met animaties
 */

import { motion } from 'framer-motion';
import { User, MessageCircle, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ThreePillarsFrameworkProps {
  onContinue: () => void;
}

const pillars = [
  {
    id: 1,
    title: "Wie Ben Je?",
    subtitle: "Profiel Suite",
    description: "Presenteer jezelf op de beste manier. Van profielfoto's tot bio - maak een onweerstaanbaar profiel.",
    icon: User,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    features: [
      "AI Profielfoto Analyse",
      "Bio Generator",
      "Profiel Optimalisatie",
      "A/B Testing Tools"
    ],
    stats: "8 tools beschikbaar"
  },
  {
    id: 2,
    title: "Hoe Communiceer Je?",
    subtitle: "Communicatie Hub",
    description: "Van eerste bericht tot diepgaand gesprek. Leer verbinden, interesseren en boeien.",
    icon: MessageCircle,
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    features: [
      "Opening Lines Generator",
      "Chat Coach AI",
      "Gesprek Scenario's",
      "Emotionele Intelligentie"
    ],
    stats: "12 tools beschikbaar"
  },
  {
    id: 3,
    title: "Hoe Groei Je?",
    subtitle: "Growth & Goals",
    description: "Blijvende groei en zelfinzicht. Begrijp jezelf beter en ontwikkel je dating vaardigheden.",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    features: [
      "Waarden Kompas",
      "Hechtingsstijl Analyse",
      "Relatiepatronen",
      "Persoonlijke Groeipad"
    ],
    stats: "10 tools beschikbaar"
  }
];

export function ThreePillarsFramework({ onContinue }: ThreePillarsFrameworkProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full">
          <Sparkles className="w-4 h-4 text-pink-600" />
          <span className="text-sm font-semibold text-gray-700">Het Framework</span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900">
          De 3 Pilaren van Dating Succes
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Jouw persoonlijke groeipad is gebouwd op deze drie fundamenten.
          Elk pilaar bevat tools, cursussen en coaches om je te helpen groeien.
        </p>
      </motion.div>

      {/* Pillars Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {pillars.map((pillar, index) => {
          const IconComponent = pillar.icon;

          return (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className={cn(
                "h-full border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
                pillar.borderColor
              )}>
                <CardContent className="p-6 space-y-4">
                  {/* Icon */}
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                    pillar.color
                  )}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {pillar.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-600">
                      {pillar.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 pt-2">
                    {pillar.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-pink-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats Badge */}
                  <div className="pt-2">
                    <Badge variant="secondary" className="text-xs">
                      {pillar.stats}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Hoe het werkt
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center mx-auto font-bold text-lg">
                  1
                </div>
                <h4 className="font-semibold text-gray-900">Jouw Startpunt</h4>
                <p className="text-sm text-gray-600">
                  We bepalen waar je nu staat en welke pilaar het beste bij je past
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center mx-auto font-bold text-lg">
                  2
                </div>
                <h4 className="font-semibold text-gray-900">Gepersonaliseerd Pad</h4>
                <p className="text-sm text-gray-600">
                  Krijg een routekaart met aanbevolen cursussen en tools per pilaar
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center mx-auto font-bold text-lg">
                  3
                </div>
                <h4 className="font-semibold text-gray-900">Groei & Resultaat</h4>
                <p className="text-sm text-gray-600">
                  Volg je voortgang en zie tastbare verbeteringen in je dating leven
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 px-8"
        >
          Ontdek Jouw Startpunt
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-sm text-gray-600 mt-3">
          Volgende: AI Foto Quick Scan
        </p>
      </motion.div>
    </div>
  );
}
