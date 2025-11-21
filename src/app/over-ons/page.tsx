'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Shield, TrendingUp, Users, Heart, Award, Target } from 'lucide-react';

export default function OverOnsPage() {
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
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sinds 2013 helpen we mensen succesvol te daten. Van traditioneel datingbureau naar AI-powered platform, we hebben alles gezien en weten wat werkt.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Van traditioneel naar digitaal
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Het verhaal achter onze missie om daten toegankelijker te maken
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Story Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">10+ Jaar Ervaring</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sinds 2013 helpen we duizenden mensen succesvol te daten. Van traditioneel datingbureau naar AI-powered platform - we hebben alles gezien en weten wat werkt.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Van Traditioneel naar Digitaal</h3>
                <p className="text-gray-600 leading-relaxed">
                  Begonnen als datingbureau voor mensen met beperking, nu de meest complete AI-powered dating coach. We combineren bewezen methoden met cutting-edge technologie.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Vincent van Munster</h3>
                <p className="text-gray-600 leading-relaxed">
                  Met meer dan 10 jaar ervaring als dating coach en sociaal ondernemer, heb ik duizenden mensen geholpen hun liefde te vinden. DatingAssistent is mijn missie om daten toegankelijker te maken voor iedereen.
                </p>
              </div>

              <div className="pt-4">
                <Link href="/register">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full">
                    Ontdek onze tools
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Stats & Trust */}
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-pink-500 mb-2">25K+</div>
                  <div className="text-sm text-gray-600">Tevreden gebruikers</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-pink-500 mb-2">89%</div>
                  <div className="text-sm text-gray-600">Meer matches gemiddeld</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-pink-500 mb-2">4.9/5</div>
                  <div className="text-sm text-gray-600">Gemiddelde beoordeling</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-pink-500 mb-2">10+</div>
                  <div className="text-sm text-gray-600">Jaar ervaring</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
                <h4 className="font-bold text-gray-900 mb-2">Onze Missie</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  "Met 10+ jaar expertise maken we daten makkelijker, succesvoller en leuker. Je staat er nooit alleen voor - wij zijn er om je te helpen slagen."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Onze Reis
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Van kleine start tot toonaangevende dating coach
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">2009</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">De eerste stappen</h3>
                <p className="text-gray-600">
                  Ontwikkeling van meerdere datingsites, onder andere voor mensen met een beperking en voor 40- en 50-plussers. Deze periode legde de basis voor onze kennis van online daten en doelgroepgerichte begeleiding.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">2013</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Oprichting DatingAssistent</h3>
                <p className="text-gray-600">
                  In 2013 richtte ik DatingAssistent op, een datingbureau gespecialiseerd in hulp voor mensen met een beperking (bekend van tv-programma's als The Undateables). Hier ontdekten we hoe groot de behoefte is aan professionele, toegankelijke datingondersteuning.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">2018</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Eerste digitale tools</h3>
                <p className="text-gray-600">
                  Lancering van onze eerste digitale oplossingen. Steeds meer mensen hadden behoefte aan 24/7 begeleiding die niet afhankelijk was van de beschikbaarheid van een coach.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">2022</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI-integratie</h3>
                <p className="text-gray-600">
                  Na uitgebreid onderzoek begonnen we met de integratie van AI-technologie. Dit stelde ons in staat om gepersonaliseerde adviezen en begeleiding te bieden aan grotere groepen gebruikers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">2025</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Lancering AI-versie van DatingAssistent.nl</h3>
                <p className="text-gray-600">
                  Lancering van ons volledig AI-powered platform. Met deze digitale versie kunnen we duizenden mensen tegelijk helpen met persoonlijke, slimme en direct toepasbare datingondersteuning. Ons doel blijft hetzelfde: daten toegankelijker, persoonlijker en succesvoller maken voor iedereen, ongeacht achtergrond of ervaring.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Waar wij voor staan
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              De kernwaarden die ons dagelijks werk bepalen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Empathie</h3>
              <p className="text-gray-600">
                We begrijpen dat daten kwetsbaar kan zijn. Daarom behandelen we iedereen met respect en bieden we ondersteuning zonder oordeel.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Veiligheid</h3>
              <p className="text-gray-600">
                Jouw veiligheid en privacy staan altijd voorop. We volgen strikte richtlijnen en beschermen je gegevens met de hoogste standaarden.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Effectiviteit</h3>
              <p className="text-gray-600">
                We geloven in bewezen methoden. Al onze tools en adviezen zijn gebaseerd op jarenlange ervaring en wetenschappelijke inzichten.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Inclusiviteit</h3>
              <p className="text-gray-600">
                Liefde kent geen grenzen. We helpen mensen van alle achtergronden, leeftijden en ervaringen om hun perfecte match te vinden.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Innovatie</h3>
              <p className="text-gray-600">
                We blijven leren en verbeteren. Door AI en technologie in te zetten, kunnen we steeds betere ondersteuning bieden.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Kwaliteit</h3>
              <p className="text-gray-600">
                We streven altijd naar het beste. Van onze AI-tools tot onze klantenservice - kwaliteit is onze hoogste prioriteit.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ontmoet het Team
          </h2>

          <div className="max-w-md mx-auto">
            <Card className="p-8">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">V</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Vincent van Munster</h3>
              <p className="text-pink-600 mb-4">Oprichter & Dating Coach</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Met meer dan 10 jaar ervaring als dating coach heeft Vincent duizenden mensen geholpen hun liefde te vinden. Zijn missie: daten toegankelijker maken voor iedereen.
              </p>
            </Card>
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