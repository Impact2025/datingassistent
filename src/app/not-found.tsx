"use client";

/**
 * 404 Not Found Page - Strak, minimalistisch en professioneel
 * Wordt automatisch getoond bij niet-bestaande routes
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home, Search, ArrowLeft, HelpCircle, Compass, MapPin,
  Heart, Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';

const motivationalMessages = [
  {
    icon: Compass,
    title: "Oeps! Deze pagina bestaat niet",
    message: "Net als bij daten, soms neem je een verkeerde afslag. Geen zorgen, we helpen je weer op weg!",
    emoji: "🧭"
  },
  {
    icon: MapPin,
    title: "404 - Pagina niet gevonden",
    message: "Deze pagina is waarschijnlijk op date. Laten we jou ook op het juiste pad krijgen!",
    emoji: "🗺️"
  },
  {
    icon: Search,
    title: "Hmm, dit pad leidt nergens heen",
    message: "Maar jouw dating journey wel! Laten we je terugbrengen naar de juiste richting.",
    emoji: "🔍"
  }
];

export default function NotFoundPage() {
  const router = useRouter();
  const [randomMessage, setRandomMessage] = useState(motivationalMessages[0]);

  // Set random message only on client side after hydration to prevent hydration mismatch
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    setRandomMessage(motivationalMessages[randomIndex]);
  }, []);

  const IconComponent = randomMessage.icon;

  const quickActions = [
    {
      icon: Home,
      title: "Naar Dashboard",
      description: "Ga terug naar je persoonlijke dashboard",
      action: () => router.push('/dashboard'),
      color: "pink"
    },
    {
      icon: ArrowLeft,
      title: "Terug",
      description: "Ga terug naar de vorige pagina",
      action: () => router.back(),
      color: "purple"
    },
    {
      icon: HelpCircle,
      title: "Help",
      description: "Bekijk onze help pagina",
      action: () => router.push('/help'),
      color: "blue"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <Logo iconSize={60} textSize="xl" />
          </div>
        </motion.div>

        {/* Main Message Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-pink-200 shadow-xl">
            <CardContent className="p-8 text-center space-y-6">
              {/* 404 Large Display */}
              <div className="relative">
                <div className="text-8xl md:text-9xl font-bold text-gray-200 select-none">
                  404
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl">{randomMessage.emoji}</div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {randomMessage.title}
                </h1>
                <p className="text-lg text-gray-600">
                  {randomMessage.message}
                </p>
              </div>

              {/* Quick Tips */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <Heart className="w-5 h-5 mx-auto mb-1 text-pink-600" />
                  <p className="text-xs text-gray-600">Blijf positief</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Sparkles className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-xs text-gray-600">Probeer opnieuw</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Compass className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-gray-600">Vind je weg</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const borderColor = action.color === 'pink' ? 'border-pink-300' :
                               action.color === 'purple' ? 'border-purple-300' :
                               'border-blue-300';
            const bgColor = action.color === 'pink' ? 'bg-pink-100' :
                           action.color === 'purple' ? 'bg-purple-100' :
                           'bg-blue-100';
            const iconColor = action.color === 'pink' ? 'text-pink-600' :
                             action.color === 'purple' ? 'text-purple-600' :
                             'text-blue-600';
            const hoverColor = action.color === 'pink' ? 'hover:border-pink-400 hover:bg-pink-50' :
                              action.color === 'purple' ? 'hover:border-purple-400 hover:bg-purple-50' :
                              'hover:border-blue-400 hover:bg-blue-50';

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card
                  className={`border-2 ${borderColor} ${hoverColor} transition-all cursor-pointer hover:shadow-lg`}
                  onClick={action.action}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Popular Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">
                Populaire pagina's
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full border-pink-200 hover:bg-pink-50"
                  onClick={() => router.push('/')}
                >
                  Homepage
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-purple-200 hover:bg-purple-50"
                  onClick={() => router.push('/features')}
                >
                  Features
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-blue-200 hover:bg-blue-50"
                  onClick={() => router.push('/blog')}
                >
                  Blog
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-green-200 hover:bg-green-50"
                  onClick={() => router.push('/contact')}
                >
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-gray-500"
        >
          <p>
            Heb je hulp nodig? Neem contact op met ons{' '}
            <button
              onClick={() => router.push('/help')}
              className="text-pink-600 hover:text-pink-700 underline"
            >
              support team
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
