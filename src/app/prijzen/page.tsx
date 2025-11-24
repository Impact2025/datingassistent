'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { CheckCircle } from 'lucide-react';

// Pricing plans data - consistent with actual subscription system
const plans = [
  {
    name: 'Core',
    description: 'Slim starten met AI',
    monthlyPrice: 29,
    yearlyPrice: 290, // €290 per jaar (bespaar 17%)
    features: [
      '50 AI-berichten per week',
      'Profiel Coach – analyseer en verbeter je bio',
      'Chat Coach – 24/7 hulp bij gesprekken',
      'AI Foto Check – feedback op je foto\'s',
      '1 cursus per maand',
      '+ 1 meer features'
    ],
    popular: true
  },
  {
    name: 'Pro',
    description: 'Versnel je groei met AI & feedback',
    monthlyPrice: 49,
    yearlyPrice: 490, // €490 per jaar (bespaar 17%)
    features: [
      '125 AI-berichten per week',
      'Alle tools van Core, plus:',
      'Opener Lab – originele openingszinnen',
      'Match Analyse – waarom wel/niet matches',
      'Date Planner – creatieve date-ideeën',
      '+ 3 meer features'
    ],
    popular: false
  },
  {
    name: 'Premium AI',
    description: 'Persoonlijke begeleiding met slimme AI-assistentie',
    monthlyPrice: 99,
    yearlyPrice: 990, // €990 per jaar (bespaar 17%)
    features: [
      'Alle tools en cursussen direct unlocked',
      '250 AI-berichten per week',
      'Persoonlijke intake (45 minuten video)',
      'Persoonlijk verbeterplan op maat',
      '3 Coach Check-ins (chat of voice)',
      '+ 2 meer features'
    ],
    popular: false
  },
  {
    name: 'Premium Plus',
    description: 'De complete persoonlijke datingtransformatie',
    monthlyPrice: null, // One-time payment
    yearlyPrice: 2490, // €2490 éénmalig (geen abonnement)
    features: [
      'Alles uit Premium AI Coaching',
      'Live startgesprek van 2 uur met jouw coach',
      '4 extra 1-op-1 sessies van 60 minuten',
      'Persoonlijke fotoshoot met professionele fotograaf',
      'Feedback op profiel, gesprekken en dates',
      '+ 2 meer features'
    ],
    popular: false
  }
];

const handleCheckout = (planName: string) => {
  // Map landing page plan names to package types
  const planMapping: Record<string, string> = {
    'Core': 'core',
    'Pro': 'pro',
    'Premium AI': 'premium',
    'Premium Plus': 'premium_plus'
  };

  const packageType = planMapping[planName] || planName.toLowerCase();

  // Special handling for Premium Plus (one-time payment)
  if (planName === 'Premium Plus') {
    console.log(`Redirecting to registration for Premium Plus plan`);
    window.location.href = `/register?plan=${packageType}&billing=yearly&redirect_after_payment=true`;
    return;
  }

  // Redirect to registration with plan selection for paid plans
  if (packageType !== 'free' && packageType !== 'gratis') {
    console.log(`Redirecting to registration for ${packageType} plan`);
    window.location.href = `/register?plan=${packageType}&billing=yearly&redirect_after_payment=true`;
  } else {
    // Free plan - direct to registration
    console.log(`Redirecting to registration for free plan`);
    window.location.href = `/register`;
  }
};

