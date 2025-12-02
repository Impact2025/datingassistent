import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

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
            💕 Durf te daten, durf jezelf te zijn
          </div>

          {/* Main Title */}
          <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight px-2">
              Dé dating coach die altijd beschikbaar is
              <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal text-gray-600 mt-2">
                voor iedereen
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            24/7 AI hulp • 8 cursussen • Nederlandse app
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-2">
            <Link href="/register?plan=pro&billing=yearly" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 text-base shadow-lg hover:shadow-xl transition-all">
                Start 3 dagen gratis →
              </Button>
            </Link>

            <Link href="/features" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500 px-6 py-2.5 text-base">
                Bekijk hier al onze tools →
              </Button>
            </Link>
          </div>

          {/* Trust Bullets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 px-2">
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-600">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Gebaseerd op 10 jaar expertise en passie</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-600">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Nieuw: bewezen methode, nu 24/7 beschikbaar</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-600">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm">100% Nederlandse ontwikkeling en begeleiding</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}