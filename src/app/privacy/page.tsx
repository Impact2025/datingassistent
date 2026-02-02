import { Metadata } from 'next';
import { Shield, Cookie, Eye, Database, Lock, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description: 'Privacybeleid van DatingAssistent - Hoe wij omgaan met jouw persoonlijke gegevens',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Privacybeleid</h1>
          </div>
          <p className="text-primary-foreground/90">
            Laatste update: {new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-8 space-y-8">
          {/* Introductie */}
          <section>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              DatingAssistent respecteert jouw privacy. Dit privacybeleid legt uit welke gegevens we verzamelen,
              waarom we dat doen, en hoe we jouw gegevens beschermen. We voldoen aan de Algemene Verordening
              Gegevensbescherming (AVG) en de Nederlandse Telecommunicatiewet.
            </p>
          </section>

          {/* Verantwoordelijke */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              Wie is verantwoordelijk?
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>DatingAssistent</strong><br />
                Voor vragen over jouw privacy kun je contact opnemen via:<br />
                E-mail: privacy@datingassistent.nl
              </p>
            </div>
          </section>

          {/* Welke gegevens verzamelen we */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              Welke gegevens verzamelen we?
            </h2>

            <div className="space-y-6">
              {/* Account gegevens */}
              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  1. Account Gegevens
                </h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Naam en e-mailadres (bij registratie)</li>
                  <li>Wachtwoord (versleuteld opgeslagen)</li>
                  <li>Profielfoto's (vrijwillig geüpload)</li>
                  <li>Dating profiel informatie</li>
                  <li>Chat gesprekken met de AI coach</li>
                </ul>
              </div>

              {/* Technische gegevens */}
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  2. Technische Gegevens (alleen met toestemming)
                </h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                    ⚠️ Deze gegevens worden ALLEEN verzameld als je Analytics cookies accepteert
                  </p>
                </div>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>IP-adres (geanonimiseerd)</li>
                  <li>Browser type en versie</li>
                  <li>Besturingssysteem</li>
                  <li>Bezochte pagina's en duur van bezoek</li>
                  <li>Referrer URL (waar je vandaan kwam)</li>
                </ul>
              </div>

              {/* Analytics en tracking */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  3. Analytics en Gedragsgegevens
                </h3>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-3">
                  <p className="text-sm text-red-800 dark:text-red-300 font-bold mb-2">
                    🔴 BELANGRIJK: Sessie-opnames
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Als je Analytics cookies accepteert, gebruiken we Microsoft Clarity dat je scherm,
                    muisbewegingen en clicks opneemt. Deze opnames worden gebruikt om de gebruikerservaring
                    te verbeteren en problemen te identificeren.
                  </p>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Met jouw toestemming gebruiken we de volgende diensten:
                </p>

                <div className="space-y-3">
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Google Analytics 4
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Verzamelt: Paginaweergaven, gebruikersgedrag, conversies<br />
                      Doel: Website prestaties analyseren en verbeteren<br />
                      Privacy: IP-adressen worden geanonimiseerd
                    </p>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Microsoft Clarity
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Verzamelt: Sessie-opnames, heatmaps, scroll depth<br />
                      Doel: Gebruikerservaring optimaliseren<br />
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        ⚠️ Neemt je scherm en muisbewegingen op
                      </span>
                    </p>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Sentry
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Verzamelt: Errors, crashes, performance data<br />
                      Doel: Technische problemen snel oplossen<br />
                      Privacy: Persoonlijke data wordt gefilterd
                    </p>
                  </div>
                </div>
              </div>

              {/* Marketing gegevens */}
              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  4. Marketing Gegevens (alleen met toestemming)
                </h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Lead scoring (hoe geïnteresseerd je bent)</li>
                  <li>Conversie tracking (welke aanbiedingen je ziet)</li>
                  <li>E-mail engagement (open rates, clicks)</li>
                  <li>Onboarding voortgang</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-primary" />
              Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We gebruiken cookies voor verschillende doeleinden. Je kunt je cookie voorkeuren aanpassen
              via de cookie banner of in je browser instellingen.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Type</th>
                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Doel</th>
                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Toestemming</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-medium">Noodzakelijk</td>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Inloggen, beveiliging, thema</td>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                        Altijd actief
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-medium">Analytics</td>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Website verbeteren, sessie-opnames</td>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                        Opt-in vereist
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-medium">Marketing</td>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Gepersonaliseerde aanbiedingen</td>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                        Opt-in vereist
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Beveiliging */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              Hoe beschermen we jouw gegevens?
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>SSL/TLS encryptie voor alle verbindingen</li>
              <li>Wachtwoorden worden gehashed met bcrypt</li>
              <li>Regelmatige security audits</li>
              <li>Beperkte toegang tot persoonlijke data</li>
              <li>Data opslag binnen de EU (GDPR compliant)</li>
            </ul>
          </section>

          {/* Jouw rechten */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Jouw Rechten onder de AVG
            </h2>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Je hebt de volgende rechten:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Inzage</strong> - Je kunt opvragen welke gegevens we van je hebben</li>
                <li><strong>Correctie</strong> - Je kunt onjuiste gegevens laten aanpassen</li>
                <li><strong>Verwijdering</strong> - Je kunt verzoeken om verwijdering ("recht op vergetelheid")</li>
                <li><strong>Beperking</strong> - Je kunt verwerking beperken in bepaalde gevallen</li>
                <li><strong>Overdraagbaarheid</strong> - Je kunt een kopie van je data opvragen</li>
                <li><strong>Bezwaar</strong> - Je kunt bezwaar maken tegen bepaalde verwerkingen</li>
                <li><strong>Intrekking toestemming</strong> - Je kunt cookie toestemming altijd intrekken</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">
                Neem contact op via privacy@datingassistent.nl om van deze rechten gebruik te maken.
              </p>
            </div>
          </section>

          {/* Bewaartermijnen */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Hoe lang bewaren we gegevens?
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Account gegevens: Totdat je je account verwijdert</li>
              <li>Chat gesprekken: 12 maanden na laatste activiteit</li>
              <li>Analytics data: Geanonimiseerd na 14 maanden (Google Analytics)</li>
              <li>Sessie-opnames: Maximaal 30 dagen (Microsoft Clarity)</li>
              <li>Marketing data: Totdat je toestemming intrekt</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Vragen of Klachten?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Heb je vragen over dit privacybeleid of wil je gebruik maken van je rechten?
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>E-mail:</strong> privacy@datingassistent.nl
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
              Je hebt ook het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens (AP)
              als je vindt dat we niet correct omgaan met jouw gegevens.
            </p>
          </section>

          {/* Wijzigingen */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Wijzigingen in dit Privacybeleid
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We kunnen dit privacybeleid van tijd tot tijd aanpassen. Bij grote wijzigingen zullen we
              je hiervan op de hoogte stellen via e-mail of een melding op de website. We raden je aan
              dit privacybeleid regelmatig te controleren.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
