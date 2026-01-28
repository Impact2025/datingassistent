import { Metadata } from 'next';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { ProfileAnalysis } from '@/components/profile-analysis';

export const metadata: Metadata = {
  title: 'Profiel Analyse - AI Dating Assessment | DatingAssistent',
  description: 'Krijg een professionele analyse van je dating profiel met AI. Ontdek je sterke punten en verbeterpunten voor meer matches.',
  keywords: 'profiel analyse, dating profile, AI assessment, dating tips, meer matches',
};

export default function ProfileAnalysisPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-coral-50 to-coral-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Profiel Analyse met AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Ontvang een professionele beoordeling van je dating profiel door onze geavanceerde AI.
            Ontdek je sterke punten en krijg concrete tips om meer matches te krijgen.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Gratis analyse</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Professionele feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Concrete verbeterpunten</span>
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Tool */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Start je profiel analyse
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Vul je profielgegevens in en ontvang binnen enkele seconden een gedetailleerde analyse
              met scores, sterke punten en verbeterpunten.
            </p>
          </div>

          <ProfileAnalysis />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Waarom onze AI analyse?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Gebaseerd op data van duizenden succesvolle profielen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-coral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Data-gedreven</h3>
              <p className="text-gray-600">
                Onze AI is getraind op duizenden succesvolle dating profielen en weet precies
                wat werkt voor meer matches.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Direct resultaat</h3>
              <p className="text-gray-600">
                Binnen enkele seconden krijg je een complete analyse met scores,
                feedback en concrete verbeterpunten.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Bewijsbare resultaten</h3>
              <p className="text-gray-600">
                Gebruikers die onze tips opvolgen zien gemiddeld 89% meer matches
                en betere kwaliteit gesprekken.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-coral-500 to-coral-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Klaar voor meer matches?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Sluit je aan bij DatingAssistent en krijg toegang tot alle AI-tools voor dating succes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-coral-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-colors"
            >
              Start gratis proefperiode
            </a>
            <a
              href="/#prijzen"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-coral-600 transition-colors"
            >
              Bekijk prijzen
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}