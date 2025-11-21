import { ContentSlide } from '@/types/slides';
import * as Lucide from 'lucide-react';

interface ContentSlideTemplateProps {
  slide: ContentSlide;
}

export function ContentSlideTemplate({ slide }: ContentSlideTemplateProps) {
  const bgColor = slide.backgroundColor || 'bg-gradient-to-br from-blue-50 to-purple-50';
  const highlightColor = slide.highlightColor || 'text-purple-600';

  return (
    <div className={`w-full h-full ${bgColor} rounded-xl p-8 md:p-12 flex flex-col`}>
      {/* Title with optional emoji */}
      <div className="mb-6">
        {slide.emoji && (
          <div className="text-5xl mb-3">{slide.emoji}</div>
        )}
        <h2 className={`text-3xl md:text-4xl font-bold ${highlightColor}`}>
          {slide.title}
        </h2>
      </div>

      {/* Content text (if provided) */}
      {slide.content && (
        <div className="mb-6 text-lg text-gray-700 leading-relaxed">
          {slide.content}
        </div>
      )}

      {/* Bullet points */}
      {slide.bullets && slide.bullets.length > 0 && (
        <div className="space-y-4 flex-1">
          {slide.bullets.map((bullet, index) => (
            <div
              key={index}
              className="flex items-start gap-3 animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`flex-shrink-0 mt-1 p-1 rounded-full ${highlightColor} bg-purple-100`}>
                <Lucide.Check className="h-5 w-5" />
              </div>
              <p className="text-lg text-gray-800 leading-relaxed">
                {bullet}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
