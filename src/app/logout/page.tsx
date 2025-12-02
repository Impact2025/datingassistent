"use client";

/**
 * Logout Page - Leuke, positieve afscheid
 * Toont motiverende boodschap en opties om terug te keren
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Heart, Sparkles, TrendingUp, LogIn, Home, ArrowRight,
  CheckCircle2, Coffee, Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';
import { AuthManager } from '@/lib/auth-manager';
import { safeStorage } from '@/lib/safe-storage';

const motivationalMessages = [
  {
    icon: Heart,
    title: "Succes met je dating journey!",
    message: "Blijf jezelf en blijf groeien. We zien je graag snel terug!",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Sparkles,
    title: "Je bent op de goede weg!",
    message: "Elke stap telt. Tot de volgende keer!",
    color: "from-purple-500 to-indigo-500"
  },
  {
    icon: TrendingUp,
    title: "Blijf jezelf ontwikkelen!",
    message: "Dating mastery is een journey, geen bestemming. Kom snel terug!",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Star,
    title: "Je maakt vooruitgang!",
    message: "We kijken ernaar uit je groei voort te zetten. Tot snel!",
    color: "from-yellow-500 to-orange-500"
  }
];

export default function LogoutPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [randomMessage] = useState(() =>
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
  );

  useEffect(() => {
    const performLogout = async () => {
      console.log('🚪 Logout page - clearing session');

      // Clear all auth data
      const authManager = new AuthManager();
      authManager.clearAuth();
      safeStorage.removeItem('datespark_auth_token');

      // Clear any onboarding state
      const keysToRemove = Object.keys(localStorage).filter(key =>
        key.startsWith('onboarding_') ||
        key.startsWith('datespark_')
      );
      keysToRemove.forEach(key => safeStorage.removeItem(key));

      // Call logout API to clear server-side session
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (err) {
        console.error('Error calling logout API:', err);
      }

      // Show logout success message
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 1000);
    };

    performLogout();
  }, []);

  const IconComponent = randomMessage.icon;

  if (isLoggingOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Uitloggen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
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
              {/* Message */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {randomMessage.title}
                </h1>
                <p className="text-lg text-gray-600">
                  {randomMessage.message}
                </p>
              </div>

              {/* Quick Stats (motivational) */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <Heart className="w-5 h-5 mx-auto mb-1 text-pink-600" />
                  <p className="text-xs text-gray-600">Authentiek blijven</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Coffee className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-xs text-gray-600">Neem een pauze</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-gray-600">Blijf groeien</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-4"
        >
          {/* Login Again Button */}
          <Card className="border-2 hover:border-pink-300 transition-all cursor-pointer hover:shadow-lg">
            <CardContent
              className="p-6 text-center"
              onClick={() => router.push('/login')}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center">
                <LogIn className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Opnieuw Inloggen
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Direct weer aan de slag met je dating journey
              </p>
              <Button
                variant="outline"
                className="w-full border-pink-300 hover:bg-pink-50"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/login');
                }}
              >
                Inloggen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Home Button */}
          <Card className="border-2 hover:border-purple-300 transition-all cursor-pointer hover:shadow-lg">
            <CardContent
              className="p-6 text-center"
              onClick={() => router.push('/')}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                <Home className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Naar Homepage
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Ontdek meer over DatingAssistent
              </p>
              <Button
                variant="outline"
                className="w-full border-purple-300 hover:bg-purple-50"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/');
                }}
              >
                Homepage
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500"
        >
          <p>
            Je bent succesvol uitgelogd. Al je voortgang is opgeslagen en wacht op je!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
