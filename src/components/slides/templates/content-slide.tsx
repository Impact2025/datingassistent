import { ContentSlide } from '@/types/slides';
import * as Lucide from 'lucide-react';

interface ContentSlideTemplateProps {
  slide: ContentSlide;
}

export function ContentSlideTemplate({ slide }: ContentSlideTemplateProps) {
  const bgColor = slide.backgroundColor || 'bg-gray-50';
  const highlightColor = slide.highlightColor || 'text-coral-600';

  return (
    <div className={`w-full h-full ${bgColor} flex flex-col items-center justify-center p-6`}>
      {/* Main content card */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className={`text-2xl md:text-3xl font-bold ${highlightColor} leading-tight`}>
            {slide.title}
          </h2>
        </div>

        {/* Content text (if provided) */}
        {slide.content && (
          <div className="mb-6 text-center">
            <p className="text-base text-gray-700 leading-relaxed max-w-2xl mx-auto">
              {slide.content}
            </p>
          </div>
        )}

        {/* Bullet points */}
        {slide.bullets && slide.bullets.length > 0 && (
          <div className="space-y-3 w-full max-w-2xl mx-auto">
            {slide.bullets.map((bullet, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className={`flex-shrink-0 mt-0.5 p-1.5 rounded-full ${highlightColor} bg-coral-50`}>
                  <Lucide.Check className="h-3.5 w-3.5" />
                </div>
                <p className="text-sm text-gray-800 leading-relaxed flex-1">
                  {bullet}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
