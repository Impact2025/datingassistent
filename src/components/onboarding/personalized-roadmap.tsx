"use client";

/**
 * Personalized Roadmap
 * Geeft gepersonaliseerde aanbevelingen gebaseerd op user type (A/B/C/D)
 * Converteert naar bestaande producten (lead magnets, cursussen, abonnementen)
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Download, GraduationCap, Zap, Star, ArrowRight,
  CheckCircle2, Sparkles, Crown, TrendingUp, Gift
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PersonalizedRoadmapProps {
  userType: string; // A, B, C, or D
  userName?: string;
  onContinue: () => void;
}

const userTypes = {
  A: {
    title: "De Starter",
    description: "Je staat aan het begin van je dating journey. Perfect! We beginnen met sterke fundamenten.",
    color: "from-coral-500 to-rose-500",
    bgColor: "bg-coral-50",
    borderColor: "border-coral-200",
    icon: Sparkles,
    leadMagnet: {
      title: "De Perfecte Profielfoto",
      description: "5 stappen naar foto's die opvallen en matchen",
      downloadUrl: "/lead-magnets/perfecte-profielfoto.pdf",
      value: "€27"
    },
    recommendedCourse: {
      title: "Dating Fundament",
      price: "€47",
      description: "Bouw je dating basis: profiel, mindset en eerste stappen",
      features: [
        "Profiel optimalisatie masterclass",
        "Dating mindset fundamenten",
        "Eerste bericht strategieën",
        "30 dagen actieplan"
      ],
      url: "/products/dating-fundament"
    },
    recommendedPlan: {
      title: "Starter Plan",
      price: "€9,99/maand",
      description: "Perfecte start met essentiële AI tools",
      features: [
        "AI Chat Coach (50 berichten/maand)",
        "Bio Generator",
        "Profiel feedback",
        "Community access"
      ],
      url: "/pricing"
    }
  },
  B: {
    title: "De Optimaliseerder",
    description: "Je hebt een profiel maar het loopt niet lekker. Laten we je zichtbaarheid en matches boosten!",
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: TrendingUp,
    leadMagnet: {
      title: "Van Match naar Date",
      description: "Bewezen gesprekstechnieken die leiden tot dates",
      downloadUrl: "/lead-magnets/match-naar-date.pdf",
      value: "€19"
    },
    recommendedCourse: {
      title: "Dating Fundament",
      price: "€47",
      description: "Optimaliseer je complete aanpak en krijg meer matches",
      features: [
        "Foto analyse & optimalisatie",
        "Bio schrijven die converteert",
        "App strategie per platform",
        "Match-rate verbeterplan"
      ],
      url: "/products/dating-fundament"
    },
    recommendedPlan: {
      title: "Core Plan",
      price: "€19,99/maand",
      description: "Voor serieuze optimalisatie met unlimited AI",
      features: [
        "Unlimited AI Chat Coach",
        "AI Foto Check (onbeperkt)",
        "Bio Generator Pro",
        "Wekelijkse profiel reviews"
      ],
      url: "/pricing"
    }
  },
  C: {
    title: "De Connector",
    description: "Je krijgt matches maar zoekt meer diepte. Tijd voor betekenisvolle connecties!",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Star,
    leadMagnet: {
      title: "Match naar Betekenisvolle Date",
      description: "Van small talk naar echte connectie in 7 stappen",
      downloadUrl: "/lead-magnets/betekenisvolle-date.pdf",
      value: "€37"
    },
    recommendedCourse: {
      title: "Connectie & Diepgang",
      price: "€197",
      description: "Masterclass in authentieke connectie en emotionele intelligentie",
      features: [
        "Diepgaande gesprekstechnieken",
        "Emotionele beschikbaarheid",
        "Waarden-gebaseerd daten",
        "Van date naar relatie"
      ],
      url: "/products/connectie-diepgang"
    },
    recommendedPlan: {
      title: "Core Plan",
      price: "€19,99/maand",
      description: "Continue groei met AI coaching",
      features: [
        "Unlimited AI Relationship Coach",
        "Waarden Kompas tool",
        "Hechtingsstijl analyse",
        "Persoonlijke groei tracking"
      ],
      url: "/pricing"
    }
  },
  D: {
    title: "De Meester",
    description: "Je zoekt complete transformatie en mastery. Laten we je naar expert niveau tillen!",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: Crown,
    leadMagnet: {
      title: "Succesvol Daten Checklist",
      description: "De complete checklist voor dating succes op elk niveau",
      downloadUrl: "/lead-magnets/succesvol-daten-checklist.pdf",
      value: "€47"
    },
    recommendedCourse: {
      title: "Meesterschap",
      price: "€597",
      description: "Het ultieme programma voor complete dating transformatie",
      features: [
        "12-weken transformatie programma",
        "Alle cursussen included",
        "1-op-1 coaching sessies",
        "Lifetime access & updates"
      ],
      url: "/products/meesterschap"
    },
    recommendedPlan: {
      title: "Premium Plan",
      price: "€29,99/maand",
      description: "All-in support voor serieuze growth",
      features: [
        "Alle AI tools unlimited",
        "Priority support",
        "Maandelijkse expert calls",
        "Exclusieve masterclasses"
      ],
      url: "/pricing"
    }
  }
};

export function PersonalizedRoadmap({ userType, userName, onContinue }: PersonalizedRoadmapProps) {
  const typeData = userTypes[userType as keyof typeof userTypes] || userTypes.A;
  const IconComponent = typeData.icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <div className={cn(
          "inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br shadow-lg mb-4",
          typeData.color
        )}>
          <IconComponent className="w-10 h-10 text-white" />
        </div>

        <div>
          <Badge className={cn("mb-3", typeData.bgColor, typeData.borderColor, "border-2")}>
            Jouw Type
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {userName ? `${userName}, je bent` : "Je bent"} {typeData.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {typeData.description}
          </p>
        </div>
      </motion.div>

      {/* Free Lead Magnet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Gift className="w-6 h-6" />
                Jouw Gratis Startgids
              </CardTitle>
              <Badge className="bg-green-600 text-white">
                Waarde: {typeData.leadMagnet.value}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {typeData.leadMagnet.title}
              </h3>
              <p className="text-gray-700">
                {typeData.leadMagnet.description}
              </p>
            </div>

            <Link href={typeData.leadMagnet.downloadUrl} download>
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                <Download className="w-4 h-4 mr-2" />
                Download Nu Gratis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommended Course */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className={cn("border-2 shadow-lg", typeData.borderColor)}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-purple-600" />
                Aanbevolen Cursus
              </CardTitle>
              <Badge className="bg-purple-600 text-white">
                Populair
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {typeData.recommendedCourse.title}
              </h3>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">
                  {typeData.recommendedCourse.price}
                </div>
                <div className="text-sm text-gray-600">eenmalig</div>
              </div>
            </div>

            <p className="text-gray-700">
              {typeData.recommendedCourse.description}
            </p>

            <div className="space-y-2">
              {typeData.recommendedCourse.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link href={typeData.recommendedCourse.url}>
              <Button variant="outline" className="w-full border-2 border-purple-500 hover:bg-purple-50">
                Bekijk Cursus
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommended Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Zap className="w-6 h-6" />
                Aanbevolen Abonnement
              </CardTitle>
              <Badge className="bg-blue-600 text-white">
                Best Value
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {typeData.recommendedPlan.title}
              </h3>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {typeData.recommendedPlan.price}
                </div>
                <div className="text-sm text-gray-600">per maand</div>
              </div>
            </div>

            <p className="text-gray-700">
              {typeData.recommendedPlan.description}
            </p>

            <div className="space-y-2">
              {typeData.recommendedPlan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link href={typeData.recommendedPlan.url}>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                Bekijk Plannen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-2 border-coral-200">
          <CardContent className="p-6 text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Klaar om te beginnen? 🚀
            </h3>
            <p className="text-gray-600">
              Download je gratis gids en ontdek het platform.
              Je kunt altijd upgraden naar een cursus of abonnement wanneer je wilt!
            </p>
            <Button
              onClick={onContinue}
              size="lg"
              className="bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700"
            >
              Ga naar Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
