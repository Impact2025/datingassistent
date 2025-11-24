'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Shield, TrendingUp, Users, Heart, Award, Target, Play, Calendar, Bot } from 'lucide-react';

export default function OverOnsPage() {

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Het verhaal achter DatingAssistent
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Sinds 2013 helpen we mensen succesvol te daten. Van traditioneel datingbureau naar een AI-powered platform – we hebben alles gezien en weten precies wat werkt.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-gray-50">
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
              <div className="text-4xl font-bold text-pink-500 mb-3">25K+</div>
              <div className="text-gray-600">Tevreden gebruikers</div>
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
                Met meer dan 10 jaar ervaring als dating coach en sociaal ondernemer, heb ik duizenden mensen geholpen hun liefde te vinden. DatingAssistent is mijn missie om daten toegankelijker te maken voor iedereen.
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
            Sluit je aan bij 25.000+ mensen die succesvoller daten met DatingAssistent
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