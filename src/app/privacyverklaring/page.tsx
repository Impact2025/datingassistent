import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

export const metadata: Metadata = {
  title: 'Privacyverklaring – DatingAssistent (WeAreImpact)',
  description: 'Lees de privacyverklaring van DatingAssistent (WeAreImpact). Versie 1.1 – geldig vanaf 21 oktober 2025.',
  alternates: { canonical: 'https://datingassistent.nl/privacyverklaring' },
  openGraph: {
    title: 'Privacyverklaring – DatingAssistent (WeAreImpact)',
    description: 'Lees de privacyverklaring van DatingAssistent (WeAreImpact). Versie 1.1 – geldig vanaf 21 oktober 2025.',
    type: 'website',
    url: 'https://datingassistent.nl/privacyverklaring',
    images: [{ url: '/og-image-privacy.png', width: 1200, height: 630 }],
    siteName: 'DatingAssistent',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacyverklaring – DatingAssistent (WeAreImpact)',
    description: 'Lees de privacyverklaring van DatingAssistent (WeAreImpact). Versie 1.1 – geldig vanaf 21 oktober 2025.',
    images: ['/og-image-privacy.png'],
  },
};

export default function PrivacyPage() {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />

        <main className="flex-grow">
          <section className="bg-gradient-to-br from-primary/5 to-coral-600/5 py-16 sm:py-20">
            <div className="container mx-auto px-4 sm:px-6 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                PRIVACYVERKLARING – DatingAssistent (WeAreImpact)
              </h1>
              <p className="mt-4 text-sm sm:text-base text-foreground/80">
                Versie: 1.1 &middot; Datum: 21 oktober 2025
              </p>
            </div>
          </section>

          <section className="py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-10 text-left">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">1. Verantwoordelijke</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  DatingAssistent is verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in deze verklaring.
                </p>
                <div className="space-y-1 text-sm sm:text-base leading-relaxed text-foreground/80">
                  <p><strong>DatingAssistent</strong> (onderdeel van WeAreImpact)</p>
                  <p>Adres: Heintje Hoeksteeg 11a, 1012 GR Amsterdam</p>
                  <p>KVK: 70285888</p>
                  <p>BTW: NL858236369B01</p>
                  <p>E-mail: <Link href="mailto:info@datingassistent.nl" className="text-primary underline">info@datingassistent.nl</Link></p>
                  <p>Telefoon: <Link href="tel:+31614470977" className="text-primary underline">06 14470977</Link></p>
                  <p>Website: <Link href="https://www.datingassistent.nl" className="text-primary underline">www.DatingAssistent.nl</Link></p>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">2. Persoonsgegevens die wij verwerken</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  DatingAssistent verwerkt persoonsgegevens die de Gebruiker zelf verstrekt, waaronder:
                </p>
                <ul className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-disc pl-6">
                  <li>Naam, e-mailadres en telefoonnummer;</li>
                  <li>Ingevoerde profielinformatie en antwoorden;</li>
                  <li>Spraakopnames of tekstinvoer via de app;</li>
                  <li>Gebruiks- en interactiegegevens.</li>
                </ul>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  Er worden geen persoonsgegevens gedeeld met derden, tenzij dit wettelijk verplicht is.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">3. Doeleinden</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  DatingAssistent verwerkt persoonsgegevens voor:
                </p>
                <ul className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-disc pl-6">
                  <li>Het aanbieden van gepersonaliseerde datingcoaching;</li>
                  <li>Het verbeteren van de kwaliteit en veiligheid van de diensten;</li>
                  <li>Het opslaan van gesprekken en profielteksten voor gebruiksgemak;</li>
                  <li>Het analyseren van geanonimiseerde data voor verbetering van de dienstverlening.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">4. Grondslagen</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  De verwerking is gebaseerd op:
                </p>
                <ul className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-disc pl-6">
                  <li>Toestemming van de gebruiker;</li>
                  <li>Uitvoering van een overeenkomst;</li>
                  <li>Gerechtvaardigd belang (dienstverbetering en beveiliging).</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">5. Bewaartermijnen</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  Persoonsgegevens worden niet langer bewaard dan noodzakelijk voor het doel waarvoor zij zijn verzameld (Art. 5 lid 1 sub e AVG). Onderstaande termijnen worden automatisch gehandhaafd via nachtelijke opschoningsprocessen.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="border border-border px-3 py-2 text-left font-semibold">Datacategorie</th>
                        <th className="border border-border px-3 py-2 text-left font-semibold">Bewaartermijn</th>
                        <th className="border border-border px-3 py-2 text-left font-semibold">Grondslag</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground/80">
                      <tr>
                        <td className="border border-border px-3 py-2">Account- en profielgegevens</td>
                        <td className="border border-border px-3 py-2">Tot verwijdering door gebruiker</td>
                        <td className="border border-border px-3 py-2">Contractuitvoering</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2">AI coach-gesprekken</td>
                        <td className="border border-border px-3 py-2">12 maanden na gesprek</td>
                        <td className="border border-border px-3 py-2">Art. 5(1)(e) AVG — dataminimalisatie</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2">Activiteitslog</td>
                        <td className="border border-border px-3 py-2">24 maanden</td>
                        <td className="border border-border px-3 py-2">Gerechtvaardigd belang (beveiliging)</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2">Betaal- en ordergegevens</td>
                        <td className="border border-border px-3 py-2">7 jaar</td>
                        <td className="border border-border px-3 py-2">Fiscale bewaarplicht (art. 52 AWR)</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2">Verwijderd account (geanonimiseerd)</td>
                        <td className="border border-border px-3 py-2">30 dagen cooling-off, daarna permanent</td>
                        <td className="border border-border px-3 py-2">Art. 17 AVG — recht op vergetelheid</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2">Analytics (Google Analytics)</td>
                        <td className="border border-border px-3 py-2">Geanonimiseerd na 14 maanden</td>
                        <td className="border border-border px-3 py-2">Toestemming (cookie consent)</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2">Sessie-opnames (Microsoft Clarity)</td>
                        <td className="border border-border px-3 py-2">Maximaal 30 dagen</td>
                        <td className="border border-border px-3 py-2">Toestemming — niet actief op gevoelige pagina&apos;s</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">5a. AI-modellen en gegevensverwerking</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  DatingAssistent maakt gebruik van AI-taalmodellen voor gepersonaliseerde coaching. Vóór verzending naar externe AI-diensten worden alle directe persoonsidentificatoren verwijderd of gegeneraliseerd (pseudonimisering).
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="border border-border px-3 py-2 text-left font-semibold">Model / aanbieder</th>
                        <th className="border border-border px-3 py-2 text-left font-semibold">Toegang via</th>
                        <th className="border border-border px-3 py-2 text-left font-semibold">Data die wordt gedeeld</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground/80">
                      <tr>
                        <td className="border border-border px-3 py-2 font-medium">Claude (Anthropic)</td>
                        <td className="border border-border px-3 py-2">OpenRouter</td>
                        <td className="border border-border px-3 py-2">Gepseudonimiseerde chatberichten, leeftijdsrange, geanonimiseerde profielcontext</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ul className="list-disc pl-6 space-y-1 text-sm text-foreground/80">
                  <li><strong>Pseudonimisering:</strong> naam, exacte leeftijd en locatie worden vervangen door categorieën vóór verzending.</li>
                  <li><strong>Geen AI-training:</strong> conform onze DPA met OpenRouter/Anthropic worden jouw gegevens niet gebruikt voor het trainen van AI-modellen.</li>
                  <li><strong>Geen user-ID doorgifte:</strong> het is voor de AI-aanbieder niet mogelijk jou te identificeren op basis van de verzonden data.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">6. Subverwerkers en doorgifte aan derden</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  Voor de uitvoering van onze diensten maken wij gebruik van de volgende verwerkers. Met elk van deze partijen is een verwerkersovereenkomst (DPA) afgesloten, inclusief de door de Europese Commissie goedgekeurde Standaard Contractuele Bepalingen (SCC) voor doorgiften buiten de EU.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="border border-border px-3 py-2 text-left font-semibold">Verwerker</th>
                        <th className="border border-border px-3 py-2 text-left font-semibold">Doel</th>
                        <th className="border border-border px-3 py-2 text-left font-semibold">Locatie</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground/80">
                      <tr>
                        <td className="border border-border px-3 py-2 font-medium">Neon (PostgreSQL)</td>
                        <td className="border border-border px-3 py-2">Database / opslag persoonsgegevens</td>
                        <td className="border border-border px-3 py-2">EU (Dublin)</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2 font-medium">Vercel</td>
                        <td className="border border-border px-3 py-2">Hosting en deployment</td>
                        <td className="border border-border px-3 py-2">EU / VS (SCC)</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2 font-medium">OpenRouter</td>
                        <td className="border border-border px-3 py-2">AI-coaching (gepseudonimiseerde data)</td>
                        <td className="border border-border px-3 py-2">VS (SCC)</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2 font-medium">Resend</td>
                        <td className="border border-border px-3 py-2">E-mailverzending (naam + e-mailadres)</td>
                        <td className="border border-border px-3 py-2">VS (SCC)</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2 font-medium">Stripe</td>
                        <td className="border border-border px-3 py-2">Betalingsverwerking</td>
                        <td className="border border-border px-3 py-2">VS (SCC)</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2 font-medium">Google Analytics</td>
                        <td className="border border-border px-3 py-2">Website-analyse (alleen met toestemming)</td>
                        <td className="border border-border px-3 py-2">VS (SCC)</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2 font-medium">Microsoft Clarity</td>
                        <td className="border border-border px-3 py-2">Sessie-opnames (alleen met toestemming)</td>
                        <td className="border border-border px-3 py-2">VS (SCC)</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-2 font-medium">Sentry</td>
                        <td className="border border-border px-3 py-2">Foutopsporing (alleen met toestemming)</td>
                        <td className="border border-border px-3 py-2">VS (SCC)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  Gegevens worden uitsluitend gedeeld voor de omschreven doeleinden en nooit verkocht aan derden. De AI-coaching diensten ontvangen gepseudonimiseerde data — naam, exacte leeftijd en locatie worden vóór verzending vervangen door algemene categorieën.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">7. Beveiliging</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  DatingAssistent neemt passende technische en organisatorische maatregelen om persoonsgegevens te beschermen tegen misbruik,
                  verlies of ongeautoriseerde toegang.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">8. Rechten van de Gebruiker</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  Gebruikers hebben recht op:
                </p>
                <ul className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-disc pl-6">
                  <li>Inzage, correctie of verwijdering van persoonsgegevens;</li>
                  <li>Intrekking van toestemming;</li>
                  <li>Bezwaar tegen verwerking;</li>
                  <li>Gegevensoverdraagbaarheid.</li>
                </ul>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  Verzoeken kunnen worden gericht aan <Link href="mailto:info@datingassistent.nl" className="text-primary underline">info@datingassistent.nl</Link>. DatingAssistent reageert binnen 30 dagen.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">9. Cookies</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  DatingAssistent gebruikt alleen functionele en analytische cookies, zoals beschreven in de Cookieverklaring op de website.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">10. Minderjarigen</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  De diensten van DatingAssistent zijn bedoeld voor personen van 18 jaar en ouder. Wij verwerken geen persoonsgegevens van
                  minderjarigen zonder ouderlijke toestemming.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">11. Wijzigingen</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  DatingAssistent behoudt zich het recht voor om deze privacyverklaring te wijzigen. De meest recente versie staat altijd op de
                  website.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">12. Toezichthouder</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  Bij klachten kunt u zich wenden tot de Autoriteit Persoonsgegevens via{' '}
                  <Link href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    www.autoriteitpersoonsgegevens.nl
                  </Link>.
                </p>
              </div>

              <div className="space-y-2 text-sm sm:text-base leading-relaxed text-foreground/80">
                <p><strong>Contact:</strong></p>
                <p>DatingAssistent (WeAreImpact)</p>
                <p>Heintje Hoeksteeg 11a, 1012 GR Amsterdam</p>
                <p>E-mail: <Link href="mailto:info@datingassistent.nl" className="text-primary underline">info@datingassistent.nl</Link> &mdash; Tel: <Link href="tel:+31614470977" className="text-primary underline">06 14470977</Link></p>
              </div>
            </div>
          </section>
        </main>

        <PublicFooter />
      </div>
    </>
  );
}
