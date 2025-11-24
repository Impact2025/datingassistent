'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Shield, TrendingUp, Users, Heart, Award, Target, Play, Calendar, Bot, User } from 'lucide-react';
import { useState } from 'react';

export default function OverOnsPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Het verhaal achter <span className="text-pink-500">DatingAssistent</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sinds 2013 helpen we mensen succesvol te daten. Van traditioneel datingbureau naar een AI-powered platform – we hebben alles gezien en weten precies wat werkt.
            </p>
            <div className="flex items-center justify-center gap-2 text-lg text-gray-700">
              <span className="font-semibold">🚀</span>
              <span>DatingAssistent is de perfecte combinatie van 10+ jaar bewezen expertise en cutting-edge technologie.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Onze missie: Daten toegankelijker maken
            </h2>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 border border-pink-100 max-w-3xl mx-auto">
              <p className="text-xl text-gray-700 leading-relaxed italic">
                "Met 10+ jaar expertise maken we daten makkelijker, succesvoller en leuker. Je staat er nooit alleen voor – wij zijn er om je te helpen slagen."
              </p>
            </div>
          </div>

          <div className="mb-12">
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Onze missie is om daten toegankelijker, persoonlijker en succesvoller te maken voor iedereen, ongeacht achtergrond of ervaring.
            </p>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              📈 Resultaten die tellen
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Onze methoden zijn bewezen, en onze technologie werkt. Dit zijn onze resultaten:
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-pink-500 mb-3">89%</div>
              <div className="text-gray-600 font-medium">Meer matches gemiddeld voor onze gebruikers</div>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-pink-500 mb-3">4.9/5</div>
              <div className="text-gray-600 font-medium">Gemiddelde gebruikersbeoordeling over alle platforms</div>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-pink-500 mb-3">10+</div>
              <div className="text-gray-600 font-medium">Jaar ervaring in datingbegeleiding</div>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-pink-500 mb-3">25K+</div>
              <div className="text-gray-600 font-medium">Tevreden gebruikers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Iris AI Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Video */}
            <div className="order-2 lg:order-1">
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl max-w-md mx-auto">
                <video
                  className="w-full h-auto"
                  controls
                  poster="/images/LogoDatingAssistent.png"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                >
                  <source src="/videos/Welkom-Iris.mp4" type="video/mp4" />
                  Uw browser ondersteunt deze video niet.
                </video>
                {!isVideoPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-pink-500 rounded-full p-4 cursor-pointer hover:bg-pink-600 transition-colors">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Bot className="w-8 h-8 text-pink-500" />
                  <h3 className="text-3xl font-bold text-gray-900">🤖 De kracht van AI: Ontmoet Iris, uw persoonlijke coach</h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Na meer dan een decennium in de datingwereld weten we dat écht succes persoonlijke aandacht vereist. Daarom hebben we onze kennis vertaald in kunstmatige intelligentie (AI), gepersonifieerd door onze virtuele coach: Iris.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Iris is 24/7 beschikbaar en analyseert uw unieke situatie om hyper-gepersonaliseerd advies te geven. Van het optimaliseren van uw profielfoto's tot het voeren van boeiende gesprekken—Iris zorgt voor slimme, direct toepasbare strategieën. Met Iris heeft u een intelligente, toegankelijke expert aan uw zijde.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-pink-500" />
                <h3 className="text-3xl font-bold text-gray-900">👨‍💻 De oprichter: Vincent van Munster</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Met meer dan 10 jaar ervaring als dating coach en sociaal ondernemer, heb ik duizenden mensen geholpen hun liefde te vinden. DatingAssistent is mijn missie om daten toegankelijker te maken voor iedereen.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-6xl font-bold text-white">V</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              🛣️ Onze reis: Van traditioneel naar digitaal
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Begonnen als gespecialiseerd datingbureau, nu de meest complete AI-powered dating coach. Dit is hoe we zijn geëvolueerd:
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div className="flex-grow bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full">2009</span>
                  <h3 className="text-xl font-bold text-gray-900">De eerste stappen</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Ontwikkeling van meerdere datingsites, onder andere voor mensen met een beperking en 40- en 50-plussers. De basis voor onze diepgaande kennis.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div className="flex-grow bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full">2013</span>
                  <h3 className="text-xl font-bold text-gray-900">Oprichting DatingAssistent</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Oprichting als gespecialiseerd datingbureau (bekend van tv-programma's als The Undateables). Hier ontdekten we de enorme behoefte aan professionele, toegankelijke ondersteuning.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div className="flex-grow bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full">2018</span>
                  <h3 className="text-xl font-bold text-gray-900">Eerste digitale tools</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Lancering van onze eerste digitale oplossingen om te voorzien in de behoefte aan 24/7 begeleiding, los van de beschikbaarheid van een coach.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div className="flex-grow bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full">2022</span>
                  <h3 className="text-xl font-bold text-gray-900">AI-integratie</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Na uitgebreid onderzoek begonnen we met de integratie van AI-technologie om gepersonaliseerde adviezen te schalen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div className="flex-grow bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full">2025</span>
                  <h3 className="text-xl font-bold text-gray-900">Lancering AI-versie & Iris</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Lancering van ons volledig AI-powered platform en de introductie van Iris de AI Coach. Ons doel blijft: duizenden mensen tegelijk helpen met persoonlijke, slimme en direct toepasbare datingondersteuning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Klaar om je eigen verhaal te schrijven?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Sluit je aan bij duizenden mensen die succesvoller daten met DatingAssistent en Iris
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 text-lg rounded-full shadow-lg">
                Start je dating succes
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500 px-8 py-6 text-lg rounded-full">
                Ontmoet Iris
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Klaar om je eigen verhaal te schrijven?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Sluit je aan bij 25.000+ mensen die succesvoller daten met DatingAssistent
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 text-lg rounded-full shadow-lg">
                Start je dating succes
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500 px-8 py-6 text-lg rounded-full">
                Bekijk onze tools
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}