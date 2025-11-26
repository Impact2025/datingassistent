'use client';

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { profielOptimalisatieSlides } from "@/data/profiel-optimalisatie-slides";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

const SlideViewer = dynamic(() => import("@/components/slides/slide-viewer"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border bg-muted p-6 min-h-[400px] flex items-center justify-center">
      <p className="text-muted-foreground">Slides worden geladen...</p>
    </div>
  ),
});

export default function ProfielOptimalisatiePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Cursus", href: "/cursus" },
          { label: "Profiel Optimalisatie" }, 
        ]}
      />
      
      <Card className="mt-4 overflow-hidden shadow-lg border-0">
        <CardHeader className="bg-rose-50 p-6 border-b border-rose-100">
          <CardTitle className="text-3xl font-bold text-rose-800">
            Module 2: Profiel van Onzichtbaar naar Onweerstaanbaar
          </CardTitle>
          <CardDescription className="text-md text-rose-700 mt-2">
            Transformeer je datingprofiel van onzichtbaar naar onweerstaanbaar met bewezen technieken.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 bg-white">
          <SlideViewer deck={profielOptimalisatieSlides} />
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href="/cursus/mindset-voorbereiding">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar Module 1
          </Link>
        </Button>
        <Button asChild>
          {/* Note: This link will be broken until module 3 is created */}
          <Link href="/cursus/gesprekken-masterclass">
            Naar Module 3
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
