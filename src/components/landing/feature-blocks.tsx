'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Target,
  Award,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export function FeatureBlocks() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Block 1: Quiz */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all group">
            <CardContent className="p-8 sm:p-10 text-center space-y-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                <Sparkles className="w-7 h-7 text-pink-600" />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  Ontdek je Dating Stijl in 2 minuten
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  AI-analyse van je gedrag met direct persoonlijk actieplan
                </p>
              </div>

              <Link href="/quiz">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium">
                  Start Gratis Analyse
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Block 2: Programs */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all group">
            <CardContent className="p-8 sm:p-10 text-center space-y-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Target className="w-7 h-7 text-purple-600" />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  Kies jouw programma
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Van gratis tools tot persoonlijke 1-op-1 coaching
                </p>
              </div>

              <Link href="#programmas">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium">
                  Bekijk Programma's
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Block 3: About */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all group">
            <CardContent className="p-8 sm:p-10 text-center space-y-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Award className="w-7 h-7 text-blue-600" />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  Van The Undateables tot jouw persoonlijke AI coach
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  10 jaar dating expertise, nu voor iedereen toegankelijk
                </p>
              </div>

              <Link href="/over-ons">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium">
                  Lees Ons Verhaal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Block 4: CTA */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all group">
            <CardContent className="p-8 sm:p-10 text-center space-y-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  Stop met wachten. Start met groeien.
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Gratis beginnen • Geen creditcard nodig • Direct toegang
                </p>
              </div>

              <Link href="/register">
                <Button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all">
                  Start Gratis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
}
