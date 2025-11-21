"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as Lucide from 'lucide-react';
import { ForumCategory } from '@/lib/types';

export function ForumCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/community/forum/categories');

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      console.log('Fetched categories:', data);
      setCategories(data.categories);
    } catch (err) {
      setError('Kon forum categorieën niet laden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    router.push(`/community/forum/${categoryId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Lucide.Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle>Forum Categorieën</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
          Ontdek onze Community
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Sluit je aan bij duizenden anderen die hun dating leven verbeteren. Deel ervaringen, stel vragen en vind steun.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const icons = [
            Lucide.MessageSquare,
            Lucide.User,
            Lucide.MessageCircle,
            Lucide.Calendar,
            Lucide.Trophy,
            Lucide.Lightbulb
          ];
          const IconComponent = icons[index % icons.length];

          return (
            <Card
              key={category.id}
              className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
              onClick={() => handleCategoryClick(category.id)}
            >
              {/* Background gradient overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${category.color}20, ${category.color}05)`
                }}
              />

              <CardContent className="p-6 relative">
                <div className="flex items-start gap-4">
                  {/* Icon with gradient background */}
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`
                    }}
                  >
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>

                    {/* Stats placeholder */}
                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Lucide.MessageSquare className="h-3 w-3" />
                        <span>24 posts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Lucide.Users className="h-3 w-3" />
                        <span>156 leden</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Lucide.ChevronRight className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Call to action */}
      <div className="text-center pt-8">
        <Card className="bg-gradient-to-r from-primary/5 to-pink-600/5 border-primary/20">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-pink-600 flex items-center justify-center">
                  <Lucide.Heart className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold">Word lid van onze Community</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Deel je ervaringen, leer van anderen en vind de liefde die je verdient.
              </p>
              <Button size="lg" className="mt-4">
                <Lucide.Plus className="h-4 w-4 mr-2" />
                Start een Discussie
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}