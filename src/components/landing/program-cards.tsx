'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles, Lock, AlertCircle } from 'lucide-react';

export function ProgramCards() {
  const router = useRouter();

  // Get current month name in Dutch
  const currentMonth = new Date().toLocaleDateString('nl-NL', { month: 'long' });

  const handleSelectProgram = (slug: string) => {
    router.push(`/register?program=${slug}`);
  };

  return (
    <div className="space-y-12">
      {/* Price Anchor */}
      <div className="text-center max-w-3xl mx-auto">
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Investeer in jezelf. Een traditionele coach kost €150 per uur. Met DatingAssistent krijg je maandenlange begeleiding voor de prijs van één etentje.
        </p>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
        {/* Plan 1: Kickstart */}
        <Card className="relative border-2 border-gray-200 dark:border-gray-700 h-full flex flex-col transition-all hover:shadow-lg bg-white dark:bg-gray-800">
          <CardContent className="p-8 space-y-6 flex flex-col flex-grow">
            {/* Title */}
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Kickstart</h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Snel resultaat in 21 dagen
              </p>
            </div>

            {/* Pricing */}
            <div className="text-center py-4 border-y border-gray-100 dark:border-gray-700">
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-2xl text-gray-400 dark:text-gray-500 line-through">
                  €97
                </span>
                <span className="text-5xl font-bold text-gray-900 dark:text-gray-50">
                  €47
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 flex-grow">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400" />
                  <span>21-Dagen Video Challenge</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400" />
                  <span>AI Foto Check (Onbeperkt)</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400" />
                  <span>Bio Builder (AI schrijft je tekst)</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400" />
                  <span>Kickstart Werkboek & Templates</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <Button
              onClick={() => handleSelectProgram('kickstart')}
              variant="outline"
              className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-400 text-gray-900 dark:text-gray-100"
            >
              Meer informatie
            </Button>
          </CardContent>
        </Card>

        {/* Plan 2: Transformatie (HERO) */}
        <Card className="relative border-4 border-[#E61E63] dark:border-pink-600 h-full flex flex-col transition-all hover:shadow-2xl bg-white dark:bg-gray-800 md:scale-105 shadow-xl">
          {/* "MEEST GEKOZEN" Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <Badge className="bg-[#E61E63] dark:bg-pink-600 text-white px-4 py-2 text-sm font-bold shadow-lg">
              MEEST GEKOZEN
            </Badge>
          </div>

          <CardContent className="p-8 space-y-6 flex flex-col flex-grow pt-12">
            {/* Title */}
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Transformatie</h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                De complete opleiding tot succesvol daten
              </p>
            </div>

            {/* Pricing */}
            <div className="text-center py-4 border-y border-gray-100 dark:border-gray-700">
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-2xl text-gray-400 dark:text-gray-500 line-through">
                  €297
                </span>
                <span className="text-5xl font-bold text-[#E61E63] dark:text-pink-400">
                  €147
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 flex-grow">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#E61E63] dark:text-pink-400" />
                  <span className="font-medium">Alles uit Kickstart, plus:</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400" />
                  <span>🎓 Complete Video Academy (6 Modules)</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400" />
                  <span>🤖 Pro AI Suite (90 Dagen onbeperkt)</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400" />
                  <span>💬 24/7 Chat Coach & Match Analyse</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400" />
                  <span>👥 3x Live Q&A Sessies</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <Button
              onClick={() => handleSelectProgram('transformatie')}
              className="w-full bg-[#E61E63] hover:bg-[#c51a56] dark:bg-pink-600 dark:hover:bg-pink-700 text-white font-semibold text-lg py-6 shadow-lg hover:shadow-xl transition-all"
            >
              Kies dit programma ✨
            </Button>
          </CardContent>
        </Card>

        {/* Plan 3: VIP Reis */}
        <Card className="relative border-2 border-amber-300 dark:border-amber-600 h-full flex flex-col transition-all hover:shadow-lg bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800">
          {/* Top Scarcity Label */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <Badge className="bg-amber-500 dark:bg-amber-600 text-white px-3 py-1 text-xs font-bold shadow-md">
              MAX 10 PLEKKEN/MAAND
            </Badge>
          </div>

          <CardContent className="p-8 space-y-6 flex flex-col flex-grow pt-10">
            {/* Title */}
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-50">VIP Reis</h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                6 maanden persoonlijke begeleiding
              </p>
            </div>

            {/* Pricing */}
            <div className="text-center py-4 border-y border-amber-100 dark:border-amber-800/30">
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-5xl font-bold text-amber-600 dark:text-amber-400">
                  €997
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 flex-grow">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-500 dark:text-amber-400" />
                  <span className="font-medium">Alles uit Transformatie, plus:</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400" />
                  <span>🤝 Persoonlijke Intake (60 min video)</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400" />
                  <span>📞 6x 1-op-1 Coaching Calls</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400" />
                  <span>📱 WhatsApp Support (Directe lijn)</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400" />
                  <span>📸 Professionele Fotoshoot Planning</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500 dark:text-green-400" />
                  <span>⏳ Levenslang Toegang tot alles</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <Button
              onClick={() => handleSelectProgram('vip')}
              className="w-full bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-semibold"
            >
              Start VIP Traject
            </Button>

            {/* Bottom Urgency Text */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                Beperkte plekken beschikbaar
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guarantee Footer */}
      <div className="text-center max-w-2xl mx-auto pt-8">
        <div className="flex items-center justify-center gap-3">
          <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <p className="text-base text-gray-700 dark:text-gray-300 font-medium">
            Probeer het risicoloos: Op alle plannen geldt een 30 dagen niet-goed-geld-terug garantie.
          </p>
        </div>
      </div>
    </div>
  );
}
