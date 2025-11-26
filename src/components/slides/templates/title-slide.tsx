import { TitleSlide } from '@/types/slides';

interface TitleSlideTemplateProps {
  slide: TitleSlide;
}

export function TitleSlideTemplate({ slide }: TitleSlideTemplateProps) {
  const bgColor = slide.backgroundColor || 'bg-gray-50';
  const textColor = slide.textColor || 'text-gray-900';

  return (
    <div className={`w-full h-full ${bgColor} flex flex-col items-center justify-center p-6`}>
      {/* Main content card */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 text-center">
        <h1 className={`text-3xl md:text-4xl font-bold ${textColor} mb-4 leading-tight`}>
          {slide.title}
        </h1>

        {slide.subtitle && (
          <p className={`text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed`}>
            {slide.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
