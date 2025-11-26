import { ChecklistSlide } from '@/types/slides';
import * as Lucide from 'lucide-react';

interface ChecklistSlideTemplateProps {
  slide: ChecklistSlide;
}

export function ChecklistSlideTemplate({ slide }: ChecklistSlideTemplateProps) {
  const bgColor = slide.backgroundColor || 'bg-gray-50';

  return (
    <div className={`w-full h-full ${bgColor} flex flex-col items-center justify-center p-6`}>
      {/* Main content card */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-pink-600">
            {slide.title}
          </h2>
        </div>

        {/* Checklist items */}
        <div className="space-y-3 w-full max-w-2xl mx-auto">
          {slide.items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <div className={`flex-shrink-0 mt-0.5 ${
                item.checked
                  ? 'text-green-600'
                  : 'text-pink-300'
              }`}>
                {item.checked ? (
                  <Lucide.CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Lucide.Circle className="h-4 w-4" />
                )}
              </div>
              <p className={`text-sm leading-relaxed flex-1 ${
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
    </div>
  );
}
