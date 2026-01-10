'use client';

import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ShareButtonProps {
  title: string;
  description: string;
  variant?: 'default' | 'icon';
  className?: string;
}

export function ShareButton({
  title,
  description,
  variant = 'icon',
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';

    // Try native share first (mobile)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fall back to clipboard copy
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className={className}
              aria-label="Delen"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500 dark:text-green-400" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? 'Link gekopieerd!' : 'Deel dit artikel'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button variant="outline" onClick={handleShare} className={className}>
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Gekopieerd!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          Delen
        </>
      )}
    </Button>
  );
}
