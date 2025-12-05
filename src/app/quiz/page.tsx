import { DatingStyleQuiz } from '@/components/quiz/dating-style-quiz';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gratis Dating Stijl Quiz | DatingAssistent',
  description: 'Ontdek in 2 minuten wat je tegenhoudt in dating. Krijg direct je persoonlijke analyse + concrete tips.',
  openGraph: {
    title: 'Gratis Dating Stijl Quiz - Ontdek je valkuilen',
    description: 'In 2 minuten weet je precies wat jou tegenhoudt. Inclusief persoonlijk advies.',
  }
};

export default function QuizPage() {
  return <DatingStyleQuiz />;
}
