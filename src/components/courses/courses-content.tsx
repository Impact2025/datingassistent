'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import { WebChatWidget } from '@/components/chatbot/whatsapp-widget';
import { toSentenceCase } from '@/lib/utils';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle,
  ArrowRight,
  Award,
  TrendingUp,
  Heart
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  level: string;
  duration_hours: number;
  is_free: boolean;
  price: number;
  module_count: number;
  lesson_count: number;
}

export default function CoursesContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError('Kon cursussen niet laden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Gevorderd';
      case 'advanced':
        return 'Expert';
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchCourses}>
            Probeer opnieuw
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-pink-200">
              <BookOpen className="w-5 h-5 text-pink-500" />
              <span className="text-sm font-medium text-gray-700">Online Cursussen</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Leer de <span className="text-pink-500">kunst van het daten</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Professionele online cursussen om je dating skills naar een hoger niveau te tillen.
              Van eerste berichten tot succesvolle relaties.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register">
                <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                  Start je eerste cursus
                </Button>
              </Link>
              <Link href="#courses">
                <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500 px-8 py-6 text-lg rounded-full transition-all">
                  Bekijk alle cursussen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-500 mb-2">{courses.length}+</div>
              <div className="text-sm text-gray-600">Cursussen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-500 mb-2">
                {courses.reduce((acc, course) => acc + course.lesson_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Lessen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-500 mb-2">25.000+</div>
              <div className="text-sm text-gray-600">Studenten</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-500 mb-2">4.9/5</div>
              <div className="text-sm text-gray-600">Gemiddelde beoordeling</div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section id="courses" className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Kies je cursus
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Van beginner tot expert - vind de cursus die bij jou past
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nog geen cursussen beschikbaar
              </h3>
              <p className="text-gray-500">
                Nieuwe cursussen worden binnenkort toegevoegd!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-12 h-12 text-pink-500" />
                      )}
                    </div>

                    {/* Level Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                        {getLevelText(course.level)}
                      </span>
                    </div>

                    {/* Free Badge */}
                    {course.is_free && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Gratis
                        </span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {toSentenceCase(course.title)}
                      </h3>
                      {course.description && (
                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                          {course.description}
                        </p>
                      )}
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration_hours}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.module_count} modules</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        <span>{course.lesson_count} lessen</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {course.is_free ? (
                          'Gratis'
                        ) : (
                          `€${course.price}`
                        )}
                      </div>

                      <Link href={`/courses/${course.id}`}>
                        <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6 group-hover:bg-pink-600 transition-colors">
                          Start cursus
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Our Courses */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Waarom onze cursussen?
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Meer dan alleen theorie - praktische skills die werken
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500 flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Praktische oefeningen</h3>
              <p className="text-gray-600 leading-relaxed">
                Elke cursus bevat praktijkopdrachten die je direct kunt toepassen in je dating leven.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Bewijzen resultaten</h3>
              <p className="text-gray-600 leading-relaxed">
                Onze methoden zijn gebaseerd op wetenschappelijk onderzoek en jarenlange ervaring.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500 flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Persoonlijke aandacht</h3>
              <p className="text-gray-600 leading-relaxed">
                Directe feedback van experts en een community van gelijkgestemde singles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Klaar om je dating skills te verbeteren?
            </h2>
            <p className="text-lg text-pink-100 max-w-2xl mx-auto">
              Start vandaag nog met je eerste cursus en ontdek hoe leuk en succesvol daten kan zijn.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register">
                <Button className="bg-white text-pink-600 hover:bg-gray-50 px-8 py-6 text-lg rounded-full shadow-lg font-semibold">
                  Start gratis cursus
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-pink-600 px-8 py-6 text-lg rounded-full font-semibold">
                  Naar dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <BottomNavigation />
      <CookieConsentBanner />
      <WebChatWidget />
    </div>
  );
}