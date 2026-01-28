'use client';

/**
 * Dynamic FAQ Component
 * Searchable, categorized FAQ with smooth animations
 *
 * Features:
 * - Category filtering
 * - Search functionality
 * - Accordion with animations
 * - Helpful/not helpful feedback
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Rocket,
  Wrench,
  CreditCard,
  Shield,
  AlertTriangle,
  X,
  CheckCircle,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { KB_ARTICLES, FAQ_CATEGORIES } from '@/lib/support/knowledge-base';

interface DynamicFAQProps {
  className?: string;
  maxItems?: number;
  showSearch?: boolean;
  showCategories?: boolean;
}

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Rocket,
  Wrench,
  CreditCard,
  Shield,
  AlertTriangle,
};

// Map category titles to their icons
const getCategoryIcon = (iconName: string): LucideIcon => {
  return CATEGORY_ICONS[iconName] || Rocket;
};

export function DynamicFAQ({
  className,
  maxItems = 20,
  showSearch = true,
  showCategories = true,
}: DynamicFAQProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  // Filter articles based on search and category
  const filteredArticles = useMemo(() => {
    let articles = KB_ARTICLES;

    // Filter by category
    if (selectedCategory) {
      articles = articles.filter(
        a => a.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      articles = articles.filter(
        a =>
          a.title.toLowerCase().includes(query) ||
          a.summary.toLowerCase().includes(query) ||
          a.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return articles.slice(0, maxItems);
  }, [searchQuery, selectedCategory, maxItems]);

  // Group articles by category for display
  const groupedArticles = useMemo(() => {
    if (selectedCategory) {
      return { [selectedCategory]: filteredArticles };
    }

    return filteredArticles.reduce((acc, article) => {
      const cat = article.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(article);
      return acc;
    }, {} as Record<string, typeof filteredArticles>);
  }, [filteredArticles, selectedCategory]);

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleFeedback = (articleId: string, isHelpful: boolean) => {
    setFeedbackGiven(prev => new Set(prev).add(articleId));
    // In production, log this to analytics
    console.log(`FAQ feedback: ${articleId} = ${isHelpful ? 'helpful' : 'not helpful'}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search & Filters */}
      <div className="space-y-4">
        {/* Search */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek in veelgestelde vragen..."
              className={cn(
                'w-full pl-12 pr-10 py-3',
                'bg-white border-2 border-gray-200 rounded-xl',
                'focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20',
                'text-gray-900 placeholder:text-gray-400',
                'transition-all duration-200'
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        )}

        {/* Category Pills */}
        {showCategories && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium',
                'transition-all duration-200',
                !selectedCategory
                  ? 'bg-coral-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              Alle categorieën
            </button>
            {FAQ_CATEGORIES.map((category) => {
              const Icon = getCategoryIcon(category.icon);
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(
                    selectedCategory === category.title ? null : category.title
                  )}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium',
                    'transition-all duration-200',
                    selectedCategory === category.title
                      ? 'bg-coral-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {category.title}
                </button>
              );
            })}
          </div>
        )}

        {/* Active Filters */}
        {(searchQuery || selectedCategory) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {filteredArticles.length} resultaten
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-coral-600 hover:text-coral-700 font-medium"
            >
              Filters wissen
            </button>
          </div>
        )}
      </div>

      {/* FAQ List */}
      <div className="space-y-6">
        {Object.entries(groupedArticles).map(([category, articles]) => (
          <div key={category} className="space-y-3">
            {/* Category Header (only if not filtered) */}
            {!selectedCategory && (
              <h3 className="font-semibold text-gray-900 text-lg">
                {category}
              </h3>
            )}

            {/* FAQ Items */}
            <div className="space-y-2">
              {articles.map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    'border border-gray-200 rounded-xl overflow-hidden',
                    'bg-white hover:shadow-md transition-shadow'
                  )}
                >
                  {/* Question Header */}
                  <button
                    onClick={() => handleToggle(article.id)}
                    className={cn(
                      'w-full flex items-center justify-between gap-4 p-4 text-left',
                      'hover:bg-gray-50 transition-colors'
                    )}
                  >
                    <span className="font-medium text-gray-900">
                      {article.title}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedId === article.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </motion.div>
                  </button>

                  {/* Answer */}
                  <AnimatePresence>
                    {expandedId === article.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 border-t border-gray-100">
                          {/* Summary */}
                          <p className="text-gray-600 mt-4 mb-4">
                            {article.summary}
                          </p>

                          {/* Content preview */}
                          <div className="prose prose-sm prose-gray max-w-none">
                            <div className="text-gray-700 whitespace-pre-line">
                              {article.content.split('\n').slice(0, 10).join('\n')}
                              {article.content.split('\n').length > 10 && '...'}
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {article.tags.slice(0, 5).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Read More Link */}
                          <a
                            href={`/help/artikel/${article.slug}`}
                            className="inline-flex items-center gap-1 mt-4 text-sm text-coral-600 hover:text-coral-700 font-medium"
                          >
                            Lees volledig artikel
                            <ChevronDown className="w-4 h-4 -rotate-90" />
                          </a>

                          {/* Feedback */}
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            {!feedbackGiven.has(article.id) ? (
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">
                                  Was dit antwoord nuttig?
                                </span>
                                <button
                                  onClick={() => handleFeedback(article.id, true)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm transition-colors"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                  Ja
                                </button>
                                <button
                                  onClick={() => handleFeedback(article.id, false)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm transition-colors"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                  Nee
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                Bedankt voor je feedback!
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* No Results */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">
              Geen resultaten gevonden
            </h3>
            <p className="text-gray-500 mb-4">
              Probeer andere zoektermen of bekijk alle categorieën
            </p>
            <button
              onClick={clearFilters}
              className="text-coral-600 hover:text-coral-700 font-medium"
            >
              Alle vragen bekijken
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact FAQ for embedding
export function CompactFAQ({
  items,
  className,
}: {
  items?: typeof KB_ARTICLES;
  className?: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const articles = items || KB_ARTICLES.slice(0, 5);

  return (
    <div className={cn('space-y-2', className)}>
      {articles.map((article) => (
        <div
          key={article.id}
          className="border border-gray-200 rounded-lg overflow-hidden bg-white"
        >
          <button
            onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
            className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">
              {article.title}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform',
                expandedId === article.id && 'rotate-180'
              )}
            />
          </button>
          {expandedId === article.id && (
            <div className="px-3 pb-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
              {article.summary}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
