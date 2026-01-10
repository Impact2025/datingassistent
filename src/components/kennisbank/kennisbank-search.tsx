'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Search, X, Clock, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { KennisbankArticle } from '@/lib/kennisbank';

const RECENT_SEARCHES_KEY = 'kennisbank_recent_searches';
const MAX_RECENT_SEARCHES = 5;

interface KennisbankSearchProps {
  articles: KennisbankArticle[];
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

interface SearchResult extends KennisbankArticle {
  matchType: 'title' | 'description' | 'keyword' | 'content';
  matchScore: number;
}

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const searches = getRecentSearches().filter((s) => s !== query);
    searches.unshift(query);
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES))
    );
  } catch {
    // Ignore storage errors
  }
}

export function KennisbankSearch({
  articles,
  className,
  placeholder = 'Zoek in de kennisbank...',
  autoFocus = false,
}: KennisbankSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Search logic with scoring
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim() || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(/\s+/).filter((w) => w.length >= 2);

    return articles
      .map((article) => {
        let matchScore = 0;
        let matchType: SearchResult['matchType'] = 'content';

        const lowerTitle = article.title.toLowerCase();
        const lowerDescription = article.description.toLowerCase();
        const lowerKeywords = article.keywords?.join(' ').toLowerCase() || '';

        // Title match (highest priority)
        if (lowerTitle.includes(lowerQuery)) {
          matchScore += 100;
          matchType = 'title';
        } else if (words.some((w) => lowerTitle.includes(w))) {
          matchScore += 50;
          matchType = 'title';
        }

        // Description match
        if (lowerDescription.includes(lowerQuery)) {
          matchScore += 40;
          if (matchType !== 'title') matchType = 'description';
        } else if (words.some((w) => lowerDescription.includes(w))) {
          matchScore += 20;
          if (matchType !== 'title') matchType = 'description';
        }

        // Keyword match
        if (lowerKeywords.includes(lowerQuery)) {
          matchScore += 60;
          if (matchType === 'content') matchType = 'keyword';
        } else if (words.some((w) => lowerKeywords.includes(w))) {
          matchScore += 30;
          if (matchType === 'content') matchType = 'keyword';
        }

        // Pillar articles get a boost
        if (article.type === 'pillar') {
          matchScore += 10;
        }

        return { ...article, matchType, matchScore };
      })
      .filter((r) => r.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);
  }, [articles, query]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = results.length > 0 ? results : recentSearches;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < items.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            if (results.length > 0 && results[selectedIndex]) {
              navigateToArticle(results[selectedIndex].slug);
            } else if (recentSearches[selectedIndex]) {
              setQuery(recentSearches[selectedIndex]);
            }
          }
          break;
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [results, recentSearches, selectedIndex]
  );

  const navigateToArticle = useCallback(
    (slug: string) => {
      if (query.trim()) {
        saveRecentSearch(query.trim());
      }
      setIsOpen(false);
      setQuery('');
      router.push(`/kennisbank/${slug}`);
    },
    [query, router]
  );

  const handleFocus = () => {
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const showDropdown = isOpen && (query.length >= 2 || recentSearches.length > 0);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-10 pr-10 h-12 text-base"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Wis zoekopdracht"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-2 w-full bg-card border rounded-lg shadow-lg overflow-hidden"
          >
            {/* Search Results */}
            {results.length > 0 ? (
              <div className="py-2">
                <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  {results.length} resultaten
                </div>
                <ul role="listbox">
                  {results.map((result, index) => (
                    <li key={result.slug} role="option" aria-selected={index === selectedIndex}>
                      <button
                        onClick={() => navigateToArticle(result.slug)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          'w-full px-3 py-2.5 flex items-start gap-3 text-left transition-colors',
                          index === selectedIndex
                            ? 'bg-muted'
                            : 'hover:bg-muted/50'
                        )}
                      >
                        <BookOpen className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate">
                              {result.title.split(':')[0]}
                            </span>
                            {result.type === 'pillar' && (
                              <Badge variant="default" className="text-[10px] shrink-0">
                                Gids
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {result.description}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : query.length >= 2 ? (
              /* No Results */
              <div className="px-4 py-8 text-center">
                <Sparkles className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Geen artikelen gevonden voor &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Probeer een andere zoekterm
                </p>
              </div>
            ) : (
              /* Recent Searches */
              recentSearches.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    Recente zoekopdrachten
                  </div>
                  <ul>
                    {recentSearches.map((search, index) => (
                      <li key={search}>
                        <button
                          onClick={() => setQuery(search)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={cn(
                            'w-full px-3 py-2 flex items-center gap-3 text-left transition-colors',
                            index === selectedIndex
                              ? 'bg-muted'
                              : 'hover:bg-muted/50'
                          )}
                        >
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{search}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}

            {/* Keyboard hint */}
            <div className="px-3 py-2 border-t bg-muted/30 flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↑↓</kbd>
                navigeren
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">Enter</kbd>
                selecteren
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">Esc</kbd>
                sluiten
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
