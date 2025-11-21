import { ImageSlide } from '@/types/slides';

interface ImageSlideTemplateProps {
  slide: ImageSlide;
}

export function ImageSlideTemplate({ slide }: ImageSlideTemplateProps) {
  const bgColor = slide.backgroundColor || 'bg-gray-50';

  return (
    <div className={`w-full h-full ${bgColor} rounded-xl p-8 md:p-12 flex flex-col`}>
      {slide.title && (
        <h2 className="text-3xl md:text-4xl font-bold text-purple-600 mb-6 text-center">
          {slide.title}
        </h2>
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <img
            src={slide.imageUrl}
            alt={slide.caption || 'Slide image'}
            className="w-full h-auto rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {slide.caption && (
        <p className="text-center text-lg text-gray-600 mt-6 italic">
          {slide.caption}
        </p>
      )}
    </div>
  );
}
