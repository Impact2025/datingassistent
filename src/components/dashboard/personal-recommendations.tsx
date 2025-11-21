"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as Lucide from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import { Recommendation } from '@/lib/recommendation-engine';

export function PersonalRecommendations() {
  const { user, userProfile } = useUser();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recommendations?userId=${user?.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError('Kon persoonlijke aanbevelingen niet laden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'module':
        return <Lucide.Compass className="text-primary" />;
      case 'course':
        return <Lucide.BookOpen className="text-primary" />;
      case 'feature':
        return <Lucide.Star className="text-primary" />;
      default:
        return <Lucide.HelpCircle className="text-primary" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'module':
        return 'Module';
      case 'course':
        return 'Cursus';
      case 'feature':
        return 'Functie';
      default:
        return 'Item';
    }
  };

  if (loading) {
    return (
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.Sparkles className="text-primary" />
            Persoonlijke Aanbevelingen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Lucide.Loader className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.Sparkles className="text-primary" />
            Persoonlijke Aanbevelingen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchRecommendations} variant="outline" className="mt-2">
              Opnieuw proberen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.Sparkles className="text-primary" />
            Persoonlijke Aanbevelingen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lucide.Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              We hebben nog geen persoonlijke aanbevelingen voor je. 
              Voltooi modules of bekijk cursussen om aanbevelingen te ontvangen.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lucide.Sparkles className="text-primary" />
          Persoonlijke Aanbevelingen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          Gebaseerd op jouw gedrag en interesses hebben we deze aanbevelingen voor je samengesteld.
        </p>
        
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div 
              key={`${rec.type}-${rec.id}`} 
              className="flex items-start gap-4 p-4 rounded-lg border bg-background border-primary/20"
            >
              <div className="flex flex-col items-center mt-1">
                <div className="relative">
                  {getIconForType(rec.type)}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(rec.confidence * 100)}% match
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    {getTypeLabel(rec.type)}
                  </span>
                  <Button size="sm" variant="outline">
                    Bekijken
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}