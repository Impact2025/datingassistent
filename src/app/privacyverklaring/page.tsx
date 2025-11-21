'use client';

import Head from 'next/head';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

export default function PrivacyPage() {
  const pageTitle = 'Privacyverklaring – DatingAssistent (WeAreImpact)';
  const pageDescription =
    'Lees de privacyverklaring van DatingAssistent (WeAreImpact). Versie 1.1 – geldig vanaf 21 oktober 2025.';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href="https://datingassistent.nl/privacyverklaring" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://datingassistent.nl/privacyverklaring" />
        <meta property="og:image" content="https://datingassistent.nl/og-image-privacy.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://datingassistent.nl/og-image-privacy.png" />
      </Head>

      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />

        <main className="flex-grow">
          <section className="bg-gradient-to-br from-primary/5 to-pink-600/5 py-16 sm:py-20">
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
                  <p>E-mail: <Link href="mailto:info@datingassistent.nl" className="text-primary underline">info@DatingAssistent.nl</Link></p>
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
                  Persoonsgegevens worden niet langer bewaard dan noodzakelijk. Gebruikers kunnen te allen tijde verzoeken hun gegevens te
                  laten verwijderen.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">6. Delen met derden</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  DatingAssistent deelt geen gegevens met derden, behalve als dat nodig is voor technische uitvoering (bijv. hosting) of
                  wettelijk verplicht is. Met deze partijen zijn verwerkersovereenkomsten afgesloten.
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
                  Verzoeken kunnen worden gericht aan <Link href="mailto:info@datingassistent.nl" className="text-primary underline">info@DatingAssistent.nl</Link>. DatingAssistent reageert binnen 30 dagen.
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
                <p>E-mail: <Link href="mailto:info@datingassistent.nl" className="text-primary underline">info@DatingAssistent.nl</Link> &mdash; Tel: <Link href="tel:+31614470977" className="text-primary underline">06 14470977</Link></p>
              </div>
            </div>
          </section>
        </main>

        <PublicFooter />
      </div>
    </>
  );
}
