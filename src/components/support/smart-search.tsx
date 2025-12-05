'use client';

/**
 * Smart Search Component
 * Wereldklasse AI-powered zoekbalk voor de helpdesk
 *
 * Features:
 * - Real-time suggestions tijdens typen
 * - AI-powered relevantie scoring
 * - Keyboard navigatie
 * - Populaire zoektermen
 * - Recent gezochte items
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Sparkles,
  Clock,
  TrendingUp,
  ArrowRight,
  FileText,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResult } from '@/lib/support/types';

interface SmartSearchProps {
  onSearch?: (query: string) => void;
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

// Popular searches (could be fetched from analytics)
const POPULAR_SEARCHES = [
  'wachtwoord resetten',
  'abonnement opzeggen',
  'foto analyse',
  'Iris gebruiken',
  'betaling mislukt',
];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function SmartSearch({
  onSearch,
  onResultClick,
  placeholder = 'Zoek in onze help artikelen...',
  className,
  autoFocus = false,
}: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('helpdesk_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('helpdesk_recent_searches', JSON.stringify(updated));
  }, [recentSearches]);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/support/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: debouncedQuery }),
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        } else if (query.trim()) {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
      onSearch?.(query.trim());
      setIsOpen(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query.trim());
    onResultClick?.(result);
    setIsOpen(false);
    setQuery('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const showDropdown = isOpen && (query.trim() || recentSearches.length > 0);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-pink-500 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full pl-12 pr-24 py-4 text-lg',
            'bg-white border-2 border-pink-200 rounded-2xl',
            'focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500',
            'placeholder:text-gray-400 text-gray-900',
            'transition-all duration-200',
            'shadow-sm hover:shadow-md focus:shadow-lg'
          )}
        />

        {/* Right side buttons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={!query.trim()}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl',
              'bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium',
              'transition-all duration-200',
              'disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed'
            )}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Zoek</span>
          </button>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute top-full left-0 right-0 mt-2 z-50',
              'bg-white rounded-2xl border border-gray-200',
              'shadow-xl overflow-hidden'
            )}
          >
            {/* Results */}
            {results.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resultaten
                </div>
                {results.map((result, index) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleResultClick(result)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-xl text-left',
                      'transition-all duration-150',
                      selectedIndex === index
                        ? 'bg-pink-50 border-pink-200'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                      result.type === 'article' ? 'bg-blue-100 text-blue-600' :
                      result.type === 'faq' ? 'bg-purple-100 text-purple-600' :
                      'bg-green-100 text-green-600'
                    )}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {result.title}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {result.summary}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                          {result.category}
                        </span>
                        {result.relevanceScore > 0.8 && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 rounded-full text-green-700">
                            Beste match
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* No results message */}
            {query.trim() && !isLoading && results.length === 0 && (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">Geen resultaten gevonden</p>
                <p className="text-sm text-gray-500 mt-1">
                  Probeer andere zoektermen of{' '}
                  <button className="text-pink-600 hover:underline">
                    chat met Iris
                  </button>
                </p>
              </div>
            )}

            {/* Recent & Popular when no query */}
            {!query.trim() && (
              <div className="divide-y divide-gray-100">
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Recent gezocht
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(search)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                      >
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{search}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular searches */}
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Populair
                  </div>
                  {POPULAR_SEARCHES.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                    >
                      <TrendingUp className="h-4 w-4 text-pink-400" />
                      <span className="text-gray-700">{search}</span>
                    </button>
                  ))}
                </div>

                {/* AI suggestion */}
                <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50">
                  <button className="w-full flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all border border-pink-200">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Vraag het aan Iris</div>
                      <div className="text-sm text-gray-500">
                        Onze AI beantwoordt je vraag direct
                      </div>
                    </div>
                    <Sparkles className="h-5 w-5 text-pink-500 ml-auto" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
