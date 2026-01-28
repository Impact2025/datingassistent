import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export function HeroSectionPro() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="absolute inset-0">
        <div className="absolute top-16 left-1/3 w-96 h-96 bg-primary/30 blur-3xl opacity-70" />
        <div className="absolute -bottom-24 right-0 w-[32rem] h-[32rem] bg-coral-500/20 blur-3xl opacity-80" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 lg:py-32">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold tracking-wide uppercase">
              <Sparkles className="h-4 w-4 text-primary" />
              Pro Experience
            </div>

            <div className="space-y-6">
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-white/70">
                Premium AI Dating Coach
              </p>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Straal professionaliteit uit in elk gesprek en op elke date
              </h1>
              <p className="text-lg text-white/80 md:text-xl">
                Een tweede landingspagina voor campagnes die high-end coaching benadrukken. Zelfde flow, nieuwe
                positionering: executive level begeleiding, data gedreven adviezen en directe toegang tot een persoonlijke
                AI-coach.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-8 py-6 text-base font-semibold">
                <Link href="/register?plan=premium&billing=yearly">Plan een intake</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-white/30 bg-transparent px-8 py-6 text-base font-semibold text-white hover:bg-white/10"
              >
                <Link href="#prijzen">Bekijk trajecten</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Sparkles, label: 'Strategische profielmake-over' },
                { icon: ShieldCheck, label: '1-op-1 pro AI coach' },
                { icon: CheckCircle2, label: 'Klaar voor high-end matches' },
              ].map((item, index) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <item.icon className={`h-5 w-5 ${index === 0 ? 'text-coral-300' : index === 1 ? 'text-blue-300' : 'text-emerald-300'}`} />
                  <p className="text-sm text-white/80">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="space-y-6 rounded-2xl border border-white/5 bg-slate-900/60 p-6">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-white/60">Resultaten</p>
                <p className="text-4xl font-bold text-white">92%</p>
                <p className="text-sm text-white/70">van onze Pro-gebruikers krijgt meer kwalitatieve matches na 30 dagen.</p>
              </div>

              <div className="grid gap-4 rounded-2xl border border-white/5 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Executive profiel review</span>
                  <span>Gerealiseerd</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-coral-500" style={{ width: '86%' }} />
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-white/5 bg-slate-900/60 p-4">
                <p className="text-sm font-semibold text-white">Volgende stap</p>
                <p className="text-sm text-white/75">
                  Data driven datingstrategie voor de komende 14 dagen, begeleid door jouw persoonlijke AI coach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

