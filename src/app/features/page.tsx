import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Heart, MessageCircle, Calendar, Shield, Zap, User, Sparkles, TrendingUp, Play, CheckCircle, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: '10 AI Tools voor Dating Succes | Profiel Coach & Chat Hulp | DatingAssistent',
  description: 'Ontdek onze 10 professionele AI tools voor 89% meer matches: Profiel Coach, Chat Coach, Date Planner, Opener Lab. Gratis proberen - professionele dating hulp voor singles.',
  keywords: ['AI dating tools', 'dating coach', 'profiel optimalisatie', 'chat hulp', 'date planning', 'foto feedback', 'match analyse', 'veilig daten', 'dating app hulp'],
  openGraph: {
    title: '10 AI Tools voor Dating Succes | Profiel Coach & Chat Hulp | DatingAssistent',
    description: 'Ontdek onze 10 professionele AI tools voor 89% meer matches: Profiel Coach, Chat Coach, Date Planner, Opener Lab. Gratis proberen - professionele dating hulp voor singles.',
    type: 'website',
    url: 'https://datingassistent.nl/features',
  },
  twitter: {
    card: 'summary_large_image',
    title: '10 AI Tools voor Dating Succes | Profiel Coach & Chat Hulp | DatingAssistent',
    description: 'Ontdek onze 10 professionele AI tools voor 89% meer matches: Profiel Coach, Chat Coach, Date Planner, Opener Lab.',
  },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Ontdek al onze <span className="text-coral-500">10 AI tools</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Van profiel optimalisatie tot date planning - wij helpen je bij elke stap van je dating reis
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href="/register">
                <Button className="bg-coral-500 hover:bg-coral-600 text-white px-8 py-3 rounded-full text-lg">
                  Start gratis
                </Button>
              </Link>
              <Link href="#tools">
                <Button variant="outline" className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-coral-500 hover:text-coral-500 px-8 py-3 rounded-full text-lg">
                  Bekijk tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - All 8 Tools */}
      <section id="tools" className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Jouw Toolkit voor Succesvol Daten - 10 AI Tools
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Alle tools die je nodig hebt om met zelfvertrouwen en succes te daten.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Tool 1: Profiel Coach */}
            <div className="text-center space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-coral-200 dark:hover:border-coral-700 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-coral-50 flex items-center justify-center">
                <User className="w-6 h-6 text-coral-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Profiel Coach</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  AI-gedreven profielanalyse die je bio, foto's en persoonlijkheid analyseert. Krijg specifieke verbeterpunten, nieuwe bio suggesties en tips om je profiel 3x aantrekkelijker te maken voor potentiële matches.
                </p>
              </div>
            </div>

            {/* Tool 2: Chat Coach */}
            <div className="text-center space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-coral-200 dark:hover:border-coral-700 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Chat Coach</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Je persoonlijke AI dating coach beschikbaar 24/7. Krijg hulp bij het opbouwen van gesprekken, het beantwoorden van moeilijke vragen, en het houden van natuurlijke, boeiende chats die leiden tot dates.
                </p>
              </div>
            </div>

            {/* Tool 3: Date Planner */}
            <div className="text-center space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-coral-200 dark:hover:border-coral-700 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-green-50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Date Planner</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Ontdek unieke date ideeën afgestemd op jullie interesses, locatie en budget. Van romantische picknicks tot avontuurlijke uitjes - krijg complete plannen met routebeschrijvingen en gespreksonderwerpen.
                </p>
              </div>
            </div>

            {/* Tool 4: Opener Lab */}
            <div className="text-center space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-coral-200 dark:hover:border-coral-700 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-purple-50 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Opener Lab</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Genereer originele, pakkende openingszinnen gebaseerd op iemands profiel. Vermijd cliché berichten en maak een memorabele eerste indruk die leidt tot echte gesprekken in plaats van oppervlakkige chats.
                </p>
              </div>
            </div>

            {/* Tool 5: Match Analyse */}
            <div className="text-center space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-coral-200 dark:hover:border-coral-700 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-orange-50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Match Analyse</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Analyseer waarom mensen wel of niet op je swipen. Krijg inzichten in je match patronen, ontdek welke profiel elementen werken en leer hoe je je aantrekkingskracht kunt vergroten.
                </p>
              </div>
            </div>

            {/* Tool 6: Foto Check */}
            <div className="text-center space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-coral-200 dark:hover:border-coral-700 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 flex items-center justify-center">
                <Play className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Foto Check</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Upload je profielfoto's en krijg professionele feedback van onze AI. Ontdek welke foto's werken, welke niet, en krijg tips om je beste kant te laten zien voor meer aandacht en matches.
                </p>
              </div>
            </div>

            {/* Tool 7: Voortgang Tracker */}
            <div className="text-center space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-coral-200 dark:hover:border-coral-700 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Voortgang Tracker</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Houd je dating voortgang bij met gedetailleerde statistieken. Zie hoeveel matches je krijgt, hoe je gesprekken verlopen, en welke strategieën het beste werken voor jouw profiel.
                </p>
              </div>
            </div>

            {/* Tool 8: Veiligheid */}
            <div className="text-center space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-coral-200 dark:hover:border-coral-700 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Veiligheid</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Leer rode vlaggen herkennen in profielen en gesprekken. Onze AI helpt je veilig te daten door waarschuwingen te geven voor potentiële risico's en tips om jezelf te beschermen.
                </p>
              </div>
            </div>

            {/* Tool 9: Vaardigheden Assessment */}
            <div className="text-center space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-coral-200 dark:hover:border-coral-700 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-yellow-50 flex items-center justify-center">
                <Heart className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Vaardigheden Assessment</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Ontdek je huidige niveau in online daten met een uitgebreide vaardighedenscan. Krijg een persoonlijk rapport met sterke punten, verbeterpunten en een op maat gemaakt leertraject.
                </p>
              </div>
            </div>

            {/* Tool 10: Online Cursus */}
            <div className="text-center space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-coral-200 dark:hover:border-coral-700 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-50 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Online Cursus</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Volg een complete online cursus met video's, interactieve oefeningen en AI-gedreven coaching. Leer stap voor stap hoe je succesvoller wordt in online daten, van profiel optimalisatie tot eerste dates.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/register">
              <Button className="bg-coral-500 hover:bg-coral-600 text-white px-8 py-3 rounded-full">
                Start met onze tools
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Zo werken onze AI tools
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Van eerste match naar eerste date - wij begeleiden je stap voor stap
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 mx-auto rounded-full bg-coral-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-coral-500">1</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-coral-200 -translate-x-10"></div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Maak je profiel</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Start met een gratis account. Onze AI analyseert je huidige profiel en geeft directe verbeteringen voor meer matches.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 mx-auto rounded-full bg-coral-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-coral-500">2</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-coral-200 -translate-x-10"></div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Krijg AI hulp</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Gebruik onze tools voor openingszinnen, gespreksstarters en foto-feedback. De chat coach helpt je 24/7 met natuurlijke gesprekken.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-coral-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-coral-500">3</span>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Plan je date</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Van eerste ontmoeting tot vervolgdates - onze date planner geeft creatieve ideeën en tips voor memorabele ervaringen.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link href="/register">
              <Button className="bg-coral-500 hover:bg-coral-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
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