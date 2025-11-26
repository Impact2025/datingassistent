'use client';

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { mindsetVoorbereidingSlides } from "@/data/mindset-voorbereiding-slides";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import the SlideViewer for better performance
const SlideViewer = dynamic(() => import("@/components/slides/slide-viewer"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border bg-muted p-6 min-h-[400px] flex items-center justify-center">
      <p className="text-muted-foreground">Slides worden geladen...</p>
    </div>
  ),
});

export default function MindsetVoorbereidingPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Cursus", href: "/cursus" },
          { label: "Goed Jezelf Kennen" }, // Current page, no link
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
          <SlideViewer deck={mindsetVoorbereidingSlides} />
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
          {/* Note: This link will be broken until module 2 is created */}
          <Link href="/cursus/profiel-optimalisatie">
            Naar Module 2
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
