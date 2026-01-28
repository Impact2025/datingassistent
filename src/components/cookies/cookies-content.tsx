'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Cookie,
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  Mail,
  Phone
} from 'lucide-react';

export default function CookiesContent() {
  const cookieTypes = [
    {
      type: "Essentiële Cookies",
      description: "Deze cookies zijn noodzakelijk voor de juiste werking van onze website.",
      purpose: "Technische functionaliteit, beveiliging, en basisnavigatie",
      examples: ["Sessiebeheer", "CSRF bescherming", "Load balancing"],
      duration: "Sessie of maximaal 1 jaar",
      required: true
    },
    {
      type: "Analytische Cookies",
      description: "Deze cookies helpen ons te begrijpen hoe bezoekers onze website gebruiken.",
      purpose: "Website analyse, gebruikersgedrag, prestatie monitoring",
      examples: ["Google Analytics", "Hotjar", "Custom analytics"],
      duration: "Maximaal 2 jaar",
      required: false
    },
    {
      type: "Functionele Cookies",
      description: "Deze cookies onthouden uw voorkeuren en instellingen.",
      purpose: "Gebruikerservaring verbeteren, taalvoorkeuren, thema instellingen",
      examples: ["Taal selectie", "Cookie voorkeuren", "Formulier data"],
      duration: "Maximaal 1 jaar",
      required: false
    },
    {
      type: "Marketing Cookies",
      description: "Deze cookies worden gebruikt om relevante advertenties te tonen.",
      purpose: "Gepersonaliseerde advertenties, retargeting, conversie tracking",
      examples: ["Facebook Pixel", "Google Ads", "LinkedIn Insight"],
      duration: "Maximaal 2 jaar",
      required: false
    }
  ];

  const specificCookies = [
    {
      name: "datespark_auth_token",
      purpose: "Houdt gebruikers ingelogd tijdens hun sessie",
      type: "Essentieel",
      duration: "30 dagen"
    },
    {
      name: "datespark_theme",
      purpose: "Onthoudt de gekozen weergave modus (licht/donker)",
      type: "Functioneel",
      duration: "1 jaar"
    },
    {
      name: "_ga",
      purpose: "Google Analytics - website bezoek analyse",
      type: "Analytisch",
      duration: "2 jaar"
    },
    {
      name: "_gid",
      purpose: "Google Analytics - sessie identificatie",
      type: "Analytisch",
      duration: "24 uur"
    },
    {
      name: "datespark_saved_profiles",
      purpose: "Bewaard gebruikersprofielen voor latere referentie",
      type: "Functioneel",
      duration: "6 maanden"
    }
  ];

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-coral-50 via-coral-25 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-coral-100 to-coral-200 dark:from-coral-900/50 dark:to-coral-800/50 text-coral-700 dark:text-coral-300 text-sm font-medium mb-6 border border-coral-200 dark:border-coral-700">
              <Cookie className="w-4 h-4 mr-2" />
              Cookiebeleid
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Cookies & Privacy
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Transparante informatie over hoe wij cookies gebruiken om uw ervaring te verbeteren
              en te voldoen aan de privacywetgeving.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700">
                <Settings className="mr-2 w-5 h-5" />
                Cookie Voorkeuren
              </Button>
              <Button variant="outline" size="lg" className="px-8 border-coral-200 text-coral-700 hover:bg-coral-50">
                <Shield className="mr-2 w-5 h-5" />
                Privacyverklaring
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What are Cookies */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 dark:text-white">Wat zijn cookies?</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Cookies zijn kleine tekstbestanden die op uw apparaat worden opgeslagen wanneer u onze website bezoekt.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="dark:bg-gray-800">
                <CardContent className="p-6">
                  <Info className="w-12 h-12 text-coral-600 mb-4" />
                  <h3 className="font-semibold mb-3 dark:text-white">Hoe werken cookies?</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    Cookies bevatten informatie over uw browsegedrag en voorkeuren. Ze helpen ons om:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Uw ervaring te personaliseren
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      De website sneller te laten werken
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Uw veiligheid te waarborgen
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Gebruikspatronen te analyseren
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800">
                <CardContent className="p-6">
                  <AlertTriangle className="w-12 h-12 text-purple-600 mb-4" />
                  <h3 className="font-semibold mb-3 dark:text-white">Belangrijke informatie</h3>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <p>
                      <strong>Geen persoonlijke data:</strong> Cookies bevatten geen persoonlijke informatie
                      zoals uw naam, e-mailadres of telefoonnummer.
                    </p>
                    <p>
                      <strong>GDPR compliant:</strong> Wij respecteren de Europese privacywetgeving
                      en uw cookievoorkeuren.
                    </p>
                    <p>
                      <strong>Veilig gebruik:</strong> Alle cookies worden veilig opgeslagen
                      en kunnen niet door derden worden gelezen.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Cookie Types */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 dark:text-white">Soorten Cookies</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Wij gebruiken verschillende soorten cookies, elk met een specifieke functie.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cookieTypes.map((cookie, index) => (
                <Card key={index} className="h-full dark:bg-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between dark:text-white">
                      <span className="text-lg">{cookie.type}</span>
                      {cookie.required && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                          Vereist
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{cookie.description}</p>

                    <div>
                      <h4 className="font-medium text-sm mb-2 dark:text-white">Doel:</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{cookie.purpose}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2 dark:text-white">Voorbeelden:</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {cookie.examples.map((example, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t dark:border-gray-600">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Duur:</span>
                        <span className="font-medium dark:text-white">{cookie.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Specific Cookies */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 dark:text-white">Specifieke Cookies</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Hieronder vindt u een overzicht van de specifieke cookies die wij gebruiken.
              </p>
            </div>

            <Card className="dark:bg-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Cookie Naam
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Doel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Duur
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {specificCookies.map((cookie, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                              {cookie.name}
                            </code>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                            {cookie.purpose}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              cookie.type === 'Essentieel'
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                                : cookie.type === 'Analytisch'
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                                : cookie.type === 'Functioneel'
                                ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300'
                                : 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300'
                            }`}>
                              {cookie.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {cookie.duration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cookie Management */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 dark:text-white">Cookie Voorkeuren Beheren</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                U heeft altijd de controle over welke cookies wij mogen gebruiken.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="dark:bg-gray-700">
                <CardContent className="p-6">
                  <Settings className="w-12 h-12 text-coral-600 mb-4" />
                  <h3 className="font-semibold mb-3 dark:text-white">Cookie Instellingen</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Pas uw cookievoorkeuren aan via onze cookie banner of instellingenpagina.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 w-4 h-4" />
                    Voorkeuren Aanpassen
                  </Button>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-700">
                <CardContent className="p-6">
                  <ExternalLink className="w-12 h-12 text-purple-600 mb-4" />
                  <h3 className="font-semibold mb-3 dark:text-white">Browser Instellingen</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Beheer cookies via uw browser instellingen. Let op: dit kan de website functionaliteit beinvloeden.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p><strong>Chrome:</strong> Instellingen - Privacy - Cookies</p>
                    <p><strong>Firefox:</strong> Voorkeuren - Privacy - Cookies</p>
                    <p><strong>Safari:</strong> Voorkeuren - Privacy - Cookies beheren</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Information */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 dark:text-white">Juridische Informatie</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Informatie over uw rechten en onze verantwoordelijkheden.
              </p>
            </div>

            <div className="space-y-8">
              <Card className="dark:bg-gray-800">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 dark:text-white">Uw Rechten</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2 dark:text-white">Recht op informatie</h4>
                      <p className="text-gray-600 dark:text-gray-300">U heeft recht om te weten welke persoonsgegevens wij verwerken.</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 dark:text-white">Recht op rectificatie</h4>
                      <p className="text-gray-600 dark:text-gray-300">U kunt verzoeken om incorrecte gegevens te corrigeren.</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 dark:text-white">Recht op verwijdering</h4>
                      <p className="text-gray-600 dark:text-gray-300">U kunt verzoeken om uw gegevens te verwijderen.</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 dark:text-white">Recht op bezwaar</h4>
                      <p className="text-gray-600 dark:text-gray-300">U kunt bezwaar maken tegen bepaalde verwerkingen.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 dark:text-white">Contact voor Privacy Vragen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-coral-600 mt-1" />
                      <div>
                        <p className="font-medium dark:text-white">E-mail</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">privacy@datingassistent.nl</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium dark:text-white">Telefoon</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">020 - 123 45 67</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-gradient-to-r from-coral-50 to-coral-100 dark:from-coral-900/30 dark:to-coral-800/30 rounded-lg border border-coral-100 dark:border-coral-800">
                    <p className="text-sm text-coral-800 dark:text-coral-200">
                      <strong>Functionaris Gegevensbescherming:</strong> Voor complexe privacy vragen kunt u contact opnemen met onze Functionaris Gegevensbescherming via bovenstaande contactgegevens.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 dark:text-white">Laatste Bijwerking</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Dit cookiebeleid is voor het laatst bijgewerkt op: <strong>18 november 2025</strong>
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                    Wij controleren regelmatig of ons beleid nog up-to-date is met de laatste wetgeving en technologieen.
                    Bij belangrijke wijzigingen zullen wij u hierover informeren.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-coral-500 via-purple-600 to-coral-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Vragen over Cookies?</h2>
            <p className="text-xl mb-8 opacity-90">
              Neem contact met ons op als u vragen heeft over ons cookiebeleid of uw privacy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="px-8 bg-white text-coral-600 hover:bg-gray-50">
                  <Mail className="mr-2 w-5 h-5" />
                  Contact Opnemen
                </Button>
              </Link>
              <Link href="/privacyverklaring">
                <Button size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white hover:text-coral-600">
                  <Shield className="mr-2 w-5 h-5" />
                  Privacyverklaring
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}