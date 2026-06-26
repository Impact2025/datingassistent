import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Module 1: Mindset Voorbereiding - Goed Jezelf Kennen | DatingAssistent',
  description: 'Ontdek wat je écht zoekt in de liefde. Module 1 van onze dating cursus leert je waarom zelfkennis de basis is voor aantrekkelijke profielen.',
  alternates: { canonical: 'https://datingassistent.nl/cursus/mindset-voorbereiding' },
  openGraph: {
    title: 'Module 1: Goed Jezelf Kennen - De Basis',
    description: 'Ontdek wat je écht zoekt in de liefde met Module 1 van onze dating cursus.',
    url: 'https://datingassistent.nl/cursus/mindset-voorbereiding',
  },
};

export default function CursusMindsetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
