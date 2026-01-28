'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  MessageCircle,
  FileText,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Users,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function HelpContent() {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const toggleTopic = (topicId: string) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
  };

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat Support",
      description: "Direct hulp via onze AI-chatbot, 24/7 beschikbaar",
      availability: "24/7",
      responseTime: "Direct",
      action: "Start chat",
      href: "#chat",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: Mail,
      title: "E-mail Support",
      description: "Stuur ons een bericht voor gedetailleerde hulp",
      availability: "24/7",
      responseTime: "< 24 uur",
      action: "E-mail sturen",
      href: "mailto:support@datingassistent.nl",
      color: "bg-green-50 border-green-200"
    },
    {
      icon: Phone,
      title: "Telefonisch Support",
      description: "Snel persoonlijk contact voor urgente zaken",
      availability: "Ma-Vr 9:00-17:00",
      responseTime: "< 1 uur",
      action: "Bellen",
      href: "tel:+31201234567",
      color: "bg-purple-50 border-purple-200"
    }
  ];

  const quickResources = [
    {
      icon: FileText,
      title: "Veelgestelde Vragen",
      description: "Antwoorden op de meest gestelde vragen over DatingAssistent",
      href: "/faq",
      color: "bg-orange-50 border-orange-200"
    },
    {
      icon: BookOpen,
      title: "Handleidingen",
      description: "Stapsgewijze guides voor al onze features",
      href: "/handleidingen",
      color: "bg-teal-50 border-teal-200"
    },
    {
      icon: Users,
      title: "Community Forum",
      description: "Stel vragen aan andere gebruikers en experts",
      href: "/community",
      color: "bg-coral-50 border-coral-200"
    },
    {
      icon: Zap,
      title: "Systeem Status",
      description: "Bekijk of al onze diensten normaal functioneren",
      href: "/status",
      color: "bg-indigo-50 border-indigo-200"
    }
  ];

  const commonTopics = [
    {
      title: "Aan de slag",
      topics: [
        {
          id: "account-aanmaken",
          question: "Account aanmaken",
          answer: "Ga naar datingassistent.nl/register en vul je e-mailadres en wachtwoord in. Je ontvangt een bevestigingsmail om je account te activeren. Na activatie kun je direct beginnen met het invullen van je profiel."
        },
        {
          id: "profielanalyse",
          question: "Eerste profielanalyse",
          answer: "Na registratie word je automatisch doorverwezen naar de profielanalyse. Upload minimaal 3 recente foto's en vul je bio in. Onze AI analyseert je profiel en geeft specifieke verbeterpunten voor meer matches."
        },
        {
          id: "basisinstellingen",
          question: "Basisinstellingen configureren",
          answer: "Ga naar je dashboard > Instellingen. Stel je locatie, leeftijd, interesses en datingvoorkeuren in. Deze informatie helpt onze AI om betere aanbevelingen te geven voor matches en dates."
        }
      ]
    },
    {
      title: "Features & Tools",
      topics: [
        {
          id: "chat-coach",
          question: "Chat Coach gebruiken",
          answer: "De Chat Coach is 24/7 beschikbaar in je dashboard. Klik op 'Chat Coach' en stel je vraag over gesprekken, openingszinnen of relatie-advies. De AI geeft directe, persoonlijke tips gebaseerd op je profiel."
        },
        {
          id: "date-planner",
          question: "Date Planner instellen",
          answer: "Ga naar 'Date Planner' in je dashboard. Geef je locatie, budget en interesses op. De AI genereert gepersonaliseerde date ideeën met routebeschrijvingen en gespreksonderwerpen voor memorabele ervaringen."
        },
        {
          id: "foto-feedback",
          question: "Foto feedback begrijpen",
          answer: "Upload je profielfoto's via 'Foto Check' in je dashboard. De AI analyseert helderheid, compositie en aantrekkingskracht. Je krijgt scores en specifieke tips om je foto's te verbeteren voor meer aandacht."
        }
      ]
    },
    {
      title: "Abonnementen",
      topics: [
        {
          id: "prijzen-vergelijken",
          question: "Prijzen vergelijken",
          answer: "Bezoek datingassistent.nl/prijzen voor een overzicht van alle abonnementen. Het Basic pakket (€9.99/maand) geeft toegang tot basis tools. Premium (€19.99/maand) bevat alle features inclusief prioriteit support."
        },
        {
          id: "betaling-wijzigen",
          question: "Betaling wijzigen",
          answer: "Ga naar Dashboard > Abonnement > Betalingsmethode. Je kunt je creditcard gegevens bijwerken of wisselen naar iDEAL/SEPA. Wijzigingen worden direct verwerkt voor je volgende factuur."
        },
        {
          id: "abonnement-opzeggen",
          question: "Abonnement opzeggen",
          answer: "Ga naar Dashboard > Abonnement > Opzeggen. Je account blijft actief tot het einde van je huidige betaalperiode. Je kunt altijd weer beginnen waar je gebleven was."
        }
      ]
    },
    {
      title: "Probleemoplossing",
      topics: [
        {
          id: "login-problemen",
          question: "Login problemen",
          answer: "Controleer je e-mail voor de bevestigingslink bij eerste login. Gebruik 'Wachtwoord vergeten' als je je wachtwoord kwijt bent. Wis je browser cache bij persistente problemen."
        },
        {
          id: "betaling-mislukt",
          question: "Betaling mislukt",
          answer: "Controleer je creditcard gegevens en saldo. Contacteer je bank bij 'onvoldoende saldo' fouten. Probeer een andere betaalmethode als iDEAL niet werkt. Neem contact op als het probleem blijft bestaan."
        },
        {
          id: "app-werkt-niet",
          question: "App werkt niet",
          answer: "Vernieuw de pagina (F5) bij laadt problemen. Controleer je internetverbinding. Log uit en weer in bij account problemen. Gebruik een moderne browser (Chrome, Firefox, Safari) voor de beste ervaring."
        }
      ]
    }
  ];

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Hoe kunnen we je helpen?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Vind snel antwoorden op je vragen of neem contact op met ons support team
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Zoek in onze help artikelen..."
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600 mb-1">24/7</div>
                <div className="text-sm text-gray-600">Support beschikbaar</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600 mb-1">{"<"} 24u</div>
                <div className="text-sm text-gray-600">Gemiddelde response tijd</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600 mb-1">95%</div>
                <div className="text-sm text-gray-600">Tevredenheid score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Kies je support kanaal</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {supportOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <Card key={index} className={`${option.color} border-2 hover:shadow-lg transition-all`}>
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Icon className="w-8 h-8 text-gray-700" />
                      </div>
                      <CardTitle className="text-xl">{option.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                      <p className="text-gray-600">{option.description}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{option.availability}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Response: {option.responseTime}</span>
                        </div>
                      </div>

                      <Button
                        asChild
                        className="w-full mt-4"
                      >
                        <Link href={option.href}>
                          {option.action}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Resources */}
            <div>
              <h3 className="text-2xl font-bold text-center mb-8">Snelle hulpbronnen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickResources.map((resource, index) => {
                  const Icon = resource.icon;
                  return (
                    <Link key={index} href={resource.href}>
                      <Card className={`${resource.color} border-2 hover:shadow-md transition-all cursor-pointer group`}>
                        <CardContent className="p-6 text-center">
                          <Icon className="w-12 h-12 mx-auto mb-4 text-gray-700 group-hover:scale-110 transition-transform" />
                          <h4 className="font-semibold mb-2">{resource.title}</h4>
                          <p className="text-sm text-gray-600">{resource.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Populaire onderwerpen</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {commonTopics.map((category, index) => (
                <Card key={index} className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="border-b border-gray-100 last:border-b-0">
                          <button
                            onClick={() => toggleTopic(topic.id)}
                            className="w-full text-left text-gray-600 hover:text-blue-600 transition-colors flex items-center justify-between py-2 group"
                          >
                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                              <span className="text-sm">{topic.question}</span>
                            </div>
                            {expandedTopic === topic.id ? (
                              <ChevronUp className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          {expandedTopic === topic.id && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-md border-l-4 border-blue-200">
                              <p className="text-sm text-gray-700 leading-relaxed">{topic.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Direct contact opnemen?</h2>
              <p className="text-gray-600">
                Kun je je vraag niet vinden? Neem gerust contact met ons op.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Stuur ons een bericht</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Naam</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Jouw naam"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">E-mail</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="jouw@email.nl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Onderwerp</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Kies een onderwerp...</option>
                      <option>Technische problemen</option>
                      <option>Factureringsvraag</option>
                      <option>Feature verzoek</option>
                      <option>Algemene vraag</option>
                      <option>Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bericht</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Beschrijf je vraag zo gedetailleerd mogelijk..."
                    />
                  </div>

                  <Button className="w-full">
                    Bericht versturen
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="p-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Telefonisch contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Voor urgente zaken kun je ons bellen tijdens kantooruren.
                    </p>
                    <div className="space-y-2">
                      <p className="font-medium">020 - 123 45 67</p>
                      <p className="text-sm text-gray-500">Maandag - Vrijdag: 9:00 - 17:00</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      E-mail support
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Voor niet-urgente vragen en gedetailleerde hulp.
                    </p>
                    <div className="space-y-2">
                      <p className="font-medium">support@datingassistent.nl</p>
                      <p className="text-sm text-gray-500">Response binnen 24 uur</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-6 bg-blue-50 border-blue-200">
                  <CardContent className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <h4 className="font-semibold mb-2">Systeem Status</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Alle systemen werken normaal. Bekijk de live status.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/status">Status bekijken</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}