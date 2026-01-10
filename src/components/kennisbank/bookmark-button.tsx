'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const STORAGE_KEY = 'kennisbank_bookmarks';

interface BookmarkButtonProps {
  articleSlug: string;
  articleTitle: string;
  variant?: 'default' | 'icon' | 'text';
  className?: string;
}

interface BookmarkedArticle {
  slug: string;
  title: string;
  bookmarkedAt: string;
}

// Safe localStorage wrapper
function getBookmarks(): BookmarkedArticle[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks: BookmarkedArticle[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Failed to save bookmarks:', error);
  }
}

export function BookmarkButton({
  articleSlug,
  articleTitle,
  variant = 'default',
  className,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  // Check if article is bookmarked on mount
  useEffect(() => {
    const bookmarks = getBookmarks();
    setIsBookmarked(bookmarks.some((b) => b.slug === articleSlug));
  }, [articleSlug]);

  const toggleBookmark = useCallback(() => {
    const bookmarks = getBookmarks();
    const existingIndex = bookmarks.findIndex((b) => b.slug === articleSlug);

    if (existingIndex >= 0) {
      // Remove bookmark
      bookmarks.splice(existingIndex, 1);
      setIsBookmarked(false);
    } else {
      // Add bookmark
      bookmarks.unshift({
        slug: articleSlug,
        title: articleTitle,
        bookmarkedAt: new Date().toISOString(),
      });
      setIsBookmarked(true);
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 600);
    }

    saveBookmarks(bookmarks);
  }, [articleSlug, articleTitle]);

  const Icon = isBookmarked ? BookmarkCheck : Bookmark;
  const label = isBookmarked ? 'Opgeslagen' : 'Opslaan';

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleBookmark}
              className={cn(
                'relative',
                isBookmarked && 'text-primary',
                className
              )}
              aria-label={label}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isBookmarked ? 'bookmarked' : 'not-bookmarked'}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
              </AnimatePresence>

              {/* Bookmark animation */}
              <AnimatePresence>
                {showAnimation && (
                  <motion.div
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <BookmarkCheck className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={toggleBookmark}
        className={cn(
          'flex items-center gap-1.5 text-sm transition-colors',
          isBookmarked
            ? 'text-primary font-medium'
            : 'text-muted-foreground hover:text-foreground',
          className
        )}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    );
  }

  return (
    <Button
      variant={isBookmarked ? 'default' : 'outline'}
      onClick={toggleBookmark}
      className={cn('gap-2', className)}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );
}

// Hook to access bookmarks
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const refresh = useCallback(() => {
    setBookmarks(getBookmarks());
  }, []);

  const isBookmarked = useCallback(
    (slug: string) => bookmarks.some((b) => b.slug === slug),
    [bookmarks]
  );

  const removeBookmark = useCallback((slug: string) => {
    const updated = getBookmarks().filter((b) => b.slug !== slug);
    saveBookmarks(updated);
    setBookmarks(updated);
  }, []);

  const clearAll = useCallback(() => {
    saveBookmarks([]);
    setBookmarks([]);
  }, []);

  return {
    bookmarks,
    refresh,
    isBookmarked,
    removeBookmark,
    clearAll,
  };
}
