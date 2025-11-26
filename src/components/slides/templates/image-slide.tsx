import { ImageSlide } from '@/types/slides';

interface ImageSlideTemplateProps {
  slide: ImageSlide;
}

export function ImageSlideTemplate({ slide }: ImageSlideTemplateProps) {
  const bgColor = slide.backgroundColor || 'bg-gray-50';

  return (
    <div className={`w-full h-full ${bgColor} flex flex-col items-center justify-center p-6`}>
      {/* Main content card */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        {slide.title && (
          <h2 className="text-2xl md:text-3xl font-bold text-pink-600 mb-6 text-center">
            {slide.title}
          </h2>
        )}

        <div className="flex items-center justify-center">
          <div className="max-w-3xl w-full">
            <img
              src={slide.imageUrl}
              alt={slide.caption || 'Slide image'}
              className="w-full h-auto rounded-lg shadow-sm"
            />
          </div>
        </div>

        {slide.caption && (
          <p className="text-center text-sm text-gray-600 mt-4 italic">
            {slide.caption}
          </p>
        )}
      </div>
    </div>
  );
}
