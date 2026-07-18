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
    url: 'https://www.datingassistent.nl/features',
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
    </div>
  );
}
