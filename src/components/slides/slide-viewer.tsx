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
    <div className="w-full max-w-5xl mx-auto">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Slide {currentSlide + 1} van {totalSlides}
          </span>
          <span className="text-sm text-purple-600">{deck.title}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Slide container */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ minHeight: '500px', aspectRatio: '16/9' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Slide content */}
        <div className="w-full h-full p-8 md:p-12 flex flex-col">
          {renderSlide(deck.slides[currentSlide])}
        </div>

        {/* Navigation arrows (overlay) */}
        {!isFirstSlide && (
          <button
            onClick={goToPrevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
            aria-label="Vorige slide"
          >
            <Lucide.ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
        )}

        {!isLastSlide && (
          <button
            onClick={goToNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
            aria-label="Volgende slide"
          >
            <Lucide.ChevronRight className="h-6 w-6 text-gray-800" />
          </button>
        )}
      </div>

      {/* Bottom controls */}
      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPrevSlide}
          disabled={isFirstSlide}
          className="gap-2"
        >
          <Lucide.ChevronLeft className="h-4 w-4" />
          Vorige
        </Button>

        {/* Slide dots */}
        <div className="flex gap-2">
          {deck.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-purple-600'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ga naar slide ${index + 1}`}
            />
          ))}
        </div>

        <Button
          onClick={goToNextSlide}
          className="gap-2"
        >
          {isLastSlide ? (
            <>
              Afronden
              <Lucide.Check className="h-4 w-4" />
            </>
          ) : (
            <>
              Volgende
              <Lucide.ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Keyboard hints */}
      <div className="mt-4 text-center text-sm text-gray-500">
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
