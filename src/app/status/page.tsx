'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Server,
  Smartphone,
  Globe,
  Database
} from 'lucide-react';

export default function StatusPage() {
  const services = [
    {
      name: "Web Applicatie",
      status: "operational",
      uptime: "99.9%",
      icon: Globe,
      description: "Hoofdwebsite en dashboard"
    },
    {
      name: "AI Chat Coach",
      status: "operational",
      uptime: "99.8%",
      icon: Smartphone,
      description: "24/7 AI ondersteuning"
    },
    {
      name: "Database",
      status: "operational",
      uptime: "99.9%",
      icon: Database,
      description: "Gebruikersdata en profielen"
    },
    {
      name: "API Services",
      status: "operational",
      uptime: "99.7%",
      icon: Server,
      description: "Backend API endpoints"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'outage':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'outage':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const incidents = [
    {
      date: "2024-01-15",
      title: "Korte onderhoudsstop",
      status: "resolved",
      description: "Routine onderhoud uitgevoerd tussen 02:00-03:00. Geen impact op gebruikers."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-grow">
        {/* Header */}
        <section className="border-b bg-card/50">
          <div className="container mx-auto px-4 py-8">
            <Button
              variant="ghost"
              asChild
              className="mb-6"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug naar home
              </Link>
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Systeem Status</h1>
                <p className="text-lg text-muted-foreground">
                  Realtime status van al onze diensten en systemen
                </p>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Ververs
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Overall Status */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-green-800">Alle systemen operationeel</h2>
                    <p className="text-green-700">
                      DatingAssistent werkt normaal. Alle diensten zijn beschikbaar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Status */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Dienst Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <Card key={index} className={`border-2 ${getStatusColor(service.status)}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Icon className="w-6 h-6" />
                            <div>
                              <h4 className="font-semibold">{service.name}</h4>
                              <p className="text-sm opacity-75">{service.description}</p>
                            </div>
                          </div>
                          {getStatusIcon(service.status)}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Uptime (30 dagen)</span>
                          <span className="font-medium">{service.uptime}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Response Times */}
            <Card>
              <CardHeader>
                <CardTitle>Response Tijden</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">2-5s</div>
                    <div className="text-sm text-muted-foreground">AI Chat Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">{"<"} 24u</div>
                    <div className="text-sm text-muted-foreground">E-mail Support</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">{"<"} 1u</div>
                    <div className="text-sm text-muted-foreground">Telefoon Support</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Incidents */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Recente Incidenten</h3>
              {incidents.length > 0 ? (
                <div className="space-y-4">
                  {incidents.map((incident, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{incident.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            incident.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {incident.status === 'resolved' ? 'Opgelost' : 'Onderzoek'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                        <p className="text-xs text-muted-foreground">{incident.date}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <h4 className="font-semibold mb-2">Geen recente incidenten</h4>
                    <p className="text-sm text-muted-foreground">
                      Alle systemen draaien stabiel zonder onderbrekingen.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Subscribe to Updates */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Blijf op de hoogte</h3>
                <p className="text-muted-foreground mb-4">
                  Ontvang notificaties bij systeem updates of onderhoud.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <input
                    type="email"
                    placeholder="jouw@email.nl"
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button>Abonneren</Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Hulp nodig?</h3>
                <p className="text-muted-foreground mb-4">
                  Neem contact op met ons support team voor assistentie.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link href="/help">Help Center</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="mailto:support@datingassistent.nl">E-mail Support</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}