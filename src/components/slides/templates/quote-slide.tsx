import { QuoteSlide } from '@/types/slides';
import * as Lucide from 'lucide-react';

interface QuoteSlideTemplateProps {
  slide: QuoteSlide;
}

export function QuoteSlideTemplate({ slide }: QuoteSlideTemplateProps) {
  const bgColor = slide.backgroundColor || 'bg-gradient-to-br from-amber-50 to-orange-50';

  return (
    <div className={`w-full h-full ${bgColor} rounded-xl p-8 md:p-12 flex flex-col items-center justify-center text-center`}>
      {slide.emoji && (
        <div className="text-5xl mb-6">{slide.emoji}</div>
      )}

      <Lucide.Quote className="h-12 w-12 text-orange-400 mb-6" />

      <blockquote className="text-2xl md:text-3xl font-semibold text-gray-800 italic max-w-3xl leading-relaxed mb-6">
        "{slide.quote}"
      </blockquote>

      {slide.author && (
        <div className="flex items-center gap-2 text-lg text-gray-600">
          <div className="h-px w-12 bg-gray-400"></div>
          <span>{slide.author}</span>
          <div className="h-px w-12 bg-gray-400"></div>
        </div>
      )}
    </div>
  );
}
