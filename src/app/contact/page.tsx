import type { Metadata } from 'next';
import ContactForm from '@/components/contact/contact-form';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

export const metadata: Metadata = {
  title: 'Contact | Neem Contact Op | DatingAssistent',
  description: 'Neem contact op met DatingAssistent. Live chat, email support, telefonisch contact. We helpen je graag verder met je dating vragen. Response binnen 24 uur.',
  keywords: ['contact', 'support', 'klantenservice', 'help', 'dating hulp', 'customer service'],
  openGraph: {
    title: 'Contact | Neem Contact Op | DatingAssistent',
    description: 'Neem contact op met DatingAssistent. Live chat, email support, telefonisch contact. We helpen je graag verder met je dating vragen.',
    type: 'website',
    url: 'https://datingassistent.nl/contact',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | Neem Contact Op | DatingAssistent',
    description: 'Neem contact op met DatingAssistent. Live chat, email support, telefonisch contact.',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <ContactForm />
      <PublicFooter />
    </div>
  );
}