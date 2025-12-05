'use client';

/**
 * Result Reveal - Professional Edition
 * Clean, sophisticated design matching logout page aesthetic
 * Data-driven with radar chart, no playful emojis
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Star, TrendingUp, ArrowRight, Share2,
  CheckCircle, AlertCircle, Zap, Shield, Users, Heart
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import type { DatingStyle } from '@/lib/quiz/dating-styles';
import { getRandomTestimonial } from '@/lib/quiz/dating-styles';

interface ResultRevealProps {
  datingStyle: DatingStyle;
}

// Map dating style keys to professional icons
const STYLE_ICONS = {
  architect: TrendingUp,
  vuurwerk: Zap,
  goudzoeker: Star,
  magneet: Users,
  feniks: Heart
};

export function ResultReveal({ datingStyle }: ResultRevealProps) {
  // Transform scores for radar chart
  const radarData = [
    { category: 'Authenticiteit', value: datingStyle.scores.authenticiteit },
    { category: 'Actiegericht', value: datingStyle.scores.actiegericht },
    { category: 'Reflectie', value: datingStyle.scores.reflectie },
    { category: 'Openheid', value: datingStyle.scores.openheid },
    { category: 'Stabiliteit', value: datingStyle.scores.stabiliteit }
  ];

  const StyleIcon = STYLE_ICONS[datingStyle.key as keyof typeof STYLE_ICONS] || Star;

  const handleShare = () => {
    const text = `Ik ben ${datingStyle.title}! Ontdek jouw dating stijl op DatingAssistent`;
    if (navigator.share) {
      navigator.share({
        title: `Mijn Dating Stijl: ${datingStyle.title}`,
        text,
        url: window.location.origin + '/quiz'
      });
    } else {
      navigator.clipboard.writeText(text + ' - ' + window.location.origin + '/quiz');
      alert('Link gekopieerd! Deel met je vrienden 📋');
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section - Clean & Professional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-gray-200 shadow-xl overflow-hidden bg-white">
          <CardContent className="p-8 md:p-12">
            {/* Success Badge - Subtle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <Badge
                variant="outline"
                className="text-sm px-4 py-2 border-2"
                style={{
                  borderColor: datingStyle.color,
                  color: datingStyle.color,
                  backgroundColor: `${datingStyle.color}10`
                }}
              >
                Je bent 1 van de {datingStyle.percentage}%
              </Badge>
            </motion.div>

            {/* Icon & Title - Professional */}
            <div className="text-center space-y-6 mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex justify-center"
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: `${datingStyle.color}15`,
                    border: `3px solid ${datingStyle.color}30`
                  }}
                >
                  <StyleIcon
                    className="w-12 h-12"
                    style={{ color: datingStyle.color }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <h1
                  className="text-4xl md:text-5xl font-bold"
                  style={{ color: datingStyle.color }}
                >
                  {datingStyle.title}
                </h1>

                <p className="text-xl text-gray-600 font-medium">
                  {datingStyle.subtitle}
                </p>

                <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                  {datingStyle.description}
                </p>
              </motion.div>
            </div>

            {/* Share Button - Subtle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex justify-center"
            >
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-2"
                style={{ borderColor: datingStyle.color, color: datingStyle.color }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Deel je resultaat
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Radar Chart Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="border-2 border-gray-200 shadow-xl bg-white">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Je Persoonlijkheidsprofiel
              </h2>
              <p className="text-gray-600">
                Gebaseerd op wetenschappelijke dating psychologie
              </p>
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke={datingStyle.color}
                    fill={datingStyle.color}
                    fillOpacity={0.25}
                    strokeWidth={3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Dit profiel is uniek voor {datingStyle.title}-types
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Strengths & Challenges - Clean Grid */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card className="border-2 border-green-100 shadow-lg bg-white">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border-2 border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Je Superkrachten</h3>
              </div>

              <ul className="space-y-3">
                {datingStyle.strengths.map((strength, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.3 + (idx * 0.1) }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{strength}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Challenges */}
          <Card className="border-2 border-orange-100 shadow-lg bg-white">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center border-2 border-orange-200">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Let Op Voor</h3>
              </div>

              <ul className="space-y-3">
                {datingStyle.challenges.map((challenge, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.5 + (idx * 0.1) }}
                    className="flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{challenge}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Famous People - Subtle */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.7 }}
      >
        <Card className="bg-gray-50 border-2 border-gray-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Beroemdheden met jouw stijl
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {datingStyle.famousPeople.map((person, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-base px-4 py-2 border-2"
                  style={{
                    borderColor: datingStyle.color,
                    color: datingStyle.color,
                    backgroundColor: 'white'
                  }}
                >
                  {person}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Testimonial */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.9 }}
      >
        <Card className="bg-white border-2 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${datingStyle.color}15` }}
                >
                  <span className="text-2xl">💬</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-700 italic mb-3">
                  "{getRandomTestimonial(datingStyle.key)}"
                </p>
                <div className="flex items-center gap-1 text-yellow-500">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA - Professional */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.1 }}
      >
        <Card className="border-2 shadow-xl overflow-hidden bg-white" style={{ borderColor: datingStyle.color }}>
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-3">
              <Badge
                className="text-sm px-4 py-1.5 text-white"
                style={{ backgroundColor: datingStyle.color }}
              >
                Perfect voor {datingStyle.title}
              </Badge>

              <h2 className="text-3xl font-bold text-gray-900">
                Klaar om je valkuilen te overwinnen?
              </h2>

              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                De {datingStyle.recommendation === 'transformatie' ? 'Transformatie' : 'Kickstart'} Cursus is speciaal ontworpen voor mensen zoals jij
              </p>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: datingStyle.color }} />
                <h4 className="font-semibold mb-1 text-gray-900">Persoonlijk Actieplan</h4>
                <p className="text-sm text-gray-600">Voor jouw dating stijl</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Zap className="w-8 h-8 mx-auto mb-2" style={{ color: datingStyle.color }} />
                <h4 className="font-semibold mb-1 text-gray-900">Onbeperkt AI Tools</h4>
                <p className="text-sm text-gray-600">€87 aan credits</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: datingStyle.color }} />
                <h4 className="font-semibold mb-1 text-gray-900">90 Dagen Toegang</h4>
                <p className="text-sm text-gray-600">Bewezen methode</p>
              </div>
            </div>

            {/* Pricing */}
            <div className="text-center space-y-4 pt-4 border-t border-gray-200">
              <div>
                <div className="text-4xl font-bold text-gray-900">€147</div>
                <p className="text-gray-600">Eenmalig · 90 dagen toegang</p>
              </div>

              <Link href={`/checkout/${datingStyle.recommendation}`}>
                <Button
                  size="lg"
                  className="w-full md:w-auto h-14 text-lg text-white shadow-lg hover:shadow-xl transition-all"
                  style={{
                    backgroundColor: datingStyle.color,
                    borderColor: datingStyle.color
                  }}
                >
                  Start je Transformatie
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <p className="text-sm text-gray-600">
                ✓ 14 dagen geld-terug garantie · ✓ Direct toegang
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alternative */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.3 }}
        className="text-center space-y-4"
      >
        <p className="text-gray-600">
          Wil je eerst je profiel fixen in 3 weken?
        </p>
        <Link href="/checkout/kickstart">
          <Button
            variant="outline"
            size="lg"
            className="border-2"
            style={{ borderColor: datingStyle.color, color: datingStyle.color }}
          >
            Bekijk Kickstart (€47)
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
