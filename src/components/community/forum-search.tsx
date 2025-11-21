"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as Lucide from 'lucide-react';
import { ForumPost } from '@/lib/types';

interface ForumSearchProps {
  onSearch: (query: string, categoryId?: number, sortBy?: string) => void;
  isLoading: boolean;
}

export function ForumSearch({ onSearch, isLoading }: ForumSearchProps) {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(
        query.trim(),
        categoryId && categoryId !== 'all' ? parseInt(categoryId) : undefined,
        sortBy
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="border-2 border-primary/10 shadow-lg bg-gradient-to-r from-card via-card to-card/95">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-pink-600 flex items-center justify-center">
            <Lucide.Search className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold">Zoek in onze Community</div>
            <div className="text-sm text-muted-foreground font-normal">Vind relevante discussies en ervaringen</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main search input */}
          <div className="relative">
            <Lucide.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Zoek op titel, inhoud of auteur..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 text-base border-2 focus:border-primary h-12"
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Categorie</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="border-2 focus:border-primary">
                  <SelectValue placeholder="Alle categorieën" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle categorieën</SelectItem>
                  <SelectItem value="1">💬 Algemeen</SelectItem>
                  <SelectItem value="2">👤 Profiel Advies</SelectItem>
                  <SelectItem value="3">💭 Gesprekken</SelectItem>
                  <SelectItem value="4">📅 Dates & Activiteiten</SelectItem>
                  <SelectItem value="5">🏆 Succesverhalen</SelectItem>
                  <SelectItem value="6">💡 Tips & Tricks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:w-48">
              <label className="text-sm font-medium text-foreground mb-2 block">Sorteren op</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-2 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">🕒 Nieuwste eerst</SelectItem>
                  <SelectItem value="oldest">📅 Oudste eerst</SelectItem>
                  <SelectItem value="most-viewed">👁️ Meest bekeken</SelectItem>
                  <SelectItem value="most-replies">💬 Meeste reacties</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:w-auto">
              <label className="text-sm font-medium text-foreground mb-2 block opacity-0">Zoeken</label>
              <Button
                onClick={handleSearch}
                disabled={!query.trim() || isLoading}
                className="w-full sm:w-auto h-10 bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90"
                size="lg"
              >
                {isLoading ? (
                  <Lucide.Loader className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Lucide.Search className="h-4 w-4 mr-2" />
                )}
                Zoeken
              </Button>
            </div>
          </div>

          {/* Search tips */}
          <div className="bg-gradient-to-r from-primary/5 to-pink-600/5 rounded-lg p-4 border border-primary/10">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary/10 to-pink-600/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lucide.Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Zoek tips voor betere resultaten</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Gebruik specifieke woorden zoals "eerste date" of "profielfoto"</li>
                  <li>• Zoek op auteursnamen om iemands ervaringen te vinden</li>
                  <li>• Combineer met categorie filters voor gerichte resultaten</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}