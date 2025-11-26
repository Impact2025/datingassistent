import { LesContainer } from '@/components/cursus/LesContainer';
import { IrisFloatingButton } from '@/components/iris/IrisFloatingButton';

interface LesPageProps {
  params: Promise<{
    moduleSlug: string;
    lesSlug: string;
  }>;
}
export default async function LesPage({ params }: LesPageProps) {
  const { moduleSlug, lesSlug } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <LesContainer
        moduleSlug={moduleSlug}
        lesSlug={lesSlug}
      />
      <IrisFloatingButton />
    </div>
  );
}