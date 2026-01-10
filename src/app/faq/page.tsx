'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  ChevronDown,
  Search,
  X,
  MessageCircle,
  Mail,
  HelpCircle,
  CreditCard,
  Shield,
  Settings,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import {
  FAQ_DATA,
  FAQ_CATEGORIES_META,
  searchFAQs,
  getFAQsByCategory,
  getAllCategories,
  type FAQCategory,
  type FAQItem,
} from '@/lib/faq/faq-data';

// Icon mapping
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  HelpCircle,
  CreditCard,
  Shield,
  Settings,
  Sparkles,
  User,
  Users,
};

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | null>(null);

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    let results = FAQ_DATA;

    // Filter by category first
    if (selectedCategory) {
      results = getFAQsByCategory(selectedCategory);
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      const searchResults = searchFAQs(searchQuery);
      if (selectedCategory) {
        results = searchResults.filter(faq => faq.category === selectedCategory);
      } else {
        results = searchResults;
      }
    }

    return results;
  }, [searchQuery, selectedCategory]);

  // Group FAQs by category for display
  const groupedFAQs = useMemo(() => {
    if (selectedCategory || searchQuery.trim()) {
      return { [selectedCategory || 'Zoekresultaten']: filteredFAQs };
    }

    return filteredFAQs.reduce((acc, faq) => {
      const category = faq.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(faq);
      return acc;
    }, {} as Record<string, FAQItem[]>);
  }, [filteredFAQs, selectedCategory, searchQuery]);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const categories = getAllCategories();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero Header */}
        <header className="bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-12">
            {/* Breadcrumb */}
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="/" className="hover:text-pink-500 transition-colors">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-900 dark:text-gray-100 font-medium">FAQ</li>
              </ol>
            </nav>

            <Button variant="ghost" asChild className="mb-6 -ml-4">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug naar home
              </Link>
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                Veelgestelde Vragen
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                Vind snel antwoord op je vragen over DatingAssistent. Gebruik de zoekfunctie of
                filter op categorie.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-8 max-w-2xl"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Zoek in veelgestelde vragen..."
                  className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Category Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 flex flex-wrap gap-2"
            >
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                Alle categorieën
              </button>
              {categories.map(category => {
                const meta = FAQ_CATEGORIES_META[category];
                const Icon = CATEGORY_ICONS[meta.icon] || HelpCircle;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {meta.label}
                  </button>
                );
              })}
            </motion.div>

            {/* Active Filters */}
            {(searchQuery || selectedCategory) && (
              <div className="mt-4 flex items-center gap-3 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {filteredFAQs.length} resultaten gevonden
                </span>
                <button
                  onClick={clearFilters}
                  className="text-pink-500 hover:text-pink-600 font-medium transition-colors"
                >
                  Filters wissen
                </button>
              </div>
            )}
          </div>
        </header>

        {/* FAQ Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* FAQ List */}
            {filteredFAQs.length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedFAQs).map(([category, faqs]) => (
                  <div key={category}>
                    {/* Category Header */}
                    {!searchQuery && (
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
                        {FAQ_CATEGORIES_META[category as FAQCategory]?.label || category}
                      </h2>
                    )}

                    {/* FAQ Items */}
                    <div className="space-y-3">
                      {faqs.map((faq, index) => (
                        <FAQAccordionItem
                          key={faq.id}
                          faq={faq}
                          isOpen={openId === faq.id}
                          onToggle={() => toggleFAQ(faq.id)}
                          index={index}
                          searchQuery={searchQuery}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No Results */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-lg mb-2">
                  Geen resultaten gevonden
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  We konden geen vragen vinden die overeenkomen met je zoekopdracht. Probeer andere
                  zoektermen of stel je vraag aan Iris.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={clearFilters}
                    className="text-pink-500 hover:text-pink-600 font-medium transition-colors"
                  >
                    Alle vragen bekijken
                  </button>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Vraag het aan Iris
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Iris CTA Card */}
            <Card className="mt-12 p-8 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border-pink-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-pink-500" />
                </div>
                <div className="text-center md:text-left flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                    Vraag niet gevonden?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Iris, onze AI-assistent, staat 24/7 klaar om al je vragen te beantwoorden.
                  </p>
                </div>
                <Link href="/dashboard">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat met Iris
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Contact Card */}
            <Card className="mt-6 p-8 text-center border-gray-200 dark:border-gray-700">
              <Mail className="mx-auto h-10 w-10 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-2">
                Liever persoonlijk contact?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Ons support team staat voor je klaar
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link href="mailto:support@datingassistent.nl">
                  <Button variant="outline" className="rounded-full">
                    support@datingassistent.nl
                  </Button>
                </Link>
                <Link href="/#contact">
                  <Button variant="outline" className="rounded-full">
                    Contactformulier
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />

      {/* Schema.org FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_DATA.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </div>
  );
}

interface FAQAccordionItemProps {
  faq: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  searchQuery?: string;
}

function FAQAccordionItem({ faq, isOpen, onToggle, index, searchQuery }: FAQAccordionItemProps) {
  // Highlight search terms in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-pink-200 dark:hover:border-pink-800 hover:shadow-md transition-all"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-inset"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-900 dark:text-gray-50">
          {searchQuery ? highlightText(faq.question, searchQuery) : faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 pt-0 border-t border-gray-100 dark:border-gray-800">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed pt-4">
                {searchQuery ? highlightText(faq.answer, searchQuery) : faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
