import { SplitSlide } from '@/types/slides';

interface SplitSlideTemplateProps {
  slide: SplitSlide;
}

export function SplitSlideTemplate({ slide }: SplitSlideTemplateProps) {
  const bgColor = slide.backgroundColor || 'bg-gray-50';

  return (
    <div className={`w-full h-full ${bgColor} flex flex-col items-center justify-center p-6`}>
      {/* Main content card */}
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-pink-600 mb-6 text-center">
          {slide.title}
        </h2>

        {/* Split content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="prose prose-base max-w-none text-gray-700">
              {slide.leftContent.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3 last:mb-0 leading-relaxed text-sm">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            {slide.isRightImage ? (
              <div className="flex items-center justify-center h-full">
                <img
                  src={slide.rightContent}
                  alt="Slide visual"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            ) : (
              <div className="prose prose-base max-w-none text-gray-700">
                {slide.rightContent.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 last:mb-0 leading-relaxed text-sm">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
