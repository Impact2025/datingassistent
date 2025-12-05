'use client';

/**
 * Help Page - Wereldklasse Helpdesk
 * Volledige layout met nieuwe kleurenschema
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Mail,
  Phone,
  Search,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Video,
  X,
  Users,
  Zap,
  Shield,
  CreditCard,
  Settings,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';
import { IrisSupportChat } from '@/components/support/iris-support-chat';
import { KB_ARTICLES, FAQ_CATEGORIES } from '@/lib/support/knowledge-base';
import type { UserSegment } from '@/lib/support/types';

// Popular FAQ items
const POPULAR_FAQ = KB_ARTICLES.slice(0, 8);

// Support categories for the grid
const SUPPORT_CATEGORIES = [
  {
    icon: Zap,
    title: 'Aan de slag',
    description: 'Leer de basis van DatingAssistent',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    articles: 5,
  },
  {
    icon: MessageCircle,
    title: 'Berichten & Chat',
    description: 'Tips voor betere gesprekken',
    color: 'bg-pink-500',
    bgColor: 'bg-pink-50',
    articles: 8,
  },
  {
    icon: CreditCard,
    title: 'Abonnement & Betaling',
    description: 'Facturen, opzeggen, upgrades',
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    articles: 6,
  },
  {
    icon: Settings,
    title: 'Account & Instellingen',
    description: 'Profiel, wachtwoord, privacy',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    articles: 4,
  },
  {
    icon: Shield,
    title: 'Privacy & Veiligheid',
    description: 'Je gegevens beschermen',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    articles: 3,
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Stap-voor-stap uitleg',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    articles: 10,
  },
];

function HelpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [userSegment, setUserSegment] = useState<UserSegment>('anonymous');

  // Check for chat param in URL
  useEffect(() => {
    if (searchParams.get('chat') === 'open') {
      setIsChatOpen(true);
    }
  }, [searchParams]);

  // Filter FAQ based on search
  const filteredFaq = searchQuery.trim()
    ? KB_ARTICLES.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 8)
    : POPULAR_FAQ;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-pink-100 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo iconSize={40} textSize="lg" />
            <Button
              onClick={() => router.push('/dashboard')}
              variant="ghost"
              className="text-gray-600 hover:text-pink-600"
            >
              Terug naar Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full text-pink-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              24/7 AI-Powered Support
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Hoe kunnen we je{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                helpen?
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Zoek in onze kennisbank of chat direct met Iris, onze AI-assistent
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zoek in veelgestelde vragen..."
                  className="w-full pl-14 pr-14 py-4 text-lg border-2 border-pink-200 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all text-gray-900 placeholder:text-gray-400 shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5 text-pink-500" />
                <span>24/7 Beschikbaar</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Zap className="w-5 h-5 text-purple-500" />
                <span>&lt; 30 sec reactietijd</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>95% direct opgelost</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Support Channel Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            {/* Chat with Iris */}
            <Card
              className="border-2 border-pink-200 hover:border-pink-400 transition-all cursor-pointer hover:shadow-xl group"
              onClick={() => setIsChatOpen(true)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      Chat met Iris
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Direct antwoord van onze AI-assistent
                    </p>
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Online - Geen wachttijd
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsChatOpen(true);
                  }}
                >
                  Start Chat
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Email Support */}
            <Card
              className="border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer hover:shadow-xl group"
              onClick={() => router.push('/contact')}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      E-mail Support
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Voor uitgebreide vragen en bijlagen
                    </p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      Reactie binnen 24 uur
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-purple-300 hover:bg-purple-50 text-purple-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/contact');
                  }}
                >
                  Stuur Bericht
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Phone Support */}
            <Card
              className="border-2 border-green-200 hover:border-green-400 transition-all cursor-pointer hover:shadow-xl group"
              onClick={() => (window.location.href = 'tel:+31201234567')}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      Bel Ons
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Persoonlijk contact met ons team
                    </p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      Ma-Vr 9:00-17:00
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-green-300 hover:bg-green-50 text-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = 'tel:+31201234567';
                  }}
                >
                  +31 20 123 4567
                  <Phone className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Categories */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-pink-500" />
                Help Categorieën
              </h2>
              <div className="space-y-3">
                {SUPPORT_CATEGORIES.map((category, index) => (
                  <Card
                    key={index}
                    className="border hover:border-pink-300 transition-all cursor-pointer hover:shadow-md group"
                    onClick={() => router.push('/faq')}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${category.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <category.icon className={`w-5 h-5 ${category.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm group-hover:text-pink-600 transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {category.description}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        {category.articles}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* All FAQ Link */}
              <Button
                variant="outline"
                className="w-full mt-4 border-pink-200 hover:bg-pink-50"
                onClick={() => router.push('/faq')}
              >
                Bekijk alle artikelen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            {/* Right Column - FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-pink-500" />
                {searchQuery ? 'Zoekresultaten' : 'Veelgestelde Vragen'}
              </h2>

              <Card className="border-2 border-gray-100">
                <CardContent className="p-0 divide-y divide-gray-100">
                  {filteredFaq.map((item) => (
                    <div key={item.id} className="overflow-hidden">
                      <button
                        onClick={() =>
                          setExpandedFaq(expandedFaq === item.id ? null : item.id)
                        }
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 pr-4">
                          {item.title}
                        </span>
                        {expandedFaq === item.id ? (
                          <ChevronUp className="w-5 h-5 text-pink-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedFaq === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-5 pb-5 text-gray-600 border-t border-gray-100 pt-4">
                              {item.summary}
                              <div className="mt-4 flex flex-wrap gap-2">
                                {item.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-pink-50 text-pink-600 text-xs rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                              <a
                                href={`/help/artikel/${item.slug}`}
                                className="inline-flex items-center gap-1 mt-4 text-pink-600 hover:text-pink-700 font-medium text-sm"
                              >
                                Lees meer
                                <ArrowRight className="w-4 h-4" />
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  {filteredFaq.length === 0 && searchQuery && (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 mb-2">Geen resultaten gevonden</p>
                      <button
                        onClick={() => setIsChatOpen(true)}
                        className="text-pink-600 hover:text-pink-700 font-medium"
                      >
                        Vraag het aan Iris →
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Nog steeds vragen?
          </h2>
          <p className="text-pink-100 mb-6">
            Ons team staat voor je klaar. Mail naar{' '}
            <a href="mailto:support@datingassistent.nl" className="underline hover:no-underline">
              support@datingassistent.nl
            </a>
          </p>
          <Button
            onClick={() => setIsChatOpen(true)}
            className="bg-white text-pink-600 hover:bg-pink-50"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat met Iris
          </Button>
        </div>
      </section>

      {/* Floating Chat Button (mobile) */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg hover:shadow-xl flex items-center justify-center md:hidden"
          >
            <MessageCircle className="w-7 h-7 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Iris Support Chat */}
      <AnimatePresence>
        {isChatOpen && (
          <IrisSupportChat
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            userSegment={userSegment}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Loading fallback
function HelpPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600">Help center laden...</p>
      </div>
    </div>
  );
}

// Default export with Suspense
export default function HelpPage() {
  return (
    <Suspense fallback={<HelpPageLoading />}>
      <HelpPageContent />
    </Suspense>
  );
}
