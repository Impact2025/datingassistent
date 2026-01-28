import { QuoteSlide } from '@/types/slides';
import * as Lucide from 'lucide-react';

interface QuoteSlideTemplateProps {
  slide: QuoteSlide;
}

export function QuoteSlideTemplate({ slide }: QuoteSlideTemplateProps) {
  const bgColor = slide.backgroundColor || 'bg-gray-50';

  return (
    <div className={`w-full h-full ${bgColor} flex flex-col items-center justify-center p-6`}>
      {/* Main content card */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 text-center">
        <div className="mb-4">
          <Lucide.Quote className="h-10 w-10 text-coral-400 mx-auto" />
        </div>

        <blockquote className="text-xl md:text-2xl font-semibold text-gray-800 italic max-w-2xl leading-relaxed mb-6">
          "{slide.quote}"
        </blockquote>

        {slide.author && (
          <div className="flex items-center justify-center gap-2 text-base text-gray-500">
            <div className="h-px w-6 bg-gray-300"></div>
            <span className="font-medium">{slide.author}</span>
            <div className="h-px w-6 bg-gray-300"></div>
          </div>
        )}
      </div>
    </div>
  );
}
