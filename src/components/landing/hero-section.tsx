import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative py-12 sm:py-16 md:py-20 px-4 overflow-hidden min-h-[600px] sm:min-h-[650px] flex items-center">
      {/* Full-width Background Image - Optimized with Next.js Image */}
      <Image
        src="/images/hero-dating.jpg.png"
        alt="Dating couple enjoying time together"
        fill
        priority
        className="object-cover object-center"
        quality={85}
        sizes="100vw"
      />

      {/* Dark overlay for better contrast - stronger on mobile, adaptive for dark mode */}
      <div className="absolute inset-0 bg-black/50 sm:bg-black/40 dark:bg-black/70" />

      <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
        {/* Semi-transparent background - adapts to theme */}
        <div className="inline-block bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl max-w-4xl mx-auto w-full border border-white/20 dark:border-gray-700/50">

          {/* Tagline */}
          <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-pink-200 dark:border-pink-800/50">
            💕 Durf te daten, durf jezelf te zijn.
          </div>

          {/* Main Title */}
          <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-50 leading-tight px-2">
              Stop met eindeloos swipen
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-50 mt-2">
                zonder resultaat
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-2 leading-relaxed">
            Van eindeloos swipen naar dates met impact. Krijg 24/7 persoonlijke begeleiding om je liefdesleven vlot te trekken
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-2">
            {/* Primary CTA - Register/Foto Scan */}
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all rounded-full flex items-center justify-center gap-2">
                Start Gratis & Scan mijn Foto
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>

            <p className="text-sm text-gray-700 dark:text-gray-400">
              ✅ Krijg binnen 2 minuten inzicht + persoonlijk advies
            </p>

            {/* Secondary Link - Quiz */}
            <Link href="/quiz" className="text-sm text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 underline transition-colors">
              Of doe eerst de Dating Stijl Quiz
            </Link>
          </div>

          {/* Trust Bullets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 px-2">
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">10+ Jaar ervaring (Bekend van TV)</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Wetenschappelijk onderbouwd</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">100% Privacy & Veilig</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}