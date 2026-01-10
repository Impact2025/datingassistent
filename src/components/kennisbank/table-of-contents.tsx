'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { List, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TOCHeading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TOCHeading[];
  className?: string;
}

export function TableOfContents({ headings, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track active heading on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
      if (isMobile) setIsCollapsed(true);
    }
  }, [isMobile]);

  if (headings.length === 0) return null;

  // Group h3s under their parent h2
  const groupedHeadings = headings.reduce<Array<TOCHeading & { children?: TOCHeading[] }>>((acc, heading) => {
    if (heading.level === 2) {
      acc.push({ ...heading, children: [] });
    } else if (heading.level === 3 && acc.length > 0) {
      const lastH2 = acc[acc.length - 1];
      if (lastH2.children) {
        lastH2.children.push(heading);
      }
    }
    return acc;
  }, []);

  return (
    <nav
      className={cn(
        'bg-card border rounded-lg shadow-sm',
        'lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto',
        className
      )}
      aria-label="Inhoudsopgave"
    >
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 text-left lg:cursor-default"
        aria-expanded={!isCollapsed}
      >
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <List className="w-4 h-4" />
          Inhoudsopgave
        </span>
        <span className="lg:hidden text-muted-foreground">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </span>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {(!isCollapsed || !isMobile) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="px-4 pb-4 space-y-1">
              {groupedHeadings.map((heading) => (
                <li key={heading.id}>
                  <button
                    onClick={() => scrollToHeading(heading.id)}
                    className={cn(
                      'w-full text-left py-1.5 px-2 rounded-md text-sm transition-all duration-200',
                      'hover:bg-muted hover:text-foreground',
                      activeId === heading.id
                        ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-0.5 pl-2.5'
                        : 'text-muted-foreground'
                    )}
                  >
                    {heading.text}
                  </button>

                  {/* Nested h3s */}
                  {heading.children && heading.children.length > 0 && (
                    <ul className="ml-3 mt-1 space-y-1 border-l border-border pl-2">
                      {heading.children.map((child) => (
                        <li key={child.id}>
                          <button
                            onClick={() => scrollToHeading(child.id)}
                            className={cn(
                              'w-full text-left py-1 px-2 rounded-md text-xs transition-all duration-200',
                              'hover:bg-muted hover:text-foreground',
                              activeId === child.id
                                ? 'text-primary font-medium'
                                : 'text-muted-foreground'
                            )}
                          >
                            {child.text}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// Utility function to extract headings from markdown content
export function extractHeadings(content: string): TOCHeading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TOCHeading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    headings.push({ id, text, level });
  }

  return headings;
}
