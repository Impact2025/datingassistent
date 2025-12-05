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

      {/* Dark overlay for better contrast - stronger on mobile */}
      <div className="absolute inset-0 bg-black/50 sm:bg-black/40" />

      <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
        {/* Semi-transparent white background behind text - better mobile padding */}
        <div className="inline-block bg-white/80 sm:bg-white/75 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl max-w-4xl mx-auto w-full">

          {/* Tagline */}
          <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-pink-100 text-pink-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            💕 Durf te daten, durf jezelf te zijn.
          </div>

          {/* Main Title */}
          <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight px-2">
              Stop met eindeloos swipen
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mt-2">
                zonder resultaat
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto px-2 leading-relaxed">
            Krijg binnen 30 dagen betekenisvolle dates met 24/7 AI-hulp die je precies vertelt wat je moet zeggen
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-2">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Primary CTA - Quiz */}
              <Link href="/quiz" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all rounded-full flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Doe de Gratis Dating Scan
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              {/* Secondary CTA - Register */}
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500 px-8 py-3 text-base font-semibold rounded-full">
                  Of start direct gratis
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-600">
              Krijg binnen 2 minuten inzicht in jouw valkuilen + persoonlijk advies.
            </p>
          </div>

          {/* Trust Bullets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 px-2">
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-700">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Gebaseerd op 10+ jaar ervaring en passie</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-700">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Nieuw: bewezen methode, nu 24/7 beschikbaar</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-700">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">100% Nederlandse ontwikkeling en begeleiding</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}