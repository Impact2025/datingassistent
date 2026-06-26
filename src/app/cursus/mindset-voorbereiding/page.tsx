'use client';

import { useState, useEffect } from 'react';
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { mindsetVoorbereidingSlides } from "@/data/mindset-voorbereiding-slides";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { SlideDeck } from "@/types/slides";

export const dynamic = 'force-dynamic';

export default function MindsetVoorbereidingPage() {
  const [SlideViewer, setSlideViewer] = useState<React.ComponentType<{ deck: SlideDeck; onComplete?: () => void }> | null>(null);

  useEffect(() => {
    import("@/components/slides/slide-viewer").then(mod => {
      setSlideViewer(() => mod.default);
    }).catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Cursus", href: "/cursus" },
          { label: "Goed Jezelf Kennen" },
        ]}
      />
      
      <Card className="mt-4 overflow-hidden shadow-lg border-0">
        <CardHeader className="bg-gray-50 p-6 border-b">
          <CardTitle className="text-3xl font-bold text-gray-800">
            Module 1: Goed Jezelf Kennen - De Basis
          </CardTitle>
          <CardDescription className="text-md text-gray-600 mt-2">
            Ontdek wat je écht zoekt in de liefde. Waarom zelfkennis de basis is voor aantrekkelijke profielen.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 bg-white">
          {SlideViewer ? (
            <SlideViewer deck={mindsetVoorbereidingSlides} />
          ) : (
            <div className="rounded-lg border bg-muted p-6 min-h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Slides worden geladen...</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href="/cursus">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar cursusoverzicht
          </Link>
        </Button>
        <Button asChild>
          <Link href="/cursus/profiel-optimalisatie">
            Naar Module 2
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
