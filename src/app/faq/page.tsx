'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ChevronDown, Mail } from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

const faqs = [
  // Algemene vragen
  {
    question: "Wat is DatingAssistent precies?",
    answer: "DatingAssistent is een professionele AI-gedreven dating coach die je helpt bij elk aspect van online daten. We combineren geavanceerde kunstmatige intelligentie met 10+ jaar expertise in dating coaching. Van profieloptimalisatie tot date planning - wij begeleiden je stap voor stap naar meer succes in de liefde."
  },
  {
    question: "Voor wie is DatingAssistent geschikt?",
    answer: "DatingAssistent is geschikt voor iedereen van 18+ die serieus wil daten. Of je nu beginner bent, al langer online date zonder succes, single ouders, mensen met een beperking, of professionals die weinig tijd hebben - onze tools passen zich aan aan jouw unieke situatie en behoeften."
  },
  {
    question: "Hoe werkt de AI-technologie van DatingAssistent?",
    answer: "Onze AI analyseert miljoenen datapunten van succesvolle dates en combineert dit met bewezen dating psychologie. De AI leert van jouw gedrag, geeft gepersonaliseerde adviezen, en past zich continu aan om steeds betere resultaten te leveren."
  },

  // Prijzen en abonnementen
  {
    question: "Wat zijn de kosten van DatingAssistent?",
    answer: "We bieden flexibele abonnementen: Core (€29/maand), Pro (€49/maand), Premium AI (€99/maand) en Premium Plus (€2490 eenmalig). Alle abonnementen zijn maandelijks opzegbaar. Jaarlijks betalen bespaart tot 17%. Gratis proefperiode van 7 dagen beschikbaar."
  },
  {
    question: "Kan ik mijn abonnement opzeggen wanneer ik wil?",
    answer: "Absoluut. Alle abonnementen zijn maandelijks opzegbaar zonder opzegtermijn of extra kosten. Je behoudt toegang tot al je data en voortgang tot het einde van de betaalde periode. Geen verplichtingen, geen gedoe."
  },
  {
    question: "Welke betaalmethodes accepteren jullie?",
    answer: "We accepteren alle gangbare betaalmethodes: iDEAL, creditcard (Visa, Mastercard, American Express), PayPal, en bankoverschrijving. Alle betalingen zijn SSL-versleuteld en voldoen aan PCI DSS security standaarden."
  },
  {
    question: "Bieden jullie kortingen of coupon codes aan?",
    answer: "Ja, we bieden regelmatig kortingen aan voor nieuwe gebruikers, studenten, en bij jaarlijkse abonnementen. Coupon codes zijn beschikbaar via onze nieuwsbrief, social media, en partner websites. Neem contact op voor actuele aanbiedingen."
  },

  // Privacy en veiligheid
  {
    question: "Hoe beschermen jullie mijn privacy?",
    answer: "Privacy is onze hoogste prioriteit. Alle data is end-to-end versleuteld, opgeslagen in Nederlandse datacenters die voldoen aan GDPR. We delen nooit persoonlijke informatie met derden. Je hebt volledige controle over je data via ons privacy dashboard."
  },
  {
    question: "Wat gebeurt er met mijn data als ik stop?",
    answer: "Bij opzegging kun je kiezen om je account te deactiveren (tijdelijk pauze) of volledig te verwijderen. Bij verwijdering wordt al je data permanent gewist binnen 30 dagen, conform GDPR 'right to be forgotten'."
  },
  {
    question: "Zijn mijn berichten en profielinformatie veilig?",
    answer: "Ja, alle communicatie tussen jou en onze AI is versleuteld. We slaan geen persoonlijke berichten op langer dan noodzakelijk voor service verbetering. Je profielinformatie wordt alleen gebruikt om betere adviezen te geven."
  },

  // Technische vragen
  {
    question: "Op welke apparaten werkt DatingAssistent?",
    answer: "DatingAssistent werkt op alle moderne apparaten: desktop computers, laptops, tablets en smartphones. We ondersteunen alle populaire browsers (Chrome, Firefox, Safari, Edge) en hebben native apps voor iOS en Android."
  },
  {
    question: "Werkt het offline?",
    answer: "Basisfunctionaliteit werkt offline voor opgeslagen content. Voor AI-features en nieuwe analyses is internetverbinding vereist. We raden minimaal 4G verbinding aan voor optimale prestaties."
  },
  {
    question: "Hoe snel reageert de AI?",
    answer: "Onze AI reageert typisch binnen 2-5 seconden op vragen. Complexe analyses kunnen tot 30 seconden duren. Tijdens piekuren kan het iets langer zijn, maar we streven altijd naar sub-10 seconden response tijden."
  },

  // Functionaliteit en features
  {
    question: "Met welke dating apps werkt DatingAssistent?",
    answer: "DatingAssistent werkt met alle populaire dating platforms: Tinder, Bumble, Hinge, Happn, Badoo, OkCupid, Match, eHarmony, en meer. Onze adviezen zijn universeel toepasbaar en platform-onafhankelijk."
  },
  {
    question: "Hoe snel zie ik verbeteringen in mijn dating resultaten?",
    answer: "89% van gebruikers ziet binnen 2 weken meer matches. Significante verbeteringen in date kwaliteit treden meestal op na 4-6 weken consistent gebruik. Succes hangt af van je inzet en het volgen van onze adviezen."
  },
  {
    question: "Kan ik mijn voortgang tracken?",
    answer: "Ja, onze Voortgang Tracker geeft gedetailleerde inzichten in je dating statistieken: matches, conversaties, date success rate, en persoonlijke verbeterpunten. Alles wordt visueel weergegeven met trends en aanbevelingen."
  },

  // Account en support
  {
    question: "Hoe kan ik mijn wachtwoord resetten?",
    answer: "Ga naar de login pagina en klik op 'Wachtwoord vergeten'. Voer je e-mailadres in en je ontvangt binnen 5 minuten een reset link. Voor security redenen verlopen reset links na 24 uur."
  },
  {
    question: "Kan ik mijn account verwijderen?",
    answer: "Ja, je kunt je account op elk moment verwijderen via de account instellingen. Kies tussen 'tijdelijk deactiveren' (30 dagen pauze) of 'permanent verwijderen'. Bij permanent verwijderen wordt alle data gewist conform privacy wetgeving."
  },
  {
    question: "Hoe kan ik contact opnemen met support?",
    answer: "We bieden meerdere support kanalen: live chat (24/7), e-mail (support@datingassistent.nl, response binnen 24 uur), telefoon (werkdagen 9-17), en uitgebreide help documentatie. Premium gebruikers krijgen prioriteit support."
  },

  // Probleemoplossing
  {
    question: "Wat als ik problemen heb met inloggen?",
    answer: "Controleer eerst je internetverbinding en browser cache. Probeer een andere browser of incognito modus. Als dat niet helpt, gebruik de wachtwoord reset functie of neem contact op met support. We helpen je binnen 1 uur weer online."
  },
  {
    question: "Mijn betaling is mislukt, wat nu?",
    answer: "Controleer je betaalmethode en probeer opnieuw. Als het probleem blijft bestaan, neem contact op met support. We kunnen handmatig betalingen verwerken en zorgen dat je geen toegang verliest."
  },
  {
    question: "Hoe exporteer ik mijn data?",
    answer: "Via je account instellingen kun je al je data exporteren in JSON of CSV formaat. Dit omvat profiel analyses, chat geschiedenis, voortgangsdata, en persoonlijke instellingen. Export is gratis en onbeperkt."
  },

  // Geavanceerde features
  {
    question: "Bieden jullie API toegang aan?",
    answer: "Ja, voor zakelijke gebruikers en developers bieden we REST API toegang. Hiermee kun je DatingAssistent integreren in je eigen applicaties. API documentatie en sandbox omgeving beschikbaar op aanvraag."
  },
  {
    question: "Kunnen bedrijven DatingAssistent gebruiken?",
    answer: "Absoluut. We hebben speciale enterprise oplossingen voor dating bureaus, relatie coaches, en HR afdelingen. Neem contact op voor een customized demo en prijsopgave."
  },
  {
    question: "Hoe blijven jullie AI modellen up-to-date?",
    answer: "Onze AI modellen worden dagelijks getraind met nieuwe data van succesvolle dates wereldwijd. We monitoren dating trends, app updates, en gebruikersfeedback om onze algoritmes continu te verbeteren."
  },

  // Specifieke doelgroepen
  {
    question: "Hebben jullie speciale ondersteuning voor mensen met een beperking?",
    answer: "Ja, DatingAssistent is begonnen als toegankelijke dating coach voor mensen met beperkingen. We bieden voice-over ondersteuning, screen reader compatibility, vereenvoudigde interfaces, en speciale coaching programma's."
  },
  {
    question: "Is DatingAssistent geschikt voor oudere singles?",
    answer: "Zeker! We hebben speciale programma's voor 50+ singles met focus op moderne dating etiquette, digitale veiligheid, en betekenisvolle connecties. Onze AI begrijpt de unieke uitdagingen van deze doelgroep."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-grow">
        {/* Header */}
        <header className="border-b bg-card/50">
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

            <h1 className="text-3xl md:text-4xl font-bold mb-4">Uitgebreide FAQ</h1>
            <p className="text-lg text-muted-foreground">
              Complete gids met antwoorden op al je vragen over DatingAssistent
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="overflow-hidden">
                  <button
                    className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                    onClick={() => toggleFAQ(index)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{faq.question}</h3>
                      <ChevronDown 
                        className={`ml-4 h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                          openIndex === index ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6 text-muted-foreground">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Still have questions */}
            <Card className="mt-12 p-8 text-center">
              <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Nog vragen?</h3>
              <p className="text-muted-foreground mb-6">
                Neem contact met ons op voor persoonlijke ondersteuning
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="mailto:support@datingassistent.nl">
                  <Button variant="outline">support@datingassistent.nl</Button>
                </Link>
                <Link href="/#contact">
                  <Button>Contactformulier</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <PublicFooter />
    </div>
  );
}
