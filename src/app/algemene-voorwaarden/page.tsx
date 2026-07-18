import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden',
  description: 'Lees de algemene voorwaarden van DatingAssistent (WeAreImpact). Versie 1.1 – geldig vanaf 21 oktober 2025.',
  alternates: { canonical: 'https://www.datingassistent.nl/algemene-voorwaarden' },
  openGraph: {
    title: 'Algemene Voorwaarden',
    description: 'Lees de algemene voorwaarden van DatingAssistent (WeAreImpact). Versie 1.1 – geldig vanaf 21 oktober 2025.',
    type: 'website',
    url: 'https://www.datingassistent.nl/algemene-voorwaarden',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    siteName: 'DatingAssistent',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Algemene Voorwaarden',
    description: 'Lees de algemene voorwaarden van DatingAssistent (WeAreImpact). Versie 1.1 – geldig vanaf 21 oktober 2025.',
    images: ['/og-image.png'],
  },
};

export default function TermsPage() {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />

        <main className="flex-grow">
          <section className="bg-gradient-to-br from-primary/5 to-coral-600/5 py-16 sm:py-20">
            <div className="container mx-auto px-4 sm:px-6 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                ALGEMENE VOORWAARDEN – DatingAssistent (WeAreImpact)
              </h1>
              <p className="mt-4 text-sm sm:text-base text-foreground/80">
                Versie: 1.1 &middot; Datum: 21 oktober 2025
              </p>
            </div>
          </section>

          <section className="py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-10 text-left">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">1. Definities</h2>
                <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
                  In deze Algemene Voorwaarden wordt verstaan onder:
                </p>
                <ul className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-disc pl-6">
                  <li>
                    <strong>DatingAssistent</strong>: de handelsnaam van WeAreImpact, gevestigd aan Heintje Hoeksteeg 11a,
                    1012 GR Amsterdam, ingeschreven bij de Kamer van Koophandel onder nummer 70285888.
                  </li>
                  <li>
                    <strong>Gebruiker</strong>: iedere natuurlijke persoon die gebruikmaakt van de diensten van DatingAssistent.
                  </li>
                  <li>
                    <strong>Diensten</strong>: alle digitale coaching- en ondersteuningsdiensten die door DatingAssistent worden
                    aangeboden, waaronder profielhulp, matchadvies, gesprekscoaching, dateplanning en zelfvertrouwenstraining.
                  </li>
                  <li>
                    <strong>Website</strong>: <Link href="https://www.datingassistent.nl" className="text-primary underline">www.DatingAssistent.nl</Link>.
                  </li>
                  <li>
                    <strong>Overeenkomst</strong>: iedere afspraak tussen DatingAssistent en de Gebruiker met betrekking tot de Diensten.
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">2. Toepasselijkheid</h2>
                <ol className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-decimal pl-6">
                  <li>
                    Deze Algemene Voorwaarden zijn van toepassing op alle aanbiedingen, overeenkomsten, diensten en producten van
                    DatingAssistent, tenzij schriftelijk anders overeengekomen.
                  </li>
                  <li>
                    Door gebruik te maken van de diensten van DatingAssistent verklaart de Gebruiker zich akkoord met deze voorwaarden.
                  </li>
                  <li>
                    Afwijkingen zijn alleen geldig als deze schriftelijk zijn bevestigd door DatingAssistent.
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">3. Diensten</h2>
                <ol className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-decimal pl-6">
                  <li>
                    DatingAssistent biedt digitale coaching en ondersteuning bij daten via AI-technologie, eventueel gecombineerd met
                    menselijke begeleiding.
                  </li>
                  <li>De Diensten zijn bedoeld als hulpmiddel en bieden geen garantie op succes in de liefde of relaties.</li>
                  <li>
                    DatingAssistent kan de inhoud, vorm of beschikbaarheid van de Diensten wijzigen, verbeteren of beëindigen zonder
                    voorafgaande kennisgeving.
                  </li>
                  <li>
                    De Gebruiker is zelf verantwoordelijk voor het juiste gebruik van de Diensten en de eigen keuzes binnen het
                    datingproces.
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">4. Gebruik door de Gebruiker</h2>
                <ol className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-decimal pl-6">
                  <li>De Gebruiker dient juiste, actuele en volledige informatie te verstrekken.</li>
                  <li>
                    Het is niet toegestaan om via DatingAssistent onjuiste, beledigende, discriminerende of ongepaste informatie te delen.
                  </li>
                  <li>
                    De Gebruiker blijft verantwoordelijk voor de inhoud van ingevoerde teksten, spraakopnames en berichten.
                  </li>
                  <li>
                    DatingAssistent mag accounts blokkeren of content verwijderen bij misbruik of overtreding van deze voorwaarden.
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">5. Intellectueel eigendom</h2>
                <ol className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-decimal pl-6">
                  <li>
                    Alle intellectuele eigendomsrechten met betrekking tot de Diensten, software, teksten, ontwerpen, logo’s en overige
                    materialen berusten bij DatingAssistent of haar licentiegevers.
                  </li>
                  <li>
                    Zonder schriftelijke toestemming van DatingAssistent mag niets worden gekopieerd, gewijzigd, verspreid of commercieel
                    gebruikt.
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">6. Aansprakelijkheid</h2>
                <ol className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-decimal pl-6">
                  <li>
                    DatingAssistent is niet aansprakelijk voor schade die voortvloeit uit het gebruik van haar Diensten, tenzij sprake is
                    van opzet of grove nalatigheid.
                  </li>
                  <li>
                    De aansprakelijkheid van DatingAssistent is beperkt tot het bedrag dat door de aansprakelijkheidsverzekering wordt
                    uitgekeerd, vermeerderd met het eigen risico.
                  </li>
                  <li>
                    DatingAssistent is niet verantwoordelijk voor gebeurtenissen of afspraken die voortkomen uit contacten die via haar
                    Diensten tot stand zijn gekomen.
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">7. Betaling</h2>
                <ol className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-decimal pl-6">
                  <li>Indien voor bepaalde Diensten kosten gelden, worden deze duidelijk vermeld op de Website.</li>
                  <li>Betaling geschiedt op de wijze zoals aangegeven door DatingAssistent.</li>
                  <li>Bij niet-tijdige betaling mag DatingAssistent de dienstverlening opschorten.</li>
                  <li>Abonnementen worden automatisch verlengd voor dezelfde periode tenzij de Gebruiker het abonnement uiterlijk 24 uur voor de verlengingsdatum opzegt via de accountinstellingen of via <Link href="mailto:info@datingassistent.nl" className="text-primary underline">info@datingassistent.nl</Link>.</li>
                  <li>DatingAssistent behoudt zich het recht voor de prijzen te wijzigen. Bij prijswijzigingen worden abonnees minimaal 30 dagen van tevoren per e-mail geïnformeerd.</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">7a. Herroepingsrecht (consumenten)</h2>
                <ol className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-decimal pl-6">
                  <li>Consumenten hebben het recht een overeenkomst op afstand zonder opgave van redenen te ontbinden binnen <strong>14 kalenderdagen</strong> na het sluiten van de overeenkomst (art. 6:230o BW).</li>
                  <li>
                    <strong>Afstand van herroepingsrecht:</strong> Door bij het afronden van de betaling expliciet toestemming te geven voor onmiddellijke levering van digitale diensten, erkent de Gebruiker dat het herroepingsrecht vervalt zodra de dienst volledig is geleverd of de toegang is verstrekt.
                  </li>
                  <li>Om gebruik te maken van het herroepingsrecht kan de Gebruiker binnen de 14-daagse termijn contact opnemen via <Link href="mailto:info@datingassistent.nl" className="text-primary underline">info@datingassistent.nl</Link> met vermelding van naam, e-mailadres en ordernummer.</li>
                  <li>Bij gebruikmaking van het herroepingsrecht vergoedt DatingAssistent het betaalde bedrag binnen 14 dagen via de oorspronkelijke betaalmethode.</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">7b. Proefperiode</h2>
                <ol className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-decimal pl-6">
                  <li>DatingAssistent kan een gratis proefperiode aanbieden. De duur en voorwaarden van de proefperiode worden vermeld bij het aanbod.</li>
                  <li>Na afloop van de proefperiode wordt de Gebruiker <strong>niet automatisch</strong> omgezet naar een betaald abonnement tenzij dit expliciet is overeengekomen en de Gebruiker daarvoor zijn betaalgegevens heeft opgegeven.</li>
                  <li>De Gebruiker ontvangt een herinnering per e-mail voordat de proefperiode afloopt.</li>
                  <li>Annuleren tijdens de proefperiode kan op elk moment via de accountinstellingen of via <Link href="mailto:info@datingassistent.nl" className="text-primary underline">info@datingassistent.nl</Link>.</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">8. Beëindiging</h2>
                <ol className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-decimal pl-6">
                  <li>De Gebruiker kan de dienstverlening op elk moment beëindigen.</li>
                  <li>DatingAssistent kan de toegang beëindigen bij misbruik, overtreding of zwaarwegende redenen.</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">9. Toepasselijk recht en geschillen</h2>
                <ol className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/80 list-decimal pl-6">
                  <li>Op alle overeenkomsten is Nederlands recht van toepassing.</li>
                  <li>Geschillen worden voorgelegd aan de bevoegde rechter te Amsterdam, tenzij dwingendrechtelijk anders bepaald.</li>
                </ol>
              </div>

              <div className="space-y-2 text-sm sm:text-base leading-relaxed text-foreground/80">
                <p><strong>DatingAssistent (WeAreImpact)</strong></p>
                <p>Heintje Hoeksteeg 11a, 1012 GR Amsterdam</p>
                <p>KVK: 70285888 &mdash; BTW: NL858236369B01</p>
                <p>
                  E-mail: <Link href="mailto:info@datingassistent.nl" className="text-primary underline">info@datingassistent.nl</Link> &mdash; Tel: <Link href="tel:+31614470977" className="text-primary underline">06 14470977</Link>
                </p>
                <p>
                  Website: <Link href="https://www.datingassistent.nl" className="text-primary underline">www.DatingAssistent.nl</Link>
                </p>
              </div>
            </div>
          </section>
        </main>

        <PublicFooter />
      </div>
    </>
  );
}
