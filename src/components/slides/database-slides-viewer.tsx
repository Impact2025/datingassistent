'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface DatabaseSlide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  notes?: string;
}

export interface DatabaseSlidesData {
  title: string;
  description: string;
  slides: DatabaseSlide[];
}

interface DatabaseSlidesViewerProps {
  slidesData: DatabaseSlidesData;
  onComplete?: () => void;
}

export function DatabaseSlidesViewer({ slidesData, onComplete }: DatabaseSlidesViewerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const totalSlides = slidesData.slides.length;
  const isFirstSlide = currentSlideIndex === 0;
  const isLastSlide = currentSlideIndex === totalSlides - 1;
  const currentSlide = slidesData.slides[currentSlideIndex];

  const goToNextSlide = useCallback(() => {
    if (!isLastSlide) {
      setCurrentSlideIndex(prev => prev + 1);
    } else if (onComplete) {
      onComplete();
    }
  }, [isLastSlide, onComplete]);

  const goToPrevSlide = useCallback(() => {
    if (!isFirstSlide) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  }, [isFirstSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide]);

  // Touch/swipe navigation
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextSlide();
    } else if (isRightSwipe) {
      goToPrevSlide();
    }
  };

  if (totalSlides === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">Geen slides beschikbaar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Slide Container */}
      <div
        className="relative rounded-lg border border-border bg-background shadow-lg overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Slide Content */}
        <div className="p-8 md:p-12 min-h-[400px] md:min-h-[500px] flex flex-col">
          {/* Slide Title */}
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            {currentSlide.title}
          </h3>

          {/* Slide Image */}
          {currentSlide.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden border border-border">
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.title}
                className="w-full h-auto max-h-[300px] object-contain"
              />
            </div>
          )}

          {/* Slide Content */}
          {currentSlide.content && (
            <div
              className="prose prose-sm md:prose-base max-w-none text-foreground/90 flex-1"
              dangerouslySetInnerHTML={{ __html: currentSlide.content }}
            />
          )}

          {/* Slide Notes */}
          {currentSlide.notes && (
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs md:text-sm text-muted-foreground italic">
                💡 {currentSlide.notes}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons - Positioned outside content with negative margins */}
        <Button
          onClick={goToPrevSlide}
          disabled={isFirstSlide}
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-background hover:bg-background/90 shadow-lg disabled:opacity-30 z-10"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          onClick={goToNextSlide}
          disabled={isLastSlide}
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-background hover:bg-background/90 shadow-lg disabled:opacity-30 z-10"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Slide Counter and Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Slide {currentSlideIndex + 1} van {totalSlides}
          </span>
          <span className="hidden md:inline text-xs">
            Gebruik pijltjestoetsen of swipe om te navigeren
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
          />
        </div>

        {/* Slide Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {slidesData.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlideIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlideIndex
                  ? 'bg-primary w-8'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Ga naar slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
