import { ChecklistSlide } from '@/types/slides';
import * as Lucide from 'lucide-react';

interface ChecklistSlideTemplateProps {
  slide: ChecklistSlide;
}

export function ChecklistSlideTemplate({ slide }: ChecklistSlideTemplateProps) {
  const bgColor = slide.backgroundColor || 'bg-gradient-to-br from-green-50 to-emerald-50';

  return (
    <div className={`w-full h-full ${bgColor} rounded-xl p-8 md:p-12 flex flex-col`}>
      {/* Title with optional emoji */}
      <div className="mb-8">
        {slide.emoji && (
          <div className="text-5xl mb-3">{slide.emoji}</div>
        )}
        <h2 className="text-3xl md:text-4xl font-bold text-green-700">
          {slide.title}
        </h2>
      </div>

      {/* Checklist items */}
      <div className="space-y-4 flex-1">
        {slide.items.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`flex-shrink-0 mt-1 ${
              item.checked
                ? 'text-green-600'
                : 'text-gray-300'
            }`}>
              {item.checked ? (
                <Lucide.CheckCircle2 className="h-6 w-6" />
              ) : (
                <Lucide.Circle className="h-6 w-6" />
              )}
            </div>
            <p className={`text-lg leading-relaxed ${
              item.checked
                ? 'text-gray-800 font-medium'
                : 'text-gray-600'
            }`}>
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
