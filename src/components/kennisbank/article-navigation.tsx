'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import type { KennisbankArticle } from '@/lib/kennisbank';

interface ArticleNavigationProps {
  previousArticle?: KennisbankArticle | null;
  nextArticle?: KennisbankArticle | null;
  className?: string;
}

export function ArticleNavigation({
  previousArticle,
  nextArticle,
  className,
}: ArticleNavigationProps) {
  if (!previousArticle && !nextArticle) return null;

  return (
    <nav
      className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}
      aria-label="Artikel navigatie"
    >
      {/* Previous Article */}
      <div className={cn(!previousArticle && 'sm:col-start-2')}>
        {previousArticle && (
          <Link
            href={`/kennisbank/${previousArticle.slug}`}
            className="group flex flex-col h-full p-4 border rounded-lg bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200"
          >
            <span className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Vorig artikel
            </span>
            <span className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
              {previousArticle.title.split(':')[0]}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Clock className="w-3 h-3" />
              {previousArticle.readingTime} min
            </span>
          </Link>
        )}
      </div>

      {/* Next Article */}
      <div>
        {nextArticle && (
          <Link
            href={`/kennisbank/${nextArticle.slug}`}
            className="group flex flex-col h-full p-4 border rounded-lg bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 text-right"
          >
            <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground mb-2">
              Volgend artikel
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
              {nextArticle.title.split(':')[0]}
            </span>
            <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-2">
              <Clock className="w-3 h-3" />
              {nextArticle.readingTime} min
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}

// Compact inline version
export function ArticleNavigationInline({
  previousArticle,
  nextArticle,
  className,
}: ArticleNavigationProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {previousArticle ? (
        <Link
          href={`/kennisbank/${previousArticle.slug}`}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Vorig</span>
        </Link>
      ) : (
        <div />
      )}

      {nextArticle ? (
        <Link
          href={`/kennisbank/${nextArticle.slug}`}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <span className="hidden sm:inline">Volgend</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
