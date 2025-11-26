'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import * as Lucide from 'lucide-react';
import { Slide, SlideDeck } from '@/types/slides';
import { TitleSlideTemplate } from './templates/title-slide';
import { ContentSlideTemplate } from './templates/content-slide';
import { QuoteSlideTemplate } from './templates/quote-slide';
import { SplitSlideTemplate } from './templates/split-slide';
import { ImageSlideTemplate } from './templates/image-slide';
import { ChecklistSlideTemplate } from './templates/checklist-slide';

interface SlideViewerProps {
  deck: SlideDeck;
  onComplete?: () => void;
}

export default function SlideViewer({ deck, onComplete }: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const totalSlides = deck.slides.length;
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === totalSlides - 1;

  const goToNextSlide = useCallback(() => {
    if (!isLastSlide) {
      setCurrentSlide(prev => prev + 1);
    } else if (onComplete) {
      onComplete();
    }
  }, [isLastSlide, onComplete]);

  const goToPrevSlide = useCallback(() => {
    if (!isFirstSlide) {
      setCurrentSlide(prev => prev - 1);
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

  const renderSlide = (slide: Slide) => {
    switch (slide.type) {
      case 'title':
        return <TitleSlideTemplate slide={slide} />;
      case 'content':
        return <ContentSlideTemplate slide={slide} />;
      case 'quote':
        return <QuoteSlideTemplate slide={slide} />;
      case 'split':
        return <SplitSlideTemplate slide={slide} />;
      case 'image':
        return <ImageSlideTemplate slide={slide} />;
      case 'checklist':
        return <ChecklistSlideTemplate slide={slide} />;
      default:
        return <div>Unknown slide type</div>;
    }
  };

  const progressPercentage = ((currentSlide + 1) / totalSlides) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Slide {currentSlide + 1} van {totalSlides}
          </span>
          <span className="text-sm text-pink-600 font-medium">{deck.title}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-pink-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Slide container */}
      <div
        className="relative bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-100"
        style={{ minHeight: '500px', aspectRatio: '16/10' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Slide content */}
        <div className="w-full h-full flex flex-col">
          {renderSlide(deck.slides[currentSlide])}
        </div>

        {/* Navigation arrows (overlay) */}
        {!isFirstSlide && (
          <button
            onClick={goToPrevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white hover:bg-gray-50 shadow-sm border border-gray-200 transition-all hover:scale-105"
            aria-label="Vorige slide"
          >
            <Lucide.ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
        )}

        {!isLastSlide && (
          <button
            onClick={goToNextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white hover:bg-gray-50 shadow-sm border border-gray-200 transition-all hover:scale-105"
            aria-label="Volgende slide"
          >
            <Lucide.ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Bottom controls */}
      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPrevSlide}
          disabled={isFirstSlide}
          className="gap-1.5 px-4 py-2 h-9 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm"
        >
          <Lucide.ChevronLeft className="h-3.5 w-3.5" />
          Vorige
        </Button>

        {/* Slide dots */}
        <div className="flex gap-1.5">
          {deck.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-5 bg-pink-500'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ga naar slide ${index + 1}`}
            />
          ))}
        </div>

        <Button
          onClick={goToNextSlide}
          className="gap-1.5 px-4 py-2 h-9 bg-pink-500 hover:bg-pink-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all text-sm"
        >
          {isLastSlide ? (
            <>
              Afronden
              <Lucide.Check className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Volgende
              <Lucide.ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>

      {/* Keyboard hints */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <span className="hidden md:inline">
          Gebruik ← → pijltjestoetsen of spatiebalk om te navigeren
        </span>
        <span className="md:hidden">
          Swipe om te navigeren
        </span>
      </div>
    </div>
  );
}
