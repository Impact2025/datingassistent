import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '36 Vragen om Verliefd te Worden | Gratis Tool | DatingAssistent',
  description: 'Doe de 36 vragen die tot liefde leiden. Gebaseerd op het beroemde psychologische experiment. Leer elkaar echt kennen met deze intieme vragen.',
  alternates: { canonical: 'https://www.datingassistent.nl/tools/36-vragen' },
  openGraph: {
    title: '36 Vragen om Verliefd te Worden',
    description: 'Doe de 36 vragen die tot liefde leiden. Gebaseerd op het beroemde psychologische experiment.',
    url: 'https://www.datingassistent.nl/tools/36-vragen',
  },
};

export default function Tools36VragenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
