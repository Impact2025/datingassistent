'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Shield, TrendingUp, Users, Heart, Award, Target, Play, Calendar, Bot, CheckCircle } from 'lucide-react';

export default function OverOnsPage() {

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 px-4 overflow-hidden min-h-[500px] sm:min-h-[550px] flex items-center">
        {/* Full-width Background Image */}
        <Image
          src="/images/DatingAssistent.png"
          alt="DatingAssistent - Dé dating coach die altijd beschikbaar is"
          fill
          priority
          className="object-cover object-center"
          quality={85}
          sizes="100vw"
        />

        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/60 sm:bg-black/50" />

        <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
          {/* Semi-transparent white background behind text */}
          <div className="inline-block bg-white/90 sm:bg-white/85 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl max-w-4xl mx-auto w-full">

            {/* Tagline */}
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-pink-100 text-pink-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              👨‍💻 De oprichter achter DatingAssistent
            </div>

            {/* Main Title */}
            <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight px-2">
                Het verhaal achter DatingAssistent
                <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal text-gray-600 mt-2">
                  10+ jaar expertise in één platform
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              Van traditioneel datingbureau naar AI-powered platform – we hebben alles gezien en weten precies wat werkt.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center mb-6 sm:mb-8 px-2">
              <Link href="#missie" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                  Ontdek ons verhaal →
                </Button>
              </Link>
            </div>

            {/* Trust Bullets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 px-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-600">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Sinds 2013 actief in dating</span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-600">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Innovatieve dating technologie</span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-gray-600">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm">100% Nederlandse expertise</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="missie" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md-text-4xl font-bold text-gray-900 mb-8">
            Onze missie: Daten toegankelijker maken
          </h2>
          <div className="bg-white rounded-2xl p-8 border border-gray-200 max-w-3xl mx-auto mb-8">
            <p className="text-xl text-gray-700 leading-relaxed italic">
              "Met 10+ jaar expertise maken we daten makkelijker, succesvoller en leuker. Je staat er nooit alleen voor – wij zijn er om je te helpen slagen."
            </p>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Onze missie is om daten toegankelijker, persoonlijker en succesvoller te maken voor iedereen, ongeacht achtergrond of ervaring.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md-text-4xl font-bold text-gray-900 mb-4">
              Waar we voor staan
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              De kernwaarden die ons drijven om de beste dating ervaring te bieden
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-pink-100 flex items-center justify-center">
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Authenticiteit</h3>
              <p className="text-gray-600 leading-relaxed">
                We geloven in echte connecties gebaseerd op wie je werkelijk bent, niet wie je denkt dat je moet zijn.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Veiligheid</h3>
              <p className="text-gray-600 leading-relaxed">
                Jouw welzijn en privacy staan altijd voorop. We creëren een veilige omgeving voor iedereen.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Groei</h3>
              <p className="text-gray-600 leading-relaxed">
                We helpen je niet alleen matches te vinden, maar ook jezelf te ontwikkelen en te groeien.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md-text-4xl font-bold text-gray-900 mb-4">
              Resultaten die tellen
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Onze methoden zijn bewezen, en onze technologie werkt. Dit zijn onze resultaten:
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="text-4xl font-bold text-pink-500 mb-3">89%</div>
              <div className="text-gray-600">Meer matches gemiddeld voor onze gebruikers</div>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="text-4xl font-bold text-pink-500 mb-3">4.9/5</div>
              <div className="text-gray-600">Gemiddelde gebruikersbeoordeling over alle platforms</div>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="text-4xl font-bold text-pink-500 mb-3">10+</div>
              <div className="text-gray-600">Jaar ervaring in datingbegeleiding</div>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="text-4xl font-bold text-pink-500 mb-3">24/7</div>
              <div className="text-gray-600">AI ondersteuning beschikbaar</div>
            </div>
          </div>
        </div>
      </section>

      {/* Iris AI Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Bot className="w-8 h-8 text-pink-500" />
                <h3 className="text-3xl font-bold text-gray-900">De kracht van AI: Ontmoet Iris</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Na meer dan een decennium in de datingwereld weten we dat écht succes persoonlijke aandacht vereist. Daarom hebben we onze kennis vertaald in kunstmatige intelligentie (AI), gepersonifieerd door onze virtuele coach: Iris.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Iris is 24/7 beschikbaar en analyseert uw unieke situatie om hyper-gepersonaliseerd advies te geven. Van het optimaliseren van uw profielfoto's tot het voeren van boeiende gesprekken—Iris zorgt voor slimme, direct toepasbare strategieën.
              </p>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 max-w-sm mx-auto">
                <video
                  className="w-full h-auto"
                  controls
                  poster="/images/LogoDatingAssistent.png"
                >
                  <source src="/videos/Welkom-Iris.mp4" type="video/mp4" />
                  Uw browser ondersteunt deze video niet.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">De oprichter: Vincent van Munster</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Als sociaal ondernemer is mijn drijfveer altijd geweest om zoveel mogelijk geluksmomenten te creëren. Hoewel ik een aantal jaren als dating coach in 2012 aan de basis stond van ons bedrijf, ligt mijn expertise vooral in het vinden van innovatieve oplossingen voor maatschappelijke uitdagingen. De missie van DatingAssistent is dan ook een directe vertaling van dit doel: daten toegankelijker maken voor iedereen, waardoor we de kans op die waardevolle momenten van liefde en geluk exponentieel vergroten.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-48 h-48 rounded-2xl overflow-hidden border border-gray-200">
                <Image
                  src="/images/Vincent van Munster.png"
                  alt="Vincent van Munster - Oprichter DatingAssistent"
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md-text-4xl font-bold text-gray-900 mb-4">
              Onze reis: Van traditioneel naar digitaal
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Begonnen als gespecialiseerd datingbureau, nu de meest complete AI-powered dating coach. Dit is hoe we zijn geëvolueerd:
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">2009</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">De eerste stappen</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ontwikkeling van meerdere datingsites, onder andere voor mensen met een beperking en 40- en 50-plussers. De basis voor onze diepgaande kennis.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">2013</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Oprichting DatingAssistent</h3>
                <p className="text-gray-600 leading-relaxed">
                  Oprichting als gespecialiseerd datingbureau (bekend van tv-programma's als The Undateables). Hier ontdekten we de enorme behoefte aan professionele, toegankelijke ondersteuning.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">2018</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Eerste digitale tools</h3>
                <p className="text-gray-600 leading-relaxed">
                  Lancering van onze eerste digitale oplossingen om te voorzien in de behoefte aan 24/7 begeleiding, los van de beschikbaarheid van een coach.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">2022</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI-integratie</h3>
                <p className="text-gray-600 leading-relaxed">
                  Na uitgebreid onderzoek begonnen we met de integratie van AI-technologie om gepersonaliseerde adviezen te schalen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">2025</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Lancering AI-versie & Iris</h3>
                <p className="text-gray-600 leading-relaxed">
                  Lancering van ons volledig AI-powered platform en de introductie van Iris de AI Coach. Ons doel blijft: duizenden mensen tegelijk helpen met persoonlijke, slimme en direct toepasbare datingondersteuning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Klaar om je eigen verhaal te schrijven?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Ontdek hoe DatingAssistent jouw dating leven kan transformeren!
          </p>
          <div className="flex items-center justify-center">
            <Link href="/register">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full">
                Start je dating succes
              </Button>
            </Link>
          </div>
        </div>
      </section>


      <PublicFooter />
    </div>
  );
}