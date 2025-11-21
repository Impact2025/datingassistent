'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import {
  BookOpen,
  Clock,
  Users,
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  PlayCircle,
  FileText,
  MessageCircle,
  Target,
  Zap,
  ArrowRight,
  GraduationCap,
  Lightbulb,
  Heart,
  Calendar,
  BarChart3
} from 'lucide-react';

export default function CoursesPage() {
  const courseLevels = [
    {
      level: "Beginner",
      title: "Voor beginners",
      description: "Perfect voor mensen die net beginnen met online daten",
      duration: "2-4 uur",
      modules: 3,
      icon: Heart,
      color: "bg-pink-50 border-pink-200",
      features: [
        "Basis profiel optimalisatie",
        "Eenvoudige openingszinnen",
        "Veiligheid basics"
      ]
    },
    {
      level: "Intermediate",
      title: "Voor doorgewinterden",
      description: "Voor mensen met dating ervaring die willen verbeteren",
      duration: "4-6 uur",
      modules: 5,
      icon: TrendingUp,
      color: "bg-pink-50 border-pink-200",
      features: [
        "Geavanceerde strategieën",
        "Gesprekstechnieken",
        "Date planning"
      ]
    },
    {
      level: "Advanced",
      title: "Voor experts",
      description: "Voor mensen die hun dating skills naar een hoger niveau willen tillen",
      duration: "6-8 uur",
      modules: 7,
      icon: Award,
      color: "bg-purple-50 border-purple-200",
      features: [
        "Expert technieken",
        "Lange termijn relaties",
        "Persoonlijk merk"
      ]
    }
  ];

  const learningFeatures = [
    {
      icon: PlayCircle,
      title: "Video lessen",
      description: "Korte, boeiende video's met praktische tips en demonstraties"
    },
    {
      icon: FileText,
      title: "Werkbladen",
      description: "Downloadbare oefeningen om direct toe te passen wat je leert"
    },
    {
      icon: MessageCircle,
      title: "AI Coaching",
      description: "Persoonlijke feedback van onze AI coach tijdens je leerproces"
    },
    {
      icon: Target,
      title: "Praktische opdrachten",
      description: "Hands-on oefeningen om je skills in de praktijk te brengen"
    },
    {
      icon: BarChart3,
      title: "Voortgang tracking",
      description: "Volg je verbetering met gedetailleerde statistieken"
    },
    {
      icon: Users,
      title: "Community support",
      description: "Stel vragen aan andere cursisten en experts"
    }
  ];

  const testimonials = [
    {
      name: "Sarah, 28",
      course: "Beginner cursus",
      rating: 5,
      text: "Deze cursus heeft mijn dating leven compleet veranderd! Ik heb eindelijk begrepen wat ik fout deed en nu heb ik mijn eerste relatie in jaren.",
      avatar: "S"
    },
    {
      name: "Mark, 35",
      course: "Intermediate cursus",
      rating: 5,
      text: "De praktische tips zijn geweldig. Ik heb geleerd hoe ik echt connecties maak in plaats van oppervlakkige gesprekken. Worth every penny!",
      avatar: "M"
    },
    {
      name: "Lisa, 31",
      course: "Advanced cursus",
      rating: 5,
      text: "Als dating coach was ik sceptisch, maar deze cursus heeft me nieuwe inzichten gegeven. De kwaliteit is uitstekend.",
      avatar: "L"
    }
  ];

  const curriculum = [
    {
      phase: "Fase 1: Fundamenten",
      title: "De basis leggen",
      modules: [
        "Profiel psychologie - wat werkt echt",
        "Foto strategie voor maximale aantrekkingskracht",
        "Basis gesprekstechnieken"
      ]
    },
    {
      phase: "Fase 2: Vaardigheden",
      title: "Skills ontwikkelen",
      modules: [
        "Geavanceerde openingszinnen",
        "Diepgaande gesprekken voeren",
        "Non-verbale communicatie"
      ]
    },
    {
      phase: "Fase 3: Strategie",
      title: "Systeem optimaliseren",
      modules: [
        "Match analyse en patronen",
        "Date planning en uitvoering",
        "Lange termijn relatie building"
      ]
    },
    {
      phase: "Fase 4: Mastery",
      title: "Expert niveau",
      modules: [
        "Persoonlijk merk ontwikkelen",
        "Multiple dating strategieën",
        "Relatie onderhoud en groei"
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-pink-50 to-rose-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                🎓 Professionele dating cursussen
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Leer de kunst van succesvol daten
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Van profiel optimalisatie tot eerste dates - onze cursussen geven je bewezen strategieën
                en praktische skills om je dating leven te transformeren.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="px-8">
                  <BookOpen className="mr-2 w-5 h-5" />
                  Start gratis cursus
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  Bekijk alle cursussen
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600 mb-2">100%</div>
                  <div className="text-sm text-gray-600">Nederlands concept</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">4.8/5</div>
                  <div className="text-sm text-gray-600">Gemiddelde beoordeling</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
                  <div className="text-sm text-gray-600">Meer dates na cursus</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Hoe onze cursussen werken</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Een complete leerervaring die theorie combineert met praktijk,
                  ondersteund door AI coaching en community support.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {learningFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <Icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Course Levels */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Kies je niveau</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Of je nu beginner bent of al ervaring hebt, we hebben een cursus die bij je past.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {courseLevels.map((level, index) => {
                  const Icon = level.icon;
                  return (
                    <Card key={index} className={`${level.color} border-2 hover:shadow-lg transition-all`}>
                      <CardHeader className="text-center">
                        <Icon className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                        <CardTitle className="text-xl">{level.title}</CardTitle>
                        <p className="text-sm text-gray-600">{level.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {level.duration}
                          </span>
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            {level.modules} modules
                          </span>
                        </div>

                        <ul className="space-y-2">
                          {level.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <Button className="w-full" variant={index === 1 ? "default" : "outline"}>
                          {index === 0 ? "Start gratis" : "Bekijk cursus"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Specific Courses */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Onze Cursussen</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Ontdek onze complete collectie professionele dating cursussen
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                      <Heart className="w-6 h-6 text-pink-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Profiel Mastery</h3>
                    <p className="text-sm text-gray-600 mb-3">Leer hoe je een profiel maakt dat 3x meer aandacht trekt</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-pink-600 font-medium">€29</span>
                      <span className="text-gray-500">2 uur</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Chat Expert</h3>
                    <p className="text-sm text-gray-600 mb-3">Meester gesprekstechnieken voor memorabele chats</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-pink-600 font-medium">€39</span>
                      <span className="text-gray-500">3 uur</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Date Perfection</h3>
                    <p className="text-sm text-gray-600 mb-3">Van eerste ontmoeting tot droomdate</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-pink-600 font-medium">€49</span>
                      <span className="text-gray-500">4 uur</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Attraction Accelerator</h3>
                    <p className="text-sm text-gray-600 mb-3">Verhoog je aantrekkingskracht met bewezen technieken</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-pink-600 font-medium">€59</span>
                      <span className="text-gray-500">5 uur</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <Award className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Relationship Builder</h3>
                    <p className="text-sm text-gray-600 mb-3">Bouw duurzame relaties met diepgaande connecties</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-pink-600 font-medium">€69</span>
                      <span className="text-gray-500">6 uur</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-white">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mb-4">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Complete Masterclass</h3>
                    <p className="text-sm text-gray-600 mb-3">Alle technieken in één uitgebreide masterclass</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-pink-600 font-bold">€149</span>
                      <span className="text-gray-500">15 uur</span>
                    </div>
                    <div className="mt-3 px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full text-center">
                      Meest populair
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">Alle cursussen bevatten levenslange toegang, werkbladen en AI-coaching</p>
                <Button size="lg" variant="outline">
                  Bekijk alle prijzen en aanbiedingen
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Wat leer je in onze cursussen</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Een gestructureerde aanpak van basis tot expert niveau,
                  met bewezen methoden die resultaten opleveren.
                </p>
              </div>

              <div className="space-y-8">
                {curriculum.map((phase, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{phase.phase}</CardTitle>
                          <p className="text-sm text-gray-600">{phase.title}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ul className="space-y-3">
                        {phase.modules.map((module, moduleIndex) => (
                          <li key={moduleIndex} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{module}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Wat onze cursisten zeggen</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Echte verhalen van mensen die hun dating leven hebben getransformeerd.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>

                      <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{testimonial.name}</div>
                          <div className="text-xs text-gray-600">{testimonial.course}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits & Outcomes */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Wat levert het je op?</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Meetbare resultaten die je dating leven transformeren.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">3x meer matches</h3>
                    <p className="text-sm text-gray-600">Betere profielen leiden tot meer aandacht</p>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Betere gesprekken</h3>
                    <p className="text-sm text-gray-600">Leer diepgaande connecties maken</p>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Meer dates</h3>
                    <p className="text-sm text-gray-600">Van matches naar echte ontmoetingen</p>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-pink-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Betere relaties</h3>
                    <p className="text-sm text-gray-600">Kwaliteit boven kwantiteit</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-pink-600 to-rose-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Klaar om te beginnen?</h2>
              <p className="text-xl mb-8 opacity-90">
                Start vandaag nog met onze gratis beginner cursus en ontdek hoe je je dating leven kunt verbeteren.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="px-8">
                  <GraduationCap className="mr-2 w-5 h-5" />
                  Start gratis cursus
                </Button>
                <Button size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white hover:text-blue-600">
                  Bekijk alle cursussen
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>

              <p className="text-sm mt-6 opacity-75">
                Geen verplichtingen • 30 dagen geld terug garantie • Levenslange toegang
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}