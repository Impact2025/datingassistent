/**
 * Kennisbank Overview Page
 * Wereldklasse versie met zoekfunctionaliteit en verbeterde UX
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Clock,
  ArrowRight,
  Heart,
  Brain,
  MessageCircle,
  Users,
  Sparkles,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { getKennisbankCategories, getKennisbankIndex, getAllKennisbankArticles } from '@/lib/kennisbank';
import { KennisbankSearch } from '@/components/kennisbank/kennisbank-search';

export const metadata: Metadata = {
  title: 'Kennisbank | DatingAssistent',
  description: 'Alles over dating, relaties en persoonlijke groei. Evidence-based artikelen over dating burnout, ghosting, hechtingsstijlen en meer.',
  openGraph: {
    title: 'Kennisbank | DatingAssistent',
    description: 'Evidence-based artikelen over dating, relaties en persoonlijke groei.',
    type: 'website',
    url: 'https://datingassistent.nl/kennisbank',
    siteName: 'DatingAssistent',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kennisbank | DatingAssistent',
    description: 'Evidence-based artikelen over dating, relaties en persoonlijke groei.',
  },
  alternates: {
    canonical: 'https://datingassistent.nl/kennisbank',
  },
};

// Icon mapping voor categorieën
const categoryIcons: Record<string, React.ElementType> = {
  'dating-burnout': Sparkles,
  'ghosting': MessageCircle,
  'hechtingsstijlen': Brain,
  'daten-als-introvert': Users,
  'opnieuw-daten': Heart,
  'profiel-optimaliseren': Shield,
};

// Kleuren voor categorieën
const categoryColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  'dating-burnout': {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    gradient: 'from-amber-500 to-orange-500',
  },
  'ghosting': {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    gradient: 'from-purple-500 to-pink-500',
  },
  'hechtingsstijlen': {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    gradient: 'from-blue-500 to-cyan-500',
  },
  'daten-als-introvert': {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    gradient: 'from-green-500 to-emerald-500',
  },
  'opnieuw-daten': {
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    text: 'text-pink-700 dark:text-pink-400',
    border: 'border-pink-200 dark:border-pink-800',
    gradient: 'from-pink-500 to-rose-500',
  },
  'profiel-optimaliseren': {
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    text: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
    gradient: 'from-cyan-500 to-blue-500',
  },
};

const defaultColors = {
  bg: 'bg-gray-50 dark:bg-gray-900/30',
  text: 'text-gray-700 dark:text-gray-400',
  border: 'border-gray-200 dark:border-gray-700',
  gradient: 'from-gray-500 to-gray-600',
};

export default function KennisbankPage() {
  const indexData = getKennisbankIndex();
  const categories = getKennisbankCategories();
  const allArticles = getAllKennisbankArticles();

  // Bereken totalen
  const totalArticles = allArticles.length;
  const totalReadingTime = allArticles.reduce((sum, a) => sum + a.readingTime, 0);

  // Get popular articles (pillar pages first, then by date)
  const popularArticles = allArticles
    .filter(a => a.type !== 'index')
    .sort((a, b) => {
      if (a.type === 'pillar' && b.type !== 'pillar') return -1;
      if (a.type !== 'pillar' && b.type === 'pillar') return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section with Search */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 via-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <BookOpen className="w-4 h-4" />
            <span>Evidence-based artikelen</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Kennisbank
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Alles over dating, relaties en persoonlijke groei. Geschreven door experts met 10+ jaar ervaring, onderbouwd met psychologisch onderzoek.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <KennisbankSearch
              articles={allArticles.filter(a => a.type !== 'index')}
              placeholder="Zoek artikelen, onderwerpen, of trefwoorden..."
            />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>{totalArticles} artikelen</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>~{totalReadingTime} min leestijd totaal</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Brain className="w-4 h-4" />
              <span>{categories.length} onderwerpen</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Articles - Quick Access */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Populaire artikelen</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularArticles.map((article) => {
              const colors = categoryColors[article.pillar || ''] || defaultColors;
              return (
                <Link
                  key={article.slug}
                  href={`/kennisbank/${article.slug}`}
                  className="group"
                >
                  <div className="p-4 rounded-lg border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 h-full">
                    <div className="flex items-center gap-2 mb-2">
                      {article.type === 'pillar' && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">
                          Gids
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{article.readingTime} min</span>
                    </div>
                    <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title.split(':')[0]}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-8">
            Onderwerpen
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.slug] || BookOpen;
              const colors = categoryColors[category.slug] || defaultColors;
              const pillarArticle = category.articles[0];
              const subArticles = category.articles.slice(1);

              return (
                <Card
                  key={category.slug}
                  className={`group hover:shadow-lg transition-all duration-300 border ${colors.border} overflow-hidden`}
                >
                  <CardHeader className={`${colors.bg} rounded-t-lg relative`}>
                    {/* Subtle gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-[0.03]`} />

                    <div className="relative flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-lg bg-background flex items-center justify-center shadow-sm`}>
                        <IconComponent className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.articles.length} {category.articles.length === 1 ? 'artikel' : 'artikelen'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-4 relative">
                      <Link
                        href={`/kennisbank/${category.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {category.title.split(':')[0]}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 relative">
                      {category.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-4">
                    {/* Sub-articles preview */}
                    {subArticles.length > 0 && (
                      <ul className="space-y-2 mb-4">
                        {subArticles.slice(0, 3).map((article) => (
                          <li key={article.slug}>
                            <Link
                              href={`/kennisbank/${article.slug}`}
                              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 group/item"
                            >
                              <ArrowRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              <span className="line-clamp-1">{article.title.split(':')[0]}</span>
                            </Link>
                          </li>
                        ))}
                        {subArticles.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{subArticles.length - 3} meer...
                          </li>
                        )}
                      </ul>
                    )}

                    <Link
                      href={`/kennisbank/${category.slug}`}
                      className={`inline-flex items-center gap-2 text-sm font-medium ${colors.text} hover:underline`}
                    >
                      Lees de complete gids
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Articles */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-8">
            Alle Artikelen
          </h2>

          <div className="grid gap-4">
            {allArticles
              .filter(a => a.type !== 'index')
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((article) => (
                <Link
                  key={article.slug}
                  href={`/kennisbank/${article.slug}`}
                  className="group"
                >
                  <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/50">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {article.type === 'pillar' && (
                              <Badge variant="default" className="text-xs">
                                Complete Gids
                              </Badge>
                            )}
                            {article.pillar && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {article.pillar.replace(/-/g, ' ')}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {article.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.readingTime} min
                          </span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Hulp nodig bij je specifieke situatie?
          </h2>
          <p className="text-muted-foreground mb-6">
            Onze AI-coach Iris kan je helpen met persoonlijk advies, afgestemd op jouw dating journey.
          </p>
          <Link
            href="/help?chat=open"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            Chat met Iris
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
