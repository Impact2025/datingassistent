"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star, Download, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

const slides = [
  {
    id: 1,
    headline: "Stop met Tinder-nonsens.\nStart met daten waarop je jezelf bent.",
    subheadline: "Voor introverten, technici en mensen die sociale netwerken niet snappen. Ontdek hoe je écht verbinding maakt - zonder de awkward small talk.",
    painPoint: "Ben je intelligent, grappig en succesvol... maar voelt daten overweldigend? Weet je niet hoe je profiel op te zetten of goeie gesprekken te voeren? Jij bent niet alleen.",
    ctaPrimary: "Start met AI-coaching",
    ctaSecondary: "Bekijk hoe het werkt",
    visual: "nerdy-person-laptop",
    type: "hero"
  },
  {
    id: 2,
    headline: "AI-coaching gaat je datingleven niet meer overwelmdigen -\nhet maakt het makkelijker",
    subheadline: "Geen generieke dating tips. Geen motivationele praat. Gewoon: stap-voor-stap hulp gericht op jouw type persoon.",
    tools: [
      {
        icon: "🧠",
        title: "PROFILE COACH",
        description: "Upload een foto. AI geeft feedback op je profiel - professioneel, honest, zero judgment"
      },
      {
        icon: "💬",
        title: "MESSAGE LAB",
        description: "Weet niet wat je moet zeggen? AI geeft 5 openers - niet cheesy, wel effectief"
      },
      {
        icon: "🔍",
        title: "VIBE ANALYZER",
        description: "Check de chemie eerder je een date doet. Bespaar jezelf awkward koffie moments"
      },
      {
        icon: "🤖",
        title: "CHAT COACH (24/7)",
        description: "Piekert over wat je zei? Coach antwoordt instant. Geen wachtrij, geen schaamte"
      }
    ],
    ctaPrimary: "Ontdek alle tools",
    type: "tools"
  },
  {
    id: 3,
    headline: "Introvertie is GEEN handicap in daten -\nhet's je superpower",
    subheadline: "Jij bent diepdenker, loyaal en authentiek. Jij zoekt zielsverwanten, niet oppervlakkige connecties. We helpen je ze vinden.",
    message: "Veel dating-advice is voor extraverten geschreven:\n'Ga naar feestjes! Wees spontaan! Flirt agressief!'\n\nDat is niet wie jij bent. En dat hoeft ook niet.\nIntroverten vinden hun mensen via diepere verbindingen.\nWij helpen je die sneller en beter te maken.",
    advantages: [
      "✓ Advice gericht op jouw communicatiestijl",
      "✓ AI snapt introvertie (geen judgment)",
      "✓ Focus op kwaliteit > kwantiteit",
      "✓ One-on-one coaching (geen groepsdruk)"
    ],
    ctaPrimary: "Lees hoe introverten wél succesvol daten",
    type: "niche"
  },
  {
    id: 4,
    headline: "Al 2.500+ introverten hebben hun match gevonden",
    subheadline: "De beproefde AI-strategie van DatingAssistent. Niet voor iedereen. Voor jou.",
    testimonials: [
      {
        name: "THOMAS, 34",
        role: "SOFTWAREONTWIKKELAAR",
        text: "Ik dacht daten niets voor mij was. Drie maanden AI-coaching later? Zit ik met mijn soulmate. Serieus.",
        rating: 5
      },
      {
        name: "SARA, 31",
        role: "DATA ANALYST",
        text: "Eindelijk iemand die snapt dat je niet hoeft te veranderen. Mijn partner zei: 'Waarom heb je dit niet eerder gedaan?'",
        rating: 5
      },
      {
        name: "MARK, 38",
        role: "FREELANCER",
        text: "De AI Coach is als een goede vriend die altijd online is. Ik durfde eindelijk weer te daten.",
        rating: 5
      }
    ],
    stats: [
      { icon: "📊", value: "2.500+", label: "matches geholpen" },
      { icon: "📈", value: "73%", label: "vond serieuze relatie binnen 6 maanden" },
      { icon: "⏱️", value: "90 dagen", label: "gemiddeld tot eerste date" }
    ],
    ctaPrimary: "Lees meer succesverhalen",
    type: "social-proof"
  },
  {
    id: 5,
    headline: "Gratis: De Introvert Dating Playbook",
    subheadline: "De 7 stappen die introverten van Tinder-chaos naar echte connecties brengen",
    playbookContent: [
      "✓ Hoe schrijf je een profiel dat ECHT je weergeeft",
      "✓ 15 conversation starters (voor introverten, niet cheesy)",
      "✓ Hoe je social anxiety monsters in de kamer neemt",
      "✓ Wanneer je van app naar real life gaat (utan te veel pressure)",
      "✓ De \"introvert dating timeline\" (manage expectations)",
      "✓ Wat AI-coaching kan (en wat niet)"
    ],
    bonus: "Ontvang elke week praktische tips in je inbox (geen spam, cancelable met 1 klik)",
    ctaPrimary: "Download gratis playbook",
    type: "lead-magnet"
  }
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000); // 8 seconds per slide

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const renderSlide = (slide: typeof slides[0]) => {
    switch (slide.type) {
      case "hero":
        return (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-foreground">
                  {slide.headline.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < slide.headline.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {slide.subheadline}
                </p>
              </div>

              <div className="bg-muted/50 p-6 rounded-2xl border">
                <p className="text-foreground leading-relaxed">
                  {slide.painPoint}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90">
                  {slide.ctaPrimary}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  {slide.ctaSecondary}
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center">
                <div className="text-8xl">👨‍💻</div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-background border rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  AI Coach online
                </div>
              </div>
            </div>
          </div>
        );

      case "tools":
        return (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                {slide.headline.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < slide.headline.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {slide.subheadline}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {slide.tools?.map((tool, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="text-4xl">{tool.icon}</div>
                    <h3 className="font-semibold text-lg">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" className="text-lg px-8 py-6">
                {slide.ctaPrimary}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );

      case "niche":
        return (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  {slide.headline.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < slide.headline.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {slide.subheadline}
                </p>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-2xl border">
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {slide.message}
                </p>
              </div>

              <div className="space-y-3">
                {slide.advantages?.map((advantage, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{advantage}</span>
                  </div>
                ))}
              </div>

              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                {slide.ctaPrimary}
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl flex items-center justify-center">
                <div className="text-8xl">🧠</div>
              </div>
            </div>
          </div>
        );

      case "social-proof":
        return (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                {slide.headline}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {slide.subheadline}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {slide.testimonials?.map((testimonial, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    <div className="pt-4 border-t">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6 text-center">
              {slide.stats?.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-3xl">{stat.icon}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                {slide.ctaPrimary}
              </Button>
            </div>
          </div>
        );

      case "lead-magnet":
        return (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  {slide.headline}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {slide.subheadline}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What's inside (sneak peek):</h3>
                <div className="space-y-3">
                  {slide.playbookContent?.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
                <p className="text-primary font-medium">
                  🎁 <strong>BONUS:</strong> {slide.bonus}
                </p>
              </div>

              <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90">
                <Download className="mr-2 h-5 w-5" />
                {slide.ctaPrimary}
              </Button>
            </div>

            <div className="relative">
              <Card className="border-2 shadow-2xl">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="w-24 h-32 bg-gradient-to-br from-primary to-secondary rounded-lg mx-auto flex items-center justify-center">
                    <div className="text-white text-2xl font-bold">7</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Introvert Dating Playbook</h3>
                    <p className="text-muted-foreground">De complete gids voor authentiek daten</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Slide Content */}
          <div className="transition-all duration-700 ease-in-out">
            {renderSlide(slides[currentSlide])}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-primary scale-125'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 backdrop-blur-sm border rounded-full flex items-center justify-center hover:bg-background transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 backdrop-blur-sm border rounded-full flex items-center justify-center hover:bg-background transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent pt-20 pb-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Klaar om je datingleven voorgoed te veranderen?
          </h3>
          <div className="flex justify-center">
            <div className="animate-bounce">
              <ArrowRight className="h-8 w-8 text-primary rotate-90" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}