export default function PrijzenPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Kies jouw <span className="text-pink-500">pad</span> naar meer liefde
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Of je nu zelfstandig wilt leren daten met hulp van AI, of intensief wilt samenwerken met een persoonlijke coach — DatingAssistent helpt je stap voor stap naar meer succes in de liefde.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Kies jouw pad naar meer liefde, groei en zelfvertrouwen
            </h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              Of je nu zelfstandig wilt leren daten met hulp van AI, of intensief wilt samenwerken met een persoonlijke coach —<br />
              DatingAssistent helpt je stap voor stap naar meer succes in de liefde.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`card-playful relative ${plan.popular ? 'border-2 border-pink-500 shadow-lg' : 'border border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="bg-pink-500 text-white text-xs font-bold py-1 px-3 rounded-full absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    Meest gekozen
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-600 italic">"{plan.description}"</p>
                  </div>

                  <div className="text-center mb-6">
                    {plan.name === 'Premium Plus' ? (
                      <div className="mb-2">
                        <span className="text-3xl font-bold text-gray-900">
                          €{plan.yearlyPrice}
                        </span>
                        <div className="text-sm text-gray-600">
                          éénmalig (geen abonnement)
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-center gap-2 mb-2">
                          <span className="text-3xl font-bold text-gray-900">
                            €{plan.monthlyPrice}
                          </span>
                          <span className="text-sm text-gray-500">
                            / maand
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          of €{plan.yearlyPrice} per jaar (bespaar 17%)
                        </div>
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.slice(0, plan.name === 'Premium' ? 6 : 5).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > (plan.name === 'Premium' ? 6 : 5) && (
                      <li className="text-sm text-gray-500 italic">
                        + {plan.features.length - (plan.name === 'Premium' ? 6 : 5)} meer features
                      </li>
                    )}
                  </ul>

                  <Button
                    onClick={() => handleCheckout(plan.name)}
                    className={`w-full text-sm font-semibold ${
                      plan.popular
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.name === 'Core' && 'Start vandaag met Core'}
                    {plan.name === 'Pro' && 'Upgrade naar Pro'}
                    {plan.name === 'Premium AI' && 'Plan jouw intake'}
                    {plan.name === 'Premium Plus' && 'Reserveer jouw Premium Plus traject'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Information */}
          <>
            {/* Lifetime explanation */}
            <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-4xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">ℹ️</span>
                </div>
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Jaarlijkse toegang</strong> = blijvende toegang tot tools & cursussen voor een heel jaar.<br />
                    <strong>Maandelijkse abonnementen</strong> worden automatisch verlengd, je kunt altijd opzeggen.<br />
                    <strong>Premium Plus</strong> is een eenmalige investering zonder vervolgkosten.
                  </p>
                </div>
              </div>
            </div>

            {/* All plans include */}
            <div className="mt-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ❤️ Alle plannen bevatten toegang tot onze 8 AI-tools:
              </h3>
              <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
                <span className="bg-gray-100 px-3 py-1 rounded-full">Profiel Coach</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">Chat Coach</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">Date Planner</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">Veiligheid Check</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">Opener Lab</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">Match Analyse</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">AI Foto Check</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">Voortgang Tracker</span>
              </div>
            </div>

            {/* Footer text */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                Prijzen inclusief btw. Je kunt op elk moment upgraden of opzeggen.<br />
                Vragen? Neem contact met ons op via support@datingassistent.nl
              </p>
            </div>
          </>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Veelgestelde vragen over prijzen</h2>
            <p className="text-gray-500">Antwoorden op de meest gestelde vragen</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Kan ik opzeggen wanneer ik wil?</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Absoluut! Je kunt je abonnement op elk moment opzeggen zonder extra kosten. Geen verplichtingen, geen gedoe.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Wat gebeurt er na mijn proefperiode?</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Na je gratis proefperiode kun je kiezen voor maandelijkse of jaarlijkse betaling. Jaarlijks bespaar je tot 20%.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Kan ik upgraden naar een hoger plan?</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ja! Je kunt altijd upgraden naar een hoger plan. Het verschil wordt naar rato berekend.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Is er een gratis versie?</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ja! Je kunt gratis beginnen met een account aanmaken en basis tools uitproberen. Premium features zijn beschikbaar via betaalde abonnementen.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/faq" className="text-pink-500 hover:text-pink-600 font-medium">
              Bekijk alle veelgestelde vragen →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Klaar om te beginnen?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Sluit je aan bij duizenden mensen die succesvoller daten met DatingAssistent
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 text-lg rounded-full shadow-lg">
                Start gratis proefperiode
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500 px-8 py-6 text-lg rounded-full">
                Bekijk alle features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}