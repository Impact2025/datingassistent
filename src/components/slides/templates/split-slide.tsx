import { SplitSlide } from '@/types/slides';

interface SplitSlideTemplateProps {
  slide: SplitSlide;
}

export function SplitSlideTemplate({ slide }: SplitSlideTemplateProps) {
  const bgColor = slide.backgroundColor || 'bg-white';

  return (
    <div className={`w-full h-full ${bgColor} rounded-xl p-8 md:p-12 flex flex-col`}>
      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-bold text-purple-600 mb-6">
        {slide.title}
      </h2>

      {/* Split content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side */}
        <div className="flex flex-col justify-center">
          <div className="prose prose-lg max-w-none text-gray-700">
            {slide.leftContent.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-center">
          {slide.isRightImage ? (
            <img
              src={slide.rightContent}
              alt="Slide visual"
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          ) : (
            <div className="prose prose-lg max-w-none text-gray-700">
              {slide.rightContent.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
