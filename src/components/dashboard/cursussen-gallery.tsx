"use client";

/**
 * Cursussen Gallery Component
 * Moderne card-based weergave van alle cursussen met het nieuwe dashboard design
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, BookOpen, TrendingUp, CheckCircle, Lock, Play, Star, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CursusWithProgress } from '@/types/cursus.types';

interface CursussenGalleryProps {
  onCursusSelect?: (slug: string) => void;
}

export function CursussenGallery({ onCursusSelect }: CursussenGalleryProps) {
  const [cursussen, setCursussen] = useState<CursusWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchCursussen();
  }, []);

  const fetchCursussen = async () => {
    try {
      const response = await fetch('/api/cursussen');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const text = await response.text();
      if (!text) {
        setCursussen([]);
        return;
      }

      const data = JSON.parse(text);
      setCursussen(data.cursussen || []);
    } catch (error) {
      console.error('Error fetching cursussen:', error);
      setCursussen([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter cursussen
  const filteredCursussen = cursussen.filter(cursus => {
    const matchesSearch = searchQuery === '' ||
      cursus.titel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cursus.beschrijving && cursus.beschrijving.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = selectedLevel === 'all' || cursus.niveau === selectedLevel;
    const matchesType = selectedType === 'all' || cursus.cursus_type === selectedType;

    return matchesSearch && matchesLevel && matchesType;
  });

  const getLevelLabel = (niveau: string) => {
    const labels: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Gevorderd',
      advanced: 'Expert',
    };
    return labels[niveau] || niveau;
  };

  const getCursusTypeBadge = (type: string) => {
    if (type === 'gratis') {
      return <Badge className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">Gratis</Badge>;
    }
    return <Badge className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">Premium</Badge>;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-secondary rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-secondary rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-secondary rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-muted-foreground" />
              <h4 className="font-semibold">Zoek & Filter</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-3">
                <Input
                  type="text"
                  placeholder="Zoek cursussen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Level filter */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">Alle niveaus</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Gevorderd</option>
                <option value="advanced">Expert</option>
              </select>

              {/* Type filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">Alle types</option>
                <option value="gratis">Gratis</option>
                <option value="starter">Starter</option>
                <option value="groeier">Groeier</option>
                <option value="expert">Expert</option>
                <option value="vip">VIP</option>
              </select>

              {/* Results count */}
              <div className="flex items-center text-sm text-muted-foreground">
                <span>{filteredCursussen.length} {filteredCursussen.length === 1 ? 'cursus' : 'cursussen'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cursussen Grid */}
      {filteredCursussen.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Geen cursussen gevonden
            </h3>
            <p className="text-muted-foreground text-center">
              Probeer een andere zoekopdracht of filter
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCursussen.map((cursus) => {
            const progress = cursus.user_progress;
            const isStarted = progress && progress.voltooide_lessen > 0;
            const isCompleted = progress && progress.percentage === 100;
            const hasAccess = cursus.hasAccess !== false; // Default to true for backwards compat
            const isLocked = !hasAccess && cursus.cursus_type !== 'gratis';

            const CursusCard = (
              <Card
                onClick={onCursusSelect ? () => onCursusSelect(cursus.slug) : undefined}
                className={cn(
                  "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full relative",
                  isCompleted && "border-green-500 border-2",
                  isStarted && !isCompleted && "border-pink-300",
                  isLocked && "opacity-90"
                )}
              >
                  {/* Header with badges */}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight group-hover:text-pink-600 transition-colors">
                          {cursus.titel}
                        </CardTitle>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getCursusTypeBadge(cursus.cursus_type)}
                        {isCompleted && (
                          <Badge className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Voltooid
                          </Badge>
                        )}
                      </div>
                    </div>

                    {cursus.subtitel && (
                      <CardDescription className="line-clamp-2">
                        {cursus.subtitel}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Beschrijving */}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {cursus.beschrijving}
                    </p>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{cursus.duur_minuten} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{progress?.totaal_lessen || 0} lessen</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{getLevelLabel(cursus.niveau)}</span>
                      </div>
                    </div>

                    {/* Progress bar (if started) */}
                    {isStarted && progress && (
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Voortgang</span>
                          <span className="font-semibold text-pink-600">
                            {progress.voltooide_lessen} / {progress.totaal_lessen} lessen
                          </span>
                        </div>
                        <Progress value={progress.percentage} className="h-2" />
                      </div>
                    )}

                    {/* Doelen preview (max 2) */}
                    {cursus.doelen && cursus.doelen.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t">
                        <p className="text-xs font-semibold text-muted-foreground">Je leert:</p>
                        <ul className="space-y-1">
                          {cursus.doelen.slice(0, 2).map((doel, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-pink-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{doel}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button
                      className={cn(
                        "w-full rounded-full shadow-lg hover:shadow-xl transition-all",
                        isLocked
                          ? "bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white"
                          : "bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                      )}
                    >
                      {isLocked ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Kopen
                        </>
                      ) : isCompleted ? (
                        <>
                          <Star className="w-4 h-4 mr-2" />
                          Bekijk opnieuw
                        </>
                      ) : isStarted ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Verder gaan
                        </>
                      ) : (
                        cursus.cursus_type === 'gratis' ? 'Gratis starten' : 'Bekijk cursus'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
            );

            // Determine the correct href based on access
            const cursusHref = isLocked ? '/prijzen' : `/cursussen/${cursus.slug}`;

            return (
              <div key={cursus.id}>
                {onCursusSelect ? (
                  // When using callback, only call for non-locked courses
                  <div onClick={isLocked ? undefined : () => onCursusSelect(cursus.slug)}>
                    {isLocked ? (
                      <Link href="/prijzen">{CursusCard}</Link>
                    ) : (
                      CursusCard
                    )}
                  </div>
                ) : (
                  <Link href={cursusHref}>
                    {CursusCard}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state when no cursussen at all */}
      {cursussen.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="w-20 h-20 text-muted-foreground/50 mb-4" />
            <h3 className="text-2xl font-bold text-muted-foreground mb-2">
              Geen cursussen beschikbaar
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Er zijn momenteel geen gepubliceerde cursussen. Check binnenkort nog eens terug!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
