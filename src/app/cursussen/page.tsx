'use client';

import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Sparkles, TrendingUp, Award } from 'lucide-react';
import { CursussenGallery } from '@/components/dashboard/cursussen-gallery';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

/**
 * Cursussen Overzicht Pagina
 * Minimalistisch, professioneel design zoals dashboard homepage
 */
export default function CursussenPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <PublicHeader />
      {/* Header Section - Clean & Minimal */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-coral-500 to-coral-600 rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Online Cursussen
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ontwikkel je dating vaardigheden met professionele cursussen
              </p>
            </div>
          </div>

          {/* Stats Overview - Minimal Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-coral-500 to-coral-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">2+</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Cursussen</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-coral-500 to-coral-600 rounded-lg flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">∞</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Lessen</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-coral-500 to-coral-600 rounded-lg flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">3</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Niveaus</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-coral-500 to-coral-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">Pro</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Certificaten</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cursussen Gallery - Modern Dashboard Design */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <CursussenGallery />
      </div>

      {/* Info Section - Clean Card */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Waarom onze cursussen?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">Expert Begeleiding</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Leer van dating experts met jarenlange ervaring in relatie coaching en persoonlijke ontwikkeling.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">Praktische Toepassing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Direct toepasbare tips en strategieën die je vandaag nog kunt gebruiken in je dating leven.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">Jouw Tempo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Leer op je eigen tempo met 24/7 toegang tot alle cursusmateriaal en voortgangsregistratie.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PublicFooter />
    </div>
  );
}
