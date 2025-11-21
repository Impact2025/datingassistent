import { TitleSlide } from '@/types/slides';

interface TitleSlideTemplateProps {
  slide: TitleSlide;
}

export function TitleSlideTemplate({ slide }: TitleSlideTemplateProps) {
  const bgColor = slide.backgroundColor || 'from-purple-600 to-pink-600';
  const textColor = slide.textColor || 'text-white';

  return (
    <div className={`w-full h-full bg-gradient-to-br ${bgColor} flex flex-col items-center justify-center text-center p-8 rounded-xl`}>
      {slide.emoji && (
        <div className="text-6xl md:text-8xl mb-6 animate-bounce">
          {slide.emoji}
        </div>
      )}

      <h1 className={`text-4xl md:text-6xl font-bold ${textColor} mb-4 leading-tight`}>
        {slide.title}
      </h1>

      {slide.subtitle && (
        <p className={`text-xl md:text-2xl ${textColor} opacity-90 max-w-2xl`}>
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}